# Rezona Yönetici Paneli

React, TypeScript ve Vite ile hazırlanmış, tek demo şirketi üzerinden çalışan şirket yönetimi frontend’i.

## Çalıştırma

Node.js 22 ve npm ile proje klasöründe:

```sh
npm ci
npm run dev
```

Vite’ın terminalde yazdığı yerel adresi açın. Üretim çıktısı için `npm run build`, üretilen çıktıyı yerelde açmak için `npm run preview` kullanın.

## Demo oturumları

Giriş ekranındaki rol düğmeleri demo hesabının e-postasını ve parolasını forma yazar.

| Rol | Varsayılan ekran | Erişim |
| --- | --- | --- |
| Company Admin | `#/admin` | Şirket özeti, kullanıcılar, takımlar, HR ve Operator hesap yönetimi |
| HR | `#/hr` | Şirketin takım ve üye sayısı özeti |
| Operator | `#/operator` | Kendi profil ve takım bilgileri |

Demo hesap verisi `localStorage`, oturum kimliği `sessionStorage` üzerinden saklanır. `src/users.ts` yerel kullanıcı verisini, `src/demoAuth.ts` demo oturumunu yönetir. Rol ve şirket filtreleri frontend davranışını gösterir. Üretim ortamındaki kimlik doğrulama, API yetkileri ve şirket izolasyonu sunucuda uygulanır.
