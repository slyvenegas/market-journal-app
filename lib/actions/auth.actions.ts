// ============================================
// DIRECTIVA 'use server'
// ============================================
// 'use server': directiva especial de Next.js que marca este archivo como SERVER-ONLY
// TODO el código en este archivo se ejecuta EXCLUSIVAMENTE en el servidor
// NUNCA se envía al navegador del cliente
//
// PROPÓSITO:
// - Proteger lógica sensible (autenticación, acceso a DB)
// - Acceder a recursos del servidor (variables de entorno, DB, APIs internas)
// - Reducir bundle size del cliente (este código no se descarga al navegador)
//
// IMPORTANTE: Las funciones aquí definidas son "Server Actions"
// Se pueden llamar desde Client Components pero se ejecutan en el servidor
'use server';

// ============================================
// IMPORTACIONES
// ============================================
// auth: instancia configurada de Better Auth
// Proporciona la API para todas las operaciones de autenticación
// Incluye métodos como: signUpEmail, signInEmail, signOut, getSession, etc.
import { auth } from "@/lib/better-auth/auth";

// inngest: cliente de Inngest para envío de eventos y manejo de background jobs
// Inngest es una plataforma para ejecutar tareas asíncronas y workflows
// Se usa aquí para disparar eventos cuando un usuario se registra
// Ejemplo: enviar emails de bienvenida, crear registros iniciales, analytics
import { inngest } from "@/lib/inngest/client";

// headers: función de Next.js para acceder a los headers HTTP de la petición
// Se usa para leer cookies de sesión en operaciones que requieren autenticación
// Es asíncrona porque Next.js puede estar ejecutando en Edge o servidor
import { headers } from "next/headers";

// ============================================
// SERVER ACTION: signUpWithEmail
// ============================================
// Esta es una Server Action para registrar un nuevo usuario con email/password
// Se llama desde el formulario de registro (sign-up page) en el cliente
//
// PARÁMETROS:
// Recibe un objeto con todos los datos del formulario de registro:
// - email: correo electrónico del usuario
// - password: contraseña (en texto plano, Better Auth la hasheará)
// - fullName: nombre completo del usuario
// - country: país de residencia
// - investmentGoals: objetivos de inversión (ej: "long-term growth", "retirement")
// - riskTolerance: tolerancia al riesgo (ej: "conservative", "moderate", "aggressive")
// - preferredIndustry: industria preferida (ej: "technology", "healthcare")
//
// SignUpFormData: tipo TypeScript definido en types.ts con la estructura del formulario
//
// RETORNA:
// - { success: true, data: response } si el registro fue exitoso
// - { success: false, error: string } si falló
export const signUpWithEmail = async ({ 
    email, 
    password, 
    fullName, 
    country, 
    investmentGoals, 
    riskTolerance, 
    preferredIndustry 
}: SignUpFormData) => {
    
    // ============================================
    // BLOQUE TRY-CATCH: MANEJO DE ERRORES
    // ============================================
    // try-catch es crítico aquí porque:
    // - Las operaciones de red pueden fallar
    // - Better Auth puede rechazar el registro (email duplicado, validaciones)
    // - Inngest puede tener problemas enviando eventos
    // Sin try-catch, un error crashearía toda la aplicación
    try {
        // ============================================
        // REGISTRO DEL USUARIO EN BETTER AUTH
        // ============================================
        // auth.api.signUpEmail(): método de Better Auth para crear cuenta con email/password
        //
        // PROCESO INTERNO DE BETTER AUTH:
        // 1. Valida que el email tenga formato correcto
        // 2. Verifica que el email NO esté registrado previamente
        // 3. Hashea la contraseña con bcrypt o argon2 (nunca se guarda en texto plano)
        // 4. Crea registro en la tabla 'users' de la base de datos
        // 5. Genera un session token o JWT
        // 6. Establece cookie HTTP-only con el token de sesión
        // 7. Retorna los datos del usuario creado
        //
        // PARÁMETROS:
        // - body: objeto con los campos requeridos por Better Auth
        //   * email: correo del usuario
        //   * password: contraseña sin hashear (Better Auth la hasheará)
        //   * name: nombre completo (se guarda en la tabla users)
        //
        // NOTA: Solo pasamos email, password y name a Better Auth
        // Los otros campos (country, investmentGoals, etc.) NO son estándar de Better Auth
        // Los manejaremos con Inngest event para guardarlos en otra tabla
        const response = await auth.api.signUpEmail({ 
            body: { 
                email, 
                password, 
                name: fullName 
            } 
        })

        // ============================================
        // DISPARO DE EVENTO PARA PROCESAMIENTO ADICIONAL
        // ============================================
        // if (response): verifica que el registro fue exitoso
        // Solo si Better Auth retornó una respuesta (usuario creado)
        // disparamos el evento de Inngest
        if (response) {
            // ============================================
            // INNGEST EVENT: app/user.created
            // ============================================
            // inngest.send(): envía un evento a Inngest para procesamiento asíncrono
            //
            // PATRÓN DE ARQUITECTURA: Event-Driven Architecture
            // En lugar de hacer TODO aquí (bloquear la respuesta):
            // - Registrar usuario ✅ (síncono, inmediato)
            // - Enviar email de bienvenida ⏳ (asíncrono, background)
            // - Crear watchlist inicial ⏳ (asíncrono)
            // - Registrar en analytics ⏳ (asíncrono)
            // - Guardar preferencias adicionales ⏳ (asíncrono)
            //
            // Solo hacemos lo crítico aquí, el resto se procesa en background
            //
            // VENTAJAS:
            // - Respuesta más rápida al usuario (no espera por emails, etc.)
            // - Si falla el email, el registro YA se completó
            // - Mejor experiencia de usuario (UX)
            // - Escalabilidad: tareas pesadas no bloquean el servidor
            await inngest.send({
                // ============================================
                // NOMBRE DEL EVENTO
                // ============================================
                // 'app/user.created': convención para nombrar eventos
                // - 'app': namespace de la aplicación
                // - 'user.created': describe qué sucedió (usuario fue creado)
                //
                // Este evento será escuchado por "functions" de Inngest
                // que ejecutarán las tareas en background
                name: 'app/user.created',
                
                // ============================================
                // DATA DEL EVENTO
                // ============================================
                // Objeto con TODA la información del usuario recién registrado
                // Estos datos estarán disponibles para las funciones de Inngest
                //
                // USOS TÍPICOS DE ESTOS DATOS:
                // - email: enviar email de bienvenida personalizado
                // - name: personalizar el mensaje del email
                // - country: configurar timezone, currency, market por defecto
                // - investmentGoals: recomendar stocks iniciales según objetivos
                // - riskTolerance: sugerir estrategias de inversión adecuadas
                // - preferredIndustry: popular watchlist con stocks de esa industria
                data: { 
                    email, 
                    name: fullName, 
                    country, 
                    investmentGoals, 
                    riskTolerance, 
                    preferredIndustry 
                }
            })
        }

        // ============================================
        // RETORNO EXITOSO
        // ============================================
        // Si llegamos aquí, TODO salió bien:
        // - Usuario registrado en Better Auth ✅
        // - Evento de Inngest enviado ✅
        //
        // Retornamos:
        // - success: true (para que el cliente sepa que funcionó)
        // - data: response (contiene info del usuario: id, email, name, etc.)
        //
        // El componente cliente usará esto para:
        // - Mostrar mensaje de éxito
        // - Redirigir al usuario a /dashboard
        // - Actualizar estado de autenticación
        return { success: true, data: response }
        
    } catch (e) {
        // ============================================
        // MANEJO DE ERRORES
        // ============================================
        // Si algo falló en el bloque try, llegamos aquí
        //
        // POSIBLES ERRORES:
        // - Email ya registrado (409 Conflict)
        // - Contraseña demasiado débil (400 Bad Request)
        // - Problemas de red con Better Auth
        // - Error de conexión a la base de datos
        // - Inngest no disponible (menos crítico, el usuario YA se registró)
        //
        // console.log(): imprime el error en los logs del servidor
        // IMPORTANTE: en producción deberías usar un sistema de logging profesional
        // (Winston, Pino, Sentry, etc.) en lugar de console.log
        console.log('Sign up failed', e)
        
        // Retorna error al cliente
        // success: false indica que algo falló
        // error: mensaje genérico (NO exponemos detalles por seguridad)
        //
        // SEGURIDAD: No decimos "email ya existe" porque:
        // - Revela información (ese email está registrado)
        // - Puede usarse para enumeration attacks
        // Better devolver mensaje genérico: "Sign up failed"
        return { success: false, error: 'Sign up failed' }
    }
}

// ============================================
// SERVER ACTION: signInWithEmail
// ============================================
// Server Action para iniciar sesión con email y contraseña
// Se llama desde el formulario de login (sign-in page)
//
// PARÁMETROS:
// - email: correo electrónico del usuario
// - password: contraseña en texto plano
//
// SignInFormData: tipo TypeScript con la estructura del formulario de login
//
// RETORNA:
// - { success: true, data: response } si el login fue exitoso
// - { success: false, error: string } si falló
export const signInWithEmail = async ({ email, password }: SignInFormData) => {
    try {
        // ============================================
        // AUTENTICACIÓN CON BETTER AUTH
        // ============================================
        // auth.api.signInEmail(): método de Better Auth para login con email/password
        //
        // PROCESO INTERNO DE BETTER AUTH:
        // 1. Busca usuario en DB por email
        // 2. Si no existe → error "Invalid credentials"
        // 3. Si existe → compara password con el hash guardado en DB
        //    - Usa bcrypt.compare() o argon2.verify()
        //    - NUNCA se comparan passwords en texto plano
        // 4. Si password incorrecta → error "Invalid credentials"
        // 5. Si password correcta → continúa
        // 6. Genera nuevo session token (o renueva el existente)
        // 7. Establece cookie HTTP-only con el token de sesión
        // 8. Actualiza last_login timestamp en la DB
        // 9. Retorna datos del usuario (sin el password, obviamente)
        //
        // PARÁMETROS:
        // - body: objeto con email y password
        const response = await auth.api.signInEmail({ 
            body: { 
                email, 
                password 
            } 
        })

        // ============================================
        // RETORNO EXITOSO
        // ============================================
        // Si llegamos aquí, el login fue exitoso:
        // - Credenciales válidas ✅
        // - Cookie de sesión establecida ✅
        // - Usuario autenticado ✅
        //
        // El cliente recibirá esto y:
        // - Mostrará mensaje de éxito
        // - Redirigirá al dashboard
        // - Actualizará estado global de autenticación
        return { success: true, data: response }
        
    } catch (e) {
        // ============================================
        // MANEJO DE ERRORES DE LOGIN
        // ============================================
        // POSIBLES ERRORES:
        // - Credenciales inválidas (email o password incorrectos)
        // - Usuario no existe
        // - Cuenta deshabilitada/bloqueada
        // - Problemas de red
        // - Error de conexión a DB
        //
        // Log del error en el servidor (para debugging)
        console.log('Sign in failed', e)
        
        // Retorna error genérico
        // SEGURIDAD: NO especificamos si el email existe o si la password es incorrecta
        // Mensaje genérico previene enumeration attacks
        // Un atacante NO puede saber si un email está registrado
        return { success: false, error: 'Sign in failed' }
    }
}

// ============================================
// SERVER ACTION: signOut
// ============================================
// Server Action para cerrar sesión del usuario actual
// Se llama desde un botón "Logout" en la UI (navbar, settings, etc.)
//
// NO RECIBE PARÁMETROS:
// Better Auth sabe qué usuario cerrar sesión leyendo la cookie de sesión
// de los headers HTTP
//
// RETORNA:
// - undefined si fue exitoso (no necesita retornar nada)
// - { success: false, error: string } si falló
export const signOut = async () => {
    try {
        // ============================================
        // CIERRE DE SESIÓN CON BETTER AUTH
        // ============================================
        // auth.api.signOut(): método de Better Auth para logout
        //
        // PROCESO INTERNO DE BETTER AUTH:
        // 1. Lee la cookie de sesión de los headers HTTP
        // 2. Busca esa sesión en la tabla 'sessions' de la DB
        // 3. Marca la sesión como inválida/expirada (soft delete o flag)
        // 4. Elimina la cookie de sesión del navegador
        //    - Set-Cookie con valor vacío y expires en el pasado
        // 5. El usuario ya NO tiene sesión activa
        //
        // PARÁMETROS:
        // - headers: await headers() obtiene los headers HTTP de la petición
        //   Esto es necesario para que Better Auth pueda leer la cookie de sesión
        //   y saber QUÉ sesión debe cerrar
        //
        // await headers(): es asíncrono porque en Next.js los headers
        // pueden estar siendo procesados en Edge o servidor
        await auth.api.signOut({ 
            headers: await headers() 
        });
        
        // ============================================
        // NOTA: NO HAY RETURN EXPLÍCITO
        // ============================================
        // Si llegamos aquí sin error, la función termina exitosamente
        // El cliente interpretará la ausencia de error como éxito
        // La cookie ya fue eliminada, el usuario está deslogueado
        //
        // Next.js automáticamente:
        // - Invalida cache de rutas protegidas
        // - El middleware detectará ausencia de cookie
        // - Redirigirá a home/login en la próxima navegación
        
    } catch (e) {
        // ============================================
        // MANEJO DE ERRORES DE LOGOUT
        // ============================================
        // POSIBLES ERRORES (raros):
        // - No hay sesión activa (usuario ya estaba deslogueado)
        // - Problemas de conexión a DB
        // - Sesión ya expirada
        //
        // Log del error (debugging)
        console.log('Sign out failed', e)
        
        // Retorna error
        // En la práctica, incluso si falla, el cliente puede:
        // - Eliminar estado local de autenticación
        // - Redirigir al home
        // - Limpiar cookies del lado del cliente
        return { success: false, error: 'Sign out failed' }
    }
}

// ============================================
// FLUJO DE TRABAJO COMPLETO: REGISTRO DE USUARIO
// ============================================
//
// PASO 1: USUARIO COMPLETA FORMULARIO
// ────────────────────────────────────────────────────────────────
// - Usuario en /sign-up completa todos los campos:
//   * Email: john@example.com
//   * Password: ********
//   * Full Name: John Doe
//   * Country: United States
//   * Investment Goals: Long-term growth
//   * Risk Tolerance: Moderate
//   * Preferred Industry: Technology
//
// PASO 2: COMPONENTE CLIENTE LLAMA A LA SERVER ACTION
// ────────────────────────────────────────────────────────────────
// ```tsx
// import { signUpWithEmail } from '@/actions/auth';
// 
// const handleSubmit = async (data: SignUpFormData) => {
//   const result = await signUpWithEmail(data);
//   
//   if (result.success) {
//     // Mostrar mensaje de éxito
//     toast.success('Account created successfully!');
//     // Redirigir al dashboard
//     router.push('/dashboard');
//   } else {
//     // Mostrar error
//     toast.error(result.error);
//   }
// };
// ```
//
// PASO 3: SERVER ACTION SE EJECUTA EN EL SERVIDOR
// ────────────────────────────────────────────────────────────────
// - Next.js recibe la llamada desde el cliente
// - Ejecuta signUpWithEmail() en el servidor (no en el navegador)
// - Los datos viajan encriptados por HTTPS
//
// PASO 4: REGISTRO EN BETTER AUTH
// ────────────────────────────────────────────────────────────────
// - Better Auth valida el email (formato correcto)
// - Verifica que john@example.com NO esté registrado
// - Hashea la password con bcrypt:
//   "password123" → "$2b$10$abcd...xyz" (hash de 60 caracteres)
// - Inserta en tabla users:
//   INSERT INTO users (id, email, password_hash, name, created_at)
//   VALUES ('user_abc123', 'john@example.com', '$2b$10$...', 'John Doe', NOW())
// - Genera session token: "session_xyz789"
// - Inserta en tabla sessions:
//   INSERT INTO sessions (id, user_id, token, expires_at)
//   VALUES ('sess_123', 'user_abc123', 'token...', NOW() + 30 days)
// - Establece cookie en el navegador:
//   Set-Cookie: better-auth-session=session_xyz789; HttpOnly; Secure; SameSite=Lax
//
// PASO 5: ENVÍO DE EVENTO A INNGEST
// ────────────────────────────────────────────────────────────────
// - inngest.send() envía evento 'app/user.created'
// - El evento se encola en Inngest (cola distribuida)
// - Retorna inmediatamente (no espera por procesamiento)
//
// PASO 6: RESPUESTA AL CLIENTE
// ────────────────────────────────────────────────────────────────
// - Server Action retorna: { success: true, data: { id, email, name } }
// - Next.js serializa la respuesta y la envía al cliente
// - El componente recibe la respuesta
// - Muestra toast de éxito
// - Redirige a /dashboard
//
// PASO 7: PROCESAMIENTO EN BACKGROUND (INNGEST)
// ────────────────────────────────────────────────────────────────
// Mientras el usuario ya está navegando en /dashboard:
//
// - Inngest Worker 1: Enviar email de bienvenida
//   * Genera email HTML personalizado
//   * Llama a Resend/SendGrid API
//   * Envía email: "Welcome to Signalist, John!"
//
// - Inngest Worker 2: Crear watchlist inicial
//   * Basado en preferredIndustry="Technology"
//   * Inserta en tabla watchlists:
//     INSERT INTO watchlists (user_id, symbols)
//     VALUES ('user_abc123', ['AAPL', 'MSFT', 'GOOGL', 'NVDA'])
//
// - Inngest Worker 3: Guardar preferencias
//   * Inserta en tabla user_preferences:
//     INSERT INTO user_preferences (user_id, country, investment_goals, risk_tolerance)
//     VALUES ('user_abc123', 'United States', 'Long-term growth', 'Moderate')
//
// - Inngest Worker 4: Analytics y tracking
//   * Envía evento a analytics platform (Mixpanel, Amplitude)
//   * Registra user_signup event con metadata
//
// PASO 8: USUARIO EN DASHBOARD
// ────────────────────────────────────────────────────────────────
// - Middleware verifica cookie de sesión → OK ✅
// - Dashboard page.tsx se renderiza
// - Muestra watchlist con stocks de tecnología (ya creada por Inngest)
// - Usuario puede empezar a usar la app inmediatamente
// - Mientras tanto, recibe email de bienvenida (1-2 minutos después)
//
// ============================================
// FLUJO DE TRABAJO: INICIO DE SESIÓN
// ============================================
//
// PASO 1: USUARIO INGRESA CREDENCIALES
// ────────────────────────────────────────────────────────────────
// - Usuario en /sign-in ingresa:
//   * Email: john@example.com
//   * Password: ********
//
// PASO 2: CLIENTE LLAMA A signInWithEmail
// ────────────────────────────────────────────────────────────────
// ```tsx
// const result = await signInWithEmail({ email, password });
// ```
//
// PASO 3: VALIDACIÓN EN BETTER AUTH
// ────────────────────────────────────────────────────────────────
// - SELECT * FROM users WHERE email = 'john@example.com'
// - Si no existe → error "Sign in failed"
// - Si existe → bcrypt.compare(password, user.password_hash)
// - Si no coincide → error "Sign in failed"
// - Si coincide → continúa
//
// PASO 4: CREACIÓN DE SESIÓN
// ────────────────────────────────────────────────────────────────
// - Genera nuevo session token
// - INSERT INTO sessions (user_id, token, expires_at)
// - Set-Cookie: better-auth-session=token; HttpOnly; Secure
//
// PASO 5: RESPUESTA Y REDIRECCIÓN
// ────────────────────────────────────────────────────────────────
// - Retorna: { success: true, data: user }
// - Cliente redirige a /dashboard
// - Middleware valida cookie → permite acceso
// - Usuario ve su dashboard personalizado
//
// ============================================
// FLUJO DE TRABAJO: CIERRE DE SESIÓN
// ============================================
//
// PASO 1: USUARIO HACE CLIC EN "LOGOUT"
// ────────────────────────────────────────────────────────────────
// - Botón en navbar ejecuta:
// ```tsx
// const handleLogout = async () => {
//   await signOut();
//   router.push('/');
// };
// ```
//
// PASO 2: signOut SE EJECUTA
// ────────────────────────────────────────────────────────────────
// - Lee cookie de sesión de los headers
// - UPDATE sessions SET active = false WHERE token = '...'
// - Set-Cookie: better-auth-session=; expires=Thu, 01 Jan 1970
//   (cookie expirada, navegador la elimina)
//
// PASO 3: LIMPIEZA Y REDIRECCIÓN
// ────────────────────────────────────────────────────────────────
// - Cliente redirige a /
// - Si usuario intenta acceder a /dashboard:
//   * Middleware no encuentra cookie
//   * Redirige a /
// - Usuario ve landing page con opciones de login
//
// ============================================
// SEGURIDAD Y BEST PRACTICES:
// ============================================
//
// ✅ 'use server': código sensible NUNCA se expone al cliente
// ✅ Passwords hasheadas: NUNCA se guardan en texto plano
// ✅ HTTP-only cookies: JavaScript del cliente NO puede leerlas (previene XSS)
// ✅ Mensajes genéricos: no revelamos si email existe (previene enumeration)
// ✅ Try-catch: errores no crashean la app
// ✅ Async/await: operaciones de red manejadas correctamente
// ✅ Event-driven: tareas pesadas en background (mejor UX)
// ✅ Logging: console.log para debugging (usar logger profesional en producción)
//
// ============================================
// INTERACCIÓN ENTRE COMPONENTES:
// ============================================
//
// CAPA 1: COMPONENTES CLIENTE (forms en /sign-in, /sign-up)
//    ↓ llaman a
// CAPA 2: SERVER ACTIONS (este archivo - auth.ts)
//    ↓ usan
// CAPA 3: BETTER AUTH (lib/better-auth/auth.ts)
//    ↓ interactúa con
// CAPA 4: BASE DE DATOS (PostgreSQL, MySQL, etc.)
//
// ADEMÁS:
// CAPA 2: SERVER ACTIONS
//    ↓ disparan eventos a
// INNGEST: Background Jobs
//    ↓ ejecutan
// WORKERS: Email, Analytics, Data Processing
//
// ============================================
// RESUMEN EJECUTIVO:
// ============================================
//
// Este archivo define 3 SERVER ACTIONS críticas para autenticación:
//
// 1️⃣ signUpWithEmail: Crea cuenta + dispara procesamiento en background
// 2️⃣ signInWithEmail: Valida credenciales + establece sesión
// 3️⃣ signOut: Invalida sesión + elimina cookie
//
// CARACTERÍSTICAS CLAVE:
// - 🔒 Ejecuta solo en servidor (seguro)
// - ⚡ Rápido (procesamiento pesado en background)
// - 🛡️ Seguro (passwords hasheadas, cookies HTTP-only)
// - 🎯 Simple (API limpia para componentes cliente)
// - 📊 Observable (logs de errores)
// - 🔄 Resiliente (manejo de errores robusto)
//
// Es el PUENTE entre tu UI y el sistema de autenticación.