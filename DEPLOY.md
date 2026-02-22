# NotifKu — Panduan Deploy Production

> **Stack:** cPanel + LiteSpeed + CloudLinux + CSF Firewall

---

## Daftar Isi

1. [Persiapan Server](#1-persiapan-server)
2. [Upload & Setup Project](#2-upload--setup-project)
3. [Konfigurasi Database](#3-konfigurasi-database)
4. [Konfigurasi Environment](#4-konfigurasi-environment)
5. [Build Assets](#5-build-assets)
6. [Menjalankan Reverb & Queue](#6-menjalankan-reverb--queue)
7. [Konfigurasi WebSocket](#7-konfigurasi-websocket)
8. [Konfigurasi LiteSpeed](#8-konfigurasi-litespeed)
9. [CSF Firewall](#9-csf-firewall)
10. [Checklist Final](#10-checklist-final)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Persiapan Server

### Persyaratan

| Komponen | Versi Minimum |
|----------|---------------|
| PHP | 8.2+ |
| Composer | 2.x |
| Node.js | 18+ (untuk build) |
| MySQL/MariaDB | 8.0+ / 10.6+ |
| cPanel | — |
| LiteSpeed | — |

### Ekstensi PHP yang Diperlukan

Pastikan ekstensi ini aktif di cPanel → **Select PHP Version**:

```
bcmath, ctype, curl, dom, fileinfo, json,
mbstring, openssl, pcre, pdo, pdo_mysql,
tokenizer, xml, pcntl
```

> **Penting:** `pcntl` diperlukan oleh Laravel Reverb. Di CloudLinux, ekstensi ini mungkin
> perlu diaktifkan oleh administrator hosting.

### Install Node.js di cPanel

Jika Node.js belum tersedia, install via **nvm**:

```bash
# SSH ke server
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
node -v  # pastikan v20.x
```

---

## 2. Upload & Setup Project

### Struktur Direktori cPanel

```
/home/username/
├── public_html/          ← document root (symlink nanti)
├── notifku/              ← folder project Laravel
│   ├── app/
│   ├── public/           ← akan di-symlink ke public_html
│   ├── storage/
│   └── ...
```

### Langkah Upload

```bash
# SSH ke server
cd /home/username

# Clone repo (atau upload via File Manager/FTP)
git clone [REPO_URL] notifku
cd notifku

# Install dependensi PHP
composer install --no-dev --optimize-autoloader

# Install dependensi Node.js
npm ci
```

### Setup Document Root

Ada 2 opsi untuk menghubungkan `public/` ke `public_html`:

**Opsi A — Symlink (Direkomendasikan)**

```bash
# Backup public_html lama
mv /home/username/public_html /home/username/public_html_backup

# Buat symlink
ln -s /home/username/notifku/public /home/username/public_html
```

**Opsi B — .htaccess redirect di public_html**

Jika tidak bisa symlink, salin isi `public/` ke `public_html/` dan edit `index.php`:

```php
// Ubah path di public_html/index.php
require __DIR__.'/../notifku/vendor/autoload.php';
$app = require_once __DIR__.'/../notifku/bootstrap/app.php';
```

### Set Permissions

```bash
cd /home/username/notifku

# Storage & cache harus writable
chmod -R 775 storage bootstrap/cache
chown -R username:username storage bootstrap/cache
```

---

## 3. Konfigurasi Database

### Buat Database di cPanel

1. Login cPanel → **MySQL Databases**
2. Buat database baru: misal `username_notifku`
3. Buat user baru: misal `username_notifku`
4. **Add User to Database** → pilih ALL PRIVILEGES

### Jalankan Migrasi

```bash
cd /home/username/notifku

# Copy file env
cp .env.production .env
# EDIT .env → isi DB_DATABASE, DB_USERNAME, DB_PASSWORD

# Generate app key (jika belum)
php artisan key:generate

# Jalankan migrasi
php artisan migrate --force

# (Opsional) Jalankan seeder untuk data demo
php artisan db:seed --force

# Buat symlink storage
php artisan storage:link
```

---

## 4. Konfigurasi Environment

Pilih salah satu file `.env` sesuai arsitektur yang diinginkan:

| File | Cara Kerja | Port di CSF |
|------|-----------|-------------|
| `.env.production` | Browser → wss://domain:8080 → Reverb | **8080 harus dibuka** |
| `.env.production.proxy` | Browser → wss://domain:443 → LiteSpeed → Reverb | **Tidak perlu buka port** |

```bash
cd /home/username/notifku

# Tanpa proxy:
cp .env.production .env

# ATAU dengan proxy LiteSpeed:
cp .env.production.proxy .env
```

### Edit .env — Ganti Semua Placeholder

```bash
nano .env
```

| Placeholder | Contoh Nilai |
|---|---|
| `[GANTI_DOMAIN]` | `notifku.example.com` |
| `[GANTI_DB_NAME]` | `roki_notifku` |
| `[GANTI_DB_USER]` | `roki_notifku` |
| `[GANTI_DB_PASS]` | `P@ssw0rd123` |
| `[GANTI_RANDOM_ID]` | `894592` |
| `[GANTI_RANDOM_KEY]` | Gunakan: `php -r "echo bin2hex(random_bytes(10));"` |
| `[GANTI_RANDOM_SECRET]` | Gunakan: `php -r "echo bin2hex(random_bytes(10));"` |

### Optimisasi Config

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

---

## 5. Build Assets

Build dilakukan di server (atau lokal lalu upload folder `public/build/`):

```bash
cd /home/username/notifku

# Build production assets
npm run build

# Verifikasi output
ls -la public/build/assets/
```

> **Tips:** Jika Node.js tidak tersedia di server, build di lokal lalu upload
> folder `public/build/` via FTP/File Manager.

---

## 6. Menjalankan Reverb & Queue

Reverb dan Queue Worker harus berjalan terus-menerus di background.

### Opsi A — Supervisor (Direkomendasikan, perlu akses root)

Buat file `/etc/supervisor/conf.d/notifku.conf`:

```ini
[program:notifku-reverb]
process_name=%(program_name)s
command=php /home/username/notifku/artisan reverb:start --host=0.0.0.0 --port=8080
autostart=true
autorestart=true
user=username
redirect_stderr=true
stdout_logfile=/home/username/notifku/storage/logs/reverb.log
stopwaitsecs=3600

[program:notifku-queue]
process_name=%(program_name)s_%(process_num)02d
command=php /home/username/notifku/artisan queue:work database --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
user=username
numprocs=1
redirect_stderr=true
stdout_logfile=/home/username/notifku/storage/logs/queue.log
stopwaitsecs=3600
```

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start notifku-reverb
sudo supervisorctl start notifku-queue:*

# Cek status
sudo supervisorctl status
```

### Opsi B — Cron Job + nohup (Tanpa akses root)

Jika tidak punya akses Supervisor, gunakan cron untuk auto-restart:

**1. Buat script start:**

```bash
# /home/username/notifku/start-workers.sh
#!/bin/bash

# Reverb
if ! pgrep -f "reverb:start" > /dev/null; then
    cd /home/username/notifku
    nohup php artisan reverb:start --host=0.0.0.0 --port=8080 >> storage/logs/reverb.log 2>&1 &
    echo "[$(date)] Reverb started" >> storage/logs/workers.log
fi

# Queue Worker
if ! pgrep -f "queue:work" > /dev/null; then
    cd /home/username/notifku
    nohup php artisan queue:work database --sleep=3 --tries=3 --max-time=3600 >> storage/logs/queue.log 2>&1 &
    echo "[$(date)] Queue started" >> storage/logs/workers.log
fi
```

```bash
chmod +x /home/username/notifku/start-workers.sh
```

**2. Tambahkan Cron Job di cPanel:**

cPanel → **Cron Jobs** → tambahkan (setiap 5 menit):

```
*/5 * * * * /home/username/notifku/start-workers.sh
```

**3. Tambahkan juga Laravel Scheduler:**

```
* * * * * cd /home/username/notifku && php artisan schedule:run >> /dev/null 2>&1
```

**4. Mulai pertama kali:**

```bash
bash /home/username/notifku/start-workers.sh
```

---

## 7. Konfigurasi WebSocket

### Opsi 1 — Direct WebSocket (Tanpa Proxy)

Browser terhubung langsung ke `wss://domain.com:8080`.

**Persyaratan:**
- Port 8080 terbuka di CSF
- SSL certificate (Let's Encrypt) terinstall di domain

**Konfigurasi echo.ts sudah menangani ini otomatis** — Reverb akan menerima WebSocket di port 8080 dan Pusher.js client akan connect kesana.

### Opsi 2 — LiteSpeed Proxy

Browser terhubung ke `wss://domain.com:443/app/[key]`, LiteSpeed meneruskan ke Reverb di `127.0.0.1:8080`.

Lihat **[Bagian 8](#8-konfigurasi-litespeed)** untuk setup proxy.

---

## 8. Konfigurasi LiteSpeed

### WebSocket Proxy (Hanya jika pakai `.env.production.proxy`)

Tambahkan konfigurasi di cPanel → **LiteSpeed Web Server** atau via `.htaccess`:

**Opsi A — Via .htaccess (paling mudah di cPanel)**

Tambahkan di `/home/username/public_html/.htaccess` (sebelum rules Laravel):

```apache
# WebSocket Proxy ke Reverb
RewriteEngine On
RewriteCond %{HTTP:Upgrade} =websocket [NC]
RewriteRule ^app/(.*)$ ws://127.0.0.1:8080/app/$1 [P,L]

# HTTP API Reverb
RewriteCond %{HTTP:Upgrade} !=websocket [NC]
RewriteRule ^app/(.*)$ http://127.0.0.1:8080/app/$1 [P,L]
```

**Opsi B — Via LiteSpeed Admin (jika ada akses)**

1. WebAdmin Console → Virtual Hosts → pilih vhost
2. Tab **Web Socket Proxy**
3. Tambahkan:
   - **URI:** `/app/`
   - **Address:** `127.0.0.1:8080`

### Cache & Performance

Tambahkan di `.htaccess` untuk cache aset statis:

```apache
# Cache build assets (1 tahun, file sudah di-hash)
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
```

---

## 9. CSF Firewall

### Tanpa Proxy (Port 8080 Terbuka)

```bash
# SSH sebagai root

# Tambahkan port 8080 ke CSF
nano /etc/csf/csf.conf

# Cari TCP_IN dan tambahkan 8080:
# TCP_IN = "20,21,22,25,53,80,110,143,443,465,587,993,995,8080"

# Restart CSF
csf -r
```

### Dengan Proxy (Tidak perlu buka port)

Tidak ada perubahan CSF — semua traffic lewat port 443 (sudah terbuka default).

---

## 10. Checklist Final

Jalankan checklist berikut setelah deploy:

```bash
cd /home/username/notifku

# 1. Verifikasi env
php artisan env
# Harus menampilkan: production

# 2. Verifikasi database
php artisan migrate:status
# Semua harus Ran

# 3. Verifikasi cache
php artisan config:cache
php artisan route:cache

# 4. Verifikasi storage link
ls -la public/storage
# Harus symlink ke ../storage/app/public

# 5. Verifikasi Reverb berjalan
curl -s http://127.0.0.1:8080 | head -5
# Atau cek proses:
pgrep -fa "reverb:start"

# 6. Verifikasi Queue berjalan
pgrep -fa "queue:work"

# 7. Test website
curl -sI https://[DOMAIN]
# Status harus 200 OK
```

### Checklist Keamanan

- [ ] `APP_DEBUG=false`
- [ ] `APP_ENV=production`
- [ ] `SESSION_SECURE_COOKIE=true`
- [ ] `SESSION_ENCRYPT=true`
- [ ] `.env` tidak bisa diakses publik
- [ ] `storage/` tidak bisa diakses publik
- [ ] SSL/HTTPS aktif
- [ ] REVERB_APP_SECRET menggunakan random string yang kuat

### Test Fitur Utama

- [ ] Halaman login bisa diakses
- [ ] Register user baru berhasil
- [ ] Login berhasil, redirect ke feed
- [ ] Buat post berhasil (teks + gambar)
- [ ] Like post berhasil
- [ ] Comment berhasil
- [ ] Follow user berhasil
- [ ] Notifikasi muncul di bell icon
- [ ] WebSocket terhubung (cek Console browser, tidak ada error)
- [ ] Real-time notification (toast) muncul

---

## 11. Troubleshooting

### Error 500 / Halaman Blank

```bash
# Cek log Laravel
tail -50 storage/logs/laravel.log

# Cek permissions
chmod -R 775 storage bootstrap/cache

# Clear cache
php artisan config:clear
php artisan cache:clear
php artisan view:clear
```

### WebSocket Tidak Terhubung

```bash
# Cek Reverb berjalan
pgrep -fa reverb

# Restart Reverb
php artisan reverb:start --host=0.0.0.0 --port=8080

# Cek port terbuka (tanpa proxy)
netstat -tlnp | grep 8080

# Cek dari browser Console
# Jika error "ERR_CONNECTION_REFUSED" → port belum dibuka di CSF
# Jika error "ERR_SSL_PROTOCOL_ERROR" → masalah SSL/HTTPS
# Jika error 403 → .htaccess proxy belum dikonfigurasi (opsi proxy)
```

### Queue Tidak Berjalan / Notifikasi Tidak Terkirim

```bash
# Cek queue worker
pgrep -fa "queue:work"

# Cek failed jobs
php artisan queue:failed

# Retry failed jobs
php artisan queue:retry all

# Cek log
tail -50 storage/logs/queue.log
```

### Gambar Tidak Muncul

```bash
# Pastikan storage link ada
php artisan storage:link

# Cek permissions
chmod -R 775 storage/app/public
```

### Proses Mati Setelah Beberapa Waktu (CloudLinux)

CloudLinux memiliki LVE Manager yang membatasi resource. Jika proses Reverb/Queue sering mati:

```bash
# Cek limit LVE
lveinfo --period=1d

# Minta hosting provider untuk:
# 1. Naikkan NPROC (number of processes) limit
# 2. Naikkan PMEM (physical memory) limit
# 3. Whitelist proses PHP long-running
```

Atau gunakan cron job auto-restart (lihat [Bagian 6, Opsi B](#opsi-b--cron-job--nohup-tanpa-akses-root)).

### Update / Redeploy

```bash
cd /home/username/notifku

# Pull kode terbaru
git pull origin main

# Update dependensi
composer install --no-dev --optimize-autoloader
npm ci && npm run build

# Jalankan migrasi baru
php artisan migrate --force

# Clear & rebuild cache
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Restart workers
sudo supervisorctl restart notifku-reverb
sudo supervisorctl restart notifku-queue:*

# Atau jika pakai nohup:
pkill -f "reverb:start"
pkill -f "queue:work"
bash start-workers.sh
```
