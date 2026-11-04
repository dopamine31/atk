/* Backup & restore data */
function backup(){
  const data = {products,settings,history,seq:load(KEY.seq,0)};
  const blob = new Blob([JSON.stringify(data)],{type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'backup-kasir-atk-'+new Date().toISOString().slice(0,10)+'.json';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),1500);
}

function restore(ev){
  const f = ev.target.files[0]; if(!f) return;
  const r = new FileReader();
  r.onload = ()=>{
    try{
      const d = JSON.parse(r.result);
      if(!Array.isArray(d.products)) throw new Error('format salah');
      if(!confirm('Data saat ini akan diganti dengan isi backup. Lanjutkan?')) return;
      save(KEY.products, d.products);
      save(KEY.settings, {...defaultSettings, ...(d.settings||{})});
      save(KEY.history, Array.isArray(d.history)?d.history:[]);
      save(KEY.seq, +d.seq||0);
      location.reload();
    }catch(e){ alert('File backup tidak valid'); }
  };
  r.readAsText(f);
  ev.target.value='';
}