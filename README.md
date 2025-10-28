# Market Journal App

> > Aplicación financiera moderna con Next.js, TypeScript, Shadcn y funcionalidades impulsadas por IA para alertas, resúmenes y análisis en tiempo real.

---

## ✨ Sobre el proyecto

MJ App es una aplicación de mercado de valores diseñada para monitorear precios en tiempo real, gestionar watchlists, recibir alertas personalizadas y explorar insights financieros generados por IA. Incluye un panel de administración para gestionar acciones, noticias y actividad de usuarios. Los flujos en background (Inngest) permiten automatizar alertas, resúmenes diarios y análisis de sentimiento.

---

<img width="1365" height="642" alt="image" src="https://github.com/user-attachments/assets/a0306f53-9943-4f09-a563-427360ee299b" />
<br>
<img width="1358" height="647" alt="image" src="https://github.com/user-attachments/assets/22e134ce-ebb0-4604-8496-4c38651ec3d5" />



## 🔋 Tech Stack

* **Frontend:** Next.js, React, Shadcn, Tailwind CSS, TypeScript
* **Backend / Serverless:** Next.js API Routes
* **Autenticación:** Better Auth
* **Workflows / Jobs:** Inngest
* **Datos de mercado:** Finnhub
* **Base de datos:** MongoDB
* **Emails:** Nodemailer
* **Utilidades:** Docker (opcional), Vercel (despliegue)

---

## 🔋 Características principales

* Dashboard con precios en tiempo real y gráficas (line & candlestick)
* Watchlist personalizable
* Alertas por cambios de precio o volumen (correo electrónico)
* Insights de empresa: PE, EPS, ingresos, noticias y sentimiento
* Flujos automatizados: resúmenes diarios, notificaciones de earnings
* Panel de administración para publicar noticias y gestionar usuarios
* Tests básicos y estructura modular para fácil mantención

---

## 🚀 Quick Start (local)

**Requisitos**: Node.js, npm/yarn, Git

1. Clona el repositorio

```bash
git clone https://github.com/slyvenegas/market-journal-app.git
cd market-journal-app
```

2. Instala dependencias

```bash
npm install
```

3. Crea el archivo `.env` en la raíz con las variables (ejemplo):

```
NODE_ENV='development'
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# FINNHUB
NEXT_PUBLIC_FINNHUB_API_KEY=
FINNHUB_BASE_URL=https://finnhub.io/api/v1

# MONGODB
MONGODB_URI=

# BETTER AUTH
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

# GEMINI
GEMINI_API_KEY=

# NODEMAILER
NODEMAILER_EMAIL=
NODEMAILER_PASSWORD=
```

> **Nota:** Reemplaza los valores por tus credenciales. Para pruebas locales puedes usar servicios gratis o mocks.

4. Ejecuta la app en modo desarrollo

```bash
npm run dev
# En otra terminal (si usas Inngest local)
npx inngest-cli@latest dev
```

Abre `http://localhost:3000`.

---

## 📁 Estructura recomendada de carpetas

```
/src
  /app (Next.js pages o app router)
  /components
  /lib (servicios: finnhub, email)
  /hooks
  /pages/api (endpoints)
  /inngest (workflows)
  /models (schemas mongoose)
  /utils
```

---

## 🧪 Testing

* Agrega pruebas unitarias para la lógica del dominio (ej. alertas y transformación de datos).
* Recomiendo usar Jest + Testing Library para componentes React y pruebas de funciones.

---

## 🖼️ Assets / Demo

Incluye capturas de pantalla en la carpeta `/assets`.

---

## 💡 Mejores prácticas y mejoras sugeridas

* Externalizar claves en Secret Manager para deploys
* Añadir integración CI (GitHub Actions) con lint, build y tests
* Cobertura de tests para workflows (Inngest)
* Implementar caching y optimizaciones en las consultas de Finnhub
* Añadir PWA y notificaciones push para alerts en tiempo real

---
