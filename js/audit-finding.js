let _findingSev=3;
let _findingCriteria=[];
let _findingMode='view'; // 'view' | 'edit' — read by router for hash
let _findingEditSnapshot=null;

function getFindingEditDraft(){
  if(_findingMode!=='edit')return null;
  const a=activeAudit();if(!a)return null;
  const freeText=document.getElementById('af-criterion-text');
  const criterion=freeText
    ?freeText.value.trim()
    :JSON.stringify([..._findingCriteria].sort());
  return {
    title:document.getElementById('af-title')?.value?.trim()||'',
    description:document.getElementById('af-description')?.value||'',
    recommendation:document.getElementById('af-recommendation')?.value||'',
    severity:_findingSev,
    criterion
  };
}

function hasUnsavedFindingEdit(){
  if(_findingMode!=='edit'||!_findingEditSnapshot)return false;
  const draft=getFindingEditDraft();
  return !!draft && JSON.stringify(draft)!==_findingEditSnapshot;
}

function renderAuditFindingView(){
  const a=activeAudit();if(!a){renderAuditList();return;}
  const f=activeFinding();if(!f){renderAuditDetail();return;}
  const byDate=[...findingsForAudit(a.id)].sort((x,y)=>new Date(x.createdAt)-new Date(y.createdAt));
  const num=byDate.findIndex(x=>x.id===f.id)+1;

  // Navigation order mirrors the current list sort
  const allSorted=[...findingsForAudit(a.id)].sort((x,y)=>{
    let cmp=_auditSortBy==='severity'?x.severity-y.severity:new Date(x.createdAt)-new Date(y.createdAt);
    return _auditSortDir==='asc'?cmp:-cmp;
  });
  const idx=allSorted.findIndex(x=>x.id===f.id);
  const prev=idx>0?allSorted[idx-1]:null;
  const next=idx<allSorted.length-1?allSorted[idx+1]:null;

  setNav([
    {label:'UX Audit',action:'renderDashboard()'},
    {label:'Audits',action:'renderAuditList()'},
    {label:a.name||'Audit',action:`goAuditDetail('${a.id}')`},
    {label:`#${num} ${f.title||'Finding'}`,action:''}
  ]);
  _findingMode='view';
  _findingEditSnapshot=null;
  show('audit-finding');
  const el=document.getElementById('v-audit-finding');

  const criteria=parseCriteria(f.criterion);
  const hasSets=(a.heuristicSets||[]).length>0;
  let criteriaDisplay='';
  if(hasSets){
    if(criteria.length===0){
      criteriaDisplay=`<span style="color:var(--text3);font-size:14px">–</span>`;
    } else {
      let groups='';
      (a.heuristicSets||[]).forEach(setKey=>{
        const set=AUDIT_HEURISTIC_SETS[setKey];if(!set)return;
        const matching=set.criteria.filter(c=>criteria.includes(c.id));
        if(!matching.length)return;
        const chips=matching.map(c=>`<span style="padding:5px 12px;border-radius:var(--r);font-size:12px;font-weight:500;line-height:1.2;border:1.5px solid ${AUDIT_COLOR};background:${AUDIT_BG};color:${AUDIT_COLOR};white-space:nowrap;display:inline-flex;align-items:center;vertical-align:middle">${esc(c.label)}</span>`).join('');
        groups+=`<div style="margin-bottom:12px">
          <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--text3);margin-bottom:6px">${esc(set.label)}</div>
          <div style="display:flex;flex-direction:column;align-items:flex-start;gap:5px">${chips}</div>
        </div>`;
      });
      criteriaDisplay=groups;
    }
  } else {
    criteriaDisplay=`<span style="font-size:14px">${esc(f.criterion)||'–'}</span>`;
  }

  const prevBtn=prev
    ?`<button onclick="goAuditFinding('${prev.id}')" style="display:flex;align-items:center;gap:6px">← Vorheriges</button>`
    :`<button disabled style="opacity:.3;cursor:default">← Vorheriges</button>`;
  const nextBtn=next
    ?`<button onclick="goAuditFinding('${next.id}')" style="display:flex;align-items:center;gap:6px">Nächstes →</button>`
    :`<button disabled style="opacity:.3;cursor:default">Nächstes →</button>`;

  el.innerHTML=`<div class="page" style="max-width:1040px">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;gap:10px">
      <button onclick="goAuditDetail('${a.id}')">← Zur Liste</button>
      <button onclick="renderAuditFinding()" style="display:inline-flex;align-items:center;gap:7px">${editIcon()}Bearbeiten</button>
    </div>
    <div style="display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:32px;align-items:start">
      <div>
        <div class="card">
          <div style="margin-bottom:24px">
            <div style="font-size:12px;font-weight:600;color:var(--text3);margin-bottom:4px">#${num}</div>
            <h2 style="margin-bottom:0">${esc(f.title)||'(Ohne Titel)'}</h2>
          </div>
          ${f.description?`<div style="margin-bottom:24px">
            <div class="lbl" style="display:block;font-size:12px;font-weight:600;color:var(--text2);margin-bottom:6px;letter-spacing:.03em">Beschreibung</div>
            <div style="font-size:14px;line-height:1.6;white-space:pre-wrap">${esc(f.description)}</div>
          </div>`:''}
          ${f.recommendation?`<div style="margin-bottom:0">
            <div class="lbl" style="display:block;font-size:12px;font-weight:600;color:var(--text2);margin-bottom:6px;letter-spacing:.03em">Empfehlung</div>
            <div style="font-size:14px;line-height:1.6;white-space:pre-wrap">${esc(f.recommendation)}</div>
          </div>`:''}
        </div>
      </div>
      <div>
        <div class="card">
          <h3>Einordnung</h3>
          <div style="margin-bottom:20px">
            <div class="lbl" style="display:block;font-size:12px;font-weight:600;color:var(--text2);margin-bottom:6px;letter-spacing:.03em">Schweregrad</div>
            <span style="background:${SEV.bg[f.severity]};color:${SEV.fg[f.severity]};font-size:13px;font-weight:700;line-height:1.2;padding:7px 14px;border-radius:var(--r);white-space:nowrap;display:inline-flex;align-items:center;vertical-align:middle">${SEV.label[f.severity]}</span>
          </div>
          ${criteriaDisplay?`<div class="lbl" style="display:block;font-size:12px;font-weight:600;color:var(--text2);margin-bottom:8px;letter-spacing:.03em">Kriterium</div>${criteriaDisplay}`:''}
        </div>
      </div>
    </div>

    <div style="display:flex;justify-content:space-between;margin-top:24px">${prevBtn}${nextBtn}</div>
  </div>`;
}

function renderAuditFinding(){
  const a=activeAudit();if(!a){renderAuditList();return;}
  const f=activeFinding()||{id:null,auditId:a.id,criterion:'',title:'',description:'',severity:3,recommendation:'',createdAt:null};
  const isNew=!f.id;
  _findingSev=f.severity||3;
  _findingCriteria=parseCriteria(f.criterion);
  setNav([
    {label:'UX Audit',action:'renderDashboard()'},
    {label:'Audits',action:'renderAuditList()'},
    {label:a.name||'Audit',action:`goAuditDetail('${a.id}')`},
    {label:isNew?'Neues Finding':f.title||'Finding',action:''}
  ]);
  _findingMode='edit';
  show('audit-finding');
  const el=document.getElementById('v-audit-finding');

  const hasSets=(a.heuristicSets||[]).length>0;
  let criterionField='';
  if(hasSets){
    let groups='';
    (a.heuristicSets||[]).forEach(setKey=>{
      const set=AUDIT_HEURISTIC_SETS[setKey];if(!set)return;
      const chips=set.criteria.map(c=>{
        const sel=_findingCriteria.includes(c.id);
        return`<button type="button" id="crit-${c.id}" class="crit-chip"
          style="padding:7px 12px;border-radius:var(--r);font-size:12px;font-weight:500;line-height:1.2;cursor:pointer;white-space:nowrap;text-align:left;border:1.5px solid ${sel?AUDIT_COLOR:'var(--border)'};background:${sel?AUDIT_BG:'var(--surface)'};color:${sel?AUDIT_COLOR:'var(--text2)'};display:inline-flex;align-items:center;vertical-align:middle"
          onclick="toggleCriterion('${c.id}')">${esc(c.label)}</button>`;
      }).join('');
      groups+=`<div style="margin-bottom:12px">
        <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--text3);margin-bottom:6px">${esc(set.label)}</div>
        <div style="display:flex;flex-direction:column;align-items:flex-start;gap:5px">${chips}</div>
      </div>`;
    });
    criterionField=groups;
  } else {
    criterionField=`<input type="text" id="af-criterion-text" value="${esc(f.criterion)}" placeholder="Kein Kriteriensatz konfiguriert – Freitext">`;
  }

  const sevBtns=[1,2,3,4,5].map(n=>`<button type="button" id="sev-af-${n}" class="audit-sev-btn"
    style="padding:7px 16px;border:2px solid ${n===_findingSev?SEV.fg[n]:'transparent'};background:${SEV.bg[n]};color:${SEV.fg[n]};font-size:13px;opacity:${n===_findingSev?1:.4};white-space:nowrap"
    onclick="setAfSev(${n})">${SEV.label[n]}</button>`).join('');

  const rightCol=hasSets
    ?criterionField
    :`<div class="field"><label class="lbl">Kriterium</label>${criterionField}</div>`;

  el.innerHTML=`<div class="page" style="max-width:1040px">
    <h2 style="margin-bottom:24px">${isNew?'Neues Finding':'Finding bearbeiten'}</h2>
    <div style="display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:32px;align-items:start">
      <div>
        <div class="card">
          <h3>Finding-Details</h3>
          <div class="field"><label class="lbl">Titel</label>
            <input type="text" id="af-title" value="${esc(f.title)}" placeholder="Kurze Beschreibung des Problems"></div>
          <div class="field">
            <label class="lbl">Schweregrad</label>
            <div style="display:flex;gap:8px;flex-wrap:nowrap;align-items:center;overflow-x:auto;padding-bottom:2px">${sevBtns}</div>
          </div>
          <div class="field"><label class="lbl">Beschreibung</label>
            <textarea id="af-description" rows="14" placeholder="Was wurde beobachtet? Wo tritt das Problem auf?">${esc(f.description)}</textarea></div>
          <div class="field" style="margin-bottom:0"><label class="lbl">Empfehlung</label>
            <textarea id="af-recommendation" rows="8" placeholder="Welche Maßnahme wird empfohlen?">${esc(f.recommendation)}</textarea></div>
        </div>
        <div style="display:flex;gap:10px;justify-content:space-between;margin-top:8px">
          ${!isNew?`<button class="btn-danger" onclick="deleteAuditFindingConfirm('${f.id}','${a.id}')" style="display:inline-flex;align-items:center;gap:7px">${trashIcon()}Finding löschen</button>`:`<div></div>`}
          <div style="display:flex;gap:10px">
            <button onclick="confirmLeaveIfDirty(()=>goAuditDetail('${a.id}'))">Abbrechen</button>
            <button class="btn-primary" style="background:${AUDIT_COLOR};border-color:${AUDIT_COLOR}" onclick="saveAuditFinding('${isNew?'':f.id}','${a.id}')">Speichern</button>
          </div>
        </div>
      </div>
      <div>
        <div class="card">
          <h3>Kriterium${hasSets?' (mehrere möglich)':''}</h3>
          <div style="margin-top:2px">${rightCol}</div>
        </div>
      </div>
    </div>
  </div>`;
  _findingEditSnapshot=JSON.stringify(getFindingEditDraft());
}

function toggleCriterion(id){
  if(_findingCriteria.includes(id)){
    _findingCriteria=_findingCriteria.filter(x=>x!==id);
  } else {
    _findingCriteria=[..._findingCriteria,id];
  }
  const btn=document.getElementById('crit-'+id);
  if(!btn)return;
  const sel=_findingCriteria.includes(id);
  btn.style.border=`1.5px solid ${sel?AUDIT_COLOR:'var(--border)'}`;
  btn.style.background=sel?AUDIT_BG:'var(--surface)';
  btn.style.color=sel?AUDIT_COLOR:'var(--text2)';
}

function setAfSev(n){
  _findingSev=n;
  [1,2,3,4,5].forEach(i=>{
    const btn=document.getElementById('sev-af-'+i);if(!btn)return;
    btn.style.border=`2px solid ${i===n?SEV.fg[i]:'transparent'}`;
    btn.style.opacity=i===n?'1':'0.4';
  });
}

async function saveAuditFinding(existingId,auditId){
  const title=document.getElementById('af-title').value.trim();
  const description=document.getElementById('af-description').value.trim();
  const recommendation=document.getElementById('af-recommendation').value.trim();
  const freeText=document.getElementById('af-criterion-text');
  const criterion=freeText?freeText.value.trim():serializeCriteria(_findingCriteria);
  if(!title){alert('Bitte einen Titel eingeben.');return;}
  const existing=existingId?activeFinding():null;
  const f={
    id:existingId||genId(), auditId,
    criterion, title, description, severity:_findingSev, recommendation,
    createdAt:existing?.createdAt||ts()
  };
  try{
    if(existingId){
      await updAuditFinding(f);
    } else {
      auditFindings=[...auditFindings,f];
      await saveAuditFindingToDb(f);
    }
  } catch(err){
    alert('Fehler beim Speichern:\n'+err.message);
    return;
  }
  activeAuditFindingId=f.id;
  _findingEditSnapshot=null;
  if(existingId) renderAuditFindingView();
  else goAuditDetail(auditId);
}

async function deleteAuditFindingConfirm(id,auditId){
  ask('Finding wirklich löschen?',async()=>{
    try{
      await deleteAuditFindingFromDb(id);
      auditFindings=auditFindings.filter(f=>f.id!==id);
      activeAuditFindingId=null;
      goAuditDetail(auditId);
    } catch(err){
      reportSaveError(err);
    }
  });
}
