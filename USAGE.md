# NotifKu — Panduan Penggunaan

## Daftar Isi

1. [Instalasi & Setup](#1-instalasi--setup)
2. [Menjalankan Aplikasi](#2-menjalankan-aplikasi)
3. [Panduan Fitur](#3-panduan-fitur)
4. [Konfigurasi Production](#4-konfigurasi-production)
5. [Troubleshooting](#5-troubleshooting)

---

## 1. Instalasi & Setup

### Prasyarat

| Software | Versi Minimum |
|----------|---------------|
| PHP | 8.2+ |
| Composer | 2.x |
| Node.js | 18+ |
| MySQL | 8.0+ |

### Langkah Instalasi

```bash
# 1. Clone repo
git clone <repo-url> notifku
cd notifku

# 2. Install dependensi PHP
composer install

# 3. Install dependensi Node.js
npm install

# 4. Salin file environment
cp .env.example .env

# 5. Generate application key
php artisan key:generate

# 6. Konfigurasi database di .env
# Edit DB_DATABASE, DB_USERNAME, DB_PASSWORD

# 7. Buat database MySQL
mysql -u root -p -e "CREATE DATABASE notifku"

# 8. Jalankan migrasi & seeder
php artisan migrate --seed

# 9. Buat symlink storage
php artisan storage:link

# 10. Build assets (production)
npm run build
```

### Akun Demo

| Username | Email | Password |
|----------|-------|----------|
| `alice` | alice@notifku.com | `password` |
| `bob` | bob@notifku.com | `password` |
| `charlie` | charlie@notifku.com | `password` |
| `diana` | diana@notifku.com | `password` |

---

## 2. Menjalankan Aplikasi

Buka **4 terminal** terpisah:

```bash
# Terminal 1 — Laravel server
php artisan serve

# Terminal 2 — Vite dev server (hot reload)
npm run dev

# Terminal 3 — WebSocket server (notifikasi real-time)
php artisan reverb:start

# Terminal 4 — Queue worker (proses notifikasi)
php artisan queue:work
```

Akses aplikasi di: **http://localhost:8000**

---

## 3. Panduan Fitur

### 3.1 Registrasi & Login

1. Buka `http://localhost:8000` → otomatis redirect ke halaman Login.
2. Klik **"Daftar"** untuk buat akun baru — isi nama, username, email, password.
3. Setelah register, otomatis login dan masuk ke halaman **Feed**.
4. Untuk logout, klik ikon logout di navbar kanan atas.

### 3.2 Feed

- Halaman utama setelah login.
- Menampilkan postingan dari **user yang kamu ikuti** dan **postinganmu sendiri**.
- Postingan diurutkan dari **terbaru**.
- Di bagian atas ada form untuk membuat postingan baru.

### 3.3 Membuat Post

1. Di halaman Feed, tulis teks di form "Apa yang kamu pikirkan?"
2. (Opsional) Klik tombol **📷 Foto** untuk melampirkan gambar.
3. Preview gambar muncul — klik **✕** untuk menghapus jika salah.
4. Klik **Posting** untuk mempublikasikan.

### 3.4 Like & Comment

**Like:**
- Klik ikon **❤️ (hati)** di postingan untuk like/unlike.
- Jumlah like diperbarui secara instan.

**Comment:**
1. Klik ikon **💬 (komentar)** atau buka halaman detail post.
2. Tulis komentar di form bawah → klik **Kirim**.
3. Untuk **membalas komentar**, klik **Balas** pada komentar yang ingin dibalas.
4. Indikator "Membalas [nama]" muncul di atas form — klik **Batal** untuk membatalkan reply.

### 3.5 Profil

**Melihat Profil:**
- Klik avatar/nama di postingan atau di navbar.
- Halaman profil menampilkan: foto, nama, username, bio, jumlah post/pengikut/mengikuti.

**Edit Profil:**
1. Di halaman profil sendiri, klik **Edit Profil**.
2. Ubah foto (klik avatar), nama, username, atau bio.
3. Klik **Simpan Perubahan**.

### 3.6 Follow / Unfollow

1. Buka profil user lain.
2. Klik **Ikuti** untuk follow — tombol berubah jadi **Mengikuti**.
3. Klik **Mengikuti** untuk unfollow.
4. Klik angka **Pengikut** atau **Mengikuti** untuk melihat daftar.

### 3.7 Notifikasi Real-Time

**Toast Popup:**
- Saat ada aktivitas (follow, like, comment, reply), notifikasi muncul sebagai **toast** di sudut kanan atas secara real-time.
- Klik **Lihat** pada toast untuk navigasi ke halaman terkait.

**Bell Icon:**
- Ikon lonceng 🔔 di navbar menampilkan **badge merah** jika ada notifikasi belum dibaca.
- Badge menunjukkan jumlah notifikasi yang belum dibaca.

**Halaman Notifikasi:**
1. Klik ikon 🔔 di navbar untuk masuk ke halaman notifikasi.
2. Notifikasi belum dibaca ditandai dengan **titik biru**.
3. Klik notifikasi untuk: menandai sudah dibaca + navigasi ke halaman terkait.
4. Klik **Tandai semua dibaca** untuk menandai semua sekaligus.

**Jenis Notifikasi:**

| Ikon | Kejadian | Navigasi |
|------|----------|----------|
| 👤 | Seseorang follow kamu | Profil orang tersebut |
| ❤️ | Seseorang like post kamu | Halaman post |
| 💬 | Seseorang komentar di post kamu | Halaman post |
| ↩️ | Seseorang balas komentar kamu | Halaman post |
| 📢 | Pengumuman sistem | — |

> **Catatan:** Kamu TIDAK akan menerima notifikasi dari aktivitasmu sendiri.

### 3.8 Hapus Konten

- **Hapus Post:** Buka halaman detail post milikmu → klik ikon 🗑️ di kanan atas.
- **Hapus Komentar:** Di komentar milikmu → klik **Hapus**.

---

## 4. Konfigurasi Production

### 4.1 File `.env` Production

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://notifku.com

REVERB_SCHEME=https
VITE_REVERB_HOST=notifku.com
VITE_REVERB_PORT=443
VITE_REVERB_SCHEME=https
```

### 4.2 Build Assets

```bash
npm run build
```

### 4.3 Supervisor (Reverb + Queue)

Buat file `/etc/supervisor/conf.d/notifku.conf`:

```ini
[program:notifku-reverb]
directory=/path/to/notifku
command=php artisan reverb:start --host=0.0.0.0 --port=8080
autostart=true
autorestart=true
user=www-data
stdout_logfile=/var/log/notifku/reverb.log

[program:notifku-queue]
directory=/path/to/notifku
command=php artisan queue:work database --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
user=www-data
stdout_logfile=/var/log/notifku/queue.log
```

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start all
```

### 4.4 Apache Reverse Proxy (WebSocket)

```apache
<IfModule mod_proxy.c>
    ProxyPreserveHost On
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /app/(.*) ws://127.0.0.1:8080/app/$1 [P,L]
    ProxyPass /app/ http://127.0.0.1:8080/app/
    ProxyPassReverse /app/ http://127.0.0.1:8080/app/
</IfModule>
```

---

## 5. Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Halaman blank / error 500 | Cek `storage/logs/laravel.log`. Pastikan `APP_KEY` sudah di-generate. |
| Notifikasi tidak real-time | Pastikan Reverb server berjalan (`php artisan reverb:start`). Cek console browser untuk error WebSocket. |
| Gambar tidak muncul | Jalankan `php artisan storage:link`. Pastikan `FILESYSTEM_DISK=public` di `.env`. |
| WebSocket error di production | Pastikan reverse proxy dikonfigurasi untuk WebSocket. Gunakan `wss://` (HTTPS). |
| Queue tidak jalan | Pastikan `QUEUE_CONNECTION=database` dan `php artisan queue:work` berjalan. |
| CSS tidak tampil | Jalankan `npm run dev` (development) atau `npm run build` (production). |
