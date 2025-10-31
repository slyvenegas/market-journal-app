// ============================================
// IMPORTACIONES
// ============================================

// Importa el componente Link de Next.js para navegación optimizada del lado del cliente
// Permite navegar entre páginas sin recargar la página completa
import Link from "next/link";

// Importa el componente Image de Next.js para optimización automática de imágenes
// Proporciona lazy loading, optimización de tamaño y formatos modernos (WebP, AVIF)
import Image from "next/image";

// Importa la instancia de autenticación de Better Auth
// Se usará para verificar si el usuario ya tiene una sesión activa
import {auth} from "@/lib/better-auth/auth";

// Importa headers() de Next.js para acceder a los encabezados HTTP de la petición
// Necesario para leer cookies y tokens de autenticación
import {headers} from "next/headers";

// Importa redirect() para redirigir programáticamente a otras rutas
// Se usará para enviar usuarios ya autenticados a la página principal
import {redirect} from "next/navigation";

// ============================================
// COMPONENTE LAYOUT (AUTH LAYOUT)
// ============================================
// Este es un Server Component asíncrono que actúa como layout para las páginas de autenticación
// Se usa tanto para /sign-in como para /sign-up
// IMPORTANTE: Es un "reverse guard" - redirige si el usuario YA está autenticado
const Layout = async ({ children }: { children : React.ReactNode }) => {
    
    // ============================================
    // VERIFICACIÓN DE SESIÓN (REVERSE GUARD)
    // ============================================
    // Obtiene la sesión actual del usuario desde el servidor
    // auth.api.getSession() verifica si existe una sesión activa
    // usando los headers HTTP que contienen las cookies/tokens
    const session = await auth.api.getSession({ headers: await headers() })

    // ============================================
    // REDIRECCIÓN DE USUARIOS AUTENTICADOS
    // ============================================
    // Si el usuario YA tiene una sesión activa (ya está logueado)
    // lo redirige a la página principal '/'
    // ESTO PREVIENE que usuarios autenticados vean las páginas de login/registro
    // Es el comportamiento opuesto al otro Layout que vimos
    if(session?.user) redirect('/')

    // ============================================
    // RENDERIZADO DEL LAYOUT DE AUTENTICACIÓN
    // ============================================
    return (
        // Contenedor principal del layout con clase personalizada
        // Este layout tiene un diseño de dos columnas para pantallas grandes
        <main className="auth-layout">
            
            {/* ============================================
                SECCIÓN IZQUIERDA: FORMULARIO
                ============================================ */}
            {/* Columna izquierda que contiene el logo y el formulario (children) */}
            {/* scrollbar-hide-default: oculta la barra de scroll por defecto */}
            <section className="auth-left-section scrollbar-hide-default">
                
                {/* ============================================
                    LOGO DE LA APLICACIÓN
                    ============================================ */}
                {/* Link clickeable que lleva a la página principal */}
                {/* Si un usuario hace clic aquí, regresa al home */}
                <Link href="/" className="auth-logo">
                    {/* Componente Image optimizado de Next.js */}
                    {/* src: ruta del archivo SVG del logo */}
                    {/* alt: texto alternativo para accesibilidad y SEO */}
                    {/* width/height: dimensiones originales para optimización */}
                    {/* className: limita altura a 2rem y ajusta ancho automáticamente */}
                    <Image 
                        src="/assets/icons/logo.svg" 
                        alt="Signalist logo" 
                        width={140} 
                        height={32} 
                        className='h-8 w-auto' 
                    />
                </Link>

                {/* ============================================
                    CONTENEDOR DEL FORMULARIO
                    ============================================ */}
                {/* Contenedor que envuelve el contenido hijo (formulario de SignIn o SignUp) */}
                {/* pb-6 lg:pb-8: padding bottom de 1.5rem en móvil, 2rem en pantallas grandes */}
                {/* flex-1: hace que este div ocupe todo el espacio vertical disponible */}
                <div className="pb-6 lg:pb-8 flex-1">
                    {/* {children} será el formulario de SignIn o SignUp según la ruta */}
                    {/* /sign-in → componente SignIn */}
                    {/* /sign-up → componente SignUp */}
                    {children}
                </div>
            </section>

            {/* ============================================
                SECCIÓN DERECHA: TESTIMONIAL Y PREVIEW
                ============================================ */}
            {/* Columna derecha con testimonial del usuario y preview del dashboard */}
            {/* Esta sección probablemente se oculta en móviles y se muestra en pantallas grandes */}
            <section className="auth-right-section">
                
                {/* ============================================
                    TESTIMONIAL DEL USUARIO
                    ============================================ */}
                {/* Contenedor del testimonial con posicionamiento relativo y spacing */}
                {/* z-10: coloca este elemento por encima de otros elementos */}
                {/* relative: posicionamiento relativo para que z-index funcione */}
                {/* lg:mt-4 lg:mb-16: márgenes superior e inferior en pantallas grandes */}
                <div className="z-10 relative lg:mt-4 lg:mb-16">
                    
                    {/* CITA/TESTIMONIAL */}
                    {/* Blockquote HTML semántico para citas */}
                    {/* Muestra un testimonio positivo de un usuario real para generar confianza */}
                    <blockquote className="auth-blockquote">
                        Signalist turned my watchlist into a winning list. The alerts are spot-on, and I feel more confident making moves in the market
                    </blockquote>
                    
                    {/* INFORMACIÓN DEL AUTOR Y CALIFICACIÓN */}
                    {/* Contenedor flex que distribuye el autor y las estrellas */}
                    {/* items-center: alinea verticalmente al centro */}
                    {/* justify-between: distribuye espacio entre autor (izquierda) y estrellas (derecha) */}
                    <div className="flex items-center justify-between">
                        
                        {/* INFORMACIÓN DEL AUTOR */}
                        <div>
                            {/* Nombre del autor del testimonial */}
                            {/* <cite> es el elemento HTML semántico para citar autores */}
                            <cite className="auth-testimonial-author">- Ethan R.</cite>
                            
                            {/* Descripción/rol del autor */}
                            {/* max-md:text-xs: texto extra pequeño en pantallas móviles */}
                            {/* text-gray-500: color gris medio para menor énfasis */}
                            <p className="max-md:text-xs text-gray-500">Retail Investor</p>
                        </div>
                        
                        {/* CALIFICACIÓN CON ESTRELLAS */}
                        {/* Contenedor flex para las 5 estrellas */}
                        {/* gap-0.5: espacio de 0.125rem entre cada estrella */}
                        <div className="flex items-center gap-0.5">
                            {/* ============================================
                                GENERACIÓN DE 5 ESTRELLAS
                                ============================================ */}
                            {/* [1, 2, 3, 4, 5].map() genera 5 elementos */}
                            {/* Esto es más eficiente que escribir <Image> 5 veces manualmente */}
                            {/* key={star} es necesario para que React identifique cada elemento único */}
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Image 
                                    src="/assets/icons/star.svg"  // Icono de estrella (probablemente amarilla)
                                    alt="Star"                     // Texto alternativo
                                    key={star}                     // Key única para cada estrella (1, 2, 3, 4, 5)
                                    width={20}                     // Ancho de 20px
                                    height={20}                    // Alto de 20px
                                    className="w-5 h-5"            // Clase CSS que mantiene 20px (1.25rem)
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* ============================================
                    PREVIEW DEL DASHBOARD
                    ============================================ */}
                {/* Contenedor para la imagen de preview del dashboard */}
                {/* flex-1: ocupa todo el espacio vertical disponible */}
                {/* relative: necesario para posicionar la imagen absolute dentro */}
                <div className="flex-1 relative">
                    {/* Imagen grande que muestra cómo se ve el dashboard de la aplicación */}
                    {/* Esto genera expectativa y muestra al usuario qué obtendrá al registrarse */}
                    {/* absolute top-0: posicionamiento absoluto desde la parte superior */}
                    {/* Esto permite que la imagen se "desborde" visualmente del contenedor */}
                    <Image 
                        src="/assets/images/dashboard.png"     // Captura de pantalla del dashboard
                        alt="Dashboard Preview"                // Descripción para accesibilidad
                        width={1440}                           // Ancho original de la imagen
                        height={1150}                          // Alto original de la imagen
                        className="auth-dashboard-preview absolute top-0"  // Posicionamiento y estilos
                    />
                </div>
            </section>
        </main>
    )
}

// ============================================
// EXPORTACIÓN
// ============================================
// Exporta el componente Layout para usarlo como layout de autenticación
export default Layout

// ============================================
// FLUJO DE TRABAJO DEL CÓDIGO:
// ============================================
// 1. PETICIÓN INICIAL:
//    - Usuario intenta acceder a /sign-in o /sign-up
//
// 2. VERIFICACIÓN DE SESIÓN (REVERSE GUARD):
//    - El Layout verifica si el usuario ya está autenticado
//    - Obtiene la sesión desde los headers HTTP
//
// 3. DECISIÓN DE ACCESO:
//    A) SI el usuario YA está autenticado:
//       - redirect('/') lo envía a la página principal
//       - NO ve las páginas de login/registro
//       - Esto previene que usuarios logueados vean formularios innecesarios
//    
//    B) SI el usuario NO está autenticado:
//       - Continúa al paso 4
//       - Puede ver y usar los formularios de autenticación
//
// 4. RENDERIZADO DEL LAYOUT:
//    - Muestra un diseño de dos columnas:
//      * IZQUIERDA: Logo + Formulario (children)
//      * DERECHA: Testimonial + Preview del dashboard
//
// 5. CONTENIDO DINÁMICO (children):
//    - Si la ruta es /sign-in → muestra el formulario SignIn
//    - Si la ruta es /sign-up → muestra el formulario SignUp
//
// ============================================
// PROPÓSITO GENERAL:
// ============================================
// Este Layout crea una experiencia visual atractiva para las páginas de autenticación:
//
// FUNCIONALIDADES:
// - Previene acceso de usuarios autenticados (reverse guard)
// - Muestra logo clickeable para volver al home
// - Proporciona estructura consistente para login y registro
// - Incluye elementos de marketing (testimonial, preview)
// - Genera confianza con calificaciones de 5 estrellas
// - Muestra visualmente qué obtendrán los usuarios (dashboard preview)
//
// DIFERENCIAS CON EL OTRO LAYOUT:
// - El otro Layout protege rutas PRIVADAS (redirige SI NO hay sesión)
// - Este Layout protege rutas PÚBLICAS (redirige SI HAY sesión)
// - Son complementarios: juntos cubren toda la autenticación
//
// DISEÑO UX:
// - Diseño split-screen moderno
// - Columna izquierda: funcional (formulario)
// - Columna derecha: marketing (convencer al usuario)
// - Testimonial real genera credibilidad y confianza
// - Preview del producto muestra valor antes del registro
//
// PATRÓN DE DISEÑO:
// Este es el patrón "Marketing Auth Layout" común en SaaS modernas
// donde una mitad es funcional y la otra es persuasiva/visual