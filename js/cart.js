/* Keranjang, perhitungan, tanggal/jam transaksi, checkout */

/* ---- Tanggal & jam ---- */
let autoTime = true;
function syncTime(){ if(autoTime) $('trxTime').value = toLocalInput(new Date()); }
function onTimeEdit(){ autoTime=false; $('autoTime').checked=false; }
function toggleAuto(){ autoTime = $('autoTime').checked; syncTime(); }
function resetTime(){ autoTime=true; $('autoTime').checked=true; syncTime(); }
function trxDate(){
  if(autoTime) return new Date();
  const v = $('trxTime').value;
  const d = v ? new Date(v) : null;
  return (d && !isNaN(d)) ? d : null;
}
setInterval(syncTime, 15000);

/* ---- Daftar produk di halaman kasir ---- */
function renderProducts(){
  const q = $('search').value.toLowerCase();
  if(!products.length){
    $('prodGrid').innerHTML = '<div class="empty">Belum ada produk. Tambahkan di tab Produk, atau gunakan tombol "+ Item manual".</div>';
    return;
  }
  $('prodGrid').innerHTML = products
    .filter(p=>p.name.toLowerCase().includes(q))
    .map(p=>`<button class="prod" onclick="addToCart(${p.id})"><b>${esc(p.name)}</b><span>Rp ${rp(p.price)}</span></button>`).join('')
    || '<div class="empty">Produk tidak ditemukan</div>';
}

/* ---- Keranjang ---- */
function addToCart(id){
  const p = products.find(x=>x.id===id); if(!p) return;
  const c = cart.find(x=>x.id===id);
  c ? c.qty++ : cart.push({id:p.id,name:p.name,price:p.price,qty:1});
  renderCart();
}
function addCustom(){
  const name = (prompt('Nama item:')||'').trim(); if(!name) return;
  const price = parseInt(prompt('Harga satuan:'));
  if(isNaN(price) || price<0) return toast('Harga tidak valid');
  cart.push({id:'c'+Date.now(),name,price,qty:1});
  renderCart();
}
function chgQty(i,d){
  cart[i].qty += d;
  if(cart[i].qty<=0) cart.splice(i,1);
  renderCart();
}
function renderCart(){
  $('cart').innerHTML = cart.length ? cart.map((c,i)=>`
    <div class="item">
      <div class="nm">${esc(c.name)}<small>Rp ${rp(c.price)}</small></div>
      <div class="qty">
        <button onclick="chgQty(${i},-1)">−</button><b>${c.qty}</b><button onclick="chgQty(${i},1)">+</button>
      </div>
      <div style="min-width:70px;text-align:right">${rp(c.price*c.qty)}</div>
    </div>`).join('') : '<div class="empty">Keranjang kosong</div>';
  calc();
}
function clearCart(){
  cart=[]; $('disc').value=0; $('paid').value=''; $('cust').value=''; $('method').value='Tunai';
  resetTime(); renderCart();
}

/* ---- Perhitungan ---- */
function totals(){
  const sub = cart.reduce((a,c)=>a+c.price*c.qty,0);
  const disc = Math.max(0, Math.min(parseInt($('disc').value)||0, sub));
  const total = sub-disc;
  const method = $('method').value;
  const paid = method==='Tunai' ? (parseInt($('paid').value)||0) : total;
  return {sub,disc,total,paid,change:paid-total,method};
}
function calc(){
  const t = totals();
  const cash = t.method==='Tunai';
  $('paid').disabled = !cash;
  if(!cash) $('paid').value='';
  $('tSub').textContent = rp(t.sub);
  $('tDisc').textContent = rp(t.disc);
  $('tTotal').textContent = rp(t.total);
  $('tChange').textContent = (cash && t.paid) ? rp(Math.max(t.change,0)) : '0';
}
function exactPay(){
  if($('method').value!=='Tunai') return;
  $('paid').value = totals().total; calc();
}

/* ---- Transaksi ---- */
function buildTrx(){
  const t = totals();
  const d = trxDate() || new Date();
  const seq = load(KEY.seq,0)+1;
  const paid = t.paid || t.total;
  return {
    no:`${String(d.getFullYear()).slice(2)}${pad(d.getMonth()+1)}${pad(d.getDate())}-${String(seq).padStart(4,'0')}`,
    seq, time:d.toISOString(),
    cust:$('cust').value.trim()||'Umum',
    cashier:settings.cashier||'',
    method:t.method,
    items:cart.map(c=>({...c})),
    sub:t.sub, disc:t.disc, total:t.total, paid, change:Math.max(paid-t.total,0)
  };
}
function validate(){
  if(!cart.length){ toast('Keranjang kosong'); return false; }
  if(!trxDate()){ toast('Tanggal/jam tidak valid'); return false; }
  const t = totals();
  if(t.method==='Tunai' && t.paid && t.paid < t.total){ toast('Uang bayar kurang!'); return false; }
  return true;
}
function previewCurrent(){
  if(!validate()) return;
  const t = buildTrx(); t.no = 'PREVIEW';
  lastTrx = t; showPreview(t);
}
async function checkout(){
  if(busy || !validate()) return;
  busy = true; $('btnCheckout').disabled = true;
  try{
    const t = buildTrx();
    history.unshift(t);
    history.sort((a,b)=>new Date(b.time)-new Date(a.time));
    if(history.length>HISTORY_MAX) history.length = HISTORY_MAX;
    save(KEY.history,history); save(KEY.seq,t.seq);
    lastTrx = t;
    showPreview(t);
    clearCart();
    await printTrx(t);
  } finally {
    busy = false; $('btnCheckout').disabled = false;
  }
}