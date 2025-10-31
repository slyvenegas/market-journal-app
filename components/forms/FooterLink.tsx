// ============================================
// IMPORTACIONES
// ============================================

// Importa el componente Link de Next.js para navegación optimizada
// Link permite cambiar de página sin recargar toda la aplicación (SPA behavior)
// Next.js hace prefetching automático de las páginas enlazadas para navegación instantánea
import Link from "next/link";

// ============================================
// COMPONENTE FOOTERLINK
// ============================================
// Componente reutilizable que muestra un texto seguido de un enlace
// Se usa típicamente al final de formularios de autenticación para navegar
// entre páginas relacionadas (ej: de login a registro y viceversa)
const FooterLink = ({ text, linkText, href }: FooterLinkProps) => {
    // ============================================
    // PROPS DEL COMPONENTE
    // ============================================
    // text: Texto principal que aparece antes del enlace
    //       Ejemplo: "Don't have an account?" o "Already have an account?"
    // 
    // linkText: Texto clickeable del enlace
    //           Ejemplo: "Sign up" o "Sign in"
    // 
    // href: Ruta de destino del enlace
    //       Ejemplo: "/sign-up" o "/sign-in"
    
    return (
        // ============================================
        // CONTENEDOR PRINCIPAL
        // ============================================
        // Div que envuelve todo el contenido del componente
        // text-center: centra el texto horizontalmente
        // pt-4: padding top de 1rem (16px) - separa este elemento del contenido anterior
        <div className="text-center pt-4">
            
            {/* ============================================
                PÁRRAFO CON TEXTO Y ENLACE
                ============================================ */}
            {/* Contiene tanto el texto estático como el enlace */}
            {/* text-sm: tamaño de texto pequeño (0.875rem / 14px) */}
            {/* text-gray-500: color gris medio para el texto estático */}
            <p className="text-sm text-gray-500">
                
                {/* ============================================
                    TEXTO ESTÁTICO
                    ============================================ */}
                {/* Muestra el texto principal (ej: "Don't have an account?") */}
                {text}
                
                {/* ============================================
                    ESPACIO EN BLANCO
                    ============================================ */}
                {/* {` `} inserta un espacio literal entre el texto y el enlace */}
                {/* Template literal usado para asegurar que el espacio se renderice */}
                {/* Sin esto, el texto y el enlace quedarían pegados */}
                {/* Ejemplo sin espacio: "Don't have an account?Sign up" ❌ */}
                {/* Ejemplo con espacio: "Don't have an account? Sign up" ✅ */}
                {` `}
                
                {/* ============================================
                    ENLACE CLICKEABLE
                    ============================================ */}
                {/* Componente Link de Next.js para navegación SPA */}
                {/* href: ruta de destino (ej: '/sign-up') */}
                {/* className="footer-link": clase CSS personalizada */}
                {/*   - Probablemente define: color, hover effects, underline, etc. */}
                {/*   - Típicamente: color diferente al texto estático + hover effect */}
                <Link href={href} className="footer-link">
                    {/* Texto clickeable del enlace (ej: "Sign up") */}
                    {linkText}
                </Link>
            </p>
        </div>
    )
}

// ============================================
// EXPORTACIÓN
// ============================================
// Exporta el componente para usarlo en otros archivos
// Típicamente usado en SignIn.tsx y SignUp.tsx
export default FooterLink

// ============================================
// FLUJO DE TRABAJO DEL CÓDIGO:
// ============================================
//
// RENDERIZADO:
// 1. El componente padre (SignIn o SignUp) renderiza FooterLink
// 2. Pasa las props necesarias:
//    - En SignIn: text="Don't have an account?", linkText="Create an account", href="/sign-up"
//    - En SignUp: text="Already have an account?", linkText="Sign in", href="/sign-in"
// 3. FooterLink renderiza el texto estático y el enlace
// 4. El resultado visual es algo como:
//    "Don't have an account? [Sign up]"
//    donde [Sign up] es un enlace clickeable
//
// INTERACCIÓN DEL USUARIO:
// 1. Usuario lee el texto: "Don't have an account?"
// 2. Ve el enlace destacado: "Sign up"
// 3. Hace clic en el enlace
// 4. Link de Next.js intercepta el clic
// 5. Next.js hace una navegación del lado del cliente (sin recarga)
// 6. La URL cambia a /sign-up
// 7. El componente SignUp se renderiza
// 8. El usuario ahora ve el formulario de registro
//
// NAVEGACIÓN OPTIMIZADA (Next.js Link):
// - Next.js hace prefetch del contenido cuando el Link aparece en viewport
// - Al hacer clic, la navegación es instantánea (contenido ya descargado)
// - No hay recarga de página completa (SPA behavior)
// - El estado global de la app se mantiene (no se pierde)
// - Mejor UX que un <a> tag tradicional
//
// ============================================
// PROPÓSITO GENERAL:
// ============================================
// Este componente proporciona una forma consistente y reutilizable
// de mostrar enlaces de navegación al final de formularios.
//
// CASOS DE USO EN TU APP:
// 1. En la página de Login (SignIn):
//    - Muestra: "Don't have an account? Create an account"
//    - Enlace a: /sign-up
//    - Propósito: ayudar a nuevos usuarios a encontrar el registro
//
// 2. En la página de Registro (SignUp):
//    - Muestra: "Already have an account? Sign in"
//    - Enlace a: /sign-in
//    - Propósito: ayudar a usuarios existentes a encontrar el login
//
// VENTAJAS DEL DISEÑO:
// - Reutilizable: un componente para ambos casos de uso
// - Consistente: mismo estilo en toda la app
// - Flexible: se puede usar con cualquier texto y enlace
// - DRY (Don't Repeat Yourself): evita código duplicado
// - Fácil de mantener: cambios de estilo en un solo lugar
//
// MEJORA DE UX:
// - Texto en gris claro (menos énfasis) + enlace destacado (más énfasis)
// - Centrado para mejor jerarquía visual
// - Separado del botón principal con padding-top
// - Guía al usuario hacia la acción alternativa si está en la página incorrecta
//
// ============================================
// EJEMPLO DE USO:
// ============================================
// En SignIn.tsx:
// <FooterLink 
//   text="Don't have an account?" 
//   linkText="Create an account" 
//   href="/sign-up" 
// />
//
// Resultado renderizado:
// <div class="text-center pt-4">
//   <p class="text-sm text-gray-500">
//     Don't have an account? 
//     <a href="/sign-up" class="footer-link">Create an account</a>
//   </p>
// </div>
//
// ============================================
// ALTERNATIVAS SIN ESTE COMPONENTE:
// ============================================
// Sin FooterLink, tendrías que repetir este código en cada formulario:
//
// En SignIn.tsx:
// <div className="text-center pt-4">
//   <p className="text-sm text-gray-500">
//     Don't have an account?{' '}
//     <Link href="/sign-up" className="footer-link">
//       Create an account
//     </Link>
//   </p>
// </div>
//
// En SignUp.tsx:
// <div className="text-center pt-4">
//   <p className="text-sm text-gray-500">
//     Already have an account?{' '}
//     <Link href="/sign-in" className="footer-link">
//       Sign in
//     </Link>
//   </p>
// </div>
//
// PROBLEMAS DE NO USAR UN COMPONENTE:
// - Código duplicado (violación del principio DRY)
// - Si quieres cambiar el estilo, tienes que hacerlo en múltiples lugares
// - Mayor probabilidad de inconsistencias
// - Más difícil de mantener
//
// ============================================
// PATRÓN DE DISEÑO:
// ============================================
// Este es un ejemplo del patrón "Presentational Component"
// (también llamado "Dumb Component" o "Stateless Component"):
//
// CARACTERÍSTICAS:
// - No tiene estado propio (no usa useState)
// - Solo recibe props y renderiza UI
// - Totalmente reutilizable
// - Fácil de testear
// - Responsabilidad única: mostrar texto + enlace
//
// PRINCIPIOS APLICADOS:
// - Single Responsibility: solo se encarga de renderizar un footer link
// - DRY: evita repetición de código
// - Composition: se compone en componentes más grandes
// - Separation of Concerns: UI separada de lógica de negocio