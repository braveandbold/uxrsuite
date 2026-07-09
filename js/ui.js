function ask(msg, onOk, okLabel='Löschen', okCls='btn-danger'){
  document.getElementById('confirm-msg').textContent=msg;
  const ok=document.getElementById('confirm-ok');
  const discard=document.getElementById('confirm-discard');
  ok.innerHTML=okLabel==='Löschen'?`${trashIcon()}${esc(okLabel)}`:esc(okLabel);
  ok.className=okCls;
  ok.style.display='inline-flex';
  ok.style.alignItems='center';
  ok.style.gap='7px';
  discard.style.display='none';
  document.getElementById('confirm-overlay').classList.remove('hidden');
  const cleanup=()=>document.getElementById('confirm-overlay').classList.add('hidden');
  ok.onclick=()=>{cleanup();onOk();};
  document.getElementById('confirm-cancel').onclick=cleanup;
}
function askSave(onSave, onDiscard){
  document.getElementById('confirm-msg').textContent='Möchtest du die Änderungen speichern?';
  const ok=document.getElementById('confirm-ok');
  const discard=document.getElementById('confirm-discard');
  ok.textContent='Speichern'; ok.className='btn-primary';
  discard.style.display=''; discard.textContent='Verwerfen';
  document.getElementById('confirm-overlay').classList.remove('hidden');
  const cleanup=()=>{document.getElementById('confirm-overlay').classList.add('hidden');discard.style.display='none';};
  ok.onclick=()=>{cleanup();onSave();};
  discard.onclick=()=>{cleanup();onDiscard();};
  document.getElementById('confirm-cancel').onclick=cleanup;
}

function hasUnsavedEdits(){
  return typeof hasUnsavedFindingEdit==='function' && hasUnsavedFindingEdit();
}

function confirmLeaveIfDirty(onLeave){
  if(!hasUnsavedEdits()){onLeave();return;}
  ask('Du hast ungespeicherte Änderungen. Möchtest du diese verwerfen?', onLeave, 'Verwerfen', '');
}

function runNavAction(action){
  confirmLeaveIfDirty(()=>{new Function(action)();});
}
