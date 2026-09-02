# Eventix — Traveloka Design Style Reference

> Platform Penjualan Tiket Konser & Festival Musik Terpercaya se-Indonesia ala Traveloka Xperience

**Theme:** Clean, Trustworthy, High-Converting Light Modern UI

Eventix mengadopsi bahasa desain modern, terpercaya, dan berestetika tinggi khas **Traveloka (Traveloka Xperience)**. Tampilan dibangun di atas fondasi warna Traveloka Sky Blue (`#0194f3`), Deep Navy (`#0b2f64`), dan Traveloka Action Orange (`#ff5e1f`) untuk menarik atensi pembeli tiket, dipadukan dengan kartu putih bersih (`#ffffff`), latar belakang bernuansa cerah (`#f7f9fa`), sudut membulat modern (`rounded-2xl`, `rounded-3xl`), serta bayangan halus (*soft floating elevation*).

---

## 1. Tokens — Warna

| Nama Warna | Nilai HEX | Role & Penggunaan |
|---|---|---|
| **Traveloka Sky Blue** | `#0194f3` | Brand utama, header logo, tag kategori aktif, icon sorotan, tombol sekunder |
| **Traveloka Blue Dark** | `#0070ba` | Hover state untuk elemen biru utama |
| **Traveloka Deep Navy** | `#0b2f64` | Header utility bar, footer background, judul penting, status badge gelap |
| **Traveloka Action Orange** | `#ff5e1f` | Tombol CTA utama (Pesan Tiket, Beli Sekarang, Cari Tiket), badge diskon, harga konser |
| **Traveloka Orange Hover**| `#e64e12` | Hover state tombol CTA oranye |
| **Sky Tint Light** | `#e8f3fe` / `#f2f8fe` | Background chip/tag aktif, highlight badge, container sorotan |
| **Verified Green** | `#00875a` / `#10b981` | Badge promotor terverifikasi, status pembayaran lunas, e-tiket siap pakai |
| **Amber Warning** | `#f59e0b` / `#ffd400` | Tag flash sale, rating bintang (4.9 ⭐), status menunggu verifikasi |
| **Rose Alert** | `#ef4444` | Status tiket ditolak / dibatalkan, pesan kesalahan formulir |
| **Slate Gray Neutral** | `#f7f9fa` - `#101828` | Latar kanvas aplikasi (`#f7f9fa`), kartu putih (`#ffffff`), teks (`#101828`) |

---

## 2. Tokens — Tipografi

- **Font Family:** `Plus Jakarta Sans` / `Inter`, system-ui, sans-serif
- **Heading Weights:** 700 (Bold) – 800/900 (ExtraBold / Black)
- **Body Weights:** 400 (Regular), 500 (Medium), 600 (SemiBold)

---

## 3. Komponen Khas Traveloka

1. **Header & Navbar**:
   - Multi-tier navbar: Top mini utility bar (Pusat Bantuan, Download App, Jadi Mitra Organizer, IDR) + Main Navbar dengan logo sayap/tiket Eventix, navigasi kategori, dan profile dropdown pengguna.
2. **Interactive Hero Search Box**:
   - Tab kategori konser musik, filter lokasi kota (Jakarta, Bandung, Bali, Surabaya, dll.), input pencarian artis/venue, dan tombol aksi "Cari Tiket" oranye.
3. **Flash Sale & Coupon Banners**:
   - Kartu kupon promosi dengan kode voucher 1-klik salin.
4. **Traveloka Xperience Event Cards**:
   - Kartu bersudut bulat `rounded-2xl`, rating ulasan bintang (⭐ 4.9), badge promotor resmi, harga oranye mencolok "Mulai dari", dan tombol "Pilih".
5. **Detail Konser & Sticky Booking Sidebar**:
   - Breadcrumbs, galeri foto panggung, tab deskripsi & syarat ketentuan, kartu verifikasi organizer, dan sticky widget untuk memilih kategori tiket (VIP / Reguler) serta jumlah tiket.
6. **Multi-Step Checkout**:
   - Langkah checkout jelas (1. Data Pemesan -> 2. Transfer Pembayaran -> 3. Selesai), salin nomor rekening 1-klik, dan upload bukti bayar dengan pratinjau instan.
7. **E-Voucher & QR Code Pass (Tiket Saya)**:
   - Boarding pass digital dengan QR Code unik untuk dipindai di pintu masuk venue, serta tombol unduh tiket PDF resmi.
8. **Extranet Organizer & Admin**:
   - Dashboard analitik dengan KPI ringkasan penjualan, tabel verifikasi bukti transfer dengan modal pratinjau gambar, dan form penerbitan konser baru.
