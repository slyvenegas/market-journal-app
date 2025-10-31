// ============================================
// IMPORTACIONES
// ============================================
// betterAuth: función principal de Better Auth para crear instancia de autenticación
// Es el core de Better Auth, proporciona toda la funcionalidad de auth
// Configura: base de datos, métodos de login, sesiones, cookies, etc.
import { betterAuth } from "better-auth";

// mongodbAdapter: adaptador que permite a Better Auth usar MongoDB como base de datos
// Better Auth soporta múltiples DB: PostgreSQL, MySQL, SQLite, MongoDB
// El adapter traduce operaciones de Better Auth a queries específicas de MongoDB
// Maneja: crear usuarios, sesiones, verificación, etc.
import { mongodbAdapter} from "better-auth/adapters/mongodb";

// connectToDatabase: tu función helper que establece conexión a MongoDB
// Patrón singleton que reutiliza conexión existente
// Previene múltiples conexiones en cada petición (eficiente)
import { connectToDatabase} from "@/database/mongoose";

// nextCookies: plugin de Better Auth específico para Next.js
// Maneja cookies de sesión de forma optimizada para Next.js
// Funciona con: App Router, Server Components, Server Actions, Middleware
// Gestiona: HttpOnly cookies, Secure flags, SameSite attributes
import { nextCookies} from "better-auth/next-js";

// ============================================
// VARIABLE GLOBAL: CACHE DE INSTANCIA
// ============================================
// authInstance: variable que almacena la instancia de Better Auth
// Inicialmente es null, se crea bajo demanda (lazy initialization)
//
// PROPÓSITO: PATRÓN SINGLETON
// Queremos UNA SOLA instancia de Better Auth en toda la aplicación
// No crear nueva instancia en cada import o petición (ineficiente)
//
// ReturnType<typeof betterAuth>: tipo TypeScript que extrae el tipo de retorno
// - typeof betterAuth: obtiene el tipo de la función betterAuth
// - ReturnType<...>: extrae qué retorna esa función
// Resultado: tipo exacto de la instancia de Better Auth
//
// | null: puede ser null inicialmente (antes de la primera creación)
let authInstance: ReturnType<typeof betterAuth> | null = null;

// ============================================
// FUNCIÓN ASÍNCRONA: getAuth
// ============================================
// Esta función implementa el patrón SINGLETON para Better Auth
// Garantiza que solo exista UNA instancia en toda la aplicación
//
// PATRÓN SINGLETON:
// 1. Primera llamada: crea instancia y la cachea
// 2. Llamadas siguientes: retorna instancia cacheada
// 3. No reconecta a DB, no reconfigura, solo reutiliza
//
// ES ASÍNCRONA porque:
// - Necesita conectarse a MongoDB (operación I/O)
// - await connectToDatabase() es asíncrono
//
// RETORNA: instancia configurada de Better Auth
export const getAuth = async () => {
    // ============================================
    // PASO 1: VERIFICAR SI YA EXISTE INSTANCIA
    // ============================================
    // if (authInstance): verifica si ya creamos la instancia anteriormente
    // Si existe, la retorna inmediatamente (rápido, no hace nada más)
    //
    // VENTAJAS:
    // - No reconecta a MongoDB innecesariamente
    // - No reconfigura Better Auth cada vez
    // - Múltiples imports obtienen la MISMA instancia
    // - Performance: retorno inmediato en llamadas subsecuentes
    if(authInstance) return authInstance;
    // Si llegamos aquí, es la PRIMERA vez que se llama getAuth()

    // ============================================
    // PASO 2: ESTABLECER CONEXIÓN A MONGODB
    // ============================================
    // Conecta a MongoDB usando tu función helper
    // connectToDatabase() es singleton también (reutiliza conexión)
    //
    // await: esperamos porque la conexión es asíncrona
    // mongoose: instancia de Mongoose con conexión activa
    const mongoose = await connectToDatabase();
    
    // ============================================
    // PASO 3: OBTENER INSTANCIA NATIVA DE MONGODB
    // ============================================
    // mongoose.connection.db: accede a MongoDB native driver
    // Better Auth necesita la instancia NATIVA (no el wrapper de Mongoose)
    //
    // ¿POR QUÉ?
    // Better Auth usa MongoDB driver directamente para:
    // - Crear colecciones automáticamente (user, session, verification)
    // - Ejecutar queries sin schemas de Mongoose
    // - Mayor control sobre operaciones de DB
    const db = mongoose.connection.db;
    
    // ============================================
    // VALIDACIÓN: VERIFICAR CONEXIÓN
    // ============================================
    // if (!db): verifica que la conexión existe
    // Si es null/undefined, lanza error (no puede continuar sin DB)
    //
    // throw new Error(): detiene ejecución
    // El error será capturado por el caller (quien llamó getAuth)
    if(!db) throw new Error('MongoDB connection not found');

    // ============================================
    // PASO 4: CREAR Y CONFIGURAR INSTANCIA DE BETTER AUTH
    // ============================================
    // betterAuth(): función que crea instancia con configuración específica
    // Recibe un objeto de configuración con múltiples opciones
    authInstance = betterAuth({
        // ============================================
        // CONFIGURACIÓN: DATABASE ADAPTER
        // ============================================
        // database: define QUÉ base de datos usa Better Auth
        // mongodbAdapter(db): adaptador que traduce operaciones a MongoDB
        //
        // PROCESO INTERNO:
        // - Better Auth llama: adapter.createUser({ email, password })
        // - Adapter traduce: db.collection('user').insertOne({ ... })
        // - Better Auth es agnóstico de DB, adapter hace la traducción
        //
        // as any: cast de TypeScript porque tipos pueden no coincidir perfectamente
        // (pequeña incompatibilidad entre tipos de Mongoose y Better Auth)
        // En runtime funciona perfectamente, solo es tema de tipos
        database: mongodbAdapter(db as any),
        
        // ============================================
        // CONFIGURACIÓN: SECRET KEY
        // ============================================
        // secret: clave secreta para firmar tokens JWT y cookies
        // CRÍTICA PARA SEGURIDAD: debe ser larga, aleatoria, y secreta
        //
        // process.env.BETTER_AUTH_SECRET: variable de entorno
        // Ejemplo en .env: BETTER_AUTH_SECRET="tu-clave-super-secreta-de-32-chars-minimo"
        //
        // SE USA PARA:
        // - Firmar JWT tokens (previene manipulación)
        // - Encriptar cookies de sesión
        // - Generar tokens de verificación
        // - Validar que tokens no fueron alterados
        //
        // NUNCA debe estar hardcoded en código (seguridad)
        // NUNCA debe commitearse a Git (usar .env y .gitignore)
        // DEBE SER DIFERENTE en dev, staging, producción
        secret: process.env.BETTER_AUTH_SECRET,
    
        // ============================================
        // CONFIGURACIÓN: BASE URL
        // ============================================
        // baseURL: URL base de tu aplicación
        // Se usa para generar URLs absolutas (emails, redirects, callbacks)
        //
        // process.env.BETTER_AUTH_URL: variable de entorno
        // Ejemplos:
        // - Dev: "http://localhost:3000"
        // - Staging: "https://staging.tuapp.com"
        // - Producción: "https://tuapp.com"
        //
        // SE USA PARA:
        // - Links en emails de verificación: "https://tuapp.com/verify?token=..."
        // - Redirects después de OAuth: "https://tuapp.com/auth/callback"
        // - URLs en cookies (dominio correcto)
        //
        // IMPORTANTE: debe coincidir con el dominio real de tu app
        baseURL: process.env.BETTER_AUTH_URL,
        
        // ============================================
        // CONFIGURACIÓN: EMAIL & PASSWORD AUTHENTICATION
        // ============================================
        // emailAndPassword: habilita y configura auth con email/password
        // Este es el método "tradicional" de autenticación
        emailAndPassword: {
            // ============================================
            // enabled: true
            // ============================================
            // Habilita autenticación con email y password
            // Si es false, solo podrías usar OAuth (Google, GitHub, etc.)
            enabled: true,
            
            // ============================================
            // disableSignUp: false
            // ============================================
            // Permite que usuarios NUEVOS se registren
            // Si fuera true:
            // - Solo usuarios existentes pueden hacer login
            // - No se pueden crear cuentas nuevas
            // - Útil para apps "invite-only" o cerradas
            //
            // false: cualquiera puede registrarse (tu caso)
            disableSignUp: false,
            
            // ============================================
            // requireEmailVerification: false
            // ============================================
            // NO requiere verificación de email para usar la app
            //
            // Si fuera true:
            // - Después de registrarse, se envía email con link
            // - Usuario debe hacer clic en link para verificar
            // - No puede acceder a la app hasta verificar
            //
            // false: usuario puede usar app inmediatamente después de registro
            // (más friction = menos conversión, pero menos seguridad)
            //
            // RECOMENDACIÓN: true en producción (previene spam, bots, emails falsos)
            requireEmailVerification: false,
            
            // ============================================
            // minPasswordLength: 8
            // ============================================
            // Password debe tener MÍNIMO 8 caracteres
            // Better Auth rechazará passwords más cortas
            //
            // ESTÁNDAR DE SEGURIDAD:
            // - 8 es el mínimo aceptable (NIST guidelines)
            // - Recomendado: 12+ para mejor seguridad
            // - Apps financieras: 14+ caracteres
            //
            // Validación en el SERVIDOR (no se puede bypassear desde cliente)
            minPasswordLength: 8,
            
            // ============================================
            // maxPasswordLength: 128
            // ============================================
            // Password NO puede exceder 128 caracteres
            // Previene ataques DoS con passwords gigantes
            //
            // RAZÓN:
            // - Hashear passwords muy largas consume mucha CPU
            // - Atacante podría enviar password de 1MB para saturar servidor
            // - 128 caracteres es más que suficiente para cualquier password
            maxPasswordLength: 128,
            
            // ============================================
            // autoSignIn: true
            // ============================================
            // Después de REGISTRARSE, el usuario es automáticamente LOGUEADO
            //
            // FLUJO CON autoSignIn: true (tu configuración):
            // 1. Usuario llena formulario de registro
            // 2. Submit → signUpWithEmail()
            // 3. Better Auth crea cuenta
            // 4. Better Auth crea sesión automáticamente
            // 5. Better Auth establece cookie
            // 6. Usuario es redirigido a /dashboard (ya logueado)
            //
            // FLUJO CON autoSignIn: false:
            // 1. Usuario llena formulario de registro
            // 2. Submit → signUpWithEmail()
            // 3. Better Auth crea cuenta
            // 4. Usuario es redirigido a /sign-in
            // 5. Usuario debe ingresar email/password NUEVAMENTE
            // 6. Ahora sí puede acceder a /dashboard
            //
            // VENTAJAS DE true:
            // - Mejor UX (un paso menos)
            // - Menos friction (más conversión)
            // - Usuario ve valor inmediatamente
            //
            // DESVENTAJAS DE true:
            // - Si requireEmailVerification=true, usuario podría usar app sin verificar
            autoSignIn: true,
        },
        
        // ============================================
        // CONFIGURACIÓN: PLUGINS
        // ============================================
        // plugins: array de plugins que extienden funcionalidad de Better Auth
        // Plugins pueden agregar: OAuth providers, 2FA, rate limiting, etc.
        plugins: [
            // ============================================
            // PLUGIN: nextCookies()
            // ============================================
            // Plugin específico para Next.js que optimiza manejo de cookies
            //
            // FUNCIONALIDADES:
            // - Configura cookies para App Router de Next.js
            // - Maneja Server Components correctamente
            // - Optimiza cookies para Server Actions
            // - Configura headers de cookies apropiadamente
            // - Gestiona cookies en Middleware
            //
            // CONFIGURACIÓN DE COOKIES QUE APLICA:
            // - HttpOnly: true (JavaScript no puede leer, previene XSS)
            // - Secure: true en producción (solo HTTPS)
            // - SameSite: 'lax' (previene CSRF)
            // - Path: '/' (disponible en toda la app)
            // - MaxAge: 30 días (sesión expira en 30 días)
            //
            // SIN ESTE PLUGIN:
            // - Cookies podrían no funcionar correctamente en Server Components
            // - Middleware podría no leer sesión correctamente
            // - Server Actions podrían tener problemas con autenticación
            nextCookies()
        ],
    });

    // ============================================
    // PASO 5: RETORNAR INSTANCIA CREADA
    // ============================================
    // authInstance ahora contiene la instancia configurada
    // Se guardó en la variable global (cacheo)
    // Próximas llamadas a getAuth() retornarán esta instancia directamente
    return authInstance;
}

// ============================================
// EXPORTACIÓN: INSTANCIA DE AUTH (TOP-LEVEL AWAIT)
// ============================================
// export const auth = await getAuth();
//
// ESTO ES TOP-LEVEL AWAIT:
// - await se usa FUERA de una función async (en el nivel superior del módulo)
// - Solo funciona en ESM (ES Modules) moderno
// - Next.js soporta esto perfectamente
//
// EFECTO:
// - Cuando CUALQUIER archivo importa este módulo:
//   import { auth } from '@/lib/better-auth/auth';
// - Este código se ejecuta UNA VEZ
// - Llama a getAuth() y espera su resultado
// - auth contiene la instancia lista para usar
// - Todos los imports subsecuentes obtienen la MISMA instancia
//
// EJEMPLO DE USO EN OTROS ARCHIVOS:
// ```typescript
// import { auth } from '@/lib/better-auth/auth';
// 
// // Usar directamente, no necesitas await
// export async function signUp(data) {
//   const response = await auth.api.signUpEmail({ body: data });
//   return response;
// }
// ```
//
// VENTAJAS:
// - Sintaxis limpia: import { auth } en lugar de import { getAuth }
// - No necesitas await en cada uso: auth.api.signIn() en vez de (await getAuth()).api.signIn()
// - Garantiza inicialización antes de que cualquier código la use
// - Patrón singleton implícito
export const auth = await getAuth();

// ============================================
// FLUJO DE TRABAJO COMPLETO: INICIALIZACIÓN
// ============================================
//
// MOMENTO 1: PRIMERA IMPORTACIÓN DEL MÓDULO
// ────────────────────────────────────────────────────────────────
// Cualquier archivo importa auth por primera vez:
// ```typescript
// // En /actions/auth.ts
// import { auth } from '@/lib/better-auth/auth';
// ```
//
// PROCESO:
// 1. Node.js/Next.js carga el módulo '@/lib/better-auth/auth'
// 2. Ejecuta todo el código del nivel superior
// 3. Llega a: export const auth = await getAuth();
// 4. Ejecuta getAuth():
//    a) authInstance es null (primera vez)
//    b) await connectToDatabase() → conecta a MongoDB
//    c) Obtiene db = mongoose.connection.db
//    d) Crea authInstance = betterAuth({ ... })
//    e) Configura database adapter, secret, baseURL, etc.
//    f) Retorna authInstance
// 5. auth ahora contiene la instancia configurada
// 6. El import { auth } recibe la instancia lista
//
// TIEMPO: ~100-300ms (solo la primera vez)
//
// MOMENTO 2: IMPORTACIONES SUBSECUENTES
// ────────────────────────────────────────────────────────────────
// Otro archivo importa auth:
// ```typescript
// // En /middleware.ts
// import { auth } from '@/lib/better-auth/auth';
// ```
//
// PROCESO:
// 1. Node.js detecta que el módulo ya fue cargado
// 2. Retorna el export { auth } cacheado
// 3. NO vuelve a ejecutar getAuth()
// 4. NO vuelve a conectar a DB
// 5. NO vuelve a configurar Better Auth
//
// TIEMPO: <1ms (instantáneo)
//
// ============================================
// ESTRUCTURA DE LA INSTANCIA auth:
// ============================================
//
// La instancia auth contiene múltiples APIs:
//
// auth.api: API principal para operaciones de autenticación
// ├── signUpEmail({ body: { email, password, name }})
// ├── signInEmail({ body: { email, password }})
// ├── signOut({ headers })
// ├── getSession({ headers })
// ├── updateUser({ body: { ... }})
// ├── changePassword({ body: { oldPassword, newPassword }})
// ├── sendVerificationEmail({ email })
// └── verifyEmail({ token })
//
// auth.handler: Middleware/handler para Next.js
// - Se usa en API routes: /api/auth/*
// - Maneja callbacks, tokens, etc.
//
// auth.options: Configuración actual
// - Acceso a la config que establecimos
//
// ============================================
// COLECCIONES CREADAS EN MONGODB:
// ============================================
//
// Better Auth con mongodbAdapter crea automáticamente estas colecciones:
//
// 1. COLECCIÓN: user
// ────────────────────────────────────────────────────────────────
// Almacena información de usuarios
// {
//   _id: ObjectId("..."),
//   id: "user_abc123",              // ID de Better Auth (string)
//   email: "john@example.com",
//   emailVerified: false,
//   name: "John Doe",
//   image: null,
//   createdAt: ISODate("2024-10-30"),
//   updatedAt: ISODate("2024-10-30"),
//   password: "$2b$10$..."           // Password hasheada con bcrypt
// }
//
// 2. COLECCIÓN: session
// ────────────────────────────────────────────────────────────────
// Almacena sesiones activas
// {
//   _id: ObjectId("..."),
//   id: "session_xyz789",
//   userId: "user_abc123",
//   token: "eyJhbGciOiJIUzI1NiIs...",  // JWT o session token
//   expiresAt: ISODate("2024-11-30"),  // 30 días desde creación
//   ipAddress: "192.168.1.1",
//   userAgent: "Mozilla/5.0 ...",
//   createdAt: ISODate("2024-10-30")
// }
//
// 3. COLECCIÓN: verification (si requireEmailVerification: true)
// ────────────────────────────────────────────────────────────────
// Almacena tokens de verificación de email
// {
//   _id: ObjectId("..."),
//   id: "verification_123",
//   userId: "user_abc123",
//   token: "random-token-here",
//   expiresAt: ISODate("2024-10-31"),  // Expira en 24 horas
//   type: "email-verification",
//   createdAt: ISODate("2024-10-30")
// }
//
// 4. COLECCIÓN: account (si usas OAuth providers)
// ────────────────────────────────────────────────────────────────
// Vincula cuentas OAuth (Google, GitHub) con usuarios
// {
//   _id: ObjectId("..."),
//   userId: "user_abc123",
//   providerId: "google",
//   providerAccountId: "google-user-id-12345",
//   accessToken: "ya29.a0AfH6SM...",
//   refreshToken: "1//0gHZ...",
//   expiresAt: ISODate("2024-10-30T10:00:00"),
//   scope: "email profile"
// }
//
// ============================================
// VARIABLES DE ENTORNO REQUERIDAS:
// ============================================
//
// Archivo: .env.local (en la raíz del proyecto)
// ```env
// # MongoDB Connection
// MONGODB_URI="mongodb+srv://user:password@cluster.mongodb.net/signalist?retryWrites=true&w=majority"
//
// # Better Auth Configuration
// BETTER_AUTH_SECRET="tu-clave-super-secreta-minimo-32-caracteres-aleatorios"
// BETTER_AUTH_URL="http://localhost:3000"  # Dev
// # BETTER_AUTH_URL="https://tuapp.com"   # Producción
// ```
//
// GENERACIÓN DE SECRET:
// ```bash
// # Opción 1: OpenSSL
// openssl rand -base64 32
//
// # Opción 2: Node.js
// node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
//
// # Opción 3: Online
// https://generate-secret.vercel.app/32
// ```
//
// ============================================
// SEGURIDAD:
// ============================================
//
// ✅ Secret key segura: nunca hardcoded, siempre en .env
// ✅ HttpOnly cookies: JavaScript no puede leer (previene XSS)
// ✅ Secure flag: solo HTTPS en producción
// ✅ SameSite: previene CSRF attacks
// ✅ Password hashing: bcrypt con 10 rounds (estándar seguro)
// ✅ Session expiration: 30 días por defecto
// ✅ Singleton pattern: una sola instancia (previene leaks)
//
// ============================================
// COMPARACIÓN: CON vs SIN SINGLETON
// ============================================
//
// SIN SINGLETON (MAL):
// ```typescript
// // Cada import crea nueva instancia
// export const auth = betterAuth({ ... });
//
// // Problema: múltiples conexiones a DB
// import { auth } from '@/lib/auth'; // Conexión 1
// import { auth } from '@/lib/auth'; // Conexión 2
// import { auth } from '@/lib/auth'; // Conexión 3
// // → 3 conexiones a MongoDB (saturación)
// ```
//
// CON SINGLETON (BIEN):
// ```typescript
// // Tu implementación actual
// let authInstance = null;
// export const getAuth = async () => {
//   if (authInstance) return authInstance;
//   // ... crear instancia ...
//   return authInstance;
// };
// export const auth = await getAuth();
//
// // Una sola conexión compartida
// import { auth } from '@/lib/auth'; // Usa instancia cacheada
// import { auth } from '@/lib/auth'; // Usa instancia cacheada
// import { auth } from '@/lib/auth'; // Usa instancia cacheada
// // → 1 conexión a MongoDB (eficiente) ✅
// ```
//
// ============================================
// DEBUGGING Y TROUBLESHOOTING:
// ============================================
//
// PROBLEMA 1: "MongoDB connection not found"
// ```typescript
// // Verificar que MONGODB_URI esté en .env
// console.log(process.env.MONGODB_URI); // Debe imprimir la URI
//
// // Verificar conexión manual
// import { connectToDatabase } from '@/database/mongoose';
// const mongoose = await connectToDatabase();
// console.log('Connected:', mongoose.connection.readyState === 1);
// ```
//
// PROBLEMA 2: "Invalid secret"
// ```typescript
// // Verificar que BETTER_AUTH_SECRET exista
// console.log('Secret length:', process.env.BETTER_AUTH_SECRET?.length);
// // Debe ser al menos 32 caracteres
// ```
//
// PROBLEMA 3: Cookies no se establecen
// ```typescript
// // Verificar baseURL
// console.log('Base URL:', process.env.BETTER_AUTH_URL);
// // Debe coincidir con el dominio real
//
// // Verificar que nextCookies plugin esté incluido
// // Ya está en tu config ✅
// ```
//
// ============================================
// TESTING:
// ============================================
//
// ```typescript
// // Test 1: Instancia se crea correctamente
// import { auth } from '@/lib/better-auth/auth';
// console.log('Auth instance:', auth ? '✅' : '❌');
//
// // Test 2: API methods disponibles
// console.log('signUpEmail:', typeof auth.api.signUpEmail); // "function"
// console.log('signInEmail:', typeof auth.api.signInEmail); // "function"
//
// // Test 3: Singleton funciona
// import { getAuth } from '@/lib/better-auth/auth';
// const auth1 = await getAuth();
// const auth2 = await getAuth();
// console.log('Same instance:', auth1 === auth2); // true ✅
// ```
//
// ============================================
// RESUMEN EJECUTIVO:
// ============================================
//
// Este archivo es el CORAZÓN de tu sistema de autenticación:
//
// 🎯 PROPÓSITO: Configurar y exportar instancia única de Better Auth
// 🔧 PATRÓN: Singleton con lazy initialization y top-level await
// 🗄️ DATABASE: MongoDB con adapter específico
// 🔐 SEGURIDAD: Secret key, HttpOnly cookies, password hashing
// 🚀 PERFORMANCE: Una sola instancia compartida (eficiente)
// 📦 FEATURES: Email/Password auth con auto-signin
// 🔌 PLUGINS: nextCookies() para Next.js App Router
//
// ARQUITECTURA:
// - Conexión MongoDB → Adapter → Better Auth → Exported Instance
// - Todos los módulos importan la MISMA instancia
// - No hay reconexiones ni reconfiguraciones innecesarias
//
// Es la BASE sobre la que se construyen:
// - Server Actions de auth (/actions/auth.ts)
// - Middleware de protección (middleware.ts)
// - Layouts con reverse guards
// - API routes de autenticación
//
// Sin este archivo, no tendríamos sistema de autenticación funcional.