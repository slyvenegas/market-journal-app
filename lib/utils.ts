// ============================================
// IMPORTACIONES
// ============================================
// clsx: librería para concatenar clases CSS condicionalmente de forma eficiente
// Permite escribir: clsx('base', condition && 'conditional', 'another')
// ClassValue: tipo TypeScript de clsx que acepta strings, arrays, objetos, etc.
import { clsx, type ClassValue } from 'clsx';

// twMerge: librería que fusiona clases de Tailwind CSS inteligentemente
// Resuelve conflictos de clases: twMerge('p-4 p-2') → 'p-2' (última gana)
// Previene tener clases duplicadas o contradictorias
import { twMerge } from 'tailwind-merge';

// ============================================
// FUNCIÓN: cn (className utility)
// ============================================
// Esta es una función HELPER extremadamente común en proyectos Next.js + Tailwind
// Combina clsx (concatenación condicional) + twMerge (resolución de conflictos)
// 
// PROPÓSITO: Permite escribir clases CSS dinámicas de forma limpia y segura
// 
// PARÁMETROS:
// - ...inputs: "rest parameters" - acepta número ilimitado de argumentos
// - ClassValue[]: puede recibir strings, arrays, objetos, null, undefined, etc.
//
// EJEMPLO DE USO:
// cn('base-class', isActive && 'active', 'p-4', props.className)
// cn({ 'text-red-500': hasError, 'text-green-500': !hasError })
export function cn(...inputs: ClassValue[]) {
  // Flujo: inputs → clsx() → twMerge() → string final
  // 1. clsx(inputs): concatena todas las clases en un string
  // 2. twMerge(): resuelve conflictos de Tailwind y elimina duplicados
  // RETORNA: string con las clases CSS finales optimizadas
  return twMerge(clsx(inputs));
}

// ============================================
// FUNCIÓN: formatTimeAgo
// ============================================
// Convierte un timestamp Unix a formato "tiempo transcurrido" legible para humanos
// Ejemplo: timestamp de hace 2 horas → "2 hours ago"
// Es el formato que ves en redes sociales y aplicaciones modernas
//
// PARÁMETROS:
// - timestamp: número en segundos desde Unix epoch (1 Jan 1970)
//   Ejemplo: 1698765432 (timestamp típico de APIs)
export const formatTimeAgo = (timestamp: number) => {
  
  // ============================================
  // OBTENCIÓN DEL TIEMPO ACTUAL
  // ============================================
  // Date.now(): retorna timestamp actual en MILISEGUNDOS
  // Ejemplo: 1698765432000
  const now = Date.now();
  
  // ============================================
  // CÁLCULO DE LA DIFERENCIA DE TIEMPO
  // ============================================
  // timestamp * 1000: convierte el timestamp de SEGUNDOS a MILISEGUNDOS
  // (porque Date.now() está en milisegundos, necesitamos misma unidad)
  // diffInMs: diferencia en milisegundos entre ahora y el timestamp dado
  // Ejemplo: si timestamp fue hace 2 horas → diffInMs = 7,200,000 ms
  const diffInMs = now - timestamp * 1000; // Convert to milliseconds
  
  // ============================================
  // CONVERSIÓN A HORAS
  // ============================================
  // Conversión de milisegundos a horas:
  // 1000 ms = 1 segundo
  // 60 segundos = 1 minuto  
  // 60 minutos = 1 hora
  // Entonces: ms / (1000 * 60 * 60) = horas
  // Math.floor(): redondea hacia abajo para obtener horas completas
  // Ejemplo: 7,200,000 ms / 3,600,000 = 2 horas
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  
  // ============================================
  // CONVERSIÓN A MINUTOS
  // ============================================
  // Similar al cálculo de horas pero solo dividimos por ms/segundo y segundos/minuto
  // 1000 ms * 60 = 60,000 ms por minuto
  // Se usa cuando la diferencia es menor a 1 hora
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

  // ============================================
  // LÓGICA CONDICIONAL: FORMATO DE SALIDA
  // ============================================
  
  // CASO 1: Más de 24 horas (más de 1 día)
  if (diffInHours > 24) {
    // Calcula cuántos días completos han pasado
    // Ejemplo: 50 horas / 24 = 2 días (con Math.floor)
    const days = Math.floor(diffInHours / 24);
    
    // Template literal con pluralización condicional
    // days > 1 ? 's' : '': agrega "s" si es plural (2 days), nada si es singular (1 day)
    // Retorna: "1 day ago" o "5 days ago"
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } 
  // CASO 2: Entre 1 y 24 horas
  else if (diffInHours >= 1) {
    // Usa el número de horas directamente
    // Pluralización: "1 hour ago" o "5 hours ago"
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  } 
  // CASO 3: Menos de 1 hora
  else {
    // Muestra en minutos
    // Pluralización: "1 minute ago" o "30 minutes ago"
    // Incluso si es "0 minutes ago" (acabado de publicar)
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
};

// ============================================
// FUNCIÓN: delay
// ============================================
// Crea un "sleep" o pausa artificial en código asíncrono
// Es útil para rate limiting, simular carga, o espaciar peticiones a APIs
//
// PARÁMETROS:
// - ms: milisegundos a esperar
//
// RETORNA: una Promise que se resuelve después de 'ms' milisegundos
//
// EJEMPLO DE USO:
// await delay(1000); // Espera 1 segundo
// console.log("Esto se ejecuta después de 1 segundo");
export function delay(ms: number) {
  // new Promise: crea una promesa que se puede "awaitar"
  // resolve: función que se llama cuando la promesa termina exitosamente
  // setTimeout(resolve, ms): programa la ejecución de resolve después de 'ms' milisegundos
  // Cuando el setTimeout termina, la Promise se resuelve y el await continúa
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================
// FUNCIÓN: formatMarketCapValue
// ============================================
// Formatea valores de capitalización de mercado a formato legible con sufijos
// Convierte números grandes a formato: $3.10T, $900.00B, $25.00M
// Es el formato estándar que se usa en finanzas para cantidades grandes
//
// PARÁMETROS:
// - marketCapUsd: valor de market cap en dólares (número completo)
//   Ejemplo: 3100000000000 (3.1 trillones)
//
// RETORNA: string formateado con símbolo $ y sufijo (T/B/M) o 'N/A'
//
// Formatted string like "$3.10T", "$900.00B", "$25.00M" or "$999,999.99"
export function formatMarketCapValue(marketCapUsd: number): string {
  
  // ============================================
  // VALIDACIÓN: NÚMEROS INVÁLIDOS
  // ============================================
  // Number.isFinite(): verifica que sea un número válido (no Infinity, no NaN)
  // marketCapUsd <= 0: verifica que sea positivo (market cap no puede ser negativo o cero)
  // Si es inválido, retorna 'N/A' (Not Available)
  if (!Number.isFinite(marketCapUsd) || marketCapUsd <= 0) return 'N/A';

  // ============================================
  // TRILLONES (T)
  // ============================================
  // 1e12 = 1,000,000,000,000 (1 trillón)
  // Si el valor es >= 1 trillón, divide por 1e12 y agrega sufijo "T"
  // .toFixed(2): redondea a 2 decimales
  // Ejemplo: 3100000000000 / 1e12 = 3.10 → "$3.10T"
  if (marketCapUsd >= 1e12) return `$${(marketCapUsd / 1e12).toFixed(2)}T`; // Trillions
  
  // ============================================
  // BILLONES (B)
  // ============================================
  // 1e9 = 1,000,000,000 (1 billón / 1 billion en inglés)
  // Ejemplo: 900000000000 / 1e9 = 900.00 → "$900.00B"
  if (marketCapUsd >= 1e9) return `$${(marketCapUsd / 1e9).toFixed(2)}B`; // Billions
  
  // ============================================
  // MILLONES (M)
  // ============================================
  // 1e6 = 1,000,000 (1 millón)
  // Ejemplo: 25000000 / 1e6 = 25.00 → "$25.00M"
  if (marketCapUsd >= 1e6) return `$${(marketCapUsd / 1e6).toFixed(2)}M`; // Millions
  
  // ============================================
  // VALORES MENORES A 1 MILLÓN
  // ============================================
  // Si es menor a 1 millón, muestra el valor completo con 2 decimales
  // Ejemplo: 999999.99 → "$999999.99"
  return `$${marketCapUsd.toFixed(2)}`; // Below one million, show full USD amount
}

// ============================================
// FUNCIÓN: getDateRange
// ============================================
// Genera un rango de fechas desde hace X días hasta hoy
// Útil para filtrar noticias, gráficos históricos, etc.
//
// PARÁMETROS:
// - days: número de días hacia atrás desde hoy
//
// RETORNA: objeto con dos fechas en formato ISO (YYYY-MM-DD)
//   { to: "2024-10-30", from: "2024-10-23" } // si days = 7
export const getDateRange = (days: number) => {
  
  // ============================================
  // FECHA FINAL (HOY)
  // ============================================
  // new Date(): crea objeto Date con fecha/hora actual
  const toDate = new Date();
  
  // ============================================
  // FECHA INICIAL (HACE X DÍAS)
  // ============================================
  // Crea otra instancia de Date (copia independiente)
  const fromDate = new Date();
  
  // setDate(): establece el día del mes
  // toDate.getDate(): obtiene el día actual (ej: 30)
  // - days: resta los días especificados (ej: 30 - 7 = 23)
  // JavaScript maneja automáticamente cambios de mes/año
  // Ejemplo: si estamos en Oct 3 y restamos 7 días → Sept 26
  fromDate.setDate(toDate.getDate() - days);
  
  // ============================================
  // FORMATEO A YYYY-MM-DD
  // ============================================
  return {
    // toISOString(): convierte Date a formato ISO: "2024-10-30T15:30:45.123Z"
    // .split('T')[0]: divide por "T" y toma solo la parte de la fecha
    // Resultado: "2024-10-30"
    to: toDate.toISOString().split('T')[0],
    from: fromDate.toISOString().split('T')[0],
  };
};

// ============================================
// FUNCIÓN: getTodayDateRange
// ============================================
// Caso especial de getDateRange donde from y to son la misma fecha (hoy)
// Útil para filtrar solo noticias de hoy, eventos de hoy, etc.
//
// Get today's date range (from today to today)
export const getTodayDateRange = () => {
  // Crea objeto Date con la fecha actual
  const today = new Date();
  
  // Convierte a formato YYYY-MM-DD
  const todayString = today.toISOString().split('T')[0];
  
  // Retorna el mismo valor para 'to' y 'from'
  // Ejemplo: { to: "2024-10-30", from: "2024-10-30" }
  return {
    to: todayString,
    from: todayString,
  };
};

// ============================================
// FUNCIÓN: calculateNewsDistribution
// ============================================
// Calcula cuántas noticias mostrar por símbolo en el watchlist
// Balancea mostrar suficientes noticias sin sobrecargar la UI
//
// LÓGICA:
// - Pocos símbolos (1-2): 3 noticias cada uno = contenido abundante
// - Exactamente 3 símbolos: 2 noticias cada uno = 6 noticias total (perfecto)
// - Muchos símbolos (4+): 1 noticia cada uno, máximo 6 total = no sobrecarga
//
// PARÁMETROS:
// - symbolsCount: cantidad de símbolos en el watchlist del usuario
//
// RETORNA: objeto con:
//   - itemsPerSymbol: cuántas noticias mostrar por cada símbolo
//   - targetNewsCount: límite total de noticias a mostrar
//
// Calculate news per symbol based on watchlist size
export const calculateNewsDistribution = (symbolsCount: number) => {
  // Variables que se van a calcular
  let itemsPerSymbol: number;
  let targetNewsCount = 6; // Límite por defecto de 6 noticias totales

  // ============================================
  // CASO 1: WATCHLIST PEQUEÑO (1-2 símbolos)
  // ============================================
  if (symbolsCount < 3) {
    // Pocos símbolos: muestra 3 noticias por cada uno
    // Esto llena mejor el espacio y da más información al usuario
    // Ejemplo: 2 símbolos × 3 noticias = 6 noticias total
    itemsPerSymbol = 3; // Fewer symbols, more news each
  } 
  // ============================================
  // CASO 2: EXACTAMENTE 3 SÍMBOLOS (sweet spot)
  // ============================================
  else if (symbolsCount === 3) {
    // Balance perfecto: 2 noticias por símbolo
    // 3 símbolos × 2 noticias = 6 noticias total (ideal)
    itemsPerSymbol = 2; // Exactly 3 symbols, 2 news each = 6 total
  } 
  // ============================================
  // CASO 3: WATCHLIST GRANDE (4+ símbolos)
  // ============================================
  else {
    // Muchos símbolos: solo 1 noticia por símbolo
    // Previene sobrecargar la UI con demasiadas noticias
    itemsPerSymbol = 1; // Many symbols, 1 news each
    
    // Mantiene el límite en 6 noticias totales
    // Aunque tengas 10 símbolos, solo mostrarás 6 noticias
    targetNewsCount = 6; // Don't exceed 6 total
  }

  // Retorna ambos valores para usar en la lógica de fetching de noticias
  return { itemsPerSymbol, targetNewsCount };
};

// ============================================
// FUNCIÓN: validateArticle
// ============================================
// Verifica que un artículo de noticias tenga todos los campos obligatorios
// Previene errores al renderizar artículos con datos faltantes
//
// PARÁMETROS:
// - article: objeto RawNewsArticle de la API (tipo definido en types.ts)
//
// RETORNA: boolean - true si el artículo es válido, false si no
//
// VALIDACIONES:
// - headline: debe existir (título del artículo)
// - summary: debe existir (resumen/descripción)
// - url: debe existir (enlace al artículo completo)
// - datetime: debe existir (timestamp de publicación)
//
// Check for required article fields
export const validateArticle = (article: RawNewsArticle) =>
    // Operador && encadenado: retorna true solo si TODOS son truthy
    // Si algún campo es undefined, null, o string vacío → retorna false
    article.headline && article.summary && article.url && article.datetime;

// ============================================
// FUNCIÓN: getTodayString
// ============================================
// Función simple que retorna la fecha actual en formato YYYY-MM-DD
// Es un shortcut para evitar escribir la misma lógica repetidamente
//
// Get today's date string in YYYY-MM-DD format
export const getTodayString = () => new Date().toISOString().split('T')[0];

// ============================================
// FUNCIÓN: formatArticle
// ============================================
// Transforma un artículo "crudo" de la API a un formato consistente para la UI
// Normaliza datos, trunca texto, asigna valores por defecto, etc.
//
// PARÁMETROS:
// - article: artículo crudo de la API (puede tener datos inconsistentes)
// - isCompanyNews: booleano que indica si es noticia específica de una empresa
// - symbol: símbolo del stock (ej: "AAPL") - opcional, requerido si isCompanyNews=true
// - index: índice del artículo en el array (para generar IDs únicos) - default: 0
//
// RETORNA: objeto NewsArticle formateado y listo para renderizar
export const formatArticle = (
    article: RawNewsArticle,
    isCompanyNews: boolean,
    symbol?: string,
    index: number = 0
) => ({
  // ============================================
  // ID ÚNICO
  // ============================================
  // Genera ID único para cada artículo
  // - Company news: usa timestamp + número random (porque la API podría no tener ID)
  // - Market news: usa ID de la API + índice (para diferenciar duplicados)
  // El ID es crítico para React keys y evitar conflictos
  id: isCompanyNews ? Date.now() + Math.random() : article.id + index,
  
  // ============================================
  // HEADLINE (TÍTULO)
  // ============================================
  // article.headline!: el "!" es non-null assertion de TypeScript
  // Le dice a TS "confía en mí, este campo existe" (porque ya lo validamos antes)
  // .trim(): elimina espacios en blanco al inicio y final
  headline: article.headline!.trim(),
  
  // ============================================
  // SUMMARY (RESUMEN TRUNCADO)
  // ============================================
  // .substring(0, X): corta el string a X caracteres
  // - Company news: 200 caracteres (más detalle)
  // - Market news: 150 caracteres (más conciso)
  // + '...': agrega puntos suspensivos para indicar que hay más texto
  // Esto previene que resúmenes largos rompan el diseño
  summary:
      article.summary!.trim().substring(0, isCompanyNews ? 200 : 150) + '...',
  
  // ============================================
  // SOURCE (FUENTE DEL ARTÍCULO)
  // ============================================
  // Operador ||: usa el valor de la izquierda si existe, sino usa el de la derecha
  // Si article.source existe → usa ese
  // Si no existe → asigna "Company News" o "Market News" según el tipo
  source: article.source || (isCompanyNews ? 'Company News' : 'Market News'),
  
  // ============================================
  // URL (ENLACE AL ARTÍCULO COMPLETO)
  // ============================================
  // URL donde se puede leer el artículo completo
  // El "!" asegura que existe (ya validado anteriormente)
  url: article.url!,
  
  // ============================================
  // DATETIME (TIMESTAMP DE PUBLICACIÓN)
  // ============================================
  // Timestamp Unix de cuándo se publicó el artículo
  // Se usa con formatTimeAgo() para mostrar "2 hours ago"
  datetime: article.datetime!,
  
  // ============================================
  // IMAGE (IMAGEN DEL ARTÍCULO)
  // ============================================
  // URL de la imagen destacada del artículo
  // Si no existe, usa string vacío (la UI debería manejar este caso)
  image: article.image || '',
  
  // ============================================
  // CATEGORY (CATEGORÍA DEL ARTÍCULO)
  // ============================================
  // - Company news: siempre categoría 'company'
  // - Market news: usa la categoría de la API o 'general' por defecto
  // Ejemplos: 'company', 'earnings', 'merger', 'general'
  category: isCompanyNews ? 'company' : article.category || 'general',
  
  // ============================================
  // RELATED (SÍMBOLO RELACIONADO)
  // ============================================
  // - Company news: usa el símbolo pasado como parámetro (ej: "AAPL")
  //   El "!" asegura que symbol existe (es requerido si isCompanyNews=true)
  // - Market news: usa el campo related de la API o string vacío
  // Se usa para agrupar noticias por empresa
  related: isCompanyNews ? symbol! : article.related || '',
});

// ============================================
// FUNCIÓN: formatChangePercent
// ============================================
// Formatea el porcentaje de cambio de precio con signo +/- y símbolo %
// Formato: +2.45% o -1.30%
//
// PARÁMETROS:
// - changePercent: número opcional con el porcentaje de cambio
//
// RETORNA: string formateado o string vacío si no hay valor
export const formatChangePercent = (changePercent?: number) => {
  // Si no existe changePercent o es 0, retorna string vacío
  if (!changePercent) return '';
  
  // ============================================
  // DETERMINACIÓN DEL SIGNO
  // ============================================
  // Si changePercent > 0: signo = '+'
  // Si changePercent <= 0: signo = '' (el número negativo ya tiene -)
  const sign = changePercent > 0 ? '+' : '';
  
  // ============================================
  // FORMATEO FINAL
  // ============================================
  // .toFixed(2): redondea a 2 decimales (2.456 → "2.46")
  // Template literal: combina signo + número + %
  // Ejemplos: "+2.45%", "-1.30%", "-0.05%"
  return `${sign}${changePercent.toFixed(2)}%`;
};

// ============================================
// FUNCIÓN: getChangeColorClass
// ============================================
// Retorna la clase de Tailwind CSS apropiada según si el cambio es positivo o negativo
// Convención financiera: verde = subida, rojo = bajada, gris = neutral
//
// PARÁMETROS:
// - changePercent: porcentaje de cambio (puede ser undefined)
//
// RETORNA: string con clase de Tailwind CSS
export const getChangeColorClass = (changePercent?: number) => {
  // Si no hay valor, retorna gris (neutral/sin datos)
  if (!changePercent) return 'text-gray-400';
  
  // Operador ternario:
  // - Positivo (> 0): texto verde (ganancia)
  // - Negativo o cero (<= 0): texto rojo (pérdida)
  return changePercent > 0 ? 'text-green-500' : 'text-red-500';
};

// ============================================
// FUNCIÓN: formatPrice
// ============================================
// Formatea un número como precio en dólares usando el estándar internacional
// Usa la API Intl.NumberFormat para formateo correcto según locales
//
// PARÁMETROS:
// - price: número a formatear (ej: 156.78)
//
// RETORNA: string formateado (ej: "$156.78")
export const formatPrice = (price: number) => {
  // ============================================
  // INTL.NUMBERFORMAT - FORMATEO INTERNACIONAL
  // ============================================
  // Intl.NumberFormat: API nativa del navegador para formateo de números
  // 'en-US': locale estadounidense (formato: $1,234.56)
  // Configuración:
  return new Intl.NumberFormat('en-US', {
    // style: 'currency': formatea como moneda (agrega símbolo $)
    style: 'currency',
    // currency: 'USD': usa dólares estadounidenses
    currency: 'USD',
    // minimumFractionDigits: 2: siempre muestra 2 decimales
    // Ejemplo: 150 → "$150.00" (no "$150")
    minimumFractionDigits: 2,
  }).format(price); // .format(price): aplica el formato al número
  
  // Ejemplos de salida:
  // formatPrice(156.78) → "$156.78"
  // formatPrice(1234.5) → "$1,234.50"
  // formatPrice(50) → "$50.00"
};

// ============================================
// FUNCIÓN: formatDateToday
// ============================================
// Formatea la fecha actual en formato largo y legible para humanos
// Formato: "Thursday, October 30, 2024"
// Se ejecuta UNA VEZ cuando el módulo se carga (no es una función, es una constante)
export const formatDateToday = new Date().toLocaleDateString('en-US', {
  // weekday: 'long': nombre completo del día ("Thursday")
  weekday: 'long',
  // year: 'numeric': año en 4 dígitos ("2024")
  year: 'numeric',
  // month: 'long': nombre completo del mes ("October")
  month: 'long',
  // day: 'numeric': día del mes sin ceros ("30", no "30th")
  day: 'numeric',
  // timeZone: 'UTC': usa zona horaria UTC (importante para consistencia)
  timeZone: 'UTC',
});
// NOTA: Esta constante se calcula cuando el archivo se importa por primera vez
// Si la página se mantiene abierta después de medianoche, seguirá mostrando la fecha antigua
// Para fechas dinámicas, debería ser una función que se llame cada vez

// ============================================
// FUNCIÓN: getAlertText
// ============================================
// Genera texto legible para mostrar la condición de una alerta de precio
// Las alertas disparan cuando el precio cruza un umbral (threshold)
//
// PARÁMETROS:
// - alert: objeto Alert con tipo de alerta y valor umbral
//   Ejemplo: { alertType: 'upper', threshold: 150.00 }
//
// RETORNA: string descriptivo de la condición
//   Ejemplo: "Price > $150.00" o "Price < $100.00"
export const getAlertText = (alert: Alert) => {
  // ============================================
  // DETERMINACIÓN DEL OPERADOR
  // ============================================
  // 'upper': alerta cuando el precio SUBE por encima del threshold
  //          → usa operador '>' (mayor que)
  // 'lower': alerta cuando el precio BAJA por debajo del threshold
  //          → usa operador '<' (menor que)
  const condition = alert.alertType === 'upper' ? '>' : '<';
  
  // ============================================
  // CONSTRUCCIÓN DEL TEXTO
  // ============================================
  // Template literal que combina:
  // - "Price": texto fijo
  // - condition: operador > o 
  // - formatPrice(alert.threshold): precio formateado como moneda
  // Ejemplos:
  // - "Price > $150.00" (alerta upper en $150)
  // - "Price < $100.00" (alerta lower en $100)
  return `Price ${condition} ${formatPrice(alert.threshold)}`;
};

// ============================================
// FUNCIÓN: getFormattedTodayDate
// ============================================
// Similar a formatDateToday pero como FUNCIÓN en lugar de constante
// Esto significa que se ejecuta cada vez que se llama, obteniendo la fecha actual
// 
// DIFERENCIA CON formatDateToday:
// - formatDateToday: constante que se calcula una vez al cargar
// - getFormattedTodayDate(): función que se puede llamar múltiples veces
//
// Esta versión es mejor para aplicaciones de larga duración que cruzan medianoche
export const getFormattedTodayDate = () => new Date().toLocaleDateString('en-US', {
  // Misma configuración que formatDateToday
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});
// RETORNA: "Thursday, October 30, 2024" (actualizado cada vez que se llama)

// ============================================
// FLUJO DE TRABAJO GENERAL DEL ARCHIVO:
// ============================================
//
// Este archivo es un "UTILS" o "HELPERS" module - una colección de funciones
// utilitarias que se usan en TODA la aplicación.
//
// CATEGORÍAS DE FUNCIONES:
//
// 1. FORMATEO DE ESTILOS (CSS):
//    - cn(): combina clases CSS dinámicamente
//
// 2. FORMATEO DE TIEMPO:
//    - formatTimeAgo(): convierte timestamps a "2 hours ago"
//    - getDateRange(): genera rangos de fechas
//    - getTodayDateRange(): rango solo para hoy
//    - getTodayString(): fecha actual en YYYY-MM-DD
//    - formatDateToday / getFormattedTodayDate(): fecha legible larga
//
// 3. FORMATEO DE VALORES FINANCIEROS:
//    - formatMarketCapValue(): "$3.10T", "$900.00B"
//    - formatPrice(): "$156.78"
//    - formatChangePercent(): "+2.45%"
//    - getChangeColorClass(): clase CSS según positivo/negativo
//
// 4. LÓGICA DE NEGOCIO:
//    - calculateNewsDistribution(): cuántas noticias mostrar
//    - validateArticle(): verifica campos obligatorios
//    - formatArticle(): normaliza datos de artículos
//    - getAlertText(): genera texto de alertas
//
// 5. UTILIDADES GENERALES:
//    - delay(): pausa asíncrona (sleep)
// ============================================
// PROPÓSITO EN TU APLICACIÓN:
// ============================================
//
// Este archivo es el CORAZÓN de las utilidades de tu aplicación de análisis bursátil.
// Cada función resuelve problemas específicos que se repiten en múltiples componentes.
//
// EJEMPLOS DE USO EN TU APP:
//
// 1. DASHBOARD DE STOCKS:
//    - formatPrice(): muestra precios de acciones "$156.78"
//    - formatChangePercent(): muestra cambios "+2.45%" o "-1.30%"
//    - getChangeColorClass(): colorea en verde (subida) o rojo (bajada)
//    - formatMarketCapValue(): muestra market cap "Apple: $3.10T"
//
// 2. FEED DE NOTICIAS:
//    - formatTimeAgo(): muestra "2 hours ago" en cada noticia
//    - validateArticle(): filtra noticias con datos incompletos
//    - formatArticle(): normaliza noticias de diferentes APIs
//    - calculateNewsDistribution(): decide cuántas noticias mostrar por stock
//    - getDateRange(): filtra noticias de los últimos 7 días
//
// 3. SISTEMA DE ALERTAS:
//    - getAlertText(): muestra "Price > $150.00" en la lista de alertas
//    - formatPrice(): formatea el threshold de cada alerta
//
// 4. GRÁFICOS Y CHARTS:
//    - getDateRange(): define el rango temporal del gráfico
//    - formatPrice(): etiquetas del eje Y (precios)
//    - formatDateToday(): título del dashboard "Today: Thursday, October 30, 2024"
//
// 5. COMPONENTES REUTILIZABLES:
//    - cn(): en TODOS los componentes para combinar clases Tailwind
//    - delay(): para rate limiting en llamadas a APIs (evitar saturar endpoints)
//
// ============================================
// PATRÓN DE DISEÑO:
// ============================================
//
// Este archivo sigue el patrón "PURE UTILITY FUNCTIONS":
// - ✅ Funciones puras: mismo input → mismo output (predecibles)
// - ✅ Sin efectos secundarios: no modifican variables externas
// - ✅ Altamente reutilizables: se usan en decenas de componentes
// - ✅ Fáciles de testear: inputs simples, outputs verificables
// - ✅ Separación de responsabilidades: cada función hace UNA cosa bien
//
// VENTAJAS DE CENTRALIZAR ESTAS FUNCIONES:
// - No repites código de formateo en cada componente
// - Cambios en el formato se hacen en UN SOLO lugar
// - Consistencia visual en toda la app (todos los precios se ven igual)
// - Más fácil de mantener y debuggear
// - Reduce el tamaño de los componentes (más limpios y legibles)
//
// ============================================
// BEST PRACTICES IMPLEMENTADAS:
// ============================================
//
// 1. MANEJO DE EDGE CASES:
//    - formatMarketCapValue() valida números inválidos
//    - formatChangePercent() maneja valores undefined
//    - validateArticle() previene renderizar datos incompletos
//
// 2. INTERNACIONALIZACIÓN (i18n):
//    - Intl.NumberFormat para formateo según locale
//    - toLocaleDateString para fechas según región
//    - Aunque está hardcodeado a 'en-US', es fácil de extender
//
// 3. TYPESCRIPT:
//    - Tipos explícitos en parámetros y returns
//    - Non-null assertions (!) solo después de validaciones
//    - Parámetros opcionales con valores por defecto
//
// 4. PERFORMANCE:
//    - Funciones ligeras y rápidas
//    - Sin operaciones costosas innecesarias
//    - Cálculos simples de matemática básica
//
// 5. LEGIBILIDAD:
//    - Nombres descriptivos (formatPrice, getDateRange)
//    - Una responsabilidad por función
//    - Lógica clara y directa
//
// ============================================
// FLUJO DE DATOS TÍPICO:
// ============================================
//
// 1. API EXTERNA → Datos crudos:
//    {
//      price: 156.78,
//      change: 2.45,
//      marketCap: 3100000000000,
//      timestamp: 1698765432
//    }
//
// 2. UTILS.TS → Transformación:
//    - formatPrice(156.78) → "$156.78"
//    - formatChangePercent(2.45) → "+2.45%"
//    - getChangeColorClass(2.45) → "text-green-500"
//    - formatMarketCapValue(3100000000000) → "$3.10T"
//    - formatTimeAgo(1698765432) → "2 hours ago"
//
// 3. COMPONENTE → Renderizado:
//    <div className={getChangeColorClass(change)}>
//      {formatPrice(price)} {formatChangePercent(change)}
//    </div>
//    // Resultado: <div class="text-green-500">$156.78 +2.45%</div>
//
// ============================================
// CASOS DE USO ESPECÍFICOS:
// ============================================
//
// CASO 1: Componente StockCard
// ```tsx
// function StockCard({ stock }) {
//   return (
//     <div className={cn("stock-card", stock.isActive && "active")}>
//       <h3>{stock.symbol}</h3>
//       <p>{formatPrice(stock.price)}</p>
//       <span className={getChangeColorClass(stock.changePercent)}>
//         {formatChangePercent(stock.changePercent)}
//       </span>
//       <small>{formatMarketCapValue(stock.marketCap)}</small>
//     </div>
//   );
// }
// ```
//
// CASO 2: NewsItem Component
// ```tsx
// function NewsItem({ article }) {
//   if (!validateArticle(article)) return null;
//   
//   const formatted = formatArticle(article, false);
//   
//   return (
//     <article>
//       <h4>{formatted.headline}</h4>
//       <p>{formatted.summary}</p>
//       <time>{formatTimeAgo(formatted.datetime)}</time>
//     </article>
//   );
// }
// ```
//
// CASO 3: AlertsList Component
// ```tsx
// function AlertsList({ alerts }) {
//   return (
//     <ul>
//       {alerts.map(alert => (
//         <li key={alert.id}>
//           <span>{alert.symbol}</span>
//           <span>{getAlertText(alert)}</span>
//         </li>
//       ))}
//     </ul>
//   );
// }
// ```
//
// CASO 4: Fetching Noticias con Rate Limiting
// ```tsx
// async function fetchNews() {
//   const { from, to } = getDateRange(7); // Últimos 7 días
//   const distribution = calculateNewsDistribution(watchlist.length);
//   
//   for (const symbol of watchlist) {
//     await delay(500); // Espera 500ms entre peticiones
//     const news = await api.getNews(symbol, from, to, distribution.itemsPerSymbol);
//     // ... procesar noticias
//   }
// }
// ```
//
// ============================================
// CONSIDERACIONES DE MEJORA FUTURA:
// ============================================
//
// 1. INTERNACIONALIZACIÓN COMPLETA:
//    - Permitir cambiar locale dinámicamente (español, inglés, etc.)
//    - Formatear fechas y números según preferencias del usuario
//
// 2. MEMOIZACIÓN:
//    - Usar memoization para formateos costosos repetidos
//    - Ejemplo: memoize(formatMarketCapValue) para cachear resultados
//
// 3. VALIDACIÓN MÁS ROBUSTA:
//    - validateArticle() podría usar Zod o Yup para validación tipada
//    - Validar rangos de valores (precios negativos, fechas futuras, etc.)
//
// 4. CONFIGURACIÓN CENTRALIZADA:
//    - Extraer constantes mágicas (6 noticias, 200 chars, etc.) a un config
//    - Hacer los límites configurables por el usuario
//
// 5. ERROR HANDLING:
//    - Envolver funciones en try-catch para datos malformados
//    - Logging de errores para debugging
//
// 6. TESTING:
//    - Cada función debería tener tests unitarios
//    - Casos edge: valores null, números extremos, fechas inválidas
//
// ============================================
// RESUMEN EJECUTIVO:
// ============================================
//
// Este archivo utils.ts es una TOOLBOX (caja de herramientas) que:
//
// ✅ FORMATEA datos financieros para visualización profesional
// ✅ NORMALIZA datos de diferentes fuentes a formato consistente
// ✅ CALCULA distribuciones inteligentes de contenido
// ✅ VALIDA datos antes de renderizar (previene crashes)
// ✅ COMBINA clases CSS dinámicamente (Tailwind + condicionales)
// ✅ MANEJA tiempo de forma amigable ("2 hours ago" vs timestamps)
//
// Sin este archivo, cada componente tendría que:
// - Reimplementar lógica de formateo (código duplicado)
// - Manejar edge cases individualmente (inconsistente)
// - Formatear valores manualmente (propenso a errores)
//
// IMPACTO EN LA APLICACIÓN:
// Este archivo se importa en probablemente 20+ componentes y se usa
// cientos de veces durante la ejecución de la app. Es CRÍTICO para:
// - Experiencia de usuario (datos legibles y profesionales)
// - Mantenibilidad (cambios centralizados)
// - Consistencia visual (todo se ve uniforme)
// - Prevención de bugs (validaciones centralizadas)
//
// Es uno de los archivos más importantes aunque no contenga UI.