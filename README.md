# Felsefiy – LLM Red Teaming Platform

**TR** · Felsefiy, LLM (Büyük Dil Modelleri) güvenliğini test etmek için tasarlanmış, web tabanlı, otonom bir "Red Teaming" platformudur.

**EN** · Felsefiy is a web-based autonomous "Red Teaming" platform designed to test and evaluate the security of Large Language Models (LLMs).

---

## 🎯 Özellikler / Features

- **Çift AI aktörlü saldırı döngüsü / Dual‑agent attack loop**  
  Attacker AI ve Moderator AI ile otomatik jailbreak testleri · Automated jailbreak tests with attacker & moderator agents.

- **Dinamik hedef yapılandırması / Dynamic target configuration**  
  Postman benzeri HTTP method, URL, headers ve body template tanımı · Postman‑like API configuration.

- **Canlı izleme / Live monitoring**  
  Socket.IO ile gerçek zamanlı oturum takibi ve log akışı · Real‑time session stream via WebSocket.

- **Strateji yönetimi / Strategy management**  
  DAN, roleplay vb. saldırı stratejileri; kendi stratejinizi tanımlama · Built‑in and custom attack strategies.

- **Prompt Optimizer**  
  Başarılı saldırılardan yola çıkarak daha güçlü ve zor tespit edilen promptlar üretme · Generate stronger, harder‑to‑detect prompts from successful attacks.

- **Güvenlik raporları / Security reports**  
  Oturumları analiz eden AI destekli detaylı güvenlik raporları · AI‑generated multi‑perspective security reports.

- **Çok dilli arayüz (TR/EN) ve eğitim katmanı / Bilingual UI & onboarding layer**  
  Tüm ana ekranlarda yardım tooltipleri ve "Nasıl kullanılır?" blokları · Help tooltips and step‑by‑step guidance on key screens.

- **Modern UI**  
  Minimalist, karanlık tema, TailwindCSS tabanlı arayüz · Minimal, modern dark UI.

---

## 🛠️ Mimari / Tech Stack

- **Backend**: Node.js, Express, Socket.IO, Prisma ORM  
- **Database**: PostgreSQL  
- **Frontend**: React (Vite), TailwindCSS  
- **Containerization**: Docker & Docker Compose

Ana dizin yapısı:

```text
Felsify/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── routes/ (projects, sessions, strategies)
│   │   ├── services/ (attackLoop, openRouter, requestBuilder)
│   │   └── index.js
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/ (Dashboard, Projects, ProjectDetail, SessionView, Strategies, PromptOptimizer, Login)
│   │   ├── lib/ (api, i18n)
│   │   └── store/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## 🌐 Uluslararasılaştırma (i18n) & Eğitim Katmanı / Internationalization & Onboarding

**TR**

- Arayüz iki dili destekler: **Türkçe (tr)** ve **İngilizce (en)**.  
- Dil durumu ve çeviriler `frontend/src/lib/i18n.js` içindeki `LanguageProvider` ve `useLanguage()` hook'u ile yönetilir.  
- Tüm sabit metinler `translations.tr` ve `translations.en` sözlükleri üzerinden gelir; `t('namespace.key')` ile kullanılır.  
- Ana sayfalarda (Dashboard, Projects, ProjectDetail, SessionView, PromptOptimizer, Strategies) `HelpTooltip` bileşeni ve "Nasıl kullanılır?" blokları ile kullanıcıya açıklayıcı metinler gösterilir.

**EN**

- UI supports **Turkish (tr)** and **English (en)**.  
- Language state and translations are handled by `LanguageProvider` and the `useLanguage()` hook in `frontend/src/lib/i18n.js`.  
- Static texts are stored in `translations.tr` / `translations.en` and accessed via `t('namespace.key')`.  
- Key pages (Dashboard, Projects, ProjectDetail, SessionView, PromptOptimizer, Strategies) expose help tooltips and "How it works" sections for guided onboarding.

---

## 🚀 Kurulum / Setup

### Gereksinimler / Requirements

- Node.js **18+**  
- Docker & Docker Compose  
- OpenRouter API key  
- (Opsiyonel) Yerel geliştirme için PostgreSQL

### 1️⃣ Ortam değişkenleri / Environment

```bash
cp .env.example .env
```

`.env` dosyasında en azından OpenRouter anahtarını tanımlayın:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
# ADMIN_USERNAME, ADMIN_PASSWORD vb. kimlik bilgileri de burada tanımlanır.
```

### 2️⃣ Docker ile hızlı başlatma (önerilen) / Run with Docker (recommended)

```bash
docker-compose up -d --build
```

Bu komut / This will:

- PostgreSQL veritabanını başlatır (port **5433 → 5432** konteyner).  
- Backend API'yi başlatır (http://localhost:**3001**).  
- Frontend'i başlatır (http://localhost:**5173**).

İlk kurulumda tablolar oluşmadıysa:

```bash
docker-compose exec backend npx prisma db push
```

### 3️⃣ Manuel geliştirme / Manual dev setup

**Backend**

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

---

## 📖 Kullanım / Usage

1. **Giriş / Login**  
   - Admin kullanıcı adı/şifresi `.env` üzerinden tanımlanır.  
   - Login ekranında, alt tarafta bu ekranın nasıl çalıştığını anlatan TR/EN yardım bloğu vardır.

2. **Dashboard**  
   - Proje ve oturum istatistiklerini gösterir.  
   - Son projeler ve son oturumlar listeleri vardır; başlıklarda yardım tooltipleri bulunur.

3. **Projeler / Projects**  
   - Hedef API projelerini oluşturur/düzenlersiniz.  
   - Her karttan proje detayına gidebilir veya test başlatabilirsiniz.

4. **Stratejiler / Strategies**  
   - Saldırı stratejilerini yönetirsiniz (DAN, roleplay vb.).  
   - Varsayılan stratejileri seed edebilir veya yeni stratejiler tanımlayabilirsiniz.

5. **Proje Detayı / Project Detail**  
   - Seçilen proje için istatistikler, API yapılandırması, AI modelleri ve oturumlar.  
   - Buradan tekli test, çoklu saldırı (batch), Prompt Optimizer ve rapor oluşturma başlatılır.

6. **Oturum Ekranı / Session View**  
   - Saldırı döngüsünü canlı izlersiniz (Attacker / Target / Moderator mesajları).  
   - Üst çubuktaki "Nasıl çalışır? / How it works?" linki ile açılır/kapanır bir eğitim kartı bulunur.

7. **Prompt Optimizer**  
   - Optimize, Analyze, Successful Attacks, Templates, History sekmeleri ile prompt iyileştirme akışını yönetir.  
   - Sekme başlıkları ve sayfa üstünde yardımcı açıklamalar yer alır.

8. **Güvenlik Raporu / Security Report Modal**  
   - Tüm oturumları AI ile analiz eder, bölümlere ayrılmış kapsamlı rapor üretir.  
   - Rapor ekranının üst kısmında bu modülün nasıl kullanılacağını anlatan kısa bir rehber bulunur.

---

## 📝 API Endpoints (Özet / Summary)

### Projects

- `GET /api/projects` – Listele / List projects  
- `POST /api/projects` – Oluştur / Create project  
- `GET /api/projects/:id` – Detay / Get project detail  
- `PUT /api/projects/:id` – Güncelle / Update project  
- `DELETE /api/projects/:id` – Sil / Delete project  
- `POST /api/projects/:id/test` – Bağlantı testi / Connection test

### Sessions

- `GET /api/sessions` – Oturumları listele / List sessions  
- `POST /api/sessions` – Yeni oturum başlat / Start session  
- `GET /api/sessions/:id` – Oturum detayı / Session detail  
- `POST /api/sessions/:id/stop` – Oturumu durdur / Stop session

### Strategies

- `GET /api/strategies` – Stratejileri listele / List strategies  
- `POST /api/strategies` – Yeni strateji oluştur / Create strategy  
- `POST /api/strategies/seed` – Varsayılan stratejileri yükle / Seed default strategies

---

## 🔒 Güvenlik Notları / Security Notes

- Bu araç yalnızca **izinli sızma testleri ve güvenlik değerlendirmeleri** için kullanılmalıdır.  
- Kendi sistemlerinizi veya açıkça yetki aldığınız sistemleri test edin.  
- API anahtarlarınızı, oturum raporlarını ve logları üçüncü kişilerle paylaşmayın.  
- This tool must be used only for **authorized security testing**. Do not attack systems you do not own or explicitly control.

---

## 📄 Lisans / License

MIT License
