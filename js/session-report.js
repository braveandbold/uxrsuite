function goSessReport(id){activeSessId=id;renderSessReport()}
function changeSessStatusFromReport(val){
  const s=activeSess();if(!s)return;
  s.status=val;updSess(s);
  const active=document.getElementById('v-session-test').classList.contains('hidden');
  if(active)renderSessReport();else renderSessTest();
}
function renderSessReport(){
  const s=activeSess();if(!s){renderBatteries();return}
  const b=batteries.find(x=>x.id===s.batteryId);
  const st=s.status==='done'?{label:'Abgeschlossen',cls:'badge-done'}:{label:'Aktiv',cls:'badge-active'};
  setNav([{label:'Usability Testing',action:'renderDashboard()'},{label:'Usability-Tests',action:'renderBatteries()'},{label:b?.name||'Studie',action:`goBattDetail('${s.batteryId}')`},{label:s.personName||'Session',action:`goSessTest('${s.id}')`},{label:'Bericht',action:''}]);
  show('session-report');
  const steps=b?.steps||[];
  const entries=s.entries||[];
  const problems=entries.filter(e=>e.type==='Problem');
  const avgSev=problems.length?(problems.reduce((a,e)=>a+e.severity,0)/problems.length).toFixed(1):null;
  const countType=t=>entries.filter(e=>e.type===t).length;
  const stats=[
    {val:entries.length,lbl:'Einträge gesamt',bg:'#f3f4f6',fg:'#374151'},
    {val:countType('Beobachtung'),lbl:'Beobachtungen',type:'Beobachtung',bg:T.bg.Beobachtung,fg:T.fg.Beobachtung},
    {val:problems.length,lbl:'Probleme',type:'Problem',bg:T.bg.Problem,fg:T.fg.Problem},
    {val:countType('Zitat'),lbl:'Zitate',type:'Zitat',bg:T.bg.Zitat,fg:T.fg.Zitat},
    {val:countType('Lob'),lbl:'Lob',type:'Lob',bg:T.bg.Lob,fg:T.fg.Lob},
    {val:countType('Notiz'),lbl:'Notizen',type:'Notiz',bg:T.bg.Notiz,fg:T.fg.Notiz},
  ];
  const colGroupWithSev = `<colgroup>
    <col style="width:68px"><col style="width:145px"><col style="width:145px"><col>
  </colgroup>`;
  const colGroupNoSev = `<colgroup>
    <col style="width:68px"><col style="width:145px"><col>
  </colgroup>`;

  const chapterCards = (() => {
    let html = '';
    CHAPTERS.forEach(ch => {
      const chEntries = entries
        .filter(e => { const step=steps.find(st=>st.id===e.stepId); return step&&(step.chapter||1)===ch.id; })
        .sort((a,b) => steps.findIndex(st=>st.id===a.stepId) - steps.findIndex(st=>st.id===b.stepId));
      if(chEntries.length === 0) return;
      const noSev = ch.id === 1;
      const chRows = chEntries.map((e, i) => {
        const step = steps.find(st => st.id === e.stepId);
        const prevStep = i > 0 ? chEntries[i-1].stepId : null;
        const newStepGroup = i === 0 || e.stepId !== prevStep;
        const stepHeader = newStepGroup ? `<tr>
          <td colspan="${noSev?3:4}" style="background:var(--surface2);border-top:${i===0?'none':'1px solid var(--border)'};border-bottom:1px solid var(--border);padding:9px 14px;font-size:12px;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.06em">${step?`${steps.indexOf(step)+1}. ${esc(step.title)}`:'Ohne Schritt'}</td>
        </tr>` : '';
        return`${stepHeader}<tr>
          <td style="font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--text3);white-space:nowrap">${fmtTime(e.timestamp)}</td>
          <td>${e.type?`<span class="report-pill" style="background:${T.bg[e.type]};color:${T.fg[e.type]}">${typeIcon(e.type,14)}${e.type}</span>`:'–'}</td>
          ${noSev?'':`<td>${e.severity?`<span class="sev-pill sev-pill-audit" style="background:${SEV.bg[e.severity]};color:${SEV.fg[e.severity]}">${SEV.label[e.severity]}</span>`:'–'}</td>`}
          <td>${esc(e.text)}</td>
        </tr>`;
      }).join('');
      html += `<div class="card" style="padding:0;overflow:hidden;margin-bottom:14px">
        <div style="padding:12px 20px;border-bottom:1px solid var(--border)">
          <span style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text2)">${ch.label}</span>
          <span style="font-size:12px;color:var(--text3);margin-left:10px">${chEntries.length} Einträge</span>
        </div>
        <div style="overflow-x:auto"><table class="tbl" style="table-layout:fixed;width:100%">${noSev?colGroupNoSev:colGroupWithSev}
          <thead><tr><th>Zeit</th><th>Typ</th>${noSev?'':'<th>Schweregrad</th>'}<th>Beobachtung</th></tr></thead>
          <tbody>${chRows}</tbody>
        </table></div>
      </div>`;
    });
    const genEntries = entries.filter(e => !e.stepId);
    if(genEntries.length > 0){
      const genRows = genEntries.map(e => `<tr>
        <td style="font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--text3);white-space:nowrap">${fmtTime(e.timestamp)}</td>
        <td>${e.type?`<span class="report-pill" style="background:${T.bg[e.type]};color:${T.fg[e.type]}">${typeIcon(e.type,14)}${e.type}</span>`:'–'}</td>
        <td>${e.severity?`<span class="sev-pill sev-pill-audit" style="background:${SEV.bg[e.severity]};color:${SEV.fg[e.severity]}">${SEV.label[e.severity]}</span>`:'–'}</td>
        <td>${esc(e.text)}</td>
      </tr>`).join('');
      html += `<div class="card" style="padding:0;overflow:hidden;margin-bottom:14px">
        <div style="padding:12px 20px;border-bottom:1px solid var(--border)">
          <span style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--text2)">Allgemein</span>
          <span style="font-size:12px;color:var(--text3);margin-left:10px">${genEntries.length} Einträge</span>
        </div>
        <div style="overflow-x:auto"><table class="tbl" style="table-layout:fixed;width:100%">${colGroupWithSev}
          <thead><tr><th>Zeit</th><th>Typ</th><th>Schweregrad</th><th>Beobachtung</th></tr></thead>
          <tbody>${genRows}</tbody>
        </table></div>
      </div>`;
    }
    if(!html) html = `<div class="empty">Keine Einträge vorhanden</div>`;
    return html;
  })();
  document.getElementById('v-session-report').innerHTML=`<div class="page">
    <div class="hdr" style="margin-bottom:22px">
      <div>
        <div style="font-size:12px;color:var(--text3);margin-bottom:4px">${esc(b?.name||'')}</div>
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:5px;flex-wrap:wrap">
          <h2 style="margin-bottom:0">Bericht: ${esc(s.personName)||'Session'}${s.personCode?' <span style="font-size:14px;color:var(--text2)">('+esc(s.personCode)+')</span>':''}</h2>
          <span class="badge ${st.cls}">${st.label}</span>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:5px 14px;font-size:13px;color:var(--text2);margin-top:6px;align-items:center">
          ${s.personNotes?`<span><span style="font-weight:600;color:var(--text)">Notizen:</span> ${esc(s.personNotes)}</span>`:''}
          ${s.date?`<span><span style="font-weight:600;color:var(--text)">Datum:</span> ${fmtDate(s.date)}</span>`:''}
          ${s.tester?`<span><span style="font-weight:600;color:var(--text)">Protokollant:</span> ${esc(s.tester)}</span>`:''}
          <span><span style="font-weight:600;color:var(--text)">Einträge:</span> ${entries.length}</span>
        </div>
      </div>
      <div style="display:flex;gap:8px;flex-shrink:0;flex-wrap:wrap;align-self:flex-start">
        <button onclick="exportSessXLSX()" style="display:inline-flex;align-items:center;gap:7px">${excelIcon()}Excel</button>
        <button onclick="exportPDF()" style="display:inline-flex;align-items:center;gap:7px">${pdfIcon()}PDF</button>
        <button onclick="goSessTest('${s.id}')" style="display:inline-flex;align-items:center;gap:7px">${editIcon()}Bearbeiten</button>
      </div>
    </div>

    <h3 style="margin-bottom:12px">Zusammenfassung</h3>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(132px,1fr));gap:12px;margin-bottom:22px">
      ${stats.map(st=>`<div class="stat-card" style="background:${st.bg};color:${st.fg}">${st.type?`<div class="stat-icon">${summaryTypeIcon(st.type,26)}</div>`:''}<div class="stat-val">${st.val}</div><div class="stat-label">${st.lbl}</div></div>`).join('')}
    </div>

    ${chapterCards}

  </div>`;
}
function exportSessXLSX(){
  const s=activeSess();if(!s)return;
  const b=batteries.find(x=>x.id===s.batteryId);
  const steps=b?.steps||[];
  if(typeof XLSX==='undefined'){alert('Bitte mit Internetverbindung öffnen für Excel-Export.');return}
  const wb=XLSX.utils.book_new();
  const meta=[['Feld','Wert'],['Studie',b?.name||''],['Produkt',b?.product||''],['Testperson',s.personName],['Code',s.personCode],['Datum',s.date],['Protokollant',s.tester],['Notizen',s.personNotes],['Einträge',(s.entries||[]).length]];
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(meta),'Info');
  const hdr=['Zeit','Kapitel','Typ','Schweregrad','Schweregrad-Label','Schritt','Beobachtung'];
  const rows=(s.entries||[]).map(e=>{
    const step=steps.find(st=>st.id===e.stepId);
    const ch=step?CHAPTERS.find(c=>c.id===(step.chapter||1)):null;
    return[fmtTime(e.timestamp),ch?ch.label:'',e.type,e.severity||'',e.severity?SEV.label[e.severity]:'',step?`${steps.indexOf(step)+1}. ${step.title}`:'',e.text];
  });
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([hdr,...rows]),'Protokoll');
  XLSX.writeFile(wb,`Protokoll_${(b?.name||'Studie').replace(/\s+/g,'_')}_${(s.personName||'Session').replace(/\s+/g,'_')}_${s.date||'export'}.xlsx`);
}

function exportPDF(){
  const s=activeSess();if(!s)return;
  if(typeof window.jspdf==='undefined'){alert('Bitte mit Internetverbindung öffnen für PDF-Export.');return}
  const b=batteries.find(x=>x.id===s.batteryId);
  const steps=b?.steps||[];
  const entries=s.entries||[];
  const {jsPDF}=window.jspdf;
  const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
  const pW=210,mg=14,cW=pW-mg*2;
  let y=mg;

  const CH_PDF={
    1:{fill:[238,237,252],text:[55,48,163]},
    2:{fill:[204,251,241],text:[13,148,136]},
    3:{fill:[224,242,254],text:[3,105,161]},
    4:{fill:[253,242,248],text:[134,25,143]}
  };
  const T_PDF={
    'Beobachtung':{fill:[219,234,254],text:[30,58,138]},
    'Problem':{fill:[254,226,226],text:[127,29,29]},
    'Zitat':{fill:[237,233,254],text:[59,16,133]},
    'Lob':{fill:[220,252,231],text:[20,83,45]},
    'Notiz':{fill:[243,244,246],text:[55,65,81]}
  };
  const SEV_PDF={
    1:{fill:[187,247,208],text:[20,83,45]},2:{fill:[217,249,157],text:[54,83,20]},
    3:{fill:[254,240,138],text:[113,63,18]},4:{fill:[254,215,170],text:[124,45,18]},
    5:{fill:[254,202,202],text:[127,29,29]}
  };

  doc.setFillColor(45,42,138);
  doc.rect(mg,y,cW,24,'F');
  doc.setTextColor(255,255,255);
  doc.setFontSize(13);doc.setFont('helvetica','bold');
  doc.text(b?.name||'Studie',mg+5,y+9);
  doc.setFontSize(10);doc.setFont('helvetica','normal');
  doc.text(`${s.personName||'Session'}${s.personCode?' ('+s.personCode+')':''}`,mg+5,y+16);
  const metaRight=[s.date?fmtDate(s.date):'',s.tester?'Protokollant: '+s.tester:''].filter(Boolean).join('   ');
  doc.setFontSize(9);doc.text(metaRight,pW-mg-3,y+16,{align:'right'});
  y+=28;

  const problems=entries.filter(e=>e.type==='Problem');
  const avgSev=problems.length?(problems.reduce((a,e)=>a+e.severity,0)/problems.length).toFixed(1):'–';
  const stats=[['Einträge gesamt',String(entries.length)],[`Probleme`,String(problems.length)],['Ø Schweregrad',String(avgSev)],['Zitate',String(entries.filter(e=>e.type==='Zitat').length)]];
  const bW=(cW-6)/4;
  stats.forEach((st,i)=>{
    const x=mg+i*(bW+2);
    doc.setFillColor(238,237,252);doc.roundedRect(x,y,bW,16,2,2,'F');
    doc.setTextColor(45,42,138);
    doc.setFontSize(15);doc.setFont('helvetica','bold');
    doc.text(st[1],x+bW/2,y+9,{align:'center'});
    doc.setFontSize(7.5);doc.setFont('helvetica','normal');
    doc.text(st[0],x+bW/2,y+14,{align:'center'});
  });
  y+=21;

  CHAPTERS.forEach(ch=>{
    const chEntries=entries.filter(e=>{
      const step=steps.find(st=>st.id===e.stepId);
      return step&&(step.chapter||1)===ch.id;
    });
    if(chEntries.length===0)return;
    const cc=CH_PDF[ch.id];
    const noSev=ch.id===1;

    doc.setFillColor(...cc.fill);doc.rect(mg,y,cW,8,'F');
    doc.setTextColor(...cc.text);
    doc.setFontSize(9.5);doc.setFont('helvetica','bold');
    doc.text(ch.label,mg+3,y+5.5);
    doc.setFontSize(8.5);doc.setFont('helvetica','normal');
    doc.text(`${chEntries.length} Einträge`,pW-mg-3,y+5.5,{align:'right'});
    y+=9;

    const head=noSev?[['Zeit','Typ','Schritt','Beobachtung']]:[['Zeit','Typ','Schweregrad','Schritt','Beobachtung']];
    const body=chEntries.map(e=>{
      const step=steps.find(st=>st.id===e.stepId);
      return[
        fmtTime(e.timestamp),
        e.type||'–',
        ...(noSev?[]:[e.severity?`${e.severity} – ${SEV.label[e.severity]}`:'–']),
        step?`${steps.indexOf(step)+1}. ${step.title}`:'–',
        e.text||''
      ];
    });

    const colNoSev={0:{cellWidth:16},1:{cellWidth:26},2:{cellWidth:38},3:{cellWidth:'auto'}};
    const colSev  ={0:{cellWidth:16},1:{cellWidth:26},2:{cellWidth:34},3:{cellWidth:36},4:{cellWidth:'auto'}};

    doc.autoTable({
      startY:y, head, body,
      margin:{left:mg,right:mg},
      styles:{fontSize:8,cellPadding:2.5,overflow:'linebreak',valign:'top'},
      headStyles:{fillColor:[240,240,245],textColor:[60,60,80],fontStyle:'bold',fontSize:8},
      columnStyles:noSev?colNoSev:colSev,
      didParseCell(data){
        if(data.section!=='body')return;
        if(data.column.index===1){
          const tc=T_PDF[data.cell.raw];
          if(tc){data.cell.styles.fillColor=tc.fill;data.cell.styles.textColor=tc.text;}
        }
        if(!noSev&&data.column.index===2){
          const n=parseInt(data.cell.raw);
          const sc=SEV_PDF[n];
          if(sc){data.cell.styles.fillColor=sc.fill;data.cell.styles.textColor=sc.text;}
        }
      }
    });
    y=doc.lastAutoTable.finalY+6;
  });

  const genEntries=entries.filter(e=>!e.stepId);
  if(genEntries.length>0){
    doc.setFillColor(240,240,240);doc.rect(mg,y,cW,8,'F');
    doc.setTextColor(80,80,80);
    doc.setFontSize(9.5);doc.setFont('helvetica','bold');
    doc.text('Allgemeine Beobachtungen',mg+3,y+5.5);
    y+=9;
    const genBody=genEntries.map(e=>[fmtTime(e.timestamp),e.type||'–',e.severity?`${e.severity} – ${SEV.label[e.severity]}`:'–','–',e.text||'']);
    doc.autoTable({
      startY:y,head:[['Zeit','Typ','Schweregrad','Schritt','Beobachtung']],body:genBody,
      margin:{left:mg,right:mg},
      styles:{fontSize:8,cellPadding:2.5,overflow:'linebreak',valign:'top'},
      headStyles:{fillColor:[240,240,245],textColor:[60,60,80],fontStyle:'bold',fontSize:8},
      columnStyles:{0:{cellWidth:16},1:{cellWidth:26},2:{cellWidth:34},3:{cellWidth:36},4:{cellWidth:'auto'}},
      didParseCell(data){
        if(data.section==='body'&&data.column.index===1){
          const tc=T_PDF[data.cell.raw];if(tc){data.cell.styles.fillColor=tc.fill;data.cell.styles.textColor=tc.text;}
        }
      }
    });
    y=doc.lastAutoTable.finalY+6;
  }

  const pages=doc.internal.getNumberOfPages();
  for(let i=1;i<=pages;i++){
    doc.setPage(i);
    doc.setFontSize(8);doc.setTextColor(160,160,160);
    doc.text('Usability Protokoll-Tool',mg,294);
    doc.text(`Seite ${i} von ${pages}`,pW-mg,294,{align:'right'});
  }

  doc.save(`Protokoll_${(b?.name||'Studie').replace(/\s+/g,'_')}_${(s.personName||'Session').replace(/\s+/g,'_')}_${s.date||'export'}.pdf`);
}
