function renderAudit(){renderAuditList();}

function renderAuditList(){
  setNav([
    {label:'UX Audit',action:'renderDashboard()'},
    {label:'Audits',action:'renderAuditList()'}
  ]);
  show('audit');
  const el=document.getElementById('v-audit');
  const renderAuditRow=a=>{
    const fc=findingsForAudit(a.id).length;
    const sets=(a.heuristicSets||[]).map(s=>AUDIT_HEURISTIC_SETS[s]?.label||s).join(' · ');
    return`<div class="batt-card" onclick="goAuditDetail('${a.id}')">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;flex-wrap:wrap">
            <span style="font-weight:600;font-size:17px">${esc(a.name)||'(Ohne Name)'}</span>
            ${a.status==='done'?`<span class="badge badge-done">Abgeschlossen</span>`:`<span class="badge badge-active">Aktiv</span>`}
          </div>
          <div style="font-size:13px;color:var(--text2);display:flex;gap:16px;flex-wrap:wrap">
            ${a.subject?`<span><span style="font-weight:600;color:var(--text)">Prüfgegenstand:</span> ${esc(a.subject)}</span>`:''}
            <span><span style="font-weight:600;color:var(--text)">Findings:</span> ${fc}</span>
            ${a.auditor?`<span><span style="font-weight:600;color:var(--text)">Prüfer:</span> ${esc(a.auditor)}</span>`:''}
            ${a.date?`<span><span style="font-weight:600;color:var(--text)">Zeitraum:</span> ${fmtAuditDate(a.date)}</span>`:''}
          </div>
        </div>
      </div>
      ${sets?`<div style="margin-top:10px;font-size:12px;color:var(--text3)">${esc(sets)}</div>`:''}
    </div>`;
  };
  const renderSection=(title,items)=>items.length?`
    <div style="margin-bottom:26px">
      <h3 style="margin-bottom:10px">${title}</h3>
      ${items.map(renderAuditRow).join('')}
    </div>`:'';
  const activeAudits=auditList.filter(a=>a.status!=='done');
  const doneAudits=auditList.filter(a=>a.status==='done');
  const rows=auditList.length===0
    ?`<div class="empty"><div style="font-size:38px;margin-bottom:14px">◧</div><div>Noch keine Audits – erstelle deinen ersten</div></div>`
    :renderSection('Aktiv',activeAudits)+renderSection('Abgeschlossen',doneAudits);
  el.innerHTML=`<div class="page">
    <div class="hdr">
      <h1>Audits</h1>
      <button class="btn-primary" style="background:${AUDIT_COLOR};border-color:${AUDIT_COLOR}" onclick="goAuditNew()">+ Neuer Audit</button>
    </div>
    ${rows}
  </div>`;
}

function goAuditDetail(id){activeAuditId=id;renderAuditDetail();}
function goAuditNew(){activeAuditId=null;renderAuditEdit();}
