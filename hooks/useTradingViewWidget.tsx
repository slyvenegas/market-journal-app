// ============================================
// DIRECTIVA DE CLIENTE
// ============================================
// "use client" indica que este código se ejecuta SOLO en el navegador del cliente
// Es necesario porque:
// - Usa hooks de React (useEffect, useRef) que solo funcionan en el cliente
// - Manipula el DOM directamente (document.createElement)
// - Interactúa con scripts externos de terceros (TradingView)
// Next.js por defecto usa Server Components, esta directiva lo convierte en Client Component
"use client";

// ============================================
// IMPORTACIONES
// ============================================
// Importa hooks específicos de React necesarios para este custom hook
// useEffect: permite ejecutar código después de que el componente se monta (side effects)
// useRef: crea una referencia mutable que persiste entre renders sin causar re-renders
import { useEffect, useRef } from "react";

// ============================================
// CUSTOM HOOK: useTradingViewWidget
// ============================================
// Este es un CUSTOM HOOK reutilizable para integrar widgets de TradingView
// TradingView es una plataforma de gráficos financieros profesionales
// Este hook encapsula toda la lógica compleja de cargar y configurar widgets externos

// PARÁMETROS:
// - scriptUrl: URL del script de TradingView que se va a cargar (string)
//   Ejemplo: "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js"
// - config: objeto con la configuración del widget (tipo Record = objeto con keys string y valores unknown)
//   Contiene settings como símbolos a mostrar, colores, idioma, etc.
// - height: altura del widget en píxeles (por defecto 600px si no se especifica)
const useTradingViewWidget = (
  scriptUrl: string,
  config: Record<string, unknown>,
  height = 600
) => {
  
  // ============================================
  // REFERENCIA AL CONTENEDOR DEL WIDGET
  // ============================================
  // useRef crea una referencia al elemento DIV del DOM donde se montará el widget
  // <HTMLDivElement | null>: tipo TypeScript que indica que puede ser un div HTML o null
  // - null: valor inicial antes de que el componente se monte
  // - HTMLDivElement: tipo del elemento DOM una vez que la ref se asigna
  // Esta referencia NO causa re-renders cuando cambia (a diferencia de useState)
  // Es perfecta para guardar referencias a elementos DOM
  const containerRef = useRef<HTMLDivElement | null>(null);
 
  // ============================================
  // EFECTO: CARGA E INICIALIZACIÓN DEL WIDGET
  // ============================================
  // useEffect ejecuta código después de que el componente se renderiza
  // Se ejecuta cuando el componente se monta Y cuando cambian las dependencias
  // [scriptUrl, config, height]: array de dependencias - re-ejecuta si estos valores cambian
  useEffect(() => {
    
    // ============================================
    // VALIDACIÓN 1: VERIFICAR SI EL CONTENEDOR EXISTE
    // ============================================
    // Si containerRef.current es null (el div aún no se ha montado en el DOM)
    // entonces salimos temprano del efecto y no hacemos nada
    // return: detiene la ejecución del useEffect
    // Esto previene errores al intentar manipular un elemento que no existe
    if (!containerRef.current) return;
    
    // ============================================
    // VALIDACIÓN 2: PREVENIR CARGA DUPLICADA
    // ============================================
    // dataset.loaded: atributo data personalizado en HTML (data-loaded)
    // Si este atributo ya existe, significa que el widget ya fue cargado previamente
    // Esto previene que se cargue el mismo widget múltiples veces
    // Sin esta validación, cada re-render cargaría un nuevo widget
    if (containerRef.current.dataset.loaded) return;

    // ============================================
    // PREPARACIÓN DEL CONTENEDOR
    // ============================================
    // innerHTML: reemplaza todo el contenido HTML interno del contenedor
    // Crea un div interno con:
    // - class="tradingview-widget-container__widget": clase CSS requerida por TradingView
    // - style="width: 100%; height: ${height}px;": estilos inline
    //   * width: 100%: ocupa todo el ancho del contenedor padre (responsive)
    //   * height: ${height}px: usa el parámetro height (ej: 600px)
    // Template literal (backticks): permite interpolación de variables con ${}
    containerRef.current.innerHTML =
      `<div class="tradingview-widget-container__widget" style="width: 100%; height: ${height}px;"></div>`;

    // ============================================
    // CREACIÓN DEL SCRIPT DE TRADINGVIEW
    // ============================================
    // document.createElement("script"): crea un elemento <script> en memoria (aún no en el DOM)
    // Este script cargará el widget de TradingView dinámicamente
    const script = document.createElement("script");
    
    // src: URL del script externo de TradingView que se va a cargar
    // Ejemplo: "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js"
    script.src = scriptUrl;
    
    // async: indica que el script se carga de forma asíncrona
    // Esto significa que:
    // - No bloquea el renderizado de la página
    // - Se descarga en paralelo con otros recursos
    // - Se ejecuta tan pronto como termina de descargarse
    script.async = true;
    
    // innerHTML: contenido interno del tag <script>
    // JSON.stringify(config): convierte el objeto config a string JSON
    // TradingView lee esta configuración para saber cómo mostrar el widget
    // Ejemplo de config: { "symbols": [["NASDAQ:AAPL"]], "colorTheme": "dark" }
    script.innerHTML = JSON.stringify(config);

    // ============================================
    // INYECCIÓN DEL SCRIPT EN EL DOM
    // ============================================
    // appendChild: agrega el script como hijo del contenedor
    // En este momento el script se añade al DOM y comienza a ejecutarse
    // TradingView detecta el script, lee la configuración y renderiza el widget
    containerRef.current.appendChild(script);
    
    // ============================================
    // MARCADO COMO CARGADO
    // ============================================
    // dataset.loaded = "true": establece el atributo data-loaded="true" en el div
    // Esto previene que el widget se cargue múltiples veces (ver validación 2 arriba)
    // En HTML se verá como: <div data-loaded="true">
    containerRef.current.dataset.loaded = "true";

    // ============================================
    // FUNCIÓN DE LIMPIEZA (CLEANUP)
    // ============================================
    // Esta función se ejecuta cuando:
    // 1. El componente se desmonta (unmount)
    // 2. Antes de que el efecto se vuelva a ejecutar (si cambian las dependencias)
    // Es CRÍTICA para prevenir memory leaks y problemas de rendimiento
    return () => {
      // Verifica si el contenedor todavía existe antes de limpiarlo
      if (containerRef.current) {
        // innerHTML = "": elimina TODO el contenido del contenedor
        // Esto remueve el widget de TradingView y el script del DOM
        containerRef.current.innerHTML = "";
        
        // delete: elimina la propiedad dataset.loaded
        // Esto permite que el widget se pueda volver a cargar si es necesario
        // Sin esto, el widget no se recargaría aunque el componente se vuelva a montar
        delete containerRef.current.dataset.loaded;
      }
    }; 
    
  // ============================================
  // DEPENDENCIAS DEL EFECTO
  // ============================================
  // Este array indica cuándo debe volver a ejecutarse el efecto:
  // - scriptUrl: si cambia la URL del script (cambiar de widget)
  // - config: si cambia la configuración (cambiar símbolos, colores, etc.)
  // - height: si cambia la altura del widget
  // Si alguno de estos valores cambia, el efecto se limpia y se vuelve a ejecutar
  }, [scriptUrl, config, height]);

  // ============================================
  // RETORNO DEL HOOK
  // ============================================
  // El hook retorna la referencia al contenedor
  // El componente que use este hook asignará esta ref a un div:
  // <div ref={containerRef}></div>
  // Así el hook puede manipular ese div y cargar el widget dentro de él
  return containerRef;
};

// ============================================
// EXPORTACIÓN
// ============================================
// Exporta el custom hook para usarlo en otros componentes
// Ejemplo de uso:
// const containerRef = useTradingViewWidget(url, config, 500);
// return <div ref={containerRef} />;
export default useTradingViewWidget;

// ============================================
// FLUJO DE TRABAJO DEL CÓDIGO:
// ============================================
// 
// 1. INVOCACIÓN DEL HOOK:
//    - Un componente llama al hook: useTradingViewWidget(url, config, height)
//    - El hook inicializa containerRef como null
//
// 2. PRIMER RENDER DEL COMPONENTE:
//    - El componente renderiza un <div ref={containerRef}></div>
//    - React asigna el elemento DOM real a containerRef.current
//
// 3. EJECUCIÓN DEL useEffect (DESPUÉS DEL RENDER):
//    - Verifica que containerRef.current exista (no sea null)
//    - Verifica que el widget no haya sido cargado previamente (data-loaded)
//    
// 4. PREPARACIÓN DEL CONTENEDOR:
//    - Limpia el contenedor e inserta un div interno con dimensiones específicas
//    - Este div interno es donde TradingView renderizará el widget
//
// 5. CREACIÓN Y CONFIGURACIÓN DEL SCRIPT:
//    - Crea un elemento <script> en memoria
//    - Configura la URL del script de TradingView
//    - Marca el script como asíncrono (no bloquea el render)
//    - Inserta la configuración JSON dentro del script
//
// 6. INYECCIÓN Y CARGA:
//    - Añade el script al DOM (dentro del contenedor)
//    - El navegador descarga y ejecuta el script de TradingView
//    - TradingView lee la configuración y renderiza el widget gráfico
//    - Marca el contenedor como "loaded" para prevenir duplicados
//
// 7. WIDGET FUNCIONANDO:
//    - El widget de TradingView ya está visible y funcional
//    - Muestra gráficos financieros en tiempo real
//    - El usuario puede interactuar con el widget (zoom, cambiar símbolos, etc.)
//
// 8. CAMBIO DE DEPENDENCIAS (OPCIONAL):
//    - Si scriptUrl, config o height cambian:
//      A) Se ejecuta la función de limpieza:
//         - Elimina todo el contenido del contenedor
//         - Elimina el atributo data-loaded
//      B) Se vuelve a ejecutar todo el proceso (pasos 3-7)
//
// 9. DESMONTAJE DEL COMPONENTE:
//    - Cuando el componente se desmonta (usuario navega a otra página):
//      - Se ejecuta la función de limpieza
//      - Elimina el widget y el script del DOM
//      - Libera memoria y previene memory leaks
//
// ============================================
// PROPÓSITO GENERAL:
// ============================================
// Este custom hook es una SOLUCIÓN ELEGANTE para integrar widgets externos de terceros
// en aplicaciones React/Next.js modernas.
//
// PROBLEMAS QUE RESUELVE:
// - ✅ Carga dinámica de scripts externos sin afectar el rendimiento inicial
// - ✅ Prevención de carga duplicada del mismo widget
// - ✅ Limpieza automática para prevenir memory leaks
// - ✅ Reactividad: actualiza el widget cuando cambia la configuración
// - ✅ Encapsulación: toda la lógica compleja está en un solo lugar
// - ✅ Reutilización: se puede usar para CUALQUIER widget de TradingView
//
// VENTAJAS DE ESTE PATRÓN:
// - Separa la lógica de integración del componente visual
// - Hace el código más limpio y mantenible
// - Permite usar múltiples widgets de TradingView sin duplicar código
// - Gestiona correctamente el ciclo de vida del componente
//
// USO EN TU APLICACIÓN:
// Este hook probablemente se usa en tu dashboard para mostrar:
// - Gráficos de precios de acciones en tiempo real
// - Indicadores técnicos (RSI, MACD, etc.)
// - Watchlists de mercado
// - Información detallada de símbolos bursátiles
// - Calendarios económicos
// - Y cualquier otro widget que TradingView ofrezca
//
// EJEMPLO DE USO EN UN COMPONENTE:
// ```tsx
// const StockChart = () => {
//   const containerRef = useTradingViewWidget(
//     "https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js",
//     {
//       symbols: [["NASDAQ:AAPL", "Apple"]],
//       colorTheme: "dark",
//       locale: "es"
//     },
//     500
//   );
//   
//   return <div ref={containerRef} className="chart-container" />;
// };
// ```