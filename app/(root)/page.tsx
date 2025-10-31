// ============================================
// IMPORTACIONES
// ============================================

// Importa el componente reutilizable TradingViewWidget que encapsula los widgets de TradingView
// Este componente se usará múltiples veces en la página para mostrar diferentes visualizaciones del mercado
import TradingViewWidget from "@/components/TradingViewWidget"; 

// Importa las configuraciones predefinidas para cada tipo de widget desde el archivo de constantes
// Estas configuraciones contienen parámetros como símbolos a mostrar, colores, idioma, etc.
import { 
  HEATMAP_WIDGET_CONFIG,           // Configuración para el mapa de calor de acciones
  MARKET_DATA_WIDGET_CONFIG,       // Configuración para las cotizaciones del mercado
  MARKET_OVERVIEW_WIDGET_CONFIG,   // Configuración para la vista general del mercado
  TOP_STORIES_WIDGET_CONFIG,       // Configuración para las noticias principales
} from "@/lib/constants"; 

// ============================================
// COMPONENTE PRINCIPAL: HOME
// ============================================
// Este es el componente de la página principal de la aplicación
// Muestra un dashboard con 4 widgets diferentes de TradingView organizados en una cuadrícula
const Home = () => { 
  
  // ============================================
  // URL BASE PARA LOS SCRIPTS DE TRADINGVIEW
  // ============================================
  // Define la URL base desde donde se cargarán los scripts de los widgets de TradingView
  // Esta URL es proporcionada por TradingView y aloja todos sus widgets embebibles
  const scriptUrl = 
    "https://s3.tradingview.com/external-embedding/embed-widget-"; 
  
  // ============================================
  // RENDERIZADO DEL COMPONENTE
  // ============================================
  return ( 
    // Contenedor principal con flexbox que ocupa toda la altura de la pantalla
    // "flex" activa flexbox, "min-h-screen" asegura altura mínima de pantalla completa
    <div className="flex min-h-screen home-wrapper"> 
      
      {/* ============================================
          PRIMERA SECCIÓN: Market Overview + Stock Heatmap
          ============================================ */}
      {/* Sección superior organizada como grid con espaciado entre elementos */}
      {/* "grid" activa CSS Grid, "w-full" ocupa todo el ancho, "gap-8" añade espacio entre items */}
      <section className="grid w-full gap-8 home-section"> 
        
        {/* WIDGET 1: Market Overview (Vista General del Mercado) */}
        {/* Columna que ocupa 1 espacio en pantallas medianas y 1 en extra grandes */}
        <div className="md:col-span-1 xl:col-span-1"> 
          <TradingViewWidget 
            title="Market Overview"  // Título que se mostrará en el widget
            // Concatena la URL base con el nombre específico del script del widget de market overview
            scriptUrl={`${scriptUrl}market-overview.js`} 
            // Pasa la configuración específica para este widget (símbolos, diseño, etc.)
            config={MARKET_OVERVIEW_WIDGET_CONFIG} 
            className="custom-chart"  // Clase CSS personalizada para estilos adicionales
            height={600}  // Altura del widget en píxeles
          /> 
        </div> 
        
        {/* WIDGET 2: Stock Heatmap (Mapa de Calor de Acciones) */}
        {/* Columna que ocupa 1 espacio en pantallas medianas pero 2 espacios en extra grandes */}
        {/* Esto hace que el heatmap sea más ancho en pantallas grandes */}
        <div className="md:col-span-1 xl:col-span-2"> 
          <TradingViewWidget 
            title="Stock Heatmap"  // Título para el mapa de calor
            // Carga el script específico del widget de heatmap
            scriptUrl={`${scriptUrl}stock-heatmap.js`} 
            // Configuración del heatmap (sectores, colores, etc.)
            config={HEATMAP_WIDGET_CONFIG} 
            className="custom-chart"  // Clase CSS para estilos personalizados
            height={600}  // Altura fija de 600px
          /> 
        </div> 
      </section> 
      
      {/* ============================================
          SEGUNDA SECCIÓN: Timeline (Noticias) + Market Quotes (Cotizaciones)
          ============================================ */}
      {/* Segunda sección con la misma estructura de grid */}
      <section className="grid w-full gap-8 home-section"> 
        
        {/* WIDGET 3: Timeline (Línea de Tiempo de Noticias) */}
        {/* "h-full" hace que ocupe toda la altura disponible */}
        <div className="h-full md:col-span-1 xl:col-span-1"> 
          <TradingViewWidget 
            // No tiene título visible para este widget
            // Carga el widget de timeline que muestra noticias en tiempo real
            scriptUrl={`${scriptUrl}timeline.js`} 
            // Configuración de las noticias a mostrar
            config={TOP_STORIES_WIDGET_CONFIG} 
            height={600}  // Altura de 600px
          /> 
        </div> 
        
        {/* WIDGET 4: Market Quotes (Cotizaciones del Mercado) */}
        {/* Ocupa más espacio en pantallas grandes (2 columnas) */}
        <div className="h-full md:col-span-1 xl:col-span-2"> 
          <TradingViewWidget 
            // Sin título visible
            // Carga el widget de cotizaciones que muestra precios en tiempo real
            scriptUrl={`${scriptUrl}market-quotes.js`} 
            // Configuración con los símbolos/acciones a mostrar
            config={MARKET_DATA_WIDGET_CONFIG} 
            height={600}  // Altura de 600px
          /> 
        </div> 
      </section> 
    </div> 
  ); 
}; 

// ============================================
// EXPORTACIÓN
// ============================================
// Exporta el componente Home como export por defecto
// Esto permite importarlo en otros archivos: import Home from './Home'
export default Home;

// ============================================
// FLUJO DE TRABAJO DEL CÓDIGO:
// ============================================
// 1. Se importan las dependencias necesarias (componente TradingViewWidget y configuraciones)
// 2. Se define el componente funcional Home
// 3. Se establece la URL base para cargar los scripts de TradingView
// 4. Se renderiza un layout dividido en 2 secciones principales:
//    - Primera sección: Muestra la vista general del mercado y el mapa de calor
//    - Segunda sección: Muestra noticias y cotizaciones en tiempo real
// 5. Cada widget se renderiza usando el componente TradingViewWidget con:
//    - Una URL específica del script
//    - Una configuración personalizada
//    - Dimensiones y estilos definidos
// 6. El componente se exporta para ser usado como página principal
//
// PROPÓSITO GENERAL:
// Este componente crea un dashboard completo de análisis bursátil que muestra
// 4 visualizaciones diferentes en tiempo real del mercado de valores, organizadas
// en un layout responsivo que se adapta a diferentes tamaños de pantalla.