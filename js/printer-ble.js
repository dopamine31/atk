/* Koneksi Bluetooth Low Energy (Web Bluetooth) */
let btDevice=null, btChar=null;

const BT_SERVICES = [
  '000018f0-0000-1000-8000-00805f9b34fb',
  '0000ffe0-0000-1000-8000-00805f9b34fb',
  '0000ffe5-0000-1000-8000-00805f9b34fb',
  '0000ff00-0000-1000-8000-00805f9b34fb',
  '0000fff0-0000-1000-8000-00805f9b34fb',
  '0000fee7-0000-1000-8000-00805f9b34fb',
  '0000ae30-0000-1000-8000-00805f9b34fb',
  '0000af30-0000-1000-8000-00805f9b34fb',
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
  '49535343-fe7d-4ae5-8fa9-9fafd205e455'
];

async function findWritable(server){
  const services = await server.getPrimaryServices();
  for(const s of services){
    let chars=[];
    try{ chars = await s.getCharacteristics(); }catch{ continue; }
    for(const c of chars){
      if(c.properties.write || c.properties.writeWithoutResponse) return c;
    }
  }
  throw new Error('Characteristic tulis tidak ditemukan. Printer kemungkinan Bluetooth Classic, bukan BLE. Gunakan mode COM Port.');
}

async function connectBLE(){
  if(!navigator.bluetooth){
    alert('Browser tidak mendukung Web Bluetooth.\nGunakan Chrome/Edge lewat HTTPS atau localhost.');
    return false;
  }
  try{
    if(!btDevice){
      btDevice = await navigator.bluetooth.requestDevice({acceptAllDevices:true, optionalServices:BT_SERVICES});
      btDevice.addEventListener('gattserverdisconnected',()=>{
        btChar=null; if(printerMode==='ble') setPrinterUI(false);
      });
    }
    if(!btDevice.gatt.connected) await btDevice.gatt.connect();
    btChar = await findWritable(btDevice.gatt);
    setPrinterUI(true, btDevice.name||'BLE');
    toast('Printer BLE terhubung');
    return true;
  }catch(e){
    console.error(e);
    if(e.name!=='NotFoundError') alert('Gagal konek BLE: '+e.message);
    try{ btDevice?.gatt?.disconnect(); }catch{}
    btDevice=null; btChar=null; setPrinterUI(false);
    return false;
  }
}

async function bleSend(data){
  if(!btChar || !btDevice?.gatt?.connected){
    if(!(await connectBLE())) return false;
  }
  const CH = 20;
  const useResp = btChar.properties.write;
  try{
    for(let i=0;i<data.length;i+=CH){
      const part = data.slice(i,i+CH);
      if(useResp) await btChar.writeValue(part);
      else await btChar.writeValueWithoutResponse(part);
      await sleep(20);
    }
    return true;
  }catch(e){
    btChar=null;
    throw new Error('BLE gagal kirim: '+e.message);
  }
}