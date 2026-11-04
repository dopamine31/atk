/* Upload logo & konversi ke bitmap hitam-putih untuk printer thermal */
function uploadLogo(ev){
  const f = ev.target.files[0]; ev.target.value=''; if(!f) return;
  const img = new Image(), url = URL.createObjectURL(f);
  img.onload = ()=>{
    URL.revokeObjectURL(url);
    const MAXW=256, MAXH=120;
    const sc = Math.min(MAXW/img.width, MAXH/img.height);
    const w = Math.max(8, Math.floor(img.width*sc/8)*8);
    const h = Math.max(1, Math.round(img.height*sc));
    const c = document.createElement('canvas'); c.width=w; c.height=h;
    const x = c.getContext('2d');
    x.fillStyle='#fff'; x.fillRect(0,0,w,h); x.drawImage(img,0,0,w,h);
    const id = x.getImageData(0,0,w,h), d = id.data, wb = w/8, bytes = new Uint8Array(wb*h);
    for(let yy=0; yy<h; yy++){
      for(let xx=0; xx<w; xx++){
        const i=(yy*w+xx)*4;
        const g = 0.299*d[i]+0.587*d[i+1]+0.114*d[i+2];
        const black = g<150;
        if(black) bytes[yy*wb+(xx>>3)] |= 0x80>>(xx&7);
        const v = black?0:255; d[i]=d[i+1]=d[i+2]=v; d[i+3]=255;
      }
    }
    x.putImageData(id,0,0);
    let bin=''; bytes.forEach(b=>bin+=String.fromCharCode(b));
    settings.logo = {w,h,data:btoa(bin),url:c.toDataURL('image/png')};
    save(KEY.settings,settings);
    renderLogoPrev(); toast('Logo disimpan');
  };
  img.onerror = ()=>{ URL.revokeObjectURL(url); toast('Gambar tidak bisa dibaca'); };
  img.src = url;
}
function removeLogo(){
  settings.logo = null; save(KEY.settings,settings); renderLogoPrev(); toast('Logo dihapus');
}
function renderLogoPrev(){
  const p = $('logoPrev');
  if(settings.logo){ p.src = settings.logo.url; p.style.display='block'; }
  else p.style.display='none';
}
function rasterBytes(logo){
  const bin = atob(logo.data), wb = logo.w/8, out = [], BAND = 128;
  for(let y=0; y<logo.h; y+=BAND){
    const hh = Math.min(BAND, logo.h-y);
    out.push(0x1D,0x76,0x30,0x00, wb&255, wb>>8, hh&255, hh>>8);
    for(let i=y*wb; i<(y+hh)*wb; i++) out.push(bin.charCodeAt(i));
  }
  return out;
}