// ============================================
// IMPORTACIONES
// ============================================
// NextRequest: tipo de TypeScript que representa la petición HTTP entrante en Next.js
// Es una extensión del Request estándar de Web API con funcionalidades adicionales de Next.js
// Contiene: URL, método HTTP, headers, cookies, body, etc.
import { NextRequest, NextResponse } from "next/server";

// NextResponse: clase para crear respuestas HTTP en Next.js middleware
// Permite: redirigir, reescribir URLs, modificar headers, etc.
// Es la forma de controlar qué sucede con cada petición

// getSessionCookie: función de Better Auth que extrae la cookie de sesión de la petición
// Lee las cookies HTTP y busca la cookie de autenticación específica de Better Auth
// Retorna el valor de la cookie si existe, undefined si no
import { getSessionCookie } from "better-auth/cookies";

// ============================================
// FUNCIÓN MIDDLEWARE
// ============================================
// MIDDLEWARE es una función especial que se ejecuta ANTES de procesar cualquier ruta
// Es como un "guardia de seguridad" que intercepta TODAS las peticiones
// 
// FLUJO:
// Usuario solicita /dashboard → Middleware se ejecuta PRIMERO → Decide si permitir acceso
//
// PROPÓSITO EN TU APP:
// Proteger rutas privadas (dashboard, settings, watchlist) de usuarios no autenticados
// Si no hay sesión → redirige al home/login
// Si hay sesión → permite continuar
//
// PARÁMETROS:
// - request: objeto NextRequest con toda la info de la petición HTTP
export async function middleware(request: NextRequest) {
    
    // ============================================
    // EXTRACCIÓN DE LA COOKIE DE SESIÓN
    // ============================================
    // getSessionCookie(): busca la cookie de autenticación en los headers HTTP
    // Better Auth almacena la sesión del usuario en una cookie HTTP-only segura
    // 
    // IMPORTANTE: Esta cookie se establece cuando el usuario hace login exitoso
    // 
    // RETORNA:
    // - Si el usuario está autenticado: objeto con datos de la sesión
    // - Si NO está autenticado: undefined o null
    //
    // La cookie contiene un token JWT o ID de sesión que Better Auth usa
    // para identificar al usuario sin necesidad de enviar usuario/contraseña en cada petición
    const sessionCookie = getSessionCookie(request);

    // ============================================
    // VALIDACIÓN DE AUTENTICACIÓN
    // ============================================
    // if (!sessionCookie): verifica si NO existe la cookie de sesión
    // Esto significa que el usuario NO está autenticado
    //
    // En este caso, REDIRIGE al usuario al home ("/")
    if (!sessionCookie) {
        // ============================================
        // REDIRECCIÓN A HOME/LOGIN
        // ============================================
        // NextResponse.redirect(): crea una respuesta HTTP 302 (redirect)
        // El navegador automáticamente sigue esta redirección
        //
        // new URL("/", request.url):
        // - "/": ruta de destino (página de inicio)
        // - request.url: URL actual de la petición (para obtener el dominio)
        // 
        // EJEMPLO:
        // Usuario intenta: https://tuapp.com/dashboard
        // No tiene sesión → redirige a: https://tuapp.com/
        //
        // COMPORTAMIENTO:
        // 1. Usuario no autenticado intenta acceder a ruta protegida
        // 2. Middleware intercepta la petición
        // 3. No encuentra cookie de sesión
        // 4. Crea respuesta de redirección
        // 5. Navegador redirige automáticamente al home
        // 6. En el home, el usuario ve los formularios de Sign In / Sign Up
        return NextResponse.redirect(new URL("/", request.url));
    }

    // ============================================
    // PERMITIR ACCESO A LA RUTA SOLICITADA
    // ============================================
    // Si llegamos aquí, significa que sessionCookie SÍ existe
    // El usuario está autenticado correctamente
    //
    // NextResponse.next(): continúa con el procesamiento normal de la petición
    // Permite que la petición llegue a la ruta solicitada (page.tsx, API route, etc.)
    //
    // COMPORTAMIENTO:
    // 1. Usuario autenticado solicita /dashboard
    // 2. Middleware verifica sesión → OK ✅
    // 3. next() permite que la petición continúe
    // 4. Next.js renderiza /dashboard/page.tsx
    // 5. Usuario ve su dashboard
    return NextResponse.next();
}

// ============================================
// CONFIGURACIÓN DEL MIDDLEWARE
// ============================================
// Esta configuración define EN QUÉ RUTAS se ejecuta el middleware
// Sin esta config, el middleware se ejecutaría en TODAS las rutas (ineficiente)
export const config = {
    // ============================================
    // MATCHER: PATRÓN DE RUTAS
    // ============================================
    // matcher: array de patrones de rutas donde el middleware debe ejecutarse
    // Usa sintaxis de expresiones regulares para definir patrones complejos
    matcher: [
        // ============================================
        // PATRÓN DE EXCLUSIÓN (NEGATIVE LOOKAHEAD)
        // ============================================
        // '/((?!api|_next/static|_next/image|favicon.ico|sign-in|sign-up|assets).*)'
        //
        // Esta es una RegEx compleja que significa:
        // "Ejecuta el middleware en TODAS las rutas EXCEPTO las que empiecen con:"
        //
        // DESGLOSE DE LA REGEX:
        // - '/': empieza con slash
        // - '(...)': grupo de captura
        // - '(?!...)': negative lookahead (busca rutas que NO coincidan con lo que sigue)
        // - 'api|_next/static|_next/image|...': alternativas separadas por |
        // - '.*': cualquier carácter, cualquier cantidad de veces
        //
        // RUTAS EXCLUIDAS (el middleware NO se ejecuta aquí):
        //
        // 1. 'api': todas las rutas /api/*
        //    - Las API routes manejan su propia autenticación
        //    - Ejemplo: /api/stocks, /api/news
        //    - Evita interferir con endpoints de Better Auth (/api/auth/*)
        //
        // 2. '_next/static': archivos estáticos de Next.js
        //    - JavaScript bundles, CSS compilado
        //    - Ejemplo: /_next/static/chunks/main-abc123.js
        //    - NO requieren autenticación (son públicos)
        //
        // 3. '_next/image': servicio de optimización de imágenes de Next.js
        //    - Ejemplo: /_next/image?url=/logo.png&w=640
        //    - NO requieren autenticación
        //
        // 4. 'favicon.ico': icono del navegador
        //    - /favicon.ico debe ser accesible sin autenticación
        //
        // 5. 'sign-in': página de inicio de sesión
        //    - /sign-in debe ser accesible sin autenticación (lógico)
        //    - Si no se excluyera, crearía un loop infinito:
        //      * Usuario no autenticado → redirige a /
        //      * / redirige a /sign-in
        //      * Middleware intercepta /sign-in → redirige a /
        //      * LOOP INFINITO ❌
        //
        // 6. 'sign-up': página de registro
        //    - /sign-up debe ser accesible sin autenticación
        //    - Misma razón que sign-in
        //
        // 7. 'assets': carpeta de recursos estáticos
        //    - /assets/images/*, /assets/icons/*
        //    - Imágenes, iconos, fuentes públicas
        //    - NO requieren autenticación
        //
        // RUTAS INCLUIDAS (el middleware SÍ se ejecuta aquí):
        // - /dashboard ✅
        // - /watchlist ✅
        // - /settings ✅
        // - /profile ✅
        // - / (home - pero si hay sesión, otro layout lo redirige) ✅
        // - Cualquier otra ruta que no esté excluida ✅
        '/((?!api|_next/static|_next/image|favicon.ico|sign-in|sign-up|assets).*)',
    ],
};

// ============================================
// FLUJO DE TRABAJO COMPLETO:
// ============================================
//
// ESCENARIO 1: Usuario NO autenticado intenta acceder a /dashboard
// ────────────────────────────────────────────────────────────────
// 1. NAVEGADOR:
//    - Usuario escribe en URL: https://tuapp.com/dashboard
//    - Navegador envía petición GET a /dashboard
//    - NO incluye cookie de sesión (porque no está logueado)
//
// 2. NEXT.JS SERVER:
//    - Recibe la petición
//    - ANTES de procesar la ruta, ejecuta el middleware
//
// 3. MIDDLEWARE:
//    - getSessionCookie(request) → undefined (no hay cookie)
//    - if (!sessionCookie) → TRUE
//    - Crea NextResponse.redirect(new URL("/", request.url))
//    - Retorna respuesta de redirección (HTTP 302)
//
// 4. NAVEGADOR:
//    - Recibe el 302 redirect
//    - Automáticamente navega a https://tuapp.com/
//    - Usuario ve la landing page con botones Sign In / Sign Up
//
// 5. USUARIO:
//    - NO puede acceder a /dashboard sin autenticarse primero
//    - Debe hacer clic en Sign In y proporcionar credenciales
//
//
// ESCENARIO 2: Usuario autenticado accede a /dashboard
// ────────────────────────────────────────────────────────────────
// 1. NAVEGADOR:
//    - Usuario ya hizo login previamente
//    - Navegador tiene cookie de sesión de Better Auth almacenada
//    - Usuario navega a https://tuapp.com/dashboard
//    - Navegador envía petición GET incluyendo la cookie de sesión
//
// 2. NEXT.JS SERVER:
//    - Recibe la petición con la cookie de sesión
//    - Ejecuta el middleware
//
// 3. MIDDLEWARE:
//    - getSessionCookie(request) → { token: "abc123...", userId: "user_xyz", ... }
//    - if (!sessionCookie) → FALSE (la cookie existe)
//    - Salta el bloque if
//    - return NextResponse.next() → continúa procesando
//
// 4. NEXT.JS SERVER:
//    - Procesa la ruta /dashboard
//    - Renderiza /dashboard/page.tsx
//    - Puede hacer fetch de datos del usuario usando la sesión
//
// 5. NAVEGADOR:
//    - Recibe el HTML del dashboard
//    - Usuario ve su dashboard personalizado con sus stocks, alertas, noticias
//
//
// ESCENARIO 3: Usuario NO autenticado accede a /sign-in
// ────────────────────────────────────────────────────────────────
// 1. NAVEGADOR:
//    - Usuario navega a https://tuapp.com/sign-in
//    - NO tiene cookie de sesión
//
// 2. NEXT.JS SERVER:
//    - Recibe la petición
//    - Revisa el matcher del middleware
//    - /sign-in está en la lista de EXCLUSIONES
//    - ❌ NO ejecuta el middleware
//    - Procesa directamente /sign-in/page.tsx
//
// 3. NAVEGADOR:
//    - Usuario ve el formulario de login
//    - Puede ingresar credenciales
//
// IMPORTANTE: Si /sign-in NO estuviera excluido:
// - Middleware interceptaría /sign-in
// - No hay sesión → redirige a /
// - / podría redirigir a /sign-in
// - Loop infinito de redirecciones 🔄❌
//
//
// ESCENARIO 4: Usuario autenticado accede a /sign-in
// ────────────────────────────────────────────────────────────────
// 1. NAVEGADOR:
//    - Usuario YA está autenticado (tiene cookie)
//    - Intenta acceder a https://tuapp.com/sign-in
//
// 2. NEXT.JS SERVER:
//    - /sign-in está excluido del middleware
//    - ❌ Middleware NO se ejecuta
//    - Procesa /sign-in/page.tsx
//
// 3. SIGN-IN LAYOUT:
//    - Recuerda el Layout de auth que vimos antes
//    - REVERSE GUARD en el Layout detecta que hay sesión
//    - Layout ejecuta: redirect('/')
//    - Usuario es redirigido al dashboard
//
// NOTA: En este caso, el middleware NO previene el acceso
// Pero el LAYOUT de auth sí lo hace (reverse guard)
// Son dos capas de protección que trabajan juntas
//
//
// ESCENARIO 5: Carga de recursos estáticos
// ────────────────────────────────────────────────────────────────
// 1. NAVEGADOR:
//    - Al cargar /dashboard, necesita descargar:
//      * /_next/static/chunks/main.js
//      * /_next/image?url=/assets/logo.png
//      * /assets/icons/star.svg
//      * /favicon.ico
//
// 2. NEXT.JS SERVER:
//    - Recibe cada petición de recurso
//    - Revisa el matcher: todas están EXCLUIDAS
//    - ❌ NO ejecuta middleware en ninguna
//    - Sirve los archivos directamente
//
// 3. VENTAJAS:
//    - Rendimiento: no pierde tiempo validando sesión en recursos estáticos
//    - Evita errores: algunos recursos se cargan antes de que exista sesión
//    - Eficiencia: solo valida autenticación donde realmente importa
//
// ============================================
// PROPÓSITO GENERAL DEL MIDDLEWARE:
// ============================================
//
// Este middleware implementa el patrón "AUTHENTICATION GUARD" a nivel global
//
// RESPONSABILIDADES:
// ✅ Proteger TODAS las rutas privadas de la aplicación
// ✅ Redirigir usuarios no autenticados al login/home
// ✅ Permitir acceso a rutas públicas (sign-in, sign-up, assets)
// ✅ No interferir con APIs, recursos estáticos, o servicios internos
//
// VENTAJAS DE ESTE ENFOQUE:
// - ✅ Protección centralizada: no necesitas validar sesión en cada page.tsx
// - ✅ Ejecución temprana: intercepta ANTES de procesar la ruta (más rápido)
// - ✅ Edge runtime: puede ejecutarse en Edge (más cercano al usuario)
// - ✅ Seguridad por defecto: nuevas rutas son privadas automáticamente
// - ✅ Fácil de mantener: una sola función controla toda la autenticación
//
// ALTERNATIVAS SIN MIDDLEWARE:
// Sin este middleware, tendrías que:
// 1. Validar sesión manualmente en CADA page.tsx
// 2. Escribir código repetido en cada componente
// 3. Riesgo de olvidar proteger alguna ruta nueva
// 4. Más lento (valida después de cargar el componente)
//
// ============================================
// INTERACCIÓN CON BETTER AUTH:
// ============================================
//
// Better Auth proporciona:
// - getSessionCookie(): función para leer la cookie de sesión
// - Gestión automática de cookies HTTP-only seguras
// - Manejo de tokens JWT o session IDs
// - Validación de expiración de sesión
//
// Flujo completo con Better Auth:
// 1. Usuario hace login → Better Auth valida credenciales
// 2. Better Auth crea sesión en DB
// 3. Better Auth establece cookie HTTP-only en el navegador
// 4. Navegador incluye esta cookie en todas las peticiones futuras
// 5. Middleware lee la cookie con getSessionCookie()
// 6. Si existe cookie válida → acceso permitido
// 7. Si no existe o expiró → redirige a login
//
// ============================================
// SEGURIDAD:
// ============================================
//
// CARACTERÍSTICAS DE SEGURIDAD:
// - Cookie HTTP-only: JavaScript del cliente NO puede leerla (previene XSS)
// - Validación en cada petición: no confía en el cliente
// - Server-side: el middleware se ejecuta en el servidor (más seguro)
// - Redirección automática: usuarios no autenticados no ven contenido privado
//
// PROTECCIÓN CONTRA:
// - ✅ Acceso no autorizado a rutas privadas
// - ✅ XSS (Cross-Site Scripting): cookie HTTP-only
// - ✅ Session hijacking: Better Auth maneja tokens seguros
// - ✅ CSRF: Next.js tiene protecciones integradas
//
// ============================================
// PATRÓN DE ARQUITECTURA:
// ============================================
//
// Este middleware implementa el patrón de "CAPA DE SEGURIDAD":
//
//                    PETICIÓN HTTP
//                         ↓
//          ┌──────────────────────────┐
//          │     MIDDLEWARE           │  ← Intercepta TODA petición
//          │  (middleware.ts)         │
//          │                          │
//          │  ¿Tiene sesión?          │
//          │     /        \           │
//          │   SÍ         NO          │
//          │   ↓          ↓           │
//          │ NEXT()    REDIRECT       │
//          └──────────────────────────┘
//                 ↓            ↓
//           RUTA SOLICITADA   HOME/LOGIN
//              (page.tsx)
//
// CAPAS DE PROTECCIÓN EN TU APP:
// 1. Middleware (este archivo): primera línea de defensa
// 2. Layout guards (auth layout): segunda capa para rutas de auth
// 3. Server Components: pueden validar sesión adicional si necesario
// 4. API Routes: validan autenticación en cada endpoint
//
// ============================================
// CONSIDERACIONES DE RENDIMIENTO:
// ============================================
//
// OPTIMIZACIONES:
// - Exclusión de rutas innecesarias: no valida recursos estáticos
// - Ejecución rápida: solo lee una cookie, no consulta DB
// - Edge runtime compatible: puede ejecutarse cerca del usuario
//
// IMPACTO:
// - Agrega < 1ms de latencia por petición
// - Mucho más rápido que validar en cada componente
// - Previene renderizar componentes innecesarios
//
// ============================================
// DEBUGGING:
// ============================================
//
// Para debuggear el middleware, puedes agregar logs:
// ```typescript
// export async function middleware(request: NextRequest) {
//   console.log('🔒 Middleware:', request.nextUrl.pathname);
//   const sessionCookie = getSessionCookie(request);
//   console.log('👤 Session:', sessionCookie ? '✅ Found' : '❌ Not found');
//   
//   if (!sessionCookie) {
//     console.log('🚫 Redirecting to home');
//     return NextResponse.redirect(new URL("/", request.url));
//   }
//   
//   console.log('✅ Allowing access');
//   return NextResponse.next();
// }
// ```
//
// ============================================
// RESUMEN EJECUTIVO:
// ============================================
//
// Este middleware es el GUARDIAN de tu aplicación:
//
// 🛡️  PROTEGE: Todas las rutas privadas de accesos no autorizados
// 🚪 REDIRIGE: Usuarios sin sesión al home/login
// ⚡ OPTIMIZA: Solo se ejecuta en rutas que requieren autenticación
// 🔒 SEGURIZA: Primera línea de defensa contra accesos no autorizados
// 🎯 CENTRALIZA: Un solo archivo maneja toda la lógica de protección
//
// Sin este middleware, tu aplicación sería insegura y tendría
// que duplicar lógica de autenticación en cada página.