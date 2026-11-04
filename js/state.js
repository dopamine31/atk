/* Data aplikasi & pengaturan awal */
const APP_VERSION = '2.1.0';
const KEY = {
  products:'atk_products',
  settings:'atk_settings',
  history :'atk_history',
  seq     :'atk_seq'
};
const HISTORY_MAX = 2000;

const defaultMode = ('serial' in navigator) ? 'serial' : (navigator.bluetooth ? 'ble' : 'browser');
const defaultSettings = {
  name:'TOKO ATK', addr:'', tel:'',
  cashier:'', foot:'Terima kasih sudah berbelanja!',
  note:'Barang yang sudah dibeli tidak dapat ditukar/dikembalikan',
  width:32, feed:3, cut:false, mode:defaultMode, baud:9600,
  logo:null, barcode:false, qr:'', qrCap:''
};

let products = load(KEY.products, []);
let settings = {...defaultSettings, ...load(KEY.settings, {})};
let history  = load(KEY.history, []);

let cart = [];
let lastTrx = null;
let busy = false;