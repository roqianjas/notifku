# PRD — NotifKu: Platform Sosial Media dengan Notifikasi Real-Time

> **Versi:** 1.0  
> **Tanggal:** 22 Februari 2026  
> **Status:** Draft

---

## Daftar Isi

1. [Deskripsi Produk](#1-deskripsi-produk)
2. [Tujuan Aplikasi](#2-tujuan-aplikasi)
3. [Tech Stack & Arsitektur](#3-tech-stack--arsitektur)
4. [Fitur Utama](#4-fitur-utama)
5. [User Stories](#5-user-stories)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Flow Sistem](#8-flow-sistem)
9. [Struktur Database](#9-struktur-database)
10. [Konfigurasi Environment (.env)](#10-konfigurasi-environment-env)
11. [Deployment di WHM/cPanel VPS](#11-deployment-di-whmcpanel-vps)
12. [Batasan & Asumsi](#12-batasan--asumsi)

---

## 1. Deskripsi Produk

**NotifKu** adalah platform sosial media sederhana yang memungkinkan pengguna untuk membuat postingan, berinteraksi melalui like dan komentar, serta mengikuti pengguna lain. Keunggulan utama platform ini terletak pada sistem **notifikasi real-time** yang ditenagai oleh **Laravel Reverb (WebSocket)**, sehingga setiap interaksi sosial langsung terasa oleh pengguna yang dituju tanpa perlu me-refresh halaman.

Aplikasi ini dibangun sebagai **satu project Laravel** dengan frontend yang terintegrasi melalui **Inertia.js + React (TypeScript)** dan **shadcn/ui** sebagai UI Kit, menghasilkan pengalaman pengguna yang modern dan responsif layaknya Single Page Application (SPA) namun tetap memanfaatkan kekuatan routing dan server-side rendering milik Laravel.

---

## 2. Tujuan Aplikasi

| # | Tujuan | Deskripsi |
|---|--------|-----------|
| 1 | **Interaksi Sosial** | Menyediakan wadah bagi pengguna untuk berbagi konten (teks/gambar), saling berinteraksi melalui like, komentar, dan follow. |
| 2 | **Notifikasi Real-Time** | Memberikan pengalaman notifikasi instan menggunakan WebSocket sehingga pengguna selalu mendapat informasi terbaru tanpa delay. |
| 3 | **Kesederhanaan** | Fokus pada fitur inti tanpa over-engineering — mudah dipahami, di-maintain, dan di-deploy. |
| 4 | **Deployable di cPanel/WHM** | Aplikasi harus bisa berjalan di lingkungan shared/VPS hosting yang umum digunakan di Indonesia. |

---

## 3. Tech Stack & Arsitektur

### 3.1 Technology Stack

| Layer | Teknologi |
|-------|-----------|
| **Backend** | Laravel 11.x (PHP 8.2+) |
| **Frontend** | Inertia.js + React 18 (TypeScript / TSX) |
| **UI Kit** | shadcn/ui (Radix UI + Tailwind CSS) |
| **Authentication** | Laravel Sanctum (session-based) |
| **Real-time** | Laravel Reverb (WebSocket) |
| **Database** | MySQL 8.0+ |
| **File Storage** | Laravel Filesystem (local disk / public disk) |
| **Build Tool** | Vite |
| **Deployment** | WHM/cPanel VPS |

### 3.2 Diagram Arsitektur

```
┌─────────────────────────────────────────────────────────┐
│                      BROWSER (Client)                   │
│  ┌───────────────────────────────────────────────────┐  │
│  │  React (TSX) + Inertia.js + shadcn/ui             │  │
│  │  ┌─────────────┐  ┌──────────────────────────┐    │  │
│  │  │ Inertia     │  │ Laravel Echo (JS Client) │    │  │
│  │  │ HTTP Req    │  │ WebSocket Connection     │    │  │
│  │  └──────┬──────┘  └───────────┬──────────────┘    │  │
│  └─────────┼─────────────────────┼───────────────────┘  │
│            │                     │                       │
└────────────┼─────────────────────┼───────────────────────┘
             │ HTTP/HTTPS          │ WS/WSS
             ▼                     ▼
┌────────────────────┐  ┌──────────────────────┐
│   Laravel Backend  │  │   Laravel Reverb     │
│   (PHP-FPM/Apache) │  │   (WebSocket Server) │
│                    │  │   Port: 8080         │
│  ┌──────────────┐  │  │                      │
│  │ Controllers  │  │  │  Listens on private  │
│  │ Models       │  │  │  channels per user   │
│  │ Events       │──┼──▶                      │
│  │ Notifications│  │  └──────────────────────┘
│  │ Sanctum Auth │  │
│  └──────┬───────┘  │
│         │          │
└─────────┼──────────┘
          │
          ▼
  ┌───────────────┐
  │   MySQL 8.0   │
  │   Database    │
  └───────────────┘
```

### 3.3 Alur Request

1. **HTTP Request** — User mengakses halaman → Inertia.js mengirim request ke Laravel → Laravel me-render komponen React yang sesuai sebagai response.
2. **WebSocket** — Saat user login, Laravel Echo di sisi client membuka koneksi WebSocket ke Laravel Reverb → Server mem-broadcast event ke private channel milik user yang dituju → Client menerima event dan menampilkan notifikasi secara real-time.

---

## 4. Fitur Utama

### 4.1 User & Profil

| Fitur | Deskripsi |
|-------|-----------|
| Register | Pengguna baru dapat mendaftar dengan name, username, email, dan password. |
| Login | Pengguna masuk menggunakan email/username dan password. |
| Logout | Pengguna keluar dari sesi aktif. |
| Edit Profil | Pengguna dapat mengubah foto profil, bio, dan username. |
| Lihat Profil | Pengguna dapat melihat profil user lain beserta daftar postingan, jumlah follower, dan following. |

### 4.2 Konten

| Fitur | Deskripsi |
|-------|-----------|
| Buat Post | Pengguna dapat membuat postingan berisi teks dan/atau gambar. |
| Like Post | Pengguna dapat menyukai postingan. Toggle like/unlike. |
| Comment Post | Pengguna dapat menulis komentar pada postingan. |
| Reply Comment | Pengguna dapat membalas komentar yang sudah ada (1 level nested reply). |

### 4.3 Sosial

| Fitur | Deskripsi |
|-------|-----------|
| Follow / Unfollow | Pengguna dapat mengikuti atau berhenti mengikuti user lain. |
| Daftar Follower | Melihat siapa saja yang mengikuti seorang user. |
| Daftar Following | Melihat siapa saja yang diikuti oleh seorang user. |
| Feed | Menampilkan postingan dari user-user yang diikuti, diurutkan berdasarkan waktu terbaru. |

### 4.4 Notifikasi Real-Time

| Fitur | Deskripsi |
|-------|-----------|
| Toast Notification | Notifikasi masuk ditampilkan sebagai toast/popup di sudut layar secara real-time. |
| Bell Icon & Counter | Ikon lonceng di navbar menunjukkan jumlah notifikasi yang belum dibaca. |
| Halaman Notifikasi | Halaman khusus menampilkan riwayat semua notifikasi user. |
| Tandai Sudah Dibaca | Notifikasi bisa ditandai sudah dibaca, baik satu per satu maupun semua sekaligus. |
| Navigasi dari Notifikasi | Klik notifikasi mengarahkan user ke halaman yang relevan. |
| Self-exclusion | Notifikasi TIDAK dikirim ke diri sendiri — hanya ke user lain yang relevan. |

#### Jenis Notifikasi

| # | Kejadian | Event Name | Contoh Pesan | Tujuan Navigasi |
|---|----------|------------|--------------|-----------------|
| 1 | Ada yang follow kamu | `user.follow` | "Alice mulai mengikuti kamu" | Profil Alice |
| 2 | Post kamu di-like | `post.liked` | "Bob menyukai postingan kamu" | Halaman post yang di-like |
| 3 | Post kamu dicomment | `post.commented` | "Charlie mengomentari postingan kamu" | Halaman post, scroll ke komentar |
| 4 | Comment kamu di-reply | `comment.replied` | "Diana membalas komentar kamu" | Halaman post, scroll ke reply |
| 5 | Notifikasi sistem | `system.announcement` | "Selamat datang di platform!" | — (tidak ada navigasi khusus) |

---

## 5. User Stories

### 5.1 Registrasi & Autentikasi

| ID | User Story | Priority |
|----|-----------|----------|
| US-AUTH-01 | Sebagai pengunjung, saya ingin mendaftar akun baru dengan nama, username, email, dan password, agar saya bisa menggunakan platform. | **Must Have** |
| US-AUTH-02 | Sebagai pengguna terdaftar, saya ingin login menggunakan email dan password, agar saya bisa mengakses akun saya. | **Must Have** |
| US-AUTH-03 | Sebagai pengguna yang sudah login, saya ingin logout dari akun saya, agar sesi saya aman. | **Must Have** |

### 5.2 Profil

| ID | User Story | Priority |
|----|-----------|----------|
| US-PROF-01 | Sebagai pengguna, saya ingin mengedit profil saya (foto, bio, username), agar profil saya selalu up-to-date. | **Must Have** |
| US-PROF-02 | Sebagai pengguna, saya ingin melihat profil user lain beserta postingan mereka, jumlah follower, dan following, agar saya bisa mengenal mereka. | **Must Have** |

### 5.3 Konten (Post)

| ID | User Story | Priority |
|----|-----------|----------|
| US-POST-01 | Sebagai pengguna, saya ingin membuat postingan berisi teks, agar saya bisa berbagi pikiran saya. | **Must Have** |
| US-POST-02 | Sebagai pengguna, saya ingin membuat postingan berisi teks dan gambar, agar saya bisa berbagi konten visual. | **Must Have** |
| US-POST-03 | Sebagai pengguna, saya ingin menyukai (like) postingan orang lain, agar saya bisa menunjukkan apresiasi. | **Must Have** |
| US-POST-04 | Sebagai pengguna, saya ingin menghapus like dari postingan yang sudah saya like (unlike), agar saya bisa membatalkan apresiasi. | **Must Have** |
| US-POST-05 | Sebagai pengguna, saya ingin menulis komentar pada postingan, agar saya bisa berdiskusi. | **Must Have** |
| US-POST-06 | Sebagai pengguna, saya ingin membalas komentar yang ada pada postingan, agar saya bisa merespons diskusi. | **Should Have** |

### 5.4 Sosial (Follow)

| ID | User Story | Priority |
|----|-----------|----------|
| US-SOC-01 | Sebagai pengguna, saya ingin mengikuti (follow) user lain, agar saya bisa melihat postingan mereka di feed saya. | **Must Have** |
| US-SOC-02 | Sebagai pengguna, saya ingin berhenti mengikuti (unfollow) user, agar postingan mereka tidak muncul di feed saya lagi. | **Must Have** |
| US-SOC-03 | Sebagai pengguna, saya ingin melihat daftar follower dan following seorang user, agar saya bisa menemukan user baru. | **Should Have** |
| US-SOC-04 | Sebagai pengguna, saya ingin melihat feed berisi postingan dari user yang saya ikuti, diurutkan berdasarkan waktu terbaru. | **Must Have** |

### 5.5 Notifikasi

| ID | User Story | Priority |
|----|-----------|----------|
| US-NOTIF-01 | Sebagai pengguna, saya ingin menerima notifikasi real-time ketika seseorang follow saya, agar saya langsung tahu. | **Must Have** |
| US-NOTIF-02 | Sebagai pengguna, saya ingin menerima notifikasi real-time ketika seseorang like postingan saya, agar saya tahu ada yang mengapresiasi. | **Must Have** |
| US-NOTIF-03 | Sebagai pengguna, saya ingin menerima notifikasi real-time ketika seseorang mengomentari postingan saya. | **Must Have** |
| US-NOTIF-04 | Sebagai pengguna, saya ingin menerima notifikasi real-time ketika seseorang membalas komentar saya. | **Should Have** |
| US-NOTIF-05 | Sebagai pengguna, saya ingin melihat ikon lonceng di navbar yang menampilkan jumlah notifikasi belum dibaca. | **Must Have** |
| US-NOTIF-06 | Sebagai pengguna, saya ingin melihat halaman daftar semua notifikasi saya, agar saya bisa menelusuri riwayat notifikasi. | **Must Have** |
| US-NOTIF-07 | Sebagai pengguna, saya ingin menandai notifikasi sebagai sudah dibaca (satu per satu atau sekaligus). | **Must Have** |
| US-NOTIF-08 | Sebagai pengguna, saya ingin mengklik notifikasi dan langsung diarahkan ke halaman yang relevan. | **Must Have** |
| US-NOTIF-09 | Sebagai pengguna, saya TIDAK ingin menerima notifikasi dari aktivitas saya sendiri. | **Must Have** |
| US-NOTIF-10 | Sebagai admin, saya ingin mengirimkan notifikasi sistem (system announcement) ke semua pengguna. | **Could Have** |

---

## 6. Functional Requirements

### 6.1 Autentikasi (FR-AUTH)

| ID | Requirement |
|----|-------------|
| FR-AUTH-01 | Sistem harus menyediakan halaman registrasi dengan field: name, username, email, password, dan password confirmation. |
| FR-AUTH-02 | Username harus unik, hanya mengandung huruf kecil, angka, underscore, dan titik. Panjang 3–30 karakter. |
| FR-AUTH-03 | Email harus unik dan valid. |
| FR-AUTH-04 | Password minimal 8 karakter. |
| FR-AUTH-05 | Sistem harus menyediakan halaman login dengan field: email dan password. |
| FR-AUTH-06 | Autentikasi menggunakan Laravel Sanctum (session-based). |
| FR-AUTH-07 | Setelah login berhasil, user diarahkan ke halaman Feed. |
| FR-AUTH-08 | Setelah logout, user diarahkan ke halaman Login. |
| FR-AUTH-09 | Semua halaman aplikasi (kecuali login dan register) memerlukan autentikasi. |

### 6.2 Profil (FR-PROF)

| ID | Requirement |
|----|-------------|
| FR-PROF-01 | Halaman profil menampilkan: foto profil, nama, username, bio, jumlah postingan, jumlah follower, jumlah following. |
| FR-PROF-02 | User dapat mengedit foto profil (upload gambar, max 2MB, format: jpg/png/webp). |
| FR-PROF-03 | User dapat mengedit bio (maks 160 karakter) dan username. |
| FR-PROF-04 | Halaman profil user lain menampilkan tombol Follow/Unfollow. |
| FR-PROF-05 | Halaman profil menampilkan daftar postingan user tersebut (terbaru terlebih dahulu). |

### 6.3 Post (FR-POST)

| ID | Requirement |
|----|-------------|
| FR-POST-01 | User dapat membuat post baru berisi teks (maks 5000 karakter). |
| FR-POST-02 | User dapat menyertakan satu gambar pada post (max 5MB, format: jpg/png/webp/gif). |
| FR-POST-03 | Post menampilkan: konten teks, gambar (jika ada), nama & foto penulis, waktu dibuat, jumlah like, jumlah komentar. |
| FR-POST-04 | User dapat meng-like dan un-like post. Satu user hanya bisa memberi satu like per post. |
| FR-POST-05 | User dapat menghapus post miliknya sendiri. |
| FR-POST-06 | Post yang dihapus juga menghapus semua like, komentar, dan notifikasi terkait. |

### 6.4 Komentar (FR-COMM)

| ID | Requirement |
|----|-------------|
| FR-COMM-01 | User dapat menulis komentar pada sebuah post (maks 2000 karakter). |
| FR-COMM-02 | Komentar menampilkan: isi komentar, nama & foto penulis, waktu dibuat. |
| FR-COMM-03 | User dapat membalas komentar (reply). Reply hanya 1 level deep (tidak ada nested reply di dalam reply). |
| FR-COMM-04 | User dapat menghapus komentar miliknya sendiri. |

### 6.5 Follow (FR-FOLLOW)

| ID | Requirement |
|----|-------------|
| FR-FOLLOW-01 | User dapat mem-follow user lain. User tidak bisa mem-follow dirinya sendiri. |
| FR-FOLLOW-02 | User dapat meng-unfollow user yang sudah di-follow. |
| FR-FOLLOW-03 | Halaman profil menampilkan daftar follower (siapa yang mengikuti user ini). |
| FR-FOLLOW-04 | Halaman profil menampilkan daftar following (siapa yang diikuti user ini). |
| FR-FOLLOW-05 | Feed menampilkan postingan dari user-user yang di-follow, diurutkan berdasarkan `created_at` DESC. |
| FR-FOLLOW-06 | Feed juga menampilkan postingan user sendiri. |

### 6.6 Notifikasi (FR-NOTIF)

| ID | Requirement |
|----|-------------|
| FR-NOTIF-01 | Setiap aktivitas follow, like, comment, dan reply menghasilkan notifikasi ke user yang relevan. |
| FR-NOTIF-02 | Notifikasi TIDAK dikirim jika pelaku dan penerima adalah user yang sama (self-exclusion). |
| FR-NOTIF-03 | Notifikasi disimpan di database menggunakan tabel `notifications` bawaan Laravel. |
| FR-NOTIF-04 | Notifikasi di-broadcast secara real-time melalui Laravel Reverb ke private channel milik user penerima. |
| FR-NOTIF-05 | Format channel: `App.Models.User.{userId}` (menggunakan private channel bawaan Laravel Notification broadcasting). |
| FR-NOTIF-06 | Di sisi client, notifikasi yang baru masuk ditampilkan sebagai toast di sudut kanan atas layar. |
| FR-NOTIF-07 | Bell icon di navbar menampilkan badge berisi jumlah notifikasi yang belum dibaca (`read_at IS NULL`). |
| FR-NOTIF-08 | Halaman notifikasi menampilkan semua notifikasi, diurutkan terbaru terlebih dahulu, dengan pagination. |
| FR-NOTIF-09 | Setiap item notifikasi menampilkan: foto pelaku, pesan, waktu, dan status sudah/belum dibaca. |
| FR-NOTIF-10 | User dapat menandai satu notifikasi sebagai sudah dibaca (PATCH request). |
| FR-NOTIF-11 | User dapat menandai semua notifikasi sebagai sudah dibaca sekaligus (PATCH request). |
| FR-NOTIF-12 | Klik pada notifikasi mengarahkan user ke halaman yang relevan sesuai tipe notifikasi. |

#### Mapping Navigasi Notifikasi

| Tipe Notifikasi | Route Tujuan |
|-----------------|-------------|
| `user.follow` | `/profile/{username}` — profil user yang mem-follow |
| `post.liked` | `/post/{postId}` — halaman post yang di-like |
| `post.commented` | `/post/{postId}` — halaman post, scroll ke komentar baru |
| `comment.replied` | `/post/{postId}` — halaman post, scroll ke reply baru |
| `system.announcement` | — (tetap di halaman notifikasi / tidak ada navigasi) |

---

## 7. Non-Functional Requirements

### 7.1 Performance

| ID | Requirement |
|----|-------------|
| NFR-PERF-01 | Halaman harus ter-load dalam < 3 detik pada koneksi 3G. |
| NFR-PERF-02 | Feed menggunakan pagination (10–20 post per halaman) untuk menjaga performa. |
| NFR-PERF-03 | Notifikasi menggunakan pagination (20 item per halaman). |
| NFR-PERF-04 | Gambar yang di-upload harus di-resize/compress secara server-side sebelum disimpan. |

### 7.2 Security

| ID | Requirement |
|----|-------------|
| NFR-SEC-01 | Autentikasi menggunakan Laravel Sanctum dengan session-based token (CSRF protection aktif). |
| NFR-SEC-02 | Semua input user harus divalidasi di sisi server. |
| NFR-SEC-03 | Upload file harus divalidasi tipe MIME dan ukurannya. |
| NFR-SEC-04 | WebSocket channel menggunakan private channel yang di-autentikasi. |
| NFR-SEC-05 | User hanya bisa mengakses/memodifikasi data miliknya sendiri (authorization policy). |

### 7.3 Scalability

| ID | Requirement |
|----|-------------|
| NFR-SCALE-01 | Database di-index pada kolom yang sering di-query (foreign keys, `created_at`, dll). |
| NFR-SCALE-02 | Antrian (queue) menggunakan database driver untuk kesederhanaan di cPanel. |

### 7.4 Usability

| ID | Requirement |
|----|-------------|
| NFR-UX-01 | Aplikasi harus responsif — tampil baik di desktop dan mobile. |
| NFR-UX-02 | UI menggunakan shadcn/ui untuk konsistensi dan aksesibilitas. |
| NFR-UX-03 | Waktu ditampilkan secara relatif (misal: "5 menit lalu", "2 jam lalu"). |

### 7.5 Reliability

| ID | Requirement |
|----|-------------|
| NFR-REL-01 | Jika WebSocket terputus, client harus melakukan reconnect otomatis (built-in Laravel Echo). |
| NFR-REL-02 | Notifikasi yang gagal di-broadcast tetap tersimpan di database dan bisa dilihat saat halaman di-refresh. |

---

## 8. Flow Sistem

### 8.1 Flow Autentikasi

```
┌─────────┐     ┌──────────────┐     ┌──────────────┐
│  Guest  │────▶│ GET /register│────▶│ Halaman      │
│ (Browser)│    │              │     │ Register     │
└─────────┘     └──────────────┘     └──────┬───────┘
                                            │
                                   POST /register
                                            │
                                            ▼
                                    ┌───────────────┐
                                    │ Validasi Input│
                                    └───────┬───────┘
                                            │
                                ┌───────────┴───────────┐
                                │                       │
                             Gagal                   Berhasil
                                │                       │
                                ▼                       ▼
                        ┌──────────────┐     ┌──────────────────┐
                        │ Tampilkan    │     │ Buat User        │
                        │ Error        │     │ Login otomatis   │
                        │ Validation   │     │ Redirect ke Feed │
                        └──────────────┘     └──────────────────┘
```

**Langkah-langkah Login:**

1. User membuka `/login`.
2. User mengisi email dan password.
3. Laravel memvalidasi input dan mencocokkan credentials.
4. Jika berhasil: membuat session, redirect ke `/feed`.
5. Jika gagal: kembali ke halaman login dengan pesan error.

**Langkah-langkah Logout:**

1. User mengklik tombol Logout.
2. Frontend mengirim POST request ke `/logout`.
3. Laravel menghancurkan session.
4. User di-redirect ke `/login`.

---

### 8.2 Flow Notifikasi Real-Time

```
┌──────────┐    Aksi (like/comment/     ┌──────────────┐
│ User A   │    follow/reply)           │   Laravel    │
│ (Pelaku) │ ──────────────────────────▶│   Backend    │
└──────────┘                            └──────┬───────┘
                                               │
                                    1. Proses aksi (simpan ke DB)
                                    2. Cek: pelaku ≠ penerima?
                                    3. Buat Notification (simpan ke DB)
                                    4. Broadcast event via Reverb
                                               │
                                               ▼
                                      ┌─────────────────┐
                                      │  Laravel Reverb  │
                                      │  (WebSocket)     │
                                      └────────┬────────┘
                                               │
                                    Push ke private channel
                                    App.Models.User.{userId}
                                               │
                                               ▼
                                      ┌──────────────┐
                                      │   User B     │
                                      │  (Penerima)  │
                                      │              │
                                      │ • Toast popup│
                                      │ • Bell +1    │
                                      └──────────────┘
```

**Detail Flow per Tipe Notifikasi:**

#### a. Follow Notification (`user.follow`)

1. User A mengklik tombol "Follow" di profil User B.
2. Backend menyimpan record di tabel `follows`.
3. Backend memeriksa: User A ≠ User B → lanjut.
4. Backend membuat `FollowNotification` → disimpan di tabel `notifications`.
5. Event di-broadcast ke channel `private-App.Models.User.{userB_id}`.
6. Di browser User B: toast muncul "Alice mulai mengikuti kamu", bell counter +1.

#### b. Like Notification (`post.liked`)

1. User A meng-klik tombol Like pada Post milik User B.
2. Backend menyimpan record di tabel `likes`.
3. Backend memeriksa: User A ≠ User B (pemilik post) → lanjut.
4. Backend membuat `PostLikedNotification` → disimpan di tabel `notifications`.
5. Event di-broadcast ke channel `private-App.Models.User.{userB_id}`.
6. Di browser User B: toast muncul "Bob menyukai postingan kamu", bell counter +1.

#### c. Comment Notification (`post.commented`)

1. User A menulis komentar pada Post milik User B.
2. Backend menyimpan record di tabel `comments`.
3. Backend memeriksa: User A ≠ User B (pemilik post) → lanjut.
4. Backend membuat `PostCommentedNotification` → disimpan di tabel `notifications`.
5. Event di-broadcast ke channel `private-App.Models.User.{userB_id}`.
6. Di browser User B: toast muncul "Charlie mengomentari postingan kamu", bell counter +1.

#### d. Reply Notification (`comment.replied`)

1. User A membalas komentar milik User C pada Post milik User B.
2. Backend menyimpan record di tabel `comments` (dengan `parent_id`).
3. Backend memeriksa: User A ≠ User C (pemilik komentar parent) → lanjut.
4. Backend membuat `CommentRepliedNotification` → disimpan di tabel `notifications`.
5. Event di-broadcast ke channel `private-App.Models.User.{userC_id}`.
6. Di browser User C: toast muncul "Diana membalas komentar kamu", bell counter +1.
7. **Catatan:** Notifikasi reply dikirim ke pemilik komentar parent, BUKAN ke pemilik post (kecuali pemilik post = pemilik komentar parent).

#### e. System Announcement (`system.announcement`)

1. Admin mengirim pengumuman sistem via dashboard/console.
2. Backend membuat `SystemAnnouncementNotification` untuk setiap user.
3. Event di-broadcast ke semua user terdaftar.

---

### 8.3 Flow WebSocket Connection

```
┌──────────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                          │
│                                                                  │
│  1. User login berhasil                                          │
│  2. React component mount → Laravel Echo initialized             │
│  3. Echo.private('App.Models.User.' + userId)                    │
│     .notification((notification) => {                            │
│         // Tampilkan toast                                       │
│         // Update bell counter                                   │
│         // Tambah ke list notifikasi                             │
│     });                                                          │
│                                                                  │
│  4. Echo membuka koneksi WebSocket ke Reverb server              │
│     ws://host:port/app/{appKey}                                  │
│                                                                  │
│  5. Reverb memverifikasi autentikasi channel via Laravel         │
│     (POST /broadcasting/auth)                                    │
│                                                                  │
│  6. Koneksi established → client mendengarkan event              │
│                                                                  │
│  7. Jika koneksi terputus → Echo melakukan reconnect otomatis    │
└──────────────────────────────────────────────────────────────────┘
```

---

### 8.4 Flow Buat Post

1. User mengklik tombol "Buat Post" atau widget compose di feed.
2. User menulis teks dan (opsional) melampirkan gambar.
3. User mengklik "Posting".
4. Frontend mengirim POST request ke `/posts` (multipart/form-data jika ada gambar).
5. Backend memvalidasi input (teks maks 5000 karakter, gambar maks 5MB).
6. Backend menyimpan post ke tabel `posts`.
7. Jika ada gambar, gambar disimpan ke storage dan path-nya disimpan di kolom `image`.
8. Response: redirect ke feed / menambahkan post baru ke atas feed.

---

### 8.5 Flow Feed

1. User mengakses `/feed` (halaman utama setelah login).
2. Backend mengambil postingan dari user-user yang di-follow + postingan sendiri.
3. Query: `SELECT * FROM posts WHERE user_id IN (followingIds + selfId) ORDER BY created_at DESC`.
4. Hasil di-paginate (20 per halaman).
5. Setiap post di-render dengan info: author, konten, gambar, jumlah like, jumlah komentar.
6. Scroll ke bawah → load halaman berikutnya (infinite scroll atau tombol "Load More").

---

## 9. Struktur Database

### 9.1 Entity Relationship Diagram (ERD)

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    users     │       │    posts     │       │   comments   │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │◄──┐   │ id (PK)      │◄──┐   │ id (PK)      │
│ name         │   │   │ user_id (FK) │   │   │ user_id (FK) │
│ username     │   ├───│              │   ├───│ post_id (FK) │
│ email        │   │   │ body         │   │   │ parent_id(FK)│──┐
│ password     │   │   │ image        │   │   │ body         │  │
│ avatar       │   │   │ created_at   │   │   │ created_at   │  │
│ bio          │   │   │ updated_at   │   │   │ updated_at   │  │
│ created_at   │   │   └──────────────┘   │   └──────────────┘  │
│ updated_at   │   │                      │          ▲          │
└──────────────┘   │                      │          └──────────┘
       ▲           │   ┌──────────────┐   │       (self-referencing)
       │           │   │    likes     │   │
       │           │   ├──────────────┤   │
       │           │   │ id (PK)      │   │
       │           └───│ user_id (FK) │   │
       │               │ post_id (FK) │───┘
       │               │ created_at   │
       │               └──────────────┘
       │
       │           ┌──────────────────┐
       │           │     follows      │
       │           ├──────────────────┤
       │           │ id (PK)          │
       ├───────────│ follower_id (FK) │
       └───────────│ following_id(FK) │
                   │ created_at       │
                   └──────────────────┘

┌───────────────────────────┐
│      notifications        │
│  (Laravel built-in table) │
├───────────────────────────┤
│ id (UUID, PK)             │
│ type (VARCHAR)             │
│ notifiable_type (VARCHAR)  │
│ notifiable_id (BIGINT, FK) │
│ data (JSON)                │
│ read_at (TIMESTAMP, NULL)  │
│ created_at (TIMESTAMP)     │
│ updated_at (TIMESTAMP)     │
└───────────────────────────┘
```

### 9.2 Detail Tabel

#### Tabel `users`

| Kolom | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| `id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| `name` | VARCHAR(255) | NOT NULL | Nama lengkap |
| `username` | VARCHAR(30) | NOT NULL, UNIQUE | Username unik |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Email unik |
| `email_verified_at` | TIMESTAMP | NULLABLE | Waktu verifikasi email |
| `password` | VARCHAR(255) | NOT NULL | Hashed password |
| `avatar` | VARCHAR(255) | NULLABLE | Path ke file foto profil |
| `bio` | VARCHAR(160) | NULLABLE | Deskripsi singkat profil |
| `remember_token` | VARCHAR(100) | NULLABLE | Token remember me |
| `created_at` | TIMESTAMP | NULLABLE | |
| `updated_at` | TIMESTAMP | NULLABLE | |

**Index:** `username` (unique), `email` (unique)

---

#### Tabel `posts`

| Kolom | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| `id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| `user_id` | BIGINT UNSIGNED | FK → users.id, ON DELETE CASCADE | Penulis post |
| `body` | TEXT | NOT NULL | Isi postingan (maks 5000 karakter, validasi di app) |
| `image` | VARCHAR(255) | NULLABLE | Path ke file gambar |
| `created_at` | TIMESTAMP | NULLABLE | |
| `updated_at` | TIMESTAMP | NULLABLE | |

**Index:** `user_id`, `created_at`

---

#### Tabel `comments`

| Kolom | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| `id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| `user_id` | BIGINT UNSIGNED | FK → users.id, ON DELETE CASCADE | Penulis komentar |
| `post_id` | BIGINT UNSIGNED | FK → posts.id, ON DELETE CASCADE | Post yang dikomentari |
| `parent_id` | BIGINT UNSIGNED | FK → comments.id, ON DELETE CASCADE, NULLABLE | Komentar parent (NULL = komentar utama, terisi = reply) |
| `body` | TEXT | NOT NULL | Isi komentar (maks 2000 karakter, validasi di app) |
| `created_at` | TIMESTAMP | NULLABLE | |
| `updated_at` | TIMESTAMP | NULLABLE | |

**Index:** `post_id`, `parent_id`, `user_id`

---

#### Tabel `likes`

| Kolom | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| `id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| `user_id` | BIGINT UNSIGNED | FK → users.id, ON DELETE CASCADE | User yang like |
| `post_id` | BIGINT UNSIGNED | FK → posts.id, ON DELETE CASCADE | Post yang di-like |
| `created_at` | TIMESTAMP | NULLABLE | |

**Index:** `user_id, post_id` (unique composite — satu user hanya bisa like sekali per post)

---

#### Tabel `follows`

| Kolom | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| `id` | BIGINT UNSIGNED | PK, AUTO_INCREMENT | |
| `follower_id` | BIGINT UNSIGNED | FK → users.id, ON DELETE CASCADE | User yang mem-follow |
| `following_id` | BIGINT UNSIGNED | FK → users.id, ON DELETE CASCADE | User yang di-follow |
| `created_at` | TIMESTAMP | NULLABLE | |

**Index:** `follower_id, following_id` (unique composite — mencegah duplikat follow)

---

#### Tabel `notifications` (Laravel Built-in)

| Kolom | Tipe | Constraint | Keterangan |
|-------|------|------------|------------|
| `id` | CHAR(36) / UUID | PK | UUID |
| `type` | VARCHAR(255) | NOT NULL | Fully qualified class name dari Notification |
| `notifiable_type` | VARCHAR(255) | NOT NULL | `App\Models\User` |
| `notifiable_id` | BIGINT UNSIGNED | NOT NULL | ID user penerima |
| `data` | JSON | NOT NULL | Payload notifikasi (lihat detail di bawah) |
| `read_at` | TIMESTAMP | NULLABLE | NULL = belum dibaca |
| `created_at` | TIMESTAMP | NULLABLE | |
| `updated_at` | TIMESTAMP | NULLABLE | |

**Index:** `notifiable_type, notifiable_id` (composite)

#### Struktur `data` JSON per Tipe Notifikasi

**Follow (`user.follow`):**
```json
{
  "type": "user.follow",
  "message": "Alice mulai mengikuti kamu",
  "actor": {
    "id": 1,
    "name": "Alice",
    "username": "alice",
    "avatar": "/storage/avatars/alice.jpg"
  },
  "url": "/profile/alice"
}
```

**Like (`post.liked`):**
```json
{
  "type": "post.liked",
  "message": "Bob menyukai postingan kamu",
  "actor": {
    "id": 2,
    "name": "Bob",
    "username": "bob",
    "avatar": "/storage/avatars/bob.jpg"
  },
  "post_id": 42,
  "url": "/post/42"
}
```

**Comment (`post.commented`):**
```json
{
  "type": "post.commented",
  "message": "Charlie mengomentari postingan kamu",
  "actor": {
    "id": 3,
    "name": "Charlie",
    "username": "charlie",
    "avatar": "/storage/avatars/charlie.jpg"
  },
  "post_id": 42,
  "comment_id": 99,
  "url": "/post/42"
}
```

**Reply (`comment.replied`):**
```json
{
  "type": "comment.replied",
  "message": "Diana membalas komentar kamu",
  "actor": {
    "id": 4,
    "name": "Diana",
    "username": "diana",
    "avatar": "/storage/avatars/diana.jpg"
  },
  "post_id": 42,
  "comment_id": 100,
  "parent_comment_id": 99,
  "url": "/post/42"
}
```

**System Announcement (`system.announcement`):**
```json
{
  "type": "system.announcement",
  "message": "Selamat datang di platform!",
  "url": null
}
```

---

### 9.3 Laravel Migration Files

Berikut daftar migration yang perlu dibuat:

| # | Migration File | Deskripsi |
|---|---------------|-----------|
| 1 | `create_users_table` | Tabel `users` (modifikasi dari default Laravel untuk menambahkan `username`, `avatar`, `bio`) |
| 2 | `create_posts_table` | Tabel `posts` |
| 3 | `create_comments_table` | Tabel `comments` (dengan self-referencing `parent_id`) |
| 4 | `create_likes_table` | Tabel `likes` (dengan unique composite index) |
| 5 | `create_follows_table` | Tabel `follows` (dengan unique composite index) |
| 6 | `create_notifications_table` | Tabel `notifications` (menggunakan `php artisan notifications:table`) |
| 7 | `create_jobs_table` | Tabel `jobs` (menggunakan `php artisan queue:table`) |

---

## 10. Konfigurasi Environment (.env)

```env
# ============================================================
# BACKEND — dikonsumsi oleh Laravel (PHP)
# ============================================================

# --- Aplikasi ---
APP_NAME=NotifKu
APP_ENV=local
APP_KEY=                        # Generate via: php artisan key:generate
APP_DEBUG=true
APP_TIMEZONE=Asia/Jakarta
APP_URL=http://localhost

# --- Locale ---
APP_LOCALE=id
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=id_ID

# --- Maintenance ---
APP_MAINTENANCE_DRIVER=file

# --- Logging ---
LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

# --- Database ---
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=notifku
DB_USERNAME=root
DB_PASSWORD=

# --- Session ---
# Sanctum menggunakan session-based auth untuk Inertia.js
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

# --- Cache ---
CACHE_STORE=database

# --- Queue ---
# Menggunakan database driver agar kompatibel dengan cPanel (tanpa Redis)
QUEUE_CONNECTION=database

# --- File Storage ---
FILESYSTEM_DISK=public

# --- Mail (opsional, untuk fitur selanjutnya) ---
MAIL_MAILER=log
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@notifku.com"
MAIL_FROM_NAME="${APP_NAME}"

# ============================================================
# REVERB — WebSocket Server (dikonsumsi oleh Laravel Reverb)
# Server-side configuration untuk broadcast driver
# ============================================================

BROADCAST_CONNECTION=reverb

REVERB_APP_ID=notifku-local       # ID unik untuk aplikasi Reverb
REVERB_APP_KEY=notifku-key        # Key untuk autentikasi (akan digunakan juga di frontend)
REVERB_APP_SECRET=notifku-secret  # Secret untuk signing (hanya server-side)
REVERB_HOST=0.0.0.0              # Host yang di-listen oleh Reverb server
REVERB_PORT=8080                  # Port WebSocket server
REVERB_SCHEME=http                # http untuk local, https untuk production

# ============================================================
# FRONTEND — dikonsumsi oleh Inertia.js / React via Vite
# Variabel HARUS diawali dengan VITE_ agar dapat diakses 
# di sisi client (browser) melalui import.meta.env
# ============================================================

# --- App Info (untuk ditampilkan di UI) ---
VITE_APP_NAME="${APP_NAME}"

# --- Reverb Client Connection ---
# Konfigurasi ini digunakan oleh Laravel Echo di browser
# untuk membuat koneksi WebSocket ke Reverb server
VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"    # Key yang sama dengan REVERB_APP_KEY
VITE_REVERB_HOST="localhost"               # Host Reverb DARI SISI BROWSER (bukan 0.0.0.0!)
VITE_REVERB_PORT="${REVERB_PORT}"          # Port yang sama dengan REVERB_PORT
VITE_REVERB_SCHEME="${REVERB_SCHEME}"      # http atau https
```

### Penjelasan Perbedaan Backend vs Frontend

| Variabel | Dikonsumsi Oleh | Keterangan |
|----------|----------------|------------|
| `APP_*` | Laravel (PHP) | Konfigurasi inti aplikasi |
| `DB_*` | Laravel (PHP) | Koneksi database — TIDAK boleh diakses dari browser |
| `SESSION_*` | Laravel (PHP) | Konfigurasi session |
| `REVERB_APP_ID` | Laravel Reverb (PHP) | Hanya untuk server-side |
| `REVERB_APP_SECRET` | Laravel Reverb (PHP) | **RAHASIA** — hanya server-side |
| `REVERB_HOST` | Laravel Reverb (PHP) | Host yang di-listen server (`0.0.0.0`) |
| `VITE_APP_NAME` | React / Vite (Browser) | Nama app untuk ditampilkan di UI |
| `VITE_REVERB_APP_KEY` | Laravel Echo (Browser) | Key untuk koneksi WebSocket dari browser |
| `VITE_REVERB_HOST` | Laravel Echo (Browser) | Host Reverb dari perspektif browser (`localhost` / domain) |
| `VITE_REVERB_PORT` | Laravel Echo (Browser) | Port WebSocket dari perspektif browser |
| `VITE_REVERB_SCHEME` | Laravel Echo (Browser) | `http` / `https` |

> **⚠️ PENTING:**
> - `REVERB_HOST` di backend di-set ke `0.0.0.0` (listen di semua interface).
> - `VITE_REVERB_HOST` di frontend di-set ke `localhost` atau domain publik (dari mana browser mengakses).
> - `REVERB_APP_SECRET` TIDAK BOLEH diexpose ke frontend — tidak ada variabel `VITE_REVERB_APP_SECRET`.

---

## 11. Deployment di WHM/cPanel VPS

### 11.1 Tantangan

Laravel Reverb membutuhkan **long-running PHP process** untuk WebSocket server, sedangkan cPanel secara default menjalankan PHP via Apache/PHP-FPM yang bersifat request-response (short-lived).

### 11.2 Solusi & Rekomendasi

#### a. Menjalankan Laravel Reverb sebagai Background Process

Gunakan **Supervisor** untuk menjalankan dan memonitor proses Reverb agar tetap berjalan dan auto-restart jika crash.

**Konfigurasi Supervisor (`/etc/supervisor/conf.d/notifku-reverb.conf`):**

```ini
[program:notifku-reverb]
process_name=%(program_name)s
numprocs=1
directory=/home/username/public_html/notifku
command=php artisan reverb:start --host=0.0.0.0 --port=8080
autostart=true
autorestart=true
startsecs=3
startretries=3
user=username
redirect_stderr=true
stdout_logfile=/home/username/logs/reverb.log
stopwaitsecs=3600
```

> **Catatan:** Jika tidak ada akses root untuk install Supervisor, alternatifnya:
> - Gunakan **cron job** dengan script check dan restart.
> - Gunakan **screen** atau **nohup** untuk menjalankan proses di background.

#### b. Menjalankan Queue Worker

```ini
[program:notifku-queue]
process_name=%(program_name)s
numprocs=1
directory=/home/username/public_html/notifku
command=php artisan queue:work database --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
startsecs=3
startretries=3
user=username
redirect_stderr=true
stdout_logfile=/home/username/logs/queue.log
stopwaitsecs=3600
```

#### c. Konfigurasi Reverse Proxy untuk WebSocket

Agar WebSocket bisa diakses melalui domain (bukan IP:port), konfigurasikan reverse proxy di Apache atau Nginx.

**Apache (`.htaccess` atau VirtualHost):**

```apache
# Di VirtualHost atau melalui WHM Apache Configuration
<IfModule mod_proxy.c>
    ProxyPreserveHost On

    # WebSocket reverse proxy
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /ws/(.*) ws://127.0.0.1:8080/$1 [P,L]

    ProxyPass /app/ http://127.0.0.1:8080/app/
    ProxyPassReverse /app/ http://127.0.0.1:8080/app/
</IfModule>
```

**Nginx (jika tersedia):**

```nginx
location /app/ {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_read_timeout 86400;
}
```

#### d. SSL/TLS untuk WebSocket (WSS)

Di production, WebSocket harus berjalan melalui **WSS** (WebSocket Secure). Opsi:

1. **Reverse proxy via HTTPS** — Apache/Nginx menangani SSL, lalu forward ke Reverb via non-SSL internal.
2. **Let's Encrypt** — Gunakan SSL certificate dari cPanel AutoSSL atau Let's Encrypt.

**Konfigurasi Production `.env`:**

```env
REVERB_SCHEME=https
VITE_REVERB_SCHEME=https
VITE_REVERB_HOST=notifku.com
VITE_REVERB_PORT=443
```

#### e. Firewall

- Port 8080 (Reverb internal) **TIDAK PERLU** dibuka ke publik jika menggunakan reverse proxy.
- Jika tidak menggunakan reverse proxy, port 8080 harus dibuka di firewall.

### 11.3 Checklist Deployment

| # | Item | Status |
|---|------|--------|
| 1 | PHP 8.2+ tersedia di server | ☐ |
| 2 | MySQL 8.0+ tersedia | ☐ |
| 3 | Composer tersedia | ☐ |
| 4 | Node.js & NPM tersedia (untuk build assets) | ☐ |
| 5 | Supervisor atau alternatifnya terinstall | ☐ |
| 6 | SSL certificate aktif | ☐ |
| 7 | Reverse proxy untuk WebSocket dikonfigurasi | ☐ |
| 8 | `php artisan reverb:start` berjalan via Supervisor | ☐ |
| 9 | `php artisan queue:work` berjalan via Supervisor | ☐ |
| 10 | `npm run build` dijalankan untuk production assets | ☐ |
| 11 | `php artisan migrate` dijalankan | ☐ |
| 12 | `php artisan storage:link` dijalankan | ☐ |
| 13 | File permission sesuai (storage & bootstrap/cache writable) | ☐ |
| 14 | `.env` production sudah dikonfigurasi | ☐ |

---

## 12. Batasan & Asumsi

### 12.1 Batasan

| # | Batasan |
|---|---------|
| 1 | Satu repo, satu project Laravel — bukan monorepo. |
| 2 | Backend Laravel murni PHP — TIDAK menggunakan Node.js sebagai server utama. |
| 3 | Frontend React HANYA melalui Inertia.js (TypeScript/TSX) — bukan standalone React SPA. |
| 4 | UI Kit menggunakan shadcn/ui. |
| 5 | WebSocket menggunakan Laravel Reverb — bukan Pusher, Soketi, atau solusi 3rd party lainnya. |
| 6 | Reply komentar hanya 1 level deep (tidak ada nested reply di dalam reply). |
| 7 | Satu gambar per post (tidak ada gallery/multi-image). |
| 8 | Tidak ada fitur edit post atau edit komentar di versi ini. |
| 9 | Tidak ada fitur search di versi ini. |
| 10 | Tidak ada fitur direct message / chat di versi ini. |

### 12.2 Asumsi

| # | Asumsi |
|---|--------|
| 1 | Server hosting (VPS/cPanel) memiliki akses SSH. |
| 2 | PHP 8.2+ dan MySQL 8.0+ tersedia di server. |
| 3 | Supervisor atau metode process management tersedia untuk menjalankan Reverb dan Queue Worker. |
| 4 | SSL certificate tersedia (via AutoSSL atau Let's Encrypt di cPanel). |
| 5 | Autentikasi menggunakan Laravel Sanctum dengan session driver. |
| 6 | Queue driver menggunakan `database` untuk kesederhanaan dan kompatibilitas dengan cPanel. |
| 7 | Tidak perlu fitur advanced seperti retry queue, delivery guarantee, atau presence channel di tahap ini. |
| 8 | Upload gambar disimpan di local disk (public disk) — bukan S3 atau cloud storage. |
| 9 | Jumlah user yang concurrent tidak terlalu besar (cocok untuk MVP/awal). |

---

## Lampiran: Daftar Route API / Web

### Web Routes (Inertia)

| Method | URI | Controller | Deskripsi |
|--------|-----|-----------|-----------|
| GET | `/` | - | Redirect ke `/feed` atau `/login` |
| GET | `/register` | `Auth\RegisterController@create` | Halaman register |
| POST | `/register` | `Auth\RegisterController@store` | Proses registrasi |
| GET | `/login` | `Auth\LoginController@create` | Halaman login |
| POST | `/login` | `Auth\LoginController@store` | Proses login |
| POST | `/logout` | `Auth\LoginController@destroy` | Proses logout |
| **--- Authenticated ---** | | | |
| GET | `/feed` | `FeedController@index` | Halaman feed utama |
| GET | `/post/{post}` | `PostController@show` | Halaman detail post |
| POST | `/posts` | `PostController@store` | Buat post baru |
| DELETE | `/posts/{post}` | `PostController@destroy` | Hapus post |
| POST | `/posts/{post}/like` | `LikeController@store` | Like post |
| DELETE | `/posts/{post}/like` | `LikeController@destroy` | Unlike post |
| POST | `/posts/{post}/comments` | `CommentController@store` | Buat komentar |
| DELETE | `/comments/{comment}` | `CommentController@destroy` | Hapus komentar |
| GET | `/profile/{user:username}` | `ProfileController@show` | Lihat profil user |
| GET | `/profile/edit` | `ProfileController@edit` | Halaman edit profil |
| PATCH | `/profile` | `ProfileController@update` | Proses update profil |
| POST | `/users/{user}/follow` | `FollowController@store` | Follow user |
| DELETE | `/users/{user}/follow` | `FollowController@destroy` | Unfollow user |
| GET | `/profile/{user:username}/followers` | `FollowController@followers` | Daftar follower |
| GET | `/profile/{user:username}/following` | `FollowController@following` | Daftar following |
| GET | `/notifications` | `NotificationController@index` | Halaman notifikasi |
| PATCH | `/notifications/{notification}` | `NotificationController@markAsRead` | Tandai satu dibaca |
| PATCH | `/notifications/read-all` | `NotificationController@markAllAsRead` | Tandai semua dibaca |

### Broadcasting Channel

| Channel | Deskripsi |
|---------|-----------|
| `private-App.Models.User.{id}` | Private channel per user untuk menerima notifikasi real-time |

---

*Dokumen ini adalah PRD versi 1.0. Akan di-update seiring perkembangan project.*
