(function(){
'use strict';

const DAYS  = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
const SLOTS = [
  '07:00–08:00','08:00–09:00','09:00–10:00','10:00–11:00',
  '11:00–12:00','12:00–13:00','13:00–14:00','14:00–15:00',
  '15:00–16:00','16:00–17:00','17:00–18:00','18:00–19:00'
];
const PALETTE = [
  '#3b82f6','#8b5cf6','#06b6d4','#f59e0b','#10b981',
  '#ef4444','#ec4899','#f97316','#6366f1','#14b8a6',
  '#84cc16','#a855f7','#0ea5e9','#d946ef','#22c55e'
];
const LS_KEY = 'facitrack_workload_v3';

let subjects = [];
let blocks   = {};
let editingSubjId = null;
let editingCell   = null;
let selColor = PALETTE[0];
let selBlockColor = PALETTE[0];

/* ── Persistence ── */
function lsSave(){
  try{ localStorage.setItem(LS_KEY, JSON.stringify({subjects,blocks})); }catch(e){}
}
function lsLoad(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if(!raw) return;
    const d = JSON.parse(raw);
    if(Array.isArray(d.subjects)) subjects = d.subjects;
    if(d.blocks && typeof d.blocks==='object') blocks = d.blocks;
  }catch(e){}
}

/* ── Auto-save with debounce ── */
let autoSaveTimer = null;
function autoSave(){
  setAutoSaveStatus('saving');
  lsSave();
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(async ()=>{
    try{
      const r = await fetch('/instructor/workload/save',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({subjects,blocks})
      });
      const j = await r.json();
      if(!j.success) throw new Error(j.error||'fail');
      setAutoSaveStatus('saved');
    }catch(e){
      setAutoSaveStatus('local');
    }
  }, 800);
}

function setAutoSaveStatus(state){
  const text = document.getElementById('autoSaveText');
  const icon = document.getElementById('autoSaveIcon');
  const wrap = document.getElementById('autoSaveStatus');
  if(!text||!icon||!wrap) return;
  if(state==='saving'){
    wrap.style.color='#f59e0b';
    text.textContent='Saving...';
    icon.innerHTML='<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>';
  } else if(state==='saved'){
    wrap.style.color='#16a34a';
    text.textContent='All changes saved';
    icon.innerHTML='<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>';
    setTimeout(()=>{ wrap.style.color='#94a3b8'; },3000);
  } else {
    wrap.style.color='#94a3b8';
    text.textContent='Saved locally';
  }
}
async function serverLoad(){
  try{
    const r = await fetch('/instructor/workload/load');
    const d = await r.json();
    if(Array.isArray(d.subjects) && d.subjects.length){
      subjects = d.subjects; blocks = d.blocks||{}; lsSave();
    }
  }catch(e){}
}

/* ── Helpers ── */
function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
function byId(id){ return subjects.find(s=>s.id===id); }
function bkey(day,slot){ return day+'_'+slot; }
function nextColor(){
  const used = subjects.map(s=>s.color);
  return PALETTE.find(c=>!used.includes(c))||PALETTE[subjects.length%PALETTE.length];
}
function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* ── Render table ── */
function renderTable(){
  const tbody = document.getElementById('wlBody');
  if(!tbody) return;
  tbody.innerHTML='';
  SLOTS.forEach(slot=>{
    const tr = document.createElement('tr');
    const tc = document.createElement('td');
    tc.className='tc'; tc.textContent=slot; tr.appendChild(tc);
    DAYS.forEach(day=>{
      const td = document.createElement('td');
      td.className='slot';
      td.dataset.day=day; td.dataset.slot=slot;
      const blk = blocks[bkey(day,slot)];
      
      // Skip rendering if this is a continuation of a multi-hour block
      if(blk && blk.isSpan){
        td.style.display='none';
        tr.appendChild(td);
        return;
      }
      
      // Set rowspan for multi-hour blocks
      if(blk && blk.duration > 1){
        td.rowSpan = blk.duration;
      }
      
      if(blk){ 
        const s=byId(blk.subjectId); 
        td.innerHTML=s?renderBlk(s,blk):renderHint(); 
      } else { 
        td.innerHTML=renderHint(); 
      }
      td.addEventListener('click',onCell);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  updateStats();
}

function renderBlk(subj,blk){
  const color = blk.color || (subj ? subj.color : '#3b82f6');
  const durationLabel = blk.duration > 1 ? `<span class="b-duration">${blk.duration}hrs</span>` : '';
  return `<div class="blk" style="background:${color}">
    <button class="b-edit" title="Edit">✎</button>
    <span class="b-subj">${esc(subj ? subj.code : '')}</span>
    ${blk.room?`<span class="b-room">📍 ${esc(blk.room)}</span>`:''}
    ${blk.section?`<span class="b-sect">${esc(blk.section)}</span>`:''}
    ${durationLabel}
  </div>`;
}
function renderHint(){
  return `<div class="add-hint">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    <span>Add</span></div>`;
}

/* ── Render legend ── */
function renderLegend(){
  const tbody = document.getElementById('legendBody');
  if(!tbody) return;

  // Only subjects actually placed on the schedule
  const usedSubjectIds = [...new Set(
    Object.values(blocks).filter(b => !b.isSpan).map(b => b.subjectId)
  )];
  const usedSubjects = subjects.filter(s => usedSubjectIds.includes(s.id));

  if(!usedSubjects.length){
    tbody.innerHTML='<tr><td colspan="3" style="padding:1.5rem;text-align:center;color:#94a3b8;font-size:.82rem">No subjects placed on the schedule yet.</td></tr>';
    return;
  }

  tbody.innerHTML='';
  usedSubjects.forEach(subj=>{
    const usedBlocks = Object.values(blocks).filter(b => b.subjectId===subj.id && !b.isSpan);

    // Group by unique color+section combo
    const combos = [];
    usedBlocks.forEach(b => {
      const color = b.color || subj.color;
      const sec   = b.section || '';
      const key   = color + '|' + sec;
      if(!combos.find(c => c.key === key)) combos.push({ key, color, sec });
    });

    // Check if all combos share the same color AND same section → single row
    const allSameColor = combos.every(c => c.color === combos[0].color);
    const allSameSec   = combos.every(c => c.sec   === combos[0].sec);

    if(combos.length <= 1 || (allSameColor && allSameSec)){
      const c = combos[0] || { color: subj.color, sec: '' };
      const tr = document.createElement('tr');
      tr.style.cssText='border-bottom:1px solid #f1f5f9;transition:background .15s';
      tr.onmouseenter=()=>tr.style.background='#f8fafc';
      tr.onmouseleave=()=>tr.style.background='transparent';
      tr.innerHTML=`
        <td style="padding:.6rem 1rem">
          <div style="width:80px;height:38px;background:${c.color};border-radius:5px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:.68rem;font-weight:700;text-align:center;padding:.2rem;line-height:1.2">
            ${c.sec ? esc(c.sec) : ''}
          </div>
        </td>
        <td style="padding:.6rem 1rem;font-weight:700;font-size:.85rem;color:#0f172a">${esc(subj.code)}</td>
        <td style="padding:.6rem 1rem;font-size:.82rem;color:#475569">${esc(subj.name)}</td>
      `;
      tbody.appendChild(tr);
    } else {
      // Multiple combos — stack color strips, code+name span all rows
      combos.forEach((combo, idx) => {
        const tr = document.createElement('tr');
        tr.style.cssText='border-bottom:1px solid #f8fafc;transition:background .15s';
        tr.onmouseenter=()=>tr.style.background='#f8fafc';
        tr.onmouseleave=()=>tr.style.background='transparent';

        const colorCell = document.createElement('td');
        colorCell.style.cssText='padding:.3rem 1rem';
        colorCell.innerHTML=`<div style="width:80px;height:28px;background:${combo.color};border-radius:4px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:.65rem;font-weight:700;text-align:center;padding:.15rem;line-height:1.1">${combo.sec ? esc(combo.sec) : ''}</div>`;
        tr.appendChild(colorCell);

        if(idx === 0){
          const codeCell = document.createElement('td');
          codeCell.rowSpan = combos.length;
          codeCell.style.cssText='padding:.6rem 1rem;font-weight:700;font-size:.85rem;color:#0f172a;vertical-align:middle;border-bottom:1px solid #f1f5f9';
          codeCell.textContent = subj.code;
          tr.appendChild(codeCell);

          const nameCell = document.createElement('td');
          nameCell.rowSpan = combos.length;
          nameCell.style.cssText='padding:.6rem 1rem;font-size:.82rem;color:#475569;vertical-align:middle;border-bottom:1px solid #f1f5f9';
          nameCell.textContent = subj.name;
          tr.appendChild(nameCell);
        }
        tbody.appendChild(tr);
      });
    }
  });
}

/* ── Confirm delete subject ── */
function confirmDeleteSubject(subjId){
  const subj = byId(subjId);
  if(!subj) return;
  const cnt = Object.values(blocks).filter(b=>b.subjectId===subjId).length;
  const msg = cnt > 0 
    ? `Delete "${subj.code}"? This will remove ${cnt} class block(s) from your schedule.`
    : `Delete "${subj.code}"?`;
  if(confirm(msg)){
    Object.keys(blocks).forEach(k=>{ if(blocks[k].subjectId===subjId) delete blocks[k]; });
    subjects=subjects.filter(s=>s.id!==subjId);
    lsSave(); autoSave(); renderTable(); renderLegend(); toast('Subject deleted','info');
  }
}

/* ── Export Modal ── */
function openExportModal(){
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  document.getElementById('exportSchoolYear').value = `${currentYear}-${nextYear}`;
  showMo('exportModal');
}

/* ── Export Workload ── */
async function exportWorkload(){
  const semester = document.getElementById('exportSemester').value.trim();
  const schoolYear = document.getElementById('exportSchoolYear').value.trim();
  const effectiveDate = document.getElementById('exportEffectiveDate').value.trim();
  
  if(!semester || !schoolYear){
    toast('Semester and School Year are required','error');
    return;
  }
  
  hideMo('exportModal');
  toast('Generating PDF...','info');

  const htmlContent = generatePrintableHTML(semester, schoolYear, effectiveDate);

  // Open in a new window, then trigger print-to-PDF
  const win = window.open('', '_blank', 'width=1200,height=900');
  win.document.open();
  win.document.write(htmlContent);
  win.document.close();

  // Wait for full render including images
  await new Promise(resolve => setTimeout(resolve, 1000));

  win.focus();
  win.print();

  toast('Use "Save as PDF" in the print dialog','info');
}

/* ── Generate Printable HTML ── */
function generatePrintableHTML(semester, schoolYear, effectiveDate){
  const EXPORT_DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  const instructorName = 'Dr. Maria Santos';

  const TIME_SLOTS = [
    '7:00 - 8:00','8:00 - 9:00','9:00 - 10:00','10:00 - 11:00',
    '11:00 - 12:00','12:00 - 13:00','13:00 - 14:00','14:00 - 15:00',
    '15:00 - 16:00','16:00 - 17:00','17:00 - 18:00','18:00 - 19:00'
  ];

  /* ── build table rows ── */
  const skip = new Set();
  let trows = '';
  SLOTS.forEach((slot, si) => {
    trows += '<tr>';
    trows += '<td class="tc">' + TIME_SLOTS[si] + '</td>';
    EXPORT_DAYS.forEach(day => {
      const ck = day + '_' + slot;
      if (skip.has(ck)) return;
      const blk = blocks[bkey(day, slot)];
      if (blk && !blk.isSpan) {
        const subj = byId(blk.subjectId);
        const rs   = blk.duration || 1;
        for (let i = 1; i < rs; i++)
          if (si + i < SLOTS.length) skip.add(day + '_' + SLOTS[si + i]);
        const bg = blk.color || (subj ? subj.color : '#cccccc');
        trows += '<td rowspan="' + rs + '" class="dc" style="background:' + bg + '">'
          + '<div class="bi">'
          + '<b>'  + (subj ? esc(subj.code) : '') + '</b>'
          + '<span class="bi-instr">' + esc(instructorName) + '</span>'
          + (blk.room    ? '<span class="bi-room">'    + esc(blk.room)    + '</span>' : '')
          + (blk.section ? '<span class="bi-sect">'    + esc(blk.section) + '</span>' : '')
          + '</div></td>';
      } else if (!blk) {
        trows += '<td class="dc"></td>';
      }
    });
    trows += '</tr>';
  });

  /* ── build legend rows — group by subject, stack one strip per unique color+section combo ── */
  let lrows = '';
  subjects.filter(subj => {
    return Object.values(blocks).some(b => b.subjectId === subj.id && !b.isSpan);
  }).forEach(subj => {
    const usedBlocks = Object.values(blocks).filter(b => b.subjectId === subj.id && !b.isSpan);
    const combos = [];
    usedBlocks.forEach(b => {
      const color = b.color || subj.color;
      const sec   = b.section || '';
      const key   = color + '|' + sec;
      if(!combos.find(c => c.key === key)) combos.push({ key, color, sec });
    });

    const allSameColor = combos.every(c => c.color === combos[0].color);
    const allSameSec   = combos.every(c => c.sec   === combos[0].sec);

    if(combos.length <= 1 || (allSameColor && allSameSec)){
      const c = combos[0] || { color: subj.color, sec: '' };
      lrows += '<tr>'
        + '<td class="lc"><div class="lb" style="background:' + c.color + '">' + (c.sec ? esc(c.sec) : '&nbsp;') + '</div></td>'
        + '<td class="lcode">' + esc(subj.code) + '</td>'
        + '<td class="lname">' + esc(subj.name) + '</td>'
        + '</tr>';
    } else {
      combos.forEach((combo, idx) => {
        lrows += '<tr>';
        lrows += '<td class="lc" style="padding:1pt 3pt;">'
          + '<div class="lb" style="background:' + combo.color + ';min-height:13pt;font-size:6.5pt">'
          + (combo.sec ? esc(combo.sec) : '&nbsp;')
          + '</div></td>';
        if (idx === 0) {
          lrows += '<td class="lcode" rowspan="' + combos.length + '" style="vertical-align:middle">' + esc(subj.code) + '</td>';
          lrows += '<td class="lname" rowspan="' + combos.length + '" style="vertical-align:middle">' + esc(subj.name) + '</td>';
        }
        lrows += '</tr>';
      });
    }
  });
  if (!lrows) lrows = '<tr><td colspan="3" class="lempty">No subjects added</td></tr>';

  /* ── CSS ── */
  const css = `
@page { size: A4 landscape; margin: 8mm 12mm 8mm 12mm; }
* { margin:0; padding:0; box-sizing:border-box; }
body {
  font-family: Arial, Helvetica, sans-serif;
  color: #000;
  background: #fff;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  font-size: 7.5pt;
}

/* ── HEADER ── */
.hdr { width:100%; border-collapse:collapse; }
.hdr td { padding:0; vertical-align:top; }
.logo-td { width:54pt; padding-right:7pt !important; }
.logo-td img { width:54pt; height:54pt; display:block; }
.si .rep   { font-size:7.5pt; line-height:1.4; }
.si .sname { font-size:10.5pt; font-weight:700; line-height:1.3; }
.si .addr  { font-size:7.5pt; line-height:1.4; }
.college-td { text-align:right; }
.cn { font-size:21pt; font-weight:700; line-height:1.1; letter-spacing:0.2pt; }
.cn em { font-style:italic; font-weight:400; font-size:20pt; }
.cc { font-size:6.5pt; color:#555; margin-top:4pt; }
.cf { font-size:6.5pt; color:#1a56db; }

/* ── BLUE LINE ── */
.bl { height:1.2pt; background:#1a56db; margin:5pt 0 0 0; }

/* ── TITLE ── */
.tw { text-align:center; margin:10pt 0 2pt 0; }
.tm { font-size:28pt; font-weight:700; letter-spacing:2pt; }
.ts { font-size:8.5pt; margin-top:2pt; }

/* ── INSTRUCTOR ── */
.instr { font-size:9.5pt; font-weight:700; margin:6pt 0 3pt 0; }

/* ── SCHEDULE TABLE ── */
.st { width:100%; border-collapse:collapse; table-layout:fixed; margin-bottom:7pt; }
.st thead tr { background:#000; color:#fff; }
.st th {
  font-size:8pt; font-weight:700; text-align:center;
  padding:4pt 1pt; border:0.75pt solid #000; color:#fff;
}
.th-t { width:48pt; }
.tc {
  font-size:7pt; text-align:center; padding:1pt;
  border:0.75pt solid #000; background:#fff;
  vertical-align:middle; height:20pt; white-space:nowrap;
}
.dc {
  border:0.75pt solid #000; background:#fff;
  vertical-align:middle; padding:0; height:20pt;
}
.bi { text-align:center; padding:1pt 2pt; line-height:1.25; }
.bi b        { font-size:7pt;   font-weight:700; display:block; }
.bi-instr    { font-size:6.5pt; display:block; }
.bi-room     { font-size:6pt;   display:block; }
.bi-sect     { font-size:6pt;   display:block; }

/* ── LEGEND ── */
.lt { width:100%; border-collapse:collapse; margin-bottom:6pt; }
.lt th {
  background:#f0f0f0; font-size:7.5pt; font-weight:700;
  padding:2pt 4pt; border:0.75pt solid #000; text-align:left;
}
.lth-c { width:50pt; text-align:center !important; }
.lth-k { width:85pt; }
.lc { border:0.75pt solid #000; padding:2pt; text-align:center; vertical-align:top; background:#fff; }
.lb {
  border-radius:2pt; padding:2pt 4pt; font-size:7pt; font-weight:700;
  min-height:14pt; display:flex; align-items:center; justify-content:center;
}
.lcode { border:0.75pt solid #000; padding:2pt 5pt; font-size:7.5pt; font-weight:700; background:#fff; vertical-align:middle; }
.lname { border:0.75pt solid #000; padding:2pt 5pt; font-size:7.5pt; background:#fff; vertical-align:middle; }
.lempty { border:0.75pt solid #000; padding:3pt; font-size:7pt; text-align:center; background:#fff; }

/* ── FOOTER ── */
.ft { width:100%; border-collapse:collapse; margin-top:5pt; margin-bottom:4pt; }
.ft td { font-size:7.5pt; padding:0; }
.fl { text-align:left; }
.fr { text-align:right; }
.bb { background:#000; height:6pt; margin-top:4pt; }
`;

  /* ── HTML ── */
  return '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="UTF-8">\n<style>' + css + '</style>\n</head>\n<body>\n'

    /* HEADER */
    + '<table class="hdr"><tr>'
    + '<td class="logo-td"><img src="/images/CSPC-logo.png" alt="CSPC Logo"></td>'
    + '<td class="si">'
    +   '<div class="rep">Republic of the Philippines</div>'
    +   '<div class="sname">CAMARINES SUR POLYTECHNIC COLLEGES</div>'
    +   '<div class="addr">Nabua, Camarines Sur</div>'
    + '</td>'
    + '<td class="college-td">'
    +   '<div class="cn">COLLEGE <em>of</em> COMPUTER STUDIES</div>'
    +   '<div class="cc">CSPC-F-COL-37</div>'
    +   '<div class="cf">File Code 1.7.3</div>'
    + '</td>'
    + '</tr></table>'

    /* BLUE LINE */
    + '<div class="bl"></div>'

    /* TITLE */
    + '<div class="tw">'
    +   '<div class="tm">WORKLOAD</div>'
    +   '<div class="ts">' + esc(semester) + ', School Year ' + esc(schoolYear) + '</div>'
    + '</div>'

    /* INSTRUCTOR */
    + '<div class="instr">' + esc(instructorName) + '</div>'

    /* SCHEDULE TABLE */
    + '<table class="st"><thead><tr>'
    + '<th class="th-t">Time</th>'
    + EXPORT_DAYS.map(d => '<th>' + d + '</th>').join('')
    + '</tr></thead><tbody>' + trows + '</tbody></table>'

    /* LEGEND */
    + '<table class="lt"><thead><tr>'
    + '<th class="lth-c">Color</th>'
    + '<th class="lth-k">Subject Code</th>'
    + '<th>Subject Name</th>'
    + '</tr></thead><tbody>' + lrows + '</tbody></table>'

    /* FOOTER */
    + '<table class="ft"><tr>'
    + '<td class="fl">' + (effectiveDate ? 'Effective Date: ' + esc(effectiveDate) : '') + '</td>'
    + '<td class="fr">Page 1 of 1</td>'
    + '</tr></table>'

    /* BOTTOM BAR */
    + '<div class="bb"></div>'
    + '\n</body>\n</html>';
}

/* ── Stats ── */
function updateStats(){
  const all = Object.values(blocks);
  document.getElementById('statBlocks').textContent   = all.length;
  document.getElementById('statHours').textContent    = all.length;
  document.getElementById('statSubjects').textContent = new Set(all.map(b=>b.subjectId)).size;
  document.getElementById('statRooms').textContent    = new Set(all.map(b=>b.room).filter(Boolean)).size;
}

/* ── Cell color picker ── */
function renderBlockColorPicker(){
  const row = document.getElementById('cmColorRow');
  if(!row) return;
  row.innerHTML='';
  PALETTE.forEach(c=>{
    const dot = document.createElement('div');
    const sel = c === selBlockColor;
    dot.style.cssText=`width:26px;height:26px;border-radius:50%;cursor:pointer;background:${c};border:3px solid ${sel?'#0f172a':'transparent'};transition:transform .1s,border-color .1s;flex-shrink:0;${sel?'transform:scale(1.18);box-shadow:0 0 0 2px rgba(15,23,42,.15)':''}`;
    dot.addEventListener('click',()=>{ selBlockColor=c; renderBlockColorPicker(); });
    row.appendChild(dot);
  });
}

/* ── Cell click ── */
function onCell(e){
  const td=e.currentTarget;
  editingCell={day:td.dataset.day, slot:td.dataset.slot};
  const blk = blocks[bkey(editingCell.day,editingCell.slot)];
  document.getElementById('cmTitle').textContent = blk?'Edit Class Block':'Add Class Block';
  document.getElementById('cmMetaText').textContent = `${editingCell.day}  ·  ${editingCell.slot}`;

  if(blk){
    const subj = byId(blk.subjectId);
    document.getElementById('cmSubjectCode').value = subj ? subj.code : '';
    document.getElementById('cmSubjectName').value = subj ? subj.name : '';
    document.getElementById('cmRoom').value    = blk.room||'';
    document.getElementById('cmSection').value = blk.section||'';
    setPill('cmDurationGroup','cmDuration', String(blk.duration||2));
    setPill('cmTypeGroup','cmType', blk.type||'Lecture');
    selBlockColor = blk.color || (subj ? subj.color : PALETTE[0]);
    document.getElementById('cmRemove').style.display='inline-flex';
  } else {
    document.getElementById('cmSubjectCode').value = '';
    document.getElementById('cmSubjectName').value = '';
    document.getElementById('cmRoom').value    = '';
    document.getElementById('cmSection').value = '';
    setPill('cmDurationGroup','cmDuration','2');
    setPill('cmTypeGroup','cmType','Lecture');
    selBlockColor = PALETTE[0];
    document.getElementById('cmRemove').style.display='none';
  }
  renderBlockColorPicker();
  showMo('cellModal');
}

/* ── Subject modal ── */
function openSubjModal(id){
  editingSubjId=id;
  const subj=id?byId(id):null;
  document.getElementById('smTitle').textContent=subj?'Edit Subject':'Add Subject';
  document.getElementById('smCode').value=subj?subj.code:'';
  document.getElementById('smName').value=subj?subj.name:'';
  document.getElementById('smUnits').value=subj?(subj.units||''):'';
  selColor=subj?subj.color:nextColor();
  document.getElementById('smDelete').style.display=subj?'inline-flex':'none';
  renderColorPicker();
  showMo('subjModal');
}

function renderColorPicker(){
  const row=document.getElementById('colorRow');
  if(!row) return;
  row.innerHTML='';
  PALETTE.forEach(c=>{
    const dot=document.createElement('div');
    const sel=c===selColor;
    dot.style.cssText=`width:28px;height:28px;border-radius:50%;cursor:pointer;background:${c};border:3px solid ${sel?'#0f172a':'transparent'};transition:transform .1s,border-color .1s;${sel?'transform:scale(1.18);box-shadow:0 0 0 2px rgba(15,23,42,.15)':''}`;
    dot.addEventListener('click',()=>{ selColor=c; renderColorPicker(); });
    row.appendChild(dot);
  });
}

/* ── Pill group helper ── */
function setPill(groupId, hiddenId, val){
  const group = document.getElementById(groupId);
  if(!group) return;
  group.querySelectorAll('.mo-pill').forEach(btn=>{
    btn.classList.toggle('active', btn.dataset.val === val);
  });
  document.getElementById(hiddenId).value = val;
}

/* ── Modal show/hide ── */
function showMo(id){ const el=document.getElementById(id); el.classList.add('open'); }
function hideMo(id){ const el=document.getElementById(id); el.classList.remove('open'); }

/* ── Save cell ── */
function saveCell(){
  if(!editingCell) return;
  const code    = document.getElementById('cmSubjectCode').value.trim();
  const name    = document.getElementById('cmSubjectName').value.trim();
  const section = document.getElementById('cmSection').value.trim();
  if(!code){ toast('Subject code is required','error'); return; }
  if(!name){ toast('Subject name is required','error'); return; }
  if(!section){ toast('Section is required','error'); return; }

  // Find existing subject by code, or create one
  let subj = subjects.find(s=>s.code.toLowerCase()===code.toLowerCase());
  if(!subj){
    subj = {id:uid(), code, name, color:selBlockColor, units:0};
    subjects.push(subj);
  } else {
    // Update name in case it changed
    subj.name = name;
  }

  const duration = parseInt(document.getElementById('cmDuration').value) || 2;
  const startIdx = SLOTS.indexOf(editingCell.slot);

  if(startIdx + duration > SLOTS.length){
    toast('Duration exceeds available time slots','error'); return;
  }

  // Check for conflicts
  for(let i = 0; i < duration; i++){
    const checkSlot = SLOTS[startIdx + i];
    const checkKey  = bkey(editingCell.day, checkSlot);
    const existingBlk = blocks[checkKey];
    if(existingBlk && checkKey !== bkey(editingCell.day, editingCell.slot)){
      toast(`Conflict at ${checkSlot}. Please clear that slot first.`,'error'); return;
    }
  }

  const blockData = {
    subjectId: subj.id,
    room:      document.getElementById('cmRoom').value.trim(),
    type:      document.getElementById('cmType').value,
    section,
    duration,
    color:     selBlockColor
  };

  for(let i = 0; i < duration; i++){
    const slot = SLOTS[startIdx + i];
    blocks[bkey(editingCell.day, slot)] = {...blockData, isSpan: i > 0, spanStart: editingCell.slot};
  }

  hideMo('cellModal'); lsSave(); autoSave(); renderTable(); renderLegend(); toast('Block saved','success');
}

/* ── Remove cell ── */
function removeCell(){
  if(!editingCell) return;
  const blk = blocks[bkey(editingCell.day, editingCell.slot)];
  
  // If this is a multi-hour block, remove all related slots
  if(blk && blk.duration > 1){
    const startSlot = blk.isSpan ? blk.spanStart : editingCell.slot;
    const startIdx = SLOTS.indexOf(startSlot);
    const duration = blk.duration;
    
    for(let i = 0; i < duration; i++){
      const slot = SLOTS[startIdx + i];
      delete blocks[bkey(editingCell.day, slot)];
    }
  } else {
    delete blocks[bkey(editingCell.day, editingCell.slot)];
  }
  
  hideMo('cellModal'); lsSave(); autoSave(); renderTable(); renderLegend(); toast('Block removed','info');
}

/* ── Save subject ── */
function saveSubject(){
  const code=document.getElementById('smCode').value.trim();
  const name=document.getElementById('smName').value.trim();
  const units=parseInt(document.getElementById('smUnits').value)||0;
  if(!code){ toast('Subject code is required','error'); return; }
  if(!name){ toast('Subject name is required','error'); return; }
  if(editingSubjId){
    const s=byId(editingSubjId);
    if(s){ s.code=code; s.name=name; s.color=selColor; s.units=units; }
  } else {
    subjects.push({id:uid(),code,name,color:selColor,units});
  }
  hideMo('subjModal'); lsSave(); autoSave(); renderTable(); renderLegend();
  toast(editingSubjId?'Subject updated':'Subject added','success');
}

/* ── Delete subject ── */
function deleteSubject(){
  if(!editingSubjId) return;
  Object.keys(blocks).forEach(k=>{ if(blocks[k].subjectId===editingSubjId) delete blocks[k]; });
  subjects=subjects.filter(s=>s.id!==editingSubjId);
  hideMo('subjModal'); lsSave(); autoSave(); renderTable(); renderLegend(); toast('Subject deleted','info');
}

/* ── Toast ── */
function toast(msg,type='info'){
  const wrap=document.getElementById('toastWrap');
  if(!wrap) return;
  const el=document.createElement('div');
  el.className='toast '+type;
  const icons={
    success:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
    error:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    info:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
  };
  el.innerHTML=(icons[type]||icons.info)+' '+msg;
  wrap.appendChild(el);
  setTimeout(()=>el.remove(),3000);
}

/* ── Wire buttons ── */
function wire(){
  document.getElementById('cmSave').addEventListener('click',saveCell);
  document.getElementById('cmRemove').addEventListener('click',removeCell);
  document.getElementById('cmCancel').addEventListener('click',()=>hideMo('cellModal'));
  document.getElementById('cmClose').addEventListener('click',()=>hideMo('cellModal'));

  // Pill groups for duration and type
  document.querySelectorAll('#cmDurationGroup .mo-pill').forEach(btn=>{
    btn.addEventListener('click',()=>setPill('cmDurationGroup','cmDuration',btn.dataset.val));
  });
  document.querySelectorAll('#cmTypeGroup .mo-pill').forEach(btn=>{
    btn.addEventListener('click',()=>setPill('cmTypeGroup','cmType',btn.dataset.val));
  });

  document.getElementById('smSave').addEventListener('click',saveSubject);
  document.getElementById('smDelete').addEventListener('click',deleteSubject);
  document.getElementById('smCancel').addEventListener('click',()=>hideMo('subjModal'));
  document.getElementById('smClose').addEventListener('click',()=>hideMo('subjModal'));

  document.getElementById('btnExport').addEventListener('click',openExportModal);
  document.getElementById('btnPrint').addEventListener('click',()=>window.print());
  document.getElementById('btnClear').addEventListener('click',()=>showMo('clearModal'));
  document.getElementById('clearCancel').addEventListener('click',()=>hideMo('clearModal'));
  document.getElementById('clearConfirm').addEventListener('click',()=>{
    blocks={}; hideMo('clearModal'); lsSave(); autoSave(); renderTable(); renderLegend(); toast('Schedule cleared','info');
  });

  document.getElementById('exportClose').addEventListener('click',()=>hideMo('exportModal'));
  document.getElementById('exportCancel').addEventListener('click',()=>hideMo('exportModal'));
  document.getElementById('exportConfirm').addEventListener('click',exportWorkload);

  ['cellModal','subjModal','clearModal','exportModal'].forEach(id=>{
    document.getElementById(id).addEventListener('click',function(e){
      if(e.target===this) hideMo(id);
    });
  });
}

/* ── Init ── */
let _initialized = false;
async function init(){
  if(_initialized) return;
  _initialized = true;
  lsLoad();
  await serverLoad();
  renderTable();
  renderLegend();
  wire();
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();
