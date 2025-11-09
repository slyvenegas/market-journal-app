export const PERSONALIZED_WELCOME_EMAIL_PROMPT = `Genera contenido HTML altamente personalizado que se insertará en una plantilla de correo electrónico en el marcador de posición {{intro}}.

Datos del perfil del usuario:
{{userProfile}}

REQUISITOS DE PERSONALIZACIÓN:
DEBES crear contenido (en español) que esté claramente adaptado a ESTE usuario específico mediante:

IMPORTANTE: NO comiences el contenido personalizado con "Welcome", ya que el encabezado del correo ya dice "Welcome aboard {{name}}". Usa aperturas alternativas como "Thanks for joining", "Great to have you", "You're all set", "Perfect timing", etc.

1. **Referencia directa a los detalles del usuario**: Extrae y utiliza información específica de su perfil:
   - Sus objetivos o metas exactas de inversión
   - Su nivel declarado de tolerancia al riesgo
   - Los sectores o industrias de su preferencia
   - Su nivel de experiencia o antecedentes
   - Las acciones/empresas específicas que le interesan
   - Su horizonte de inversión (corto plazo, largo plazo, jubilación)

2. **Mensajería contextual**: Crea contenido que demuestre que entiendes su situación:
   - Nuevos inversores → Referencia a comenzar su camino/aprendizaje
   - Traders experimentados → Referencia a herramientas avanzadas/mejora de estrategias  
   - Planificación de jubilación → Referencia a construir riqueza con el tiempo
   - Sectores específicos → Menciona esos sectores exactamente por nombre
   - Enfoque conservador → Referencia a seguridad y decisiones informadas
   - Enfoque agresivo → Referencia a oportunidades y potencial de crecimiento

3. **Toque personal**: Haz que se sienta escrito especialmente para él:
   - Usa sus metas en el mensaje
   - Menciona directamente sus intereses
   - Conecta las características con sus necesidades específicas
   - Haz que se sienta comprendido y visto

REQUISITOS CRÍTICOS DE FORMATO:
- Devuelve ÚNICAMENTE contenido HTML limpio, SIN markdown, SIN bloques de código, SIN comillas invertidas
- Usa un solo párrafo: <p class="mobile-text" style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #CCDADC;">contenido</p>
- Escribe exactamente DOS oraciones (agrega una oración más que la actual)
- Mantén el contenido entre 35 y 50 palabras para mejor legibilidad
- Usa <strong> para los elementos clave personalizados (sus metas, sectores, etc.)
- NO incluyas "Here's what you can do right now:" ya que esto ya está en la plantilla
- Cada palabra debe contribuir a la personalización
- La segunda oración debe añadir contexto útil o reforzar la personalización

Ejemplos de salidas personalizadas (mostrando personalización evidente con DOS oraciones):
<p class="mobile-text" style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #CCDADC;">Thanks for joining Signalist! As someone focused on <strong>technology growth stocks</strong>, you'll love our real-time alerts for companies like the ones you're tracking. We'll help you spot opportunities before they become mainstream news.</p>

<p class="mobile-text" style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #CCDADC;">Great to have you aboard! Perfect for your <strong>conservative retirement strategy</strong> — we'll help you monitor dividend stocks without overwhelming you with noise. You can finally track your portfolio progress with confidence and clarity.</p>

<p class="mobile-text" style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.6; color: #CCDADC;">You're all set! Since you're new to investing, we've designed simple tools to help you build confidence while learning the <strong>healthcare sector</strong> you're interested in. Our beginner-friendly alerts will guide you without the confusing jargon.</p>`


export const NEWS_SUMMARY_EMAIL_PROMPT = `Genera contenido HTML para un correo de resumen de noticias del mercado que se insertará en la plantilla NEWS_SUMMARY_EMAIL_TEMPLATE en el marcador de posición {{newsContent}}.

Datos de noticias a resumir:
{{newsData}}

REQUISITOS CRÍTICOS DE FORMATO:
- Devuelve ÚNICAMENTE contenido HTML limpio, SIN markdown, SIN bloques de código, SIN comillas invertidas
- Estructura el contenido con secciones claras usando encabezados HTML y párrafos adecuados
- Usa las clases CSS y estilos específicos para coincidir con la plantilla del correo:

TÍTULOS DE SECCIÓN (para categorías como "Market Highlights", "Top Movers", etc.):
<h3 class="mobile-news-title dark-text" style="margin: 30px 0 15px 0; font-size: 18px; font-weight: 600; color: #f8f9fa; line-height: 1.3;">Título de sección</h3>

PÁRRAFOS (para contenido de noticias):
<p class="mobile-text dark-text-secondary" style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #CCDADC;">El contenido va aquí</p>

MENCIONES DE ACCIONES/EMPRESAS:
<strong style="color: #FDD458;">Símbolo bursátil</strong> para los tickers  
<strong style="color: #CCDADC;">Nombre de la empresa</strong> para las compañías

INDICADORES DE RENDIMIENTO:
Usa 📈 para ganancias, 📉 para pérdidas, 📊 para neutro/mixto

ESTRUCTURA DE CADA ARTÍCULO DE NOTICIAS:
Para cada noticia dentro de una sección, usa esta estructura:
1. Contenedor del artículo con estilo visual e ícono
2. Título del artículo como subtítulo
3. Puntos clave (2-3 ideas accionables)
4. Sección “Qué significa esto” para contexto
5. Enlace "Read more" al artículo original
6. Separador visual entre artículos

CONTENEDOR DE ARTÍCULO:
<div class="dark-info-box" style="background-color: #212328; padding: 24px; margin: 20px 0; border-radius: 8px;">

TÍTULOS DE ARTÍCULO:
<h4 class="dark-text" style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #FFFFFF; line-height: 1.4;">
Título del artículo aquí
</h4>

PUNTOS CLAVE (mínimo 3 ideas concisas):
<ul style="margin: 16px 0 20px 0; padding-left: 0; margin-left: 0; list-style: none;">
  <li class="dark-text-secondary" style="...">• Explicación clara y concisa en lenguaje simple.</li>
  <li class="dark-text-secondary" style="...">• Breve explicación con cifras clave y su significado.</li>
  <li class="dark-text-secondary" style="...">• Conclusión sencilla sobre qué implica esto para el dinero de la gente común.</li>
</ul>

SECCIÓN DE CONTEXTO:
<div style="background-color: #141414; border: 1px solid #374151; padding: 15px; border-radius: 6px; margin: 16px 0;">
<p class="dark-text-secondary" style="...">💡 <strong style="color: #FDD458;">Conclusión:</strong> Explicación sencilla de por qué esta noticia importa para tus finanzas, en lenguaje cotidiano.</p>
</div>

BOTÓN "READ MORE":
<div style="margin: 20px 0 0 0;">
<a href="ARTICLE_URL" style="color: #FDD458; text-decoration: none; font-weight: 500; font-size: 14px;" target="_blank" rel="noopener noreferrer">Leer artículo completo →</a>
</div>

SEPARADOR ENTRE SECCIONES:
<div style="border-top: 1px solid #374151; margin: 32px 0 24px 0;"></div>

Guías de contenido:
- Organiza las noticias en secciones lógicas con íconos (📊 Panorama del mercado, 📈 Ganadores, 📉 Perdedores, 🔥 Última hora, 💼 Resultados, 🏛️ Datos económicos, etc.)
- NUNCA repitas encabezados de sección
- Cada artículo debe incluir su título real
- Mínimo 3 puntos concisos por noticia
- Lenguaje claro, breve y sin jerga técnica
- Explica como si hablaras con alguien nuevo en inversión
- Incluye números, pero explica su relevancia en términos simples
- Mantén un diseño limpio, claro y fácil de escanear
- Usa botones “Leer artículo completo” con URLs reales
- Enfócate en información útil y comprensible para personas comunes
- Prioriza la **brevedad** y **claridad** sobre explicaciones extensas
`


export const TRADINGVIEW_SYMBOL_MAPPING_PROMPT = `Eres un experto en mercados financieros y plataformas de trading. Tu tarea es encontrar el símbolo correcto de TradingView que corresponda a un símbolo de Finnhub dado.

Información de la acción desde Finnhub:
Símbolo: {{symbol}}
Empresa: {{company}}
Bolsa: {{exchange}}
Moneda: {{currency}}
País: {{country}}

REGLAS IMPORTANTES:
1. TradingView usa formatos de símbolos específicos que pueden diferir de Finnhub
2. Para acciones de EE.UU.: usualmente solo el símbolo (ej. AAPL para Apple)
3. Para acciones internacionales: suele incluir prefijo de bolsa (ej. NASDAQ:AAPL, NYSE:MSFT, LSE:BARC)
4. Algunos símbolos pueden tener sufijos para distintas clases de acciones
5. Los ADRs y acciones extranjeras pueden tener formatos distintos

FORMATO DE RESPUESTA:
Devuelve ÚNICAMENTE un objeto JSON válido con esta estructura exacta:
{
  "tradingViewSymbol": "EXCHANGE:SYMBOL",
  "confidence": "high|medium|low",
  "reasoning": "Breve explicación de por qué este mapeo es correcto"
}

EJEMPLOS:
- Apple Inc. (AAPL) desde Finnhub → {"tradingViewSymbol": "NASDAQ:AAPL", "confidence": "high", "reasoning": "Apple cotiza en NASDAQ como AAPL"}
- Microsoft Corp (MSFT) desde Finnhub → {"tradingViewSymbol": "NASDAQ:MSFT", "confidence": "high", "reasoning": "Microsoft cotiza en NASDAQ como MSFT"}
- Barclays PLC (BARC.L) desde Finnhub → {"tradingViewSymbol": "LSE:BARC", "confidence": "high", "reasoning": "Barclays cotiza en la Bolsa de Londres como BARC"}

Tu respuesta debe ser únicamente JSON válido. No incluyas ningún otro texto.`

