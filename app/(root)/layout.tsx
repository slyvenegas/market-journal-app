// ============================================
// IMPORTACIONES
// ============================================

// Importa el componente Header que contiene la barra de navegación/encabezado de la aplicación
// Este componente mostrará información del usuario y opciones de navegación
import Header from "@/components/Header";

// Importa la instancia de autenticación configurada con Better Auth
// Better Auth es una librería de autenticación para Next.js que maneja login, sesiones, etc.
import {auth} from "@/lib/better-auth/auth";

// Importa la función headers() de Next.js que permite acceder a los encabezados HTTP de la petición
// Necesario para verificar la sesión del usuario desde las cookies o tokens
import {headers} from "next/headers";

// Importa la función redirect() de Next.js para redirigir al usuario a otras páginas
// Se usará para enviar usuarios no autenticados a la página de login
import {redirect} from "next/navigation";

// ============================================
// COMPONENTE LAYOUT (ASYNC)
// ============================================
// Este es un Server Component asíncrono de Next.js 13+ (App Router)
// Actúa como un layout wrapper que envuelve todas las páginas protegidas de la aplicación
// IMPORTANTE: Es async porque necesita esperar la verificación de la sesión antes de renderizar
const Layout = async ({ children }: { children : React.ReactNode }) => {
    
    // ============================================
    // VERIFICACIÓN DE SESIÓN
    // ============================================
    // Obtiene la sesión actual del usuario desde el servidor
    // auth.api.getSession() verifica si hay una sesión activa usando los headers de la petición
    // await headers() espera los encabezados HTTP que contienen las cookies/tokens de autenticación
    const session = await auth.api.getSession({ headers: await headers() });

    // ============================================
    // PROTECCIÓN DE RUTA (ROUTE GUARD)
    // ============================================
    // Verifica si existe una sesión válida y si tiene un usuario asociado
    // Si NO hay sesión (!session) O si NO hay usuario (!session?.user)
    // entonces redirige al usuario a la página de inicio de sesión '/sign-in'
    // El operador ?. (optional chaining) previene errores si session es null/undefined
    if(!session?.user) redirect('/sign-in');

    // ============================================
    // PREPARACIÓN DE DATOS DEL USUARIO
    // ============================================
    // Crea un objeto simplificado con solo la información necesaria del usuario
    // Esto es una buena práctica de seguridad: solo exponer los datos que realmente necesitas
    // en lugar de pasar todo el objeto session que podría contener información sensible
    const user = {
        id: session.user.id,        // ID único del usuario en la base de datos
        name: session.user.name,    // Nombre completo o username del usuario
        email: session.user.email,  // Email del usuario
    }

    // ============================================
    // RENDERIZADO DEL LAYOUT
    // ============================================
    return (
        // Contenedor principal <main> que ocupa toda la altura de la pantalla
        // "min-h-screen" asegura altura mínima de 100vh (viewport height)
        // "text-gray-400" establece un color de texto gris claro por defecto para todo el contenido
        <main className="min-h-screen text-gray-400">
            
            {/* ============================================
                HEADER/NAVEGACIÓN
                ============================================ */}
            {/* Renderiza el componente Header pasándole los datos del usuario */}
            {/* El Header mostrará el nombre/email y probablemente opciones de navegación y logout */}
            <Header user={user} />

            {/* ============================================
                CONTENEDOR DE CONTENIDO
                ============================================ */}
            {/* Contenedor para el contenido de las páginas hijas */}
            {/* "container" centra el contenido y establece un ancho máximo responsivo */}
            {/* "py-10" añade padding vertical (arriba y abajo) de 2.5rem */}
            <div className="container py-10">
                {/* {children} es el contenido de la página específica que usa este layout */}
                {/* Por ejemplo: si estás en /dashboard, aquí se renderizará el contenido de dashboard */}
                {/* Este es el patrón de composición de React para layouts */}
                {children}
            </div>
        </main>
    )
}

// ============================================
// EXPORTACIÓN
// ============================================
// Exporta el componente Layout como export por defecto
// Next.js buscará este archivo layout.tsx automáticamente para envolver las páginas
export default Layout

// ============================================
// FLUJO DE TRABAJO DEL CÓDIGO:
// ============================================
// 1. PETICIÓN INICIAL:
//    - Un usuario intenta acceder a una página protegida (ej: /dashboard, /home)
//
// 2. VERIFICACIÓN DE AUTENTICACIÓN:
//    - El Layout intercepta la petición antes de mostrar el contenido
//    - Obtiene los headers HTTP de la petición
//    - Usa Better Auth para verificar si hay una sesión válida
//
// 3. DECISIÓN DE ACCESO:
//    - SI hay sesión válida → Continúa al paso 4
//    - SI NO hay sesión → Redirige a '/sign-in' (página de login)
//
// 4. PREPARACIÓN DE DATOS:
//    - Extrae solo la información necesaria del usuario (id, name, email)
//    - Esto previene exponer datos sensibles innecesarios
//
// 5. RENDERIZADO:
//    - Muestra el Header con la información del usuario
//    - Renderiza el contenido de la página hija dentro del container
//
// 6. RESULTADO FINAL:
//    - El usuario autenticado ve la página completa con navegación
//    - El usuario no autenticado es redirigido al login
//
// ============================================
// PROPÓSITO GENERAL:
// ============================================
// Este Layout actúa como un "guardia de seguridad" para todas las páginas
// protegidas de tu aplicación. Garantiza que:
// - Solo usuarios autenticados pueden ver el contenido
// - Todas las páginas tengan un Header consistente
// - El código de autenticación no se repita en cada página
//
// PATRÓN DE DISEÑO: 
// Este es el patrón "Layout Component + Route Guard" muy común en
// aplicaciones modernas. Centraliza la lógica de autenticación y
// proporciona una estructura visual consistente.