/* Form pengaturan */
function loadSettingsForm(){
  $('sName').value=settings.name; $('sAddr').value=settings.addr; $('sTel').value=settings.tel;
  $('sCashier').value=settings.cashier; $('sFoot').value=settings.foot; $('sNote').value=settings.note;
  $('sWidth').value=settings.width; $('sFeed').value=settings.feed;
  $('sCut').checked=settings.cut; $('sMode').value=settings.mode; $('sBaud').value=String(settings.baud);
  $('sBarcode').checked=settings.barcode; $('sQR').value=settings.qr; $('sQRCap').value=settings.qrCap;
  renderLogoPrev();
}

async function saveSettings(){
  const newMode = $('sMode').value;
  const w = parseInt($('sWidth').value);
  settings = {
    ...settings,
    name:$('sName').value.trim()||'TOKO ATK', addr:$('sAddr').value, tel:$('sTel').value,
    cashier:$('sCashier').value.trim(), foot:$('sFoot').value, note:$('sNote').value,
    width:(w>=16 && w<=48)?w:32,
    feed:Math.max(0,parseInt($('sFeed').value)||0),
    cut:$('sCut').checked, mode:newMode, baud:parseInt($('sBaud').value)||9600,
    barcode:$('sBarcode').checked, qr:$('sQR').value.trim(), qrCap:$('sQRCap').value.trim()
  };
  save(KEY.settings,settings);
  $('hdrName').textContent=settings.name;
  if(newMode!==printerMode || printerMode==='serial'){ await closeSerial(); }
  printerMode = newMode;
  setPrinterUI(false);
  toast('Pengaturan disimpan');
}