/* Koneksi COM Port (Web Serial) */
let serialPort=null, serialWriter=null;

async function closeSerial(){
  try{ if(serialWriter) serialWriter.releaseLock(); }catch{}
  serialWriter=null;
  try{ if(serialPort) await serialPort.close(); }catch{}
  serialPort=null;
}

async function openSerial(port){
  await port.open({baudRate:+settings.baud||9600});
  serialPort = port;
  serialWriter = port.writable.getWriter();
}

async function connectSerial(){
  if(!('serial' in navigator)){
    alert('Browser tidak mendukung Web Serial.\nGunakan Google Chrome atau Microsoft Edge versi desktop.');
    return false;
  }
  try{
    await closeSerial();
    const port = await navigator.serial.requestPort();
    await openSerial(port);
    setPrinterUI(true,'COM');
    toast('Printer COM terhubung');
    return true;
  }catch(e){
    console.error(e);
    await closeSerial();
    setPrinterUI(false);
    if(e.name!=='NotFoundError'){
      alert('Gagal membuka COM port: '+e.message+
        '\n\nPastikan: printer menyala & sudah di-pair, port yang dipilih adalah COM "Outgoing", dan port tidak dipakai aplikasi lain.');
    }
    return false;
  }
}

async function serialSend(data){
  if(!serialWriter){
    if(serialPort){ try{ await openSerial(serialPort); }catch{ await closeSerial(); } }
    if(!serialWriter && !(await connectSerial())) return false;
  }
  try{
    const CH = 512;
    for(let i=0;i<data.length;i+=CH){
      await serialWriter.write(data.slice(i,i+CH));
    }
    return true;
  }catch(e){
    await closeSerial(); setPrinterUI(false);
    throw new Error('COM terputus: '+e.message+' (tekan Cetak lagi untuk menyambung ulang)');
  }
}

if('serial' in navigator){
  navigator.serial.addEventListener('disconnect', e=>{
    if(e.target===serialPort){
      serialWriter=null; serialPort=null;
      if(printerMode==='serial') setPrinterUI(false);
      toast('Printer COM terputus');
    }
  });
}