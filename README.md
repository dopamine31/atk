# Kasir Toko ATK

Aplikasi kasir berbasis web untuk toko ATK dengan cetak struk thermal 58mm
(ESC/POS) lewat COM Port, Bluetooth BLE, atau dialog cetak browser.

## Fitur
- Kasir, diskon, metode bayar (Tunai/QRIS/Transfer/Debit)
- Tanggal dan jam transaksi bisa diubah
- Kelola produk, riwayat, omzet harian
- Nama toko, alamat, kasir, catatan kaki bisa diubah
- Logo, barcode, QR di struk (opsional)
- Backup/restore (JSON), PWA (bisa di-install dan offline)

## Struktur
```
index.html          halaman utama
manifest.json, sw.js  konfigurasi PWA
assets/icons/       ikon aplikasi
css/                base, components, print
js/                 satu file per fitur (lihat komentar di tiap file)
```

## Menjalankan
- Online: https://USERNAME.github.io/kasir-atk/
- Lokal: buka `index.html` di Chrome/Edge, atau jalankan server statis apa saja.

Gunakan Google Chrome atau Microsoft Edge di desktop.

## Catatan
- Data disimpan di browser (localStorage), tidak dikirim ke server.
- Urutan tag `<script>` di `index.html` penting, jangan diubah.
- Lakukan backup berkala dari menu Setelan.