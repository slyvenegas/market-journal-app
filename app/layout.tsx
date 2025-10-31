// ============================================
// IMPORTACIONES
// ============================================

// Importa el tipo Metadata de Next.js para tipar los metadatos de SEO
// Metadata define título, descripción, Open Graph, Twitter cards, etc.
import type { Metadata } from "next";

// Importa las fuentes Geist y Geist Mono desde Google Fonts
// Next.js optimiza automáticamente la carga de fuentes para mejor rendimiento
// Geist: fuente sans-serif moderna (para texto general)
// Geist_Mono: fuente monoespaciada (para código o números)
import { Geist, Geist_Mono } from "next/font/google";

// Importa el componente Toaster de sonner (librería de notificaciones)
// Este componente renderiza las notificaciones toast que usas con toast.error(), toast.success(), etc.
import { Toaster } from "@/components/ui/sonner"

// Importa los estilos globales CSS/Tailwind de toda la aplicación
// Este archivo probablemente contiene:
// - Configuración de Tailwind (@tailwind base, components, utilities)
// - Variables CSS personalizadas
// - Estilos globales de reset
import "./globals.css";

// ============================================
// CONFIGURACIÓN DE FUENTES
// ============================================

// Configura la fuente principal Geist (sans-serif)
const geistSans = Geist({
  // variable: crea una variable CSS que se puede usar en cualquier parte de la app
  // Esta variable se puede referenciar en CSS como: var(--font-geist-sans)
  variable: "--font-geist-sans",
  
  // subsets: define qué caracteres cargar (optimización)
  // "latin" incluye caracteres básicos latinos (a-z, A-Z, números, puntuación común)
  // Esto reduce el tamaño del archivo de fuente al no incluir caracteres innecesarios
  subsets: ["latin"],
});

// Configura la fuente Geist Mono (monoespaciada)
const geistMono = Geist_Mono({
  // Variable CSS para la fuente monoespaciada
  // Útil para mostrar código, números de acciones, precios, etc.
  variable: "--font-geist-mono",
  
  // Igual que arriba, solo carga caracteres latinos
  subsets: ["latin"],
});

// ============================================
// METADATOS SEO (Search Engine Optimization)
// ============================================
// Define los metadatos que aparecerán en:
// - Pestaña del navegador
// - Resultados de búsqueda de Google
// - Vistas previas al compartir en redes sociales
export const metadata: Metadata = {
  // Título que aparece en la pestaña del navegador y en resultados de Google
  // "Signalist" es el nombre de tu aplicación
  title: "Signalist",
  
  // Descripción que aparece en resultados de búsqueda
  // Resume las características principales de tu app
  // Importante para SEO: debe ser descriptiva y contener palabras clave relevantes
  description: "Track real-time stock prices, get personalized alerts and explore detailed company insights.",
};

// ============================================
// ROOT LAYOUT COMPONENT
// ============================================
// Este es el layout raíz de toda la aplicación Next.js
// IMPORTANTE: Todo lo que se renderiza aquí envuelve TODAS las páginas
// Es el único lugar donde puedes definir las etiquetas <html> y <body>
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ============================================
  // RENDERIZADO
  // ============================================
  return (
    // ============================================
    // ETIQUETA HTML ROOT
    // ============================================
    // lang="en": define el idioma de la página (inglés)
    // Importante para:
    // - Accesibilidad (lectores de pantalla)
    // - SEO (Google sabe en qué idioma está tu contenido)
    // - Correctores ortográficos del navegador
    //
    // className="dark": activa el modo oscuro de Tailwind CSS
    // Tailwind usa la clase "dark" en el elemento raíz para aplicar variantes dark:
    // Por ejemplo: dark:bg-gray-900, dark:text-white
    // Esto hace que toda tu aplicación esté en modo oscuro por defecto
    <html lang="en" className="dark">
      
      {/* ============================================
          ETIQUETA BODY
          ============================================ */}
      {/* 
        className contiene:
        1. ${geistSans.variable}: inyecta la variable CSS --font-geist-sans
        2. ${geistMono.variable}: inyecta la variable CSS --font-geist-mono
        3. antialiased: activa suavizado de fuentes para mejor legibilidad
           - Hace que el texto se vea más suave y profesional
           - Aplica: -webkit-font-smoothing: antialiased; y -moz-osx-font-smoothing: grayscale;
        
        Template literals (${}) permiten concatenar las variables de fuente con otras clases
      */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* ============================================
            CONTENIDO DE LAS PÁGINAS
            ============================================ */}
        {/* {children} es donde se renderizan todas las páginas de tu app */}
        {/* Dependiendo de la ruta actual, aquí se mostrará:
            - /          → Home component (con sus widgets de TradingView)
            - /sign-in   → Auth Layout + SignIn component
            - /sign-up   → Auth Layout + SignUp component
            - /dashboard → Protected Layout + Dashboard component
            - etc.
        */}
        {children}
        
        {/* ============================================
            TOASTER COMPONENT (Notificaciones)
            ============================================ */}
        {/* Componente de Sonner que renderiza las notificaciones toast */}
        {/* Este componente:
            - Se renderiza una sola vez en el layout raíz
            - Escucha globalmente cuando llamas a toast.error(), toast.success(), etc.
            - Muestra las notificaciones como overlays en la esquina de la pantalla
            - Maneja automáticamente animaciones de entrada/salida
            - Apila múltiples toasts si hay varios al mismo tiempo
        
        Ejemplo de uso en otros componentes:
            import { toast } from "sonner"
            toast.error("Sign in failed", { description: "Invalid credentials" })
        */}
        <Toaster />
      </body>
    </html>
  );
}

// ============================================
// FLUJO DE TRABAJO DEL CÓDIGO:
// ============================================
//
// CUANDO LA APP SE CARGA:
// 1. Next.js construye la estructura HTML base
// 2. Aplica los metadatos (título, descripción) al <head>
// 3. Carga las fuentes Geist optimizadas desde Google Fonts
// 4. Crea las variables CSS --font-geist-sans y --font-geist-mono
// 5. Renderiza el <html> con lang="en" y className="dark"
// 6. Renderiza el <body> con las variables de fuente y antialiasing
// 7. Renderiza el contenido de la página actual en {children}
// 8. Monta el componente <Toaster /> que espera notificaciones
//
// CUANDO NAVEGAS ENTRE PÁGINAS:
// - Solo {children} cambia
// - El resto del layout (html, body, fonts, Toaster) permanece montado
// - Esto hace las transiciones más rápidas y eficientes
//
// CUANDO SE MUESTRA UNA NOTIFICACIÓN:
// 1. En cualquier componente llamas: toast.error("Mensaje")
// 2. El <Toaster /> escucha este evento
// 3. Crea y anima la notificación
// 4. La muestra por unos segundos
// 5. La remueve automáticamente con animación
//
// ============================================
// PROPÓSITO GENERAL:
// ============================================
// Este RootLayout es la "envoltura maestra" de toda tu aplicación.
// 
// RESPONSABILIDADES:
// 1. Estructura HTML básica (<html>, <body>)
// 2. Configuración de idioma y accesibilidad
// 3. Carga y configuración de fuentes
// 4. Aplicación de estilos globales
// 5. Modo oscuro por defecto
// 6. Sistema de notificaciones global
// 7. Metadatos SEO para toda la app
//
// VENTAJAS DE ESTE DISEÑO:
// - Las fuentes se cargan una sola vez
// - Tailwind dark mode funciona en toda la app
// - El Toaster está disponible globalmente
// - Los metadatos están centralizados
// - Mejor rendimiento (menos re-renders)
//
// ============================================
// CONCEPTOS TÉCNICOS:
// ============================================
//
// 1. NEXT.JS LAYOUTS:
//    - Los layouts envuelven páginas y otros layouts
//    - El RootLayout es el más externo (envuelve todo)
//    - Son Server Components por defecto
//    - Persisten durante la navegación (no se re-montan)
//
// 2. FUENTES OPTIMIZADAS:
//    - Next.js descarga las fuentes en build time
//    - Las sirve desde tu propio dominio (no de Google)
//    - Elimina el parpadeo de carga de fuentes (FOUT)
//    - Reduce latencia y mejora privacidad
//
// 3. CSS VARIABLES:
//    - --font-geist-sans y --font-geist-mono son variables CSS
//    - Se pueden usar en cualquier CSS: font-family: var(--font-geist-sans)
//    - Tailwind las reconoce automáticamente si están en :root o body
//
// 4. TAILWIND DARK MODE:
//    - className="dark" en <html> activa todas las variantes dark:
//    - Ejemplo: bg-white dark:bg-gray-900
//    - Sin JavaScript, puramente CSS
//    - Alternativa: usar media query prefers-color-scheme
//
// 5. ANTIALIASED:
//    - Suaviza los bordes de las fuentes
//    - Especialmente importante en fondos oscuros
//    - Mejora la legibilidad en pantallas de alta resolución
//
// 6. METADATA (SEO):
//    - Next.js convierte esto en etiquetas <meta> en el <head>
//    - Mejora posicionamiento en buscadores
//    - Aparece en vistas previas de links (Open Graph)
//    - Se puede sobreescribir en páginas específicas
//
// 7. TOASTER GLOBAL:
//    - Un solo componente Toaster maneja todas las notificaciones
//    - Usa React Context internamente para comunicación global
//    - Cualquier componente puede disparar toasts sin importarlo
//
// ============================================
// UBICACIÓN EN LA ESTRUCTURA:
// ============================================
// Este archivo debe estar en: app/layout.tsx
// Next.js lo reconoce automáticamente como el Root Layout
//
// Estructura típica:
// app/
//   layout.tsx        ← Este archivo (Root Layout)
//   page.tsx          ← Página principal '/'
//   globals.css       ← Estilos globales
//   (auth)/
//     layout.tsx      ← Auth Layout (anidado dentro de Root)
//     sign-in/
//       page.tsx
//     sign-up/
//       page.tsx
//   (protected)/
//     layout.tsx      ← Protected Layout (anidado)
//     dashboard/
//       page.tsx