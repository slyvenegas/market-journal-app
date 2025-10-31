// ============================================
// DIRECTIVA 'use server'
// ============================================
// 'use server': marca este archivo como SERVER-ONLY code
// TODO el código aquí se ejecuta EXCLUSIVAMENTE en el servidor
// NUNCA se envía al navegador del cliente
//
// PROPÓSITO:
// - Acceder directamente a la base de datos (conexión MongoDB)
// - Proteger queries sensibles (no exponer estructura de DB)
// - Trabajar con datos de usuarios sin exponerlos al cliente
'use server';

// ============================================
// IMPORTACIONES
// ============================================
// connectToDatabase: función helper que establece y retorna conexión a MongoDB
// Maneja la conexión de forma singleton (reutiliza conexión existente)
// Evita crear múltiples conexiones en cada petición (mejor performance)
// Ubicada en @/database/mongoose (probablemente database/mongoose.ts)
import {connectToDatabase} from "@/database/mongoose";

// ============================================
// SERVER ACTION: getAllUsersForNewsEmail
// ============================================
// Esta Server Action obtiene TODOS los usuarios con email válido de la base de datos
// Se usa específicamente para enviar newsletters o emails masivos de noticias
//
// CASO DE USO:
// Tu app probablemente tiene un cron job o Inngest function que:
// 1. Llama a esta función para obtener lista de usuarios
// 2. Para cada usuario, genera un resumen personalizado de noticias
// 3. Envía email con las noticias más relevantes según su watchlist
//
// EJEMPLO DE FLUJO:
// - Cron job diario a las 8 AM
// - getAllUsersForNewsEmail() → lista de 1000 usuarios
// - Para cada usuario: obtener su watchlist → buscar noticias → enviar email
//
// NO RECIBE PARÁMETROS:
// Obtiene TODOS los usuarios (no filtra por nada adicional)
//
// RETORNA:
// - Array de objetos con { id, email, name } si hay usuarios
// - Array vacío [] si no hay usuarios o si hay error
export const getAllUsersForNewsEmail = async () => {
    
    // ============================================
    // BLOQUE TRY-CATCH: MANEJO DE ERRORES
    // ============================================
    // try-catch es CRÍTICO aquí porque:
    // - La conexión a DB puede fallar
    // - MongoDB puede estar caído o inaccesible
    // - Queries pueden tener errores de sintaxis
    // - Colecciones pueden no existir
    //
    // Sin try-catch, un error crashearía el proceso de envío de emails
    // Con try-catch, retornamos array vacío y el sistema continúa funcionando
    try {
        // ============================================
        // ESTABLECER CONEXIÓN A MONGODB
        // ============================================
        // connectToDatabase(): función asíncrona que:
        // 1. Verifica si ya existe una conexión activa
        // 2. Si existe → reutiliza esa conexión (eficiente)
        // 3. Si NO existe → crea nueva conexión
        // 4. Conecta a MongoDB usando URI de variables de entorno
        // 5. Retorna la instancia de mongoose
        //
        // PATRÓN SINGLETON:
        // En Next.js, cada petición podría crear nueva conexión
        // Este patrón previene eso: una sola conexión compartida
        // Mejor performance y no satura MongoDB con conexiones
        //
        // await: esperamos porque la conexión es asíncrona (I/O operation)
        const mongoose = await connectToDatabase();
        
        // ============================================
        // ACCESO A LA BASE DE DATOS NATIVA
        // ============================================
        // mongoose.connection.db: accede a la instancia NATIVA de MongoDB
        // 
        // ¿POR QUÉ NO USAR MONGOOSE MODELS?
        // Mongoose tiene una capa de abstracción (schemas, models, validations)
        // Aquí usamos MongoDB driver nativo porque:
        // - Query simple: solo SELECT con filtro básico
        // - Mejor performance: sin overhead de Mongoose
        // - Más control: projection específica, no necesitamos todo el documento
        //
        // mongoose.connection.db es la instancia del MongoDB native driver
        // Permite usar métodos como: collection(), find(), aggregate(), etc.
        const db = mongoose.connection.db;
        
        // ============================================
        // VALIDACIÓN: VERIFICAR CONEXIÓN
        // ============================================
        // if (!db): verifica que la conexión a DB existe
        // Si db es null o undefined, significa que la conexión falló
        //
        // throw new Error(): lanza excepción que será capturada por el catch
        // Esto previene intentar hacer queries a una conexión inexistente
        if(!db) throw new Error('Mongoose connection not connected');

        // ============================================
        // QUERY A MONGODB: BUSCAR USUARIOS CON EMAIL
        // ============================================
        // Esta es una query de MongoDB usando el native driver
        // Es equivalente a SQL: SELECT _id, id, email, name, country FROM user WHERE email IS NOT NULL
        //
        // DESGLOSE LÍNEA POR LÍNEA:
        const users = await db.collection('user')  // Accede a la colección 'user' (tabla en SQL)
            .find(                                  // Método find() para buscar documentos
                // ============================================
                // FILTRO DE BÚSQUEDA (WHERE clause)
                // ============================================
                // Este objeto define QUÉ documentos queremos
                { 
                    email: {                         // Campo 'email' debe cumplir:
                        $exists: true,               // $exists: true → el campo 'email' debe existir en el documento
                                                     // Algunos documentos pueden no tener campo email (usuarios OAuth, etc.)
                        
                        $ne: null                    // $ne: "not equal" → email NO debe ser null
                                                     // Filtra documentos donde email existe pero es null
                    }
                },
                // Resultado del filtro: solo usuarios con email válido (existe Y no es null)
                
                // ============================================
                // PROJECTION (SELECT específico)
                // ============================================
                // Por defecto, MongoDB retorna TODOS los campos del documento
                // Projection permite especificar QUÉ campos queremos (más eficiente)
                // Es como hacer SELECT específico en SQL en lugar de SELECT *
                { 
                    projection: {                    // Objeto que define campos a retornar
                        _id: 1,                      // 1 = incluir este campo
                                                     // _id: ObjectId único de MongoDB
                        
                        id: 1,                       // id: probablemente ID de Better Auth
                                                     // Puede ser string como 'user_abc123'
                        
                        email: 1,                    // email: correo del usuario (necesario para enviar email)
                        
                        name: 1,                     // name: nombre del usuario (para personalizar email: "Hi John,")
                        
                        country: 1                   // country: país del usuario
                                                     // Útil para: timezone, market local, idioma del email
                    }
                }
                // NOTA: Campos NO incluidos (como password_hash, phone, etc.) NO se retornan
                // Esto mejora performance y seguridad (no traemos datos innecesarios)
            )
            .toArray();                              // Convierte el cursor de MongoDB a array de JavaScript
                                                     // Sin toArray(), obtendrías un cursor (objeto iterable)
                                                     // Con toArray(), obtienes: [{ _id, id, email, name, country }, ...]

        // ============================================
        // EN ESTE PUNTO:
        // ============================================
        // users contiene algo como:
        // [
        //   { _id: ObjectId("..."), id: "user_123", email: "john@example.com", name: "John Doe", country: "US" },
        //   { _id: ObjectId("..."), id: "user_456", email: "jane@example.com", name: "Jane Smith", country: "UK" },
        //   { _id: ObjectId("..."), id: null, email: "bob@example.com", name: "Bob", country: null },
        //   { _id: ObjectId("..."), id: "user_789", email: null, name: "Alice", country: "CA" },
        // ]

        // ============================================
        // POST-PROCESAMIENTO: FILTRADO Y MAPEO
        // ============================================
        // Aunque la query de MongoDB ya filtró users con email válido,
        // hacemos filtrado ADICIONAL en JavaScript por seguridad extra
        //
        // RAZÓN: MongoDB puede tener datos inconsistentes por:
        // - Migraciones antiguas
        // - Inserts directos sin validación
        // - Bugs en código anterior
        //
        // Este filtrado garantiza calidad de datos antes de enviar emails
        return users
            // ============================================
            // .filter(): FILTRADO ADICIONAL
            // ============================================
            // Solo mantiene usuarios que tengan email Y name válidos
            .filter((user) => user.email && user.name)
            // user.email: verifica que email exista y sea truthy (no null, no undefined, no '')
            // user.name: verifica que name exista y sea truthy
            //
            // USUARIOS FILTRADOS (eliminados):
            // - { email: null, name: "Alice" } → eliminado (no email)
            // - { email: "bob@example.com", name: null } → eliminado (no name)
            // - { email: "", name: "Charlie" } → eliminado (email vacío)
            //
            // USUARIOS QUE PASAN:
            // - { email: "john@example.com", name: "John Doe" } ✅
            // - { email: "jane@example.com", name: "Jane Smith" } ✅
            
            // ============================================
            // .map(): TRANSFORMACIÓN DE DATOS
            // ============================================
            // Convierte cada documento de MongoDB a un formato simplificado
            // Solo retorna los campos necesarios para enviar emails
            .map((user) => ({
                // ============================================
                // ID: NORMALIZACIÓN
                // ============================================
                // Problema: users pueden tener 'id' (Better Auth) o solo '_id' (MongoDB)
                // Solución: usa 'id' si existe, sino usa '_id' convertido a string
                //
                // user.id: ID de Better Auth (string) - preferencia
                // user._id?.toString(): ObjectId de MongoDB convertido a string
                // '': fallback si ninguno existe (string vacío)
                //
                // Operador ||: retorna el primer valor truthy
                // Operador ?.: optional chaining (no falla si _id es undefined)
                //
                // EJEMPLOS:
                // user.id = "user_123" → retorna "user_123"
                // user.id = null, user._id = ObjectId("abc") → retorna "abc..."
                // user.id = null, user._id = null → retorna ""
                id: user.id || user._id?.toString() || '',
                
                // ============================================
                // EMAIL: CAMPO REQUERIDO
                // ============================================
                // Email del usuario para enviar el newsletter
                // Ya sabemos que existe porque pasó el filtro anterior
                email: user.email,
                
                // ============================================
                // NAME: CAMPO REQUERIDO
                // ============================================
                // Nombre para personalizar el email: "Hi John,"
                // Ya sabemos que existe porque pasó el filtro anterior
                name: user.name
                
                // NOTA: NO incluimos 'country' en el resultado final
                // Aunque lo obtuvimos de MongoDB, no lo necesitamos aquí
                // Si lo necesitaras para timezone/idioma, podrías agregarlo:
                // country: user.country
            }))
            // ============================================
            // RESULTADO FINAL:
            // ============================================
            // [
            //   { id: "user_123", email: "john@example.com", name: "John Doe" },
            //   { id: "user_456", email: "jane@example.com", name: "Jane Smith" }
            // ]
            //
            // Array limpio, consistente, listo para enviar emails
        
    } catch (e) {
        // ============================================
        // MANEJO DE ERRORES
        // ============================================
        // Si CUALQUIER error ocurre en el bloque try, llegamos aquí
        //
        // POSIBLES ERRORES:
        // - MongoDB no disponible (servidor caído)
        // - Credenciales de conexión incorrectas
        // - Colección 'user' no existe
        // - Network timeout
        // - Query mal formada
        // - Permisos insuficientes en MongoDB
        //
        // console.error(): imprime el error en los logs del servidor
        // IMPORTANTE: en producción usar sistema de logging profesional
        // (Winston, Pino, Sentry, Datadog, etc.)
        console.error('Error fetching users for news email:', e)
        
        // ============================================
        // RETORNO SEGURO: ARRAY VACÍO
        // ============================================
        // En lugar de propagar el error (throw), retornamos []
        //
        // VENTAJAS DE ESTE ENFOQUE:
        // - El sistema de emails NO se rompe completamente
        // - El cron job puede continuar y reintentar después
        // - No crashea toda la aplicación
        // - Degradación elegante (graceful degradation)
        //
        // DESVENTAJAS:
        // - Los usuarios NO recibirán emails ese día
        // - Necesitas monitorear logs para detectar el problema
        //
        // ALTERNATIVA (más agresiva):
        // throw e; // Propaga error, crashea el job, pero alerta inmediata
        return []
    }
}

// ============================================
// FLUJO DE TRABAJO COMPLETO: ENVÍO DE NEWSLETTER
// ============================================
//
// ESCENARIO: Envío diario de noticias financieras personalizadas
// ────────────────────────────────────────────────────────────────
//
// PASO 1: CRON JOB SE ACTIVA
// ────────────────────────────────────────────────────────────────
// - Vercel Cron, AWS EventBridge, o Inngest scheduled function
// - Se ejecuta todos los días a las 8:00 AM UTC
// - Trigger: POST /api/cron/send-daily-news
//
// PASO 2: OBTENER LISTA DE USUARIOS
// ────────────────────────────────────────────────────────────────
// ```typescript
// // En /api/cron/send-daily-news/route.ts
// import { getAllUsersForNewsEmail } from '@/actions/email';
// 
// export async function POST() {
//   const users = await getAllUsersForNewsEmail();
//   // users = [
//   //   { id: "user_123", email: "john@example.com", name: "John Doe" },
//   //   { id: "user_456", email: "jane@example.com", name: "Jane Smith" },
//   //   ... 1000 usuarios más
//   // ]
// }
// ```
//
// PASO 3: PARA CADA USUARIO, GENERAR CONTENIDO PERSONALIZADO
// ────────────────────────────────────────────────────────────────
// ```typescript
// for (const user of users) {
//   // 1. Obtener watchlist del usuario
//   const watchlist = await getWatchlistByUserId(user.id);
//   // watchlist = ['AAPL', 'MSFT', 'GOOGL']
//   
//   // 2. Buscar noticias relevantes de esos símbolos
//   const news = await getNewsForSymbols(watchlist, { from: yesterday, to: today });
//   // news = [
//   //   { symbol: 'AAPL', headline: "Apple announces new iPhone", ... },
//   //   { symbol: 'MSFT', headline: "Microsoft Azure growth accelerates", ... }
//   // ]
//   
//   // 3. Obtener cambios de precio de sus stocks
//   const prices = await getPricesForSymbols(watchlist);
//   // prices = [
//   //   { symbol: 'AAPL', price: 178.50, change: +2.3% },
//   //   { symbol: 'MSFT', price: 420.15, change: -0.8% }
//   // ]
//   
//   // 4. Generar HTML del email personalizado
//   const emailHtml = generateNewsEmailTemplate({
//     userName: user.name,
//     news: news,
//     prices: prices
//   });
//   
//   // 5. Enviar email
//   await sendEmail({
//     to: user.email,
//     subject: `Your Daily Market Update - ${new Date().toLocaleDateString()}`,
//     html: emailHtml
//   });
//   
//   // 6. Rate limiting: esperar 100ms entre emails
//   await delay(100);
// }
// ```
//
// PASO 4: EMAIL RECIBIDO POR USUARIO
// ────────────────────────────────────────────────────────────────
// John Doe recibe email:
//
// ┌────────────────────────────────────────────┐
// │ Subject: Your Daily Market Update          │
// ├────────────────────────────────────────────┤
// │ Hi John,                                   │
// │                                            │
// │ Here's your personalized market update:    │
// │                                            │
// │ 📈 YOUR WATCHLIST PERFORMANCE              │
// │ ──────────────────────────────────────     │
// │ AAPL  $178.50  +2.3%  🟢                  │
// │ MSFT  $420.15  -0.8%  🔴                  │
// │ GOOGL $142.30  +1.5%  🟢                  │
// │                                            │
// │ 📰 TOP NEWS FOR YOUR STOCKS                │
// │ ──────────────────────────────────────     │
// │ • Apple announces new iPhone lineup        │
// │   Stock up 2.3% on strong pre-orders       │
// │                                            │
// │ • Microsoft Azure shows strong Q4 growth   │
// │   Cloud revenue beats expectations         │
// │                                            │
// │ [View Full Analysis →]                     │
// │                                            │
// │ Powered by Signalist                       │
// └────────────────────────────────────────────┘
//
// ============================================
// CONSIDERACIONES DE BASE DE DATOS:
// ============================================
//
// ESTRUCTURA DE COLECCIÓN 'user' EN MONGODB:
// ```json
// {
//   "_id": ObjectId("507f1f77bcf86cd799439011"),    // ID único de MongoDB
//   "id": "user_abc123",                            // ID de Better Auth
//   "email": "john@example.com",                    // Email del usuario
//   "name": "John Doe",                             // Nombre completo
//   "country": "United States",                     // País
//   "emailVerified": true,                          // Email verificado
//   "password_hash": "$2b$10$...",                  // Password hasheada (NO la retornamos)
//   "createdAt": ISODate("2024-01-15T08:00:00Z"),  // Fecha de registro
//   "investmentGoals": "long-term growth",          // Preferencias
//   "riskTolerance": "moderate",
//   "preferredIndustry": "technology"
// }
// ```
//
// ÍNDICES RECOMENDADOS PARA PERFORMANCE:
// ```javascript
// // Índice en email para búsquedas rápidas
// db.user.createIndex({ email: 1 })
//
// // Índice compuesto para nuestra query específica
// db.user.createIndex({ email: 1, name: 1 })
// ```
//
// TAMAÑO DE RESULTADO:
// - Sin projection: ~2KB por usuario (todos los campos)
// - Con projection: ~200 bytes por usuario (solo 5 campos)
// - 10,000 usuarios sin projection: ~20MB
// - 10,000 usuarios con projection: ~2MB (10x más eficiente) ✅
//
// ============================================
// ALTERNATIVAS Y OPTIMIZACIONES:
// ============================================
//
// OPCIÓN 1: PAGINACIÓN (para apps con millones de usuarios)
// ```typescript
// export const getUsersForNewsEmail = async (page = 0, pageSize = 100) => {
//   const users = await db.collection('user')
//     .find({ email: { $exists: true, $ne: null }})
//     .skip(page * pageSize)      // Saltar usuarios ya procesados
//     .limit(pageSize)             // Solo traer 100 a la vez
//     .toArray();
//   return users;
// }
// ```
//
// OPCIÓN 2: STREAMING (más eficiente en memoria)
// ```typescript
// export const streamUsersForNewsEmail = async (
//   callback: (user: User) => Promise<void>
// ) => {
//   const cursor = db.collection('user')
//     .find({ email: { $exists: true, $ne: null }});
//   
//   // Procesa cada usuario sin cargar todos en memoria
//   for await (const user of cursor) {
//     if (user.email && user.name) {
//       await callback({
//         id: user.id || user._id?.toString() || '',
//         email: user.email,
//         name: user.name
//       });
//     }
//   }
// }
// ```
//
// OPCIÓN 3: AGREGACIÓN PIPELINE (filtrado más complejo)
// ```typescript
// const users = await db.collection('user').aggregate([
//   // Filtrar users con email válido
//   { $match: { email: { $exists: true, $ne: null, $ne: '' }}},
//   
//   // Join con tabla de preferencias (si existe)
//   { $lookup: {
//       from: 'user_preferences',
//       localField: 'id',
//       foreignField: 'userId',
//       as: 'preferences'
//   }},
//   
//   // Solo usuarios que quieren recibir emails
//   { $match: { 'preferences.emailNotifications': true }},
//   
//   // Projection
//   { $project: { _id: 1, id: 1, email: 1, name: 1 }}
// ]).toArray();
// ```
//
// ============================================
// SEGURIDAD Y PRIVACIDAD:
// ============================================
//
// ✅ GDPR / Privacy Compliance:
// - Solo obtiene emails de usuarios que dieron consentimiento
// - Debería agregarse campo 'emailConsent: true' en el filtro
// - Permitir opt-out fácil (link "unsubscribe" en emails)
//
// ✅ Protección de datos:
// - NO retorna passwords ni datos sensibles
// - Projection explícita de solo campos necesarios
// - Logs NO deben imprimir emails completos
//
// ✅ Rate Limiting:
// - Delay entre emails para no saturar servidor SMTP
// - Batch processing en lugar de todos a la vez
//
// ============================================
// MONITOREO Y DEBUGGING:
// ============================================
//
// MÉTRICAS A TRACKEAR:
// - Total de usuarios obtenidos
// - Tiempo de ejecución de la query
// - Usuarios filtrados vs usuarios totales
// - Errores de conexión a DB
//
// LOGGING MEJORADO:
// ```typescript
// console.log(`📧 Fetched ${users.length} users for news email`);
// console.log(`⏱️  Query took ${Date.now() - startTime}ms`);
// if (users.length === 0) {
//   console.warn('⚠️  No users found - check DB connection');
// }
// ```
//
// ============================================
// TESTING:
// ============================================
//
// CASOS DE PRUEBA:
// 1. DB vacía → retorna []
// 2. Usuarios sin email → filtrados correctamente
// 3. Usuarios sin name → filtrados correctamente
// 4. DB desconectada → retorna [] sin crashear
// 5. 10,000 usuarios → performance aceptable (< 2s)
//
// ============================================
// RESUMEN EJECUTIVO:
// ============================================
//
// Esta Server Action es el PRIMER PASO en tu sistema de email marketing:
//
// 🎯 PROPÓSITO: Obtener lista limpia de usuarios para enviar newsletters
// 📊 DATOS: Solo email, name, id (mínimo necesario)
// ⚡ PERFORMANCE: Usa projection para traer solo campos necesarios
// 🛡️ SEGURIDAD: Ejecuta solo en servidor, no expone datos sensibles
// 🔄 RESILIENCIA: Maneja errores gracefully, retorna [] en lugar de crashear
// 📈 ESCALABILIDAD: Funciona hasta ~10K usuarios (considerar paginación después)
//
// Es una función pequeña pero CRÍTICA para mantener engagement con usuarios.