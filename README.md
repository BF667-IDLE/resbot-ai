# ResBot AI

ResBot AI adalah bot WhatsApp berbasis AI yang mendukung **multi-provider AI (Gemini & Groq)** dengan sistem **auto fallback**.  
Jika Gemini terkena limit atau error, bot otomatis beralih ke Groq tanpa memutus percakapan.

Bot ini dikembangkan menggunakan **Node.js (ESM)** dan cocok untuk penggunaan pribadi maupun skala kecil–menengah.

---

## ✨ Fitur Utama

- 🤖 AI Chat (Gemini & Groq)
- 🔁 Auto fallback (Gemini → Groq)
- 🧠 History percakapan per user
- ⚙️ Konfigurasi terpusat via `config.js`
- 🧩 Mudah dikembangkan & modular
- 💬 Cocok untuk bot WhatsApp (Baileys)

---

## 📦 Teknologi

- Node.js (ES Module)
- Axios
- WhatsApp Baileys
- Google Gemini API
- Groq API (LLaMA)

---

## 🚀 Instalasi

### 1️⃣ Clone Repository

```bash
git clone https://github.com/autoresbot/resbot-ai.git
cd resbot-ai
```

Mendapatkan API Key AI
Bot ini membutuhkan 2 API Key:

1. Gemini (AI utama)
2. Groq (AI cadangan)

Cara Mendapatkan API Key Gemini

- Buka website Google AI Studio
  👉 https://aistudio.google.com/

- Login menggunakan akun Google

- Klik Get API Key

- Buat API Key baru

- Salin API Key tersebut

Cara Mendapatkan API Key Groq (Backup AI)
👉 Groq digunakan otomatis jika Gemini: Error, kena limit (429)

- Langkah-langkah:

-Buka website Groq
👉 https://groq.com/

- Login atau daftar akun

- Masuk ke menu API Keys

- Klik Create API Key

- Salin API Key

Konfigurasi AI (config.js)

Buka file config.js
