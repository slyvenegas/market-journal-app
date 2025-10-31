// ============================================
// IMPORTACIONES
// ============================================

// Importa la función 'serve' de Inngest para Next.js
// Inngest es una plataforma de orquestación de funciones serverless y trabajos en segundo plano
// 'serve' crea un endpoint HTTP que Inngest puede llamar para ejecutar funciones programadas o eventos
import {serve} from "inngest/next";

// Importa la instancia del cliente de Inngest configurada para tu aplicación
// Este cliente es el punto de conexión entre tu app y los servicios de Inngest
import {inngest} from "@/lib/inngest/client";

// Importa las funciones de Inngest que se ejecutarán en segundo plano
// sendSignUpEmail: función que envía un email de bienvenida cuando un usuario se registra
// sendDailyNewsSummary: función que envía un resumen diario de noticias del mercado
import {sendSignUpEmail, sendDailyNewsSummary} from "@/lib/inngest/functions";

// ============================================
// CONFIGURACIÓN DEL ENDPOINT DE INNGEST
// ============================================
// Esta es una característica especial de Next.js App Router (Route Handlers)
// Exportar GET, POST, PUT desde un archivo route.ts crea endpoints HTTP automáticamente

// serve() configura un endpoint HTTP que Inngest usará para:
// 1. Registrar tus funciones (GET)
// 2. Ejecutar funciones cuando se disparen eventos (POST)
// 3. Otras operaciones de gestión (PUT)
export const { GET, POST, PUT } = serve({
    // ============================================
    // CLIENTE DE INNGEST
    // ============================================
    // Proporciona la instancia del cliente que contiene:
    // - API keys para autenticación
    // - Configuración del proyecto
    // - URL del servidor de Inngest
    client: inngest,
    
    // ============================================
    // REGISTRO DE FUNCIONES
    // ============================================
    // Array con todas las funciones de Inngest que esta app puede ejecutar
    // Cada función está configurada con:
    // - Un trigger (evento que la dispara)
    // - La lógica a ejecutar
    // - Configuración de reintentos, delays, etc.
    functions: [
        sendSignUpEmail,       // Función 1: Envía email cuando un usuario se registra
        sendDailyNewsSummary   // Función 2: Envía resumen diario de noticias del mercado
    ],
})

// ============================================
// FLUJO DE TRABAJO DEL CÓDIGO:
// ============================================
// 
// CONFIGURACIÓN INICIAL (Deploy):
// 1. Cuando despliegas tu aplicación, Inngest hace una petición GET a este endpoint
// 2. La petición GET retorna la configuración de todas tus funciones
// 3. Inngest registra estas funciones en su plataforma
// 4. Ahora Inngest sabe qué funciones puede ejecutar y cómo dispararlas
//
// EJECUCIÓN DE FUNCIONES (Runtime):
// 
// ESCENARIO A - Email de Bienvenida (sendSignUpEmail):
// 1. Un usuario completa el formulario de registro en SignUp
// 2. signUpWithEmail() crea el usuario en la base de datos
// 3. signUpWithEmail() dispara un evento a Inngest: 
//    inngest.send({ name: 'user/signup.created', data: { email, name } })
// 4. Inngest recibe el evento y busca funciones que escuchen 'user/signup.created'
// 5. Inngest hace una petición POST a este endpoint con los datos del evento
// 6. serve() recibe la petición y ejecuta sendSignUpEmail()
// 7. sendSignUpEmail() envía el email de bienvenida al nuevo usuario
// 8. La función retorna el resultado a Inngest
// 9. Si falla, Inngest puede reintentar automáticamente según la configuración
//
// ESCENARIO B - Resumen Diario de Noticias (sendDailyNewsSummary):
// 1. Inngest tiene un cron programado (ej: todos los días a las 8:00 AM)
// 2. Cuando llega la hora programada, Inngest dispara el evento
// 3. Inngest hace una petición POST a este endpoint
// 4. serve() ejecuta sendDailyNewsSummary()
// 5. La función:
//    a) Busca las noticias más relevantes del día
//    b) Usa IA para generar un resumen personalizado
//    c) Envía el email a todos los usuarios suscritos
// 6. La función retorna el resultado
// 7. Inngest registra el éxito/fallo y guarda logs
//
// ============================================
// PROPÓSITO GENERAL:
// ============================================
// Este archivo es el "puente" entre tu aplicación Next.js e Inngest.
// 
// VENTAJAS DE USAR INNGEST:
// - Ejecución confiable de trabajos en segundo plano
// - Reintentos automáticos si algo falla
// - Logs y monitoreo de todas las ejecuciones
// - Scheduling (cron jobs) sin configurar servidores
// - Gestión de eventos y flujos complejos
// - No bloquea las respuestas HTTP de tu aplicación
//
// SIN INNGEST TENDRÍAS QUE:
// - Configurar un servidor separado para cron jobs
// - Implementar manualmente lógica de reintentos
// - Gestionar colas de trabajos
// - Monitorear y debugear trabajos fallidos manualmente
// - Escalar la infraestructura para trabajos pesados
//
// CASOS DE USO EN TU APP:
// 1. sendSignUpEmail:
//    - Se dispara: cuando un usuario se registra
//    - Propósito: dar bienvenida y confirmar cuenta
//    - Beneficio: no bloquea el registro, si falla se reintenta
//
// 2. sendDailyNewsSummary:
//    - Se dispara: todos los días a una hora específica (cron)
//    - Propósito: mantener usuarios comprometidos con insights diarios
//    - Beneficio: análisis IA del mercado enviado automáticamente
//
// ============================================
// UBICACIÓN DEL ARCHIVO:
// ============================================
// Este archivo debe estar en: app/api/inngest/route.ts
// La ruta /api/inngest es donde Inngest enviará las peticiones
// Next.js reconoce route.ts como un Route Handler y expone los métodos HTTP
//
// ESTRUCTURA:
// app/
//   api/
//     inngest/
//       route.ts  ← Este archivo crea el endpoint /api/inngest
//
// ============================================
// CONCEPTOS CLAVE:
// ============================================
// 
// 1. ROUTE HANDLERS (Next.js 13+):
//    - Archivos route.ts/js en App Router crean endpoints API
//    - Exportar GET, POST, etc. define qué métodos HTTP acepta
//    - Similar a las API Routes de Next.js 12 pero más flexible
//
// 2. SERVERLESS FUNCTIONS:
//    - Este código se ejecuta en funciones serverless (edge/lambda)
//    - No tienes un servidor corriendo 24/7
//    - Se ejecuta solo cuando Inngest hace peticiones
//    - Escala automáticamente según la demanda
//
// 3. EVENT-DRIVEN ARCHITECTURE:
//    - Las funciones se disparan por eventos ('user/signup.created', cron, etc.)
//    - Desacopla la lógica: crear usuario ≠ enviar email
//    - Más resiliente: si el email falla, el usuario ya está creado
//
// 4. BACKGROUND JOBS:
//    - Trabajos que no necesitan respuesta inmediata
//    - Se ejecutan de forma asíncrona
//    - No afectan la experiencia del usuario (no agregan latencia)
//
// ============================================
// SEGURIDAD:
// ============================================
// - Inngest usa API keys y signing secrets para autenticación
// - Solo peticiones firmadas por Inngest pueden ejecutar las funciones
// - Tu client config en @/lib/inngest/client debe tener las credenciales
// - Las credenciales deben estar en variables de entorno (.env)
//
// ============================================
// MONITOREO Y DEBUGGING:
// ============================================
// - Inngest Cloud Dashboard muestra todas las ejecuciones
// - Puedes ver logs de cada función
// - Historial de éxitos/fallos
// - Métricas de rendimiento
// - Reintentar manualmente ejecuciones fallidas