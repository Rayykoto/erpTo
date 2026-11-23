# Panduan Kontribusi

Terima kasih atas ketertarikan Anda untuk berkontribusi pada proyek ini!

## Alur Kontribusi

1. **Fork** repository ini ke akun GitHub Anda.
2. Buat branch baru dari `main` untuk fitur atau perbaikan Anda:
   ```bash
   git checkout -b feat/nama-fitur-baru
   # atau
   git checkout -b fix/deskripsi-bug

3. `SECURITY.md` (Kebijakan Keamanan)
Sangat penting untuk aplikasi ERP agar celah keamanan (seperti kebocoran data lintas tenant) dilaporkan secara privat, bukan dibuka di *Public Issues*.

```markdown
# Kebijakan Keamanan (Security Policy)

## Melaporkan Celah Keamanan

Jika Anda menemukan celah keamanan—terutama yang berkaitan dengan isolasi data multi-tenant, autentikasi, atau hak akses—**mohon jangan membuka Issue publik**.

Laporkan temuan Anda secara langsung melalui jalur privat berikut:
- **WhatsApp / Kontak Langsung:** https://wa.me/6281314633490
- Atau gunakan fitur **Private Vulnerability Reporting** pada tab *Security* di repository GitHub ini.

Sertakan langkah reproduksi (*steps to reproduce*) agar perbaikan dapat segera dirilis.