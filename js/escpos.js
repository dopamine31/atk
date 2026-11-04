/* Pembuat perintah ESC/POS untuk printer thermal */
function clean(s){
  return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\x20-\x7E]/g,'?');
}

function escpos(t){
  const out = [0x1B,0x40, 0x1B,0x4D,0x00, 0x1B,0x74,0x00]; // init, font A, code page 0
  const push = arr => { for(const b of arr) out.push(b); };
  const A = {l:0,c:1,r:2};

  receiptLines(t).forEach(l=>{
    push([0x1B,0x61,A[l.a||'l']]);

    if(l.type==='logo'){
      if(settings.logo) push(rasterBytes(settings.logo));
      return;
    }
    if(l.type==='barcode'){
      const data = '{B'+clean(l.v);
      push([0x1D,0x68,60, 0x1D,0x77,2, 0x1D,0x48,0, 0x1D,0x6B,73,data.length]);
      push(Array.from(new TextEncoder().encode(data)));
      out.push(0x0A);
      return;
    }
    if(l.type==='qr'){
      const d = Array.from(new TextEncoder().encode(clean(l.v).slice(0,200)));
      const n = d.length+3;
      push([0x1D,0x28,0x6B,4,0,0x31,0x41,0x32,0]);        // model 2
      push([0x1D,0x28,0x6B,3,0,0x31,0x43,6]);             // ukuran modul
      push([0x1D,0x28,0x6B,3,0,0x31,0x45,0x31]);          // koreksi error
      push([0x1D,0x28,0x6B,n&255,n>>8,0x31,0x50,0x30]);   // simpan data
      push(d);
      push([0x1D,0x28,0x6B,3,0,0x31,0x51,0x30]);          // cetak
      out.push(0x0A);
      return;
    }

    push([0x1B,0x45,l.b?1:0]);
    push([0x1D,0x21,l.s||0]);
    push(Array.from(new TextEncoder().encode(clean(l.t))));
    out.push(0x0A);
  });

  push([0x1D,0x21,0]); push([0x1B,0x45,0]); push([0x1B,0x61,0]);
  push([0x1B,0x64,Math.min(Math.max(+settings.feed||0,0),20)]);
  if(settings.cut) push([0x1D,0x56,0x42,0x00]);
  return new Uint8Array(out);
}