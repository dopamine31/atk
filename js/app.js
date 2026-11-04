/* Inisialisasi aplikasi (dimuat paling akhir) */
$('hdrName').textContent = settings.name;
$('appVersion').textContent = APP_VERSION;
if(!/Android/i.test(navigator.userAgent)) $('btnRaw').style.display='none';

setPrinterUI(false);
syncTime();
renderProducts();
renderCart();

if(!window.isSecureContext){
  setTimeout(()=>toast('Buka lewat https:// atau localhost agar Bluetooth/COM berfungsi'),500);
}
if('serviceWorker' in navigator && location.protocol.startsWith('http')){
  navigator.serviceWorker.register('sw.js').catch(()=>{});
}