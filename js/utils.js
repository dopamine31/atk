/* Fungsi bantu umum */
const $ = id => document.getElementById(id);
const rp = n => Number(n||0).toLocaleString('id-ID');
const pad = n => String(n).padStart(2,'0');
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const toLocalInput = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

const load = (k,d) => {
  try{ const v=JSON.parse(localStorage.getItem(k)); return v ?? d }
  catch{ return d }
};
const save = (k,v) => {
  try{ localStorage.setItem(k, JSON.stringify(v)); return true; }
  catch(e){
    alert('Gagal menyimpan data (penyimpanan penuh atau diblokir). Lakukan backup lalu hapus riwayat lama.');
    return false;
  }
};