# VenceJá - Gestão de Boletos

MVP de gestão de boletos para pequenos restaurantes brasileiros.

## 🚀 Tech Stack

- React 18 + TypeScript + Vite
- Tailwind CSS (verde #4CAF50, azul #2196F3)
- React Query, Axios, Zustand, i18next (PT-BR)
- React Hook Form + Zod, Recharts, react-hot-toast

## 🛠️ Configuração

```bash
npm install
cp .env.example .env
# Edite VITE_API_URL no .env
npm run dev
```

## 🔌 API Endpoints

- POST /api/v1/auth/login
- GET /api/v1/boletos?page=0&size=10&status=PENDENTE
- POST /api/v1/boletos/scan (FormData)
- PUT /api/v1/boletos/{id}/pagar (FormData opcional)

## 📱 Funcionalidades

✅ Login JWT, Dashboard, Filtros, Marcar Pago, Scan, Alertas, Relatórios, Export CSV, Settings, Dark Mode, Responsive

## 🚢 Deploy

```bash
npm run build
# Deploy dist/ no Vercel/Netlify/Railway
```
