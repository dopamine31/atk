/* Navigasi, toast, dan elemen UI umum */
function go(p, btn){
  document.querySelectorAll('.page').forEach(e=>e.classList.remove('active'));
  $('p-'+p).classList.add('active');
  document.querySelectorAll('nav button').forEach(e=>e.classList.remove('active'));
  btn.classList.add('active');
  if(p==='riwayat') renderHistory();
  if(p==='produk') renderProdList();
  if(p==='setting') loadSettingsForm();
}

function toast(msg){
  const t=$('toast'); t.textContent=msg; t.style.display='block';
  clearTimeout(t._t); t._t=setTimeout(()=>t.style.display='none',2800);
}

function renameStore(){
  const v = prompt('Nama toko (tercetak di struk):', settings.name);
  if(v===null) return;
  const n = v.trim(); if(!n) return toast('Nama toko tidak boleh kosong');
  settings.name = n; save(KEY.settings,settings);
  $('hdrName').textContent = n; toast('Nama toko diubah');
}