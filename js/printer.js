/* Pengatur cetak: memilih metode (serial / ble / browser) */
let printerMode = settings.mode;

function setPrinterUI(on,label){
  const b=$('btnPrinter');
  if(printerMode==='browser'){ b.classList.add('on'); b.textContent='Printer: Browser'; return; }
  b.classList.toggle('on',!!on);
  b.textContent = on ? 'Printer: '+(label||'OK') : 'Printer: Putus';
}

async function connectPrinter(){
  if(printerMode==='serial') return connectSerial();
  if(printerMode==='ble')    return connectBLE();
  toast('Mode Browser: printer dipilih di dialog cetak Windows');
  return true;
}

async function sendBytes(data){
  if(printerMode==='serial') return serialSend(data);
  if(printerMode==='ble')    return bleSend(data);
  return false;
}

async function printTrx(t){
  if(printerMode==='browser'){
    showPreview(t);
    setTimeout(()=>window.print(),300);
    return;
  }
  try{
    const ok = await sendBytes(escpos(t));
    toast(ok ? 'Struk dicetak ✔' : 'Gagal mencetak / printer belum terhubung');
  }catch(e){
    console.error(e);
    alert('Error cetak: '+e.message+'\nStruk tetap tersimpan di Riwayat, bisa dicetak ulang.');
  }
}

function printLast(){ if(lastTrx) printTrx(lastTrx); }

function printRawBT(){
  if(!lastTrx) return;
  const bytes = escpos(lastTrx);
  let bin=''; bytes.forEach(b=>bin+=String.fromCharCode(b));
  location.href = 'intent:base64,'+btoa(bin)+'#Intent;scheme=rawbt;package=ru.a402d.rawbtprinter;end;';
}

function testPrint(){
  const t = {
    no:'TEST-0001', time:new Date().toISOString(), cust:'Umum',
    cashier:settings.cashier||'Admin', method:'Tunai',
    items:[
      {name:'Buku Tulis 38 Lbr',price:3500,qty:2},
      {name:'Pulpen Standard',price:2500,qty:1},
      {name:'Kertas HVS A4 (rim) Sinar Dunia',price:52000,qty:1}
    ],
    sub:61500, disc:1500, total:60000, paid:100000, change:40000
  };
  lastTrx=t; showPreview(t); printTrx(t);
}