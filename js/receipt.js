/* Susunan struk (dipakai preview & ESC/POS)
   Baris teks  : {t, a:'l'|'c'|'r', b:bold, s:ukuran (0=normal, 0x11=2x lebar&tinggi)}
   Baris khusus: {type:'logo'|'barcode'|'qr', v, a} */
function receiptLines(t){
  const W = +settings.width || 32;
  const HW = Math.floor(W/2);
  const L = [];
  const line = (txt,a='l',b=false,s=0)=>L.push({t:String(txt),a,b,s});
  const dash = (c='-')=>line(c.repeat(W));
  const row = (l,r,w=W)=>{
    l=String(l); r=String(r);
    const max = w - r.length - 1;
    if(l.length>max) l = l.slice(0,Math.max(max,0));
    return l + ' '.repeat(Math.max(w-l.length-r.length,1)) + r;
  };
  const wrap = (txt,w=W)=>{
    const out=[]; let cur='';
    String(txt||'').split(' ').forEach(x=>{
      while(x.length>w){ if(cur){out.push(cur);cur='';} out.push(x.slice(0,w)); x=x.slice(w); }
      if(!x) return;
      if(cur && (cur+' '+x).length>w){ out.push(cur); cur=x; }
      else cur = cur ? cur+' '+x : x;
    });
    if(cur) out.push(cur);
    return out;
  };

  /* Header */
  if(settings.logo) L.push({type:'logo',a:'c'});
  const name = settings.name.toUpperCase();
  const big = name.length <= HW;
  wrap(name, big?HW:W).forEach(x=>line(x,'c',true,big?0x11:0));
  wrap(settings.addr).forEach(x=>line(x,'c'));
  if(settings.tel) line('Telp/WA: '+settings.tel,'c');
  dash('=');
  if(t.copy){ line('*** SALINAN STRUK ***','c',true); dash(); }

  /* Info transaksi */
  const d = new Date(t.time);
  line(row('No', t.no));
  line(row('Tanggal', `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`));
  line(row('Jam', `${pad(d.getHours())}:${pad(d.getMinutes())}`));
  if(t.cashier) line(row('Kasir', t.cashier));
  line(row('Pelanggan', t.cust));
  dash();

  /* Item */
  t.items.forEach(i=>{
    wrap(i.name).forEach(x=>line(x));
    line(row(`  ${i.qty} x ${rp(i.price)}`, rp(i.qty*i.price)));
  });
  dash();

  /* Total */
  line(row('Subtotal', rp(t.sub)));
  if(t.disc>0) line(row('Diskon', '-'+rp(t.disc)));
  dash('=');
  const totR = 'Rp '+rp(t.total);
  if(('TOTAL'.length+1+totR.length) <= HW) line(row('TOTAL', totR, HW),'l',true,0x11);
  else line(row('TOTAL', totR),'l',true);
  dash('=');
  const method = t.method || 'Tunai';
  line(row('Metode', method));
  if(method==='Tunai'){
    line(row('Bayar', rp(t.paid)));
    line(row('Kembali', rp(t.change)));
  }
  dash();
  const qtyTotal = t.items.reduce((a,i)=>a+i.qty,0);
  line(`${t.items.length} jenis barang, ${qtyTotal} pcs`,'c');
  line('');

  /* Footer */
  wrap(settings.foot).forEach(x=>line(x,'c',true));
  wrap(settings.note).forEach(x=>line(x,'c'));
  if(settings.barcode && t.no!=='PREVIEW'){
    line('');
    L.push({type:'barcode',v:t.no,a:'c'});
  }
  if(settings.qr){
    line('');
    wrap(settings.qrCap).forEach(x=>line(x,'c'));
    L.push({type:'qr',v:settings.qr,a:'c'});
  }
  return L;
}

/* ---- Preview di layar ---- */
function previewHTML(t){
  const W = +settings.width || 32;
  return receiptLines(t).map(l=>{
    if(l.type==='logo') return null;
    let s;
    if(l.type==='barcode') s='▌▐▌▌▐▐▌▐▌▌▐▌▐▐▌▌▐▌▐▌▌';
    else if(l.type==='qr') s='[ QR CODE ]';
    else s = (l.s & 0x10) ? l.t.split('').join(' ') : l.t;
    if(l.a==='c') s = ' '.repeat(Math.max(0,Math.floor((W-s.length)/2)))+s;
    else if(l.a==='r') s = ' '.repeat(Math.max(0,W-s.length))+s;
    return l.b ? '<b>'+esc(s)+'</b>' : esc(s);
  }).filter(x=>x!==null).join('\n');
}
function showPreview(t){
  const W = +settings.width || 32;
  const lg = $('pvLogo');
  if(settings.logo){
    lg.src = settings.logo.url;
    lg.style.width = (settings.logo.w/(384/W))+'ch';
    lg.style.display = 'block';
  } else lg.style.display = 'none';
  $('preview').innerHTML = previewHTML(t);
  $('modal').classList.add('show');
}
function closeModal(){ $('modal').classList.remove('show'); }