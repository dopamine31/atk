/* Riwayat transaksi & ubah tanggal */
function renderHistory(){
  const today = new Date().toDateString();
  $('todaySum').textContent = 'Rp '+rp(
    history.filter(h=>new Date(h.time).toDateString()===today).reduce((a,h)=>a+h.total,0)
  );
  $('histList').innerHTML = history.slice(0,100).map((h,i)=>`
    <div class="item">
      <div class="nm"><b>${esc(h.no)}</b><small>${new Date(h.time).toLocaleString('id-ID')} · ${esc(h.cust)} · ${esc(h.method||'Tunai')}</small></div>
      <div style="font-weight:700">${rp(h.total)}</div>
      <div class="acts">
        <button class="btn gray sm" onclick="editDt(${i})">Tgl</button>
        <button class="btn sm" onclick="reprint(${i})">Struk</button>
      </div>
    </div>`).join('') || '<div class="empty">Belum ada transaksi</div>';
}

function reprint(i){ lastTrx={...history[i],copy:true}; showPreview(lastTrx); }

function clearHistory(){
  if(confirm('Hapus SEMUA riwayat?')){ history=[]; save(KEY.history,history); renderHistory(); }
}

let dtIdx = -1;
function editDt(i){
  const h = history[i]; if(!h) return;
  dtIdx = i;
  $('dtInfo').textContent = 'Transaksi '+h.no;
  $('dtInput').value = toLocalInput(new Date(h.time));
  $('dtModal').classList.add('show');
}
function closeDt(){ $('dtModal').classList.remove('show'); dtIdx=-1; }
function applyDt(){
  const v = $('dtInput').value, d = v ? new Date(v) : null;
  if(!d || isNaN(d)) return toast('Tanggal/jam tidak valid');
  const h = history[dtIdx]; if(!h) return closeDt();
  h.time = d.toISOString();
  history.sort((a,b)=>new Date(b.time)-new Date(a.time));
  save(KEY.history,history);
  closeDt(); renderHistory(); toast('Tanggal diubah');
}