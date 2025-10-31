// ============================================
// IMPORTACIONES
// ============================================

// Importa Mongoose, el ODM (Object Document Mapper) para MongoDB
// Mongoose proporciona una API para interactuar con MongoDB desde Node.js
import mongoose from 'mongoose';

// ============================================
// VARIABLE DE ENTORNO
// ============================================
// Obtiene la URI de conexión a MongoDB desde las variables de entorno
// Esta URI contiene: protocolo, usuario, contraseña, host, puerto y nombre de base de datos
// Ejemplo: mongodb+srv://user:password@cluster.mongodb.net/signalist
// O local: mongodb://localhost:27017/signalist
const MONGODB_URI = process.env.MONGODB_URI;

// ============================================
// DECLARACIÓN GLOBAL DE TYPESCRIPT
// ============================================
// Extiende el tipo global de TypeScript para incluir mongooseCache
// Esto permite almacenar la conexión en el objeto 'global' de Node.js
// sin que TypeScript arroje errores de tipo
declare global {
    // 'var' (no 'let' o 'const') porque es una declaración de tipo global
    // mongooseCache almacena la conexión y la promesa de conexión
    var mongooseCache: {
        // conn: la conexión activa a MongoDB (o null si no hay conexión)
        // typeof mongoose: tipo de la instancia de mongoose
        conn: typeof mongoose | null;
        
        // promise: promesa pendiente de conexión (o null si no hay promesa activa)
        // Esto previene múltiples intentos de conexión simultáneos
        promise: Promise<typeof mongoose> | null;
    }
}

// ============================================
// INICIALIZACIÓN DEL CACHE
// ============================================
// Crea una referencia local al cache global
// Esto facilita el acceso y hace el código más legible
let cached = global.mongooseCache;

// ============================================
// VERIFICACIÓN E INICIALIZACIÓN DEL CACHE
// ============================================
// Si el cache global no existe (primera vez que se ejecuta)
// lo inicializa con valores null
if(!cached) {
    // Crea el objeto cache con conn y promise en null
    // Lo asigna tanto a la variable global como a la local
    // = es asignación, por lo que cached también apunta al mismo objeto
    cached = global.mongooseCache = { conn: null, promise: null };
}

// ============================================
// FUNCIÓN PRINCIPAL: connectToDatabase
// ============================================
// Función asíncrona que establece y mantiene la conexión con MongoDB
// Implementa el patrón Singleton: solo una conexión activa a la vez
export const connectToDatabase = async () => {
    
    // ============================================
    // VALIDACIÓN DE VARIABLE DE ENTORNO
    // ============================================
    // Verifica que MONGODB_URI esté definida
    // Si no existe, lanza un error inmediatamente
    // Esto previene intentos de conexión con URI undefined
    if(!MONGODB_URI) throw new Error('MONGODB_URI must be set within .env');

    // ============================================
    // PATRÓN 1: REUTILIZAR CONEXIÓN EXISTENTE
    // ============================================
    // Si ya existe una conexión activa en cache, la retorna inmediatamente
    // Esto es CRUCIAL para rendimiento:
    // - Evita crear múltiples conexiones innecesarias
    // - Reutiliza la misma conexión en todas las peticiones
    // - En serverless (Vercel, AWS Lambda), las conexiones persisten entre invocaciones
    if(cached.conn) return cached.conn;

    // ============================================
    // PATRÓN 2: EVITAR CONEXIONES SIMULTÁNEAS
    // ============================================
    // Si no hay conexión pero HAY una promesa pendiente, espera esa promesa
    // Si NO hay promesa, crea una nueva
    if(!cached.promise) {
        // ============================================
        // CREACIÓN DE NUEVA CONEXIÓN
        // ============================================
        // mongoose.connect() retorna una promesa que se resuelve cuando conecta
        // Se guarda la promesa (no se espera con await todavía)
        // Esto permite que múltiples llamadas simultáneas esperen la MISMA promesa
        cached.promise = mongoose.connect(MONGODB_URI, { 
            // ============================================
            // OPCIÓN: bufferCommands
            // ============================================
            // bufferCommands: false desactiva el buffering de comandos de Mongoose
            // 
            // QUÉ ES EL BUFFERING:
            // Por defecto, Mongoose guarda comandos en un buffer si no hay conexión
            // y los ejecuta cuando la conexión se establece
            // 
            // POR QUÉ DESACTIVARLO:
            // - En entornos serverless, no queremos que comandos se queden en buffer
            // - Mejor fallar rápido si no hay conexión
            // - Evita comportamientos inesperados en funciones Lambda/Edge
            // - Cada invocación debe conectar explícitamente
            bufferCommands: false 
        });
    }

    // ============================================
    // RESOLUCIÓN DE LA PROMESA
    // ============================================
    // Try-catch para manejar errores de conexión
    try {
        // Espera a que la promesa de conexión se resuelva
        // Si tiene éxito, almacena la conexión en el cache
        // await pausa la ejecución hasta que mongoose.connect() termine
        cached.conn = await cached.promise;
        
    } catch (err) {
        // ============================================
        // MANEJO DE ERRORES DE CONEXIÓN
        // ============================================
        // Si la conexión falla:
        
        // 1. Limpia la promesa del cache
        // Esto permite que el próximo intento cree una nueva promesa
        // Si no limpiáramos, intentos futuros esperarían una promesa fallida
        cached.promise = null;
        
        // 2. Re-lanza el error para que el código que llamó a connectToDatabase
        // pueda manejarlo apropiadamente
        throw err;
    }

    // ============================================
    // LOG DE CONFIRMACIÓN
    // ============================================
    // Imprime mensaje en consola confirmando conexión exitosa
    // Útil para debugging y monitoreo
    // process.env.NODE_ENV: 'development', 'production', etc.
    console.log(`Connected to database ${process.env.NODE_ENV} - ${MONGODB_URI}`);

    // ============================================
    // RETORNO DE CONEXIÓN
    // ============================================
    // Retorna la conexión activa de Mongoose
    // Esta conexión se puede usar para operaciones de base de datos
    return cached.conn;
}

// ============================================
// FLUJO DE TRABAJO DEL CÓDIGO:
// ============================================
//
// PRIMERA LLAMADA (App inicia):
// 1. connectToDatabase() se ejecuta
// 2. MONGODB_URI existe → continúa
// 3. cached.conn es null → no retorna
// 4. cached.promise es null → crea nueva promesa
// 5. mongoose.connect() se ejecuta (intenta conectar)
// 6. await espera la conexión
// 7. Conexión exitosa → guarda en cached.conn
// 8. Imprime mensaje de confirmación
// 9. Retorna la conexión
//
// SEGUNDA LLAMADA (misma instancia):
// 1. connectToDatabase() se ejecuta
// 2. MONGODB_URI existe → continúa
// 3. cached.conn existe → retorna inmediatamente
// 4. NO crea nueva conexión (reutiliza la existente)
// 5. Retorna la conexión cacheada
//
// LLAMADAS SIMULTÁNEAS (race condition):
// Thread A: connectToDatabase()
// Thread B: connectToDatabase() (casi al mismo tiempo)
//
// Thread A:
// 1. cached.conn es null
// 2. cached.promise es null
// 3. Crea cached.promise = mongoose.connect(...)
// 4. await cached.promise (esperando...)
//
// Thread B (microsegundos después):
// 1. cached.conn es null
// 2. cached.promise EXISTE (Thread A lo creó)
// 3. NO crea nueva promesa
// 4. await cached.promise (espera LA MISMA promesa que Thread A)
//
// Resultado: Ambos threads esperan la MISMA conexión
// No se crean múltiples conexiones innecesarias
//
// ============================================
// PROPÓSITO GENERAL:
// ============================================
// Esta función implementa un patrón de conexión optimizado para:
//
// 1. REUTILIZACIÓN:
//    - Una sola conexión se reutiliza en múltiples peticiones
//    - Crucial para rendimiento en producción
//
// 2. PREVENCIÓN DE RACE CONDITIONS:
//    - Múltiples llamadas simultáneas no crean múltiples conexiones
//    - Usan la misma promesa de conexión
//
// 3. OPTIMIZACIÓN SERVERLESS:
//    - En Vercel/Lambda, las conexiones persisten entre invocaciones
//    - El cache global sobrevive entre ejecuciones de la función
//    - Reduce latencia al evitar reconexiones constantes
//
// 4. MANEJO ROBUSTO DE ERRORES:
//    - Limpia el cache si la conexión falla
//    - Permite reintentos en futuras llamadas
//
// ============================================
// PATRÓN SINGLETON:
// ============================================
// Este código implementa el patrón Singleton para conexiones a BD:
//
// CARACTERÍSTICAS:
// - Solo UNA instancia de conexión existe a la vez
// - Acceso global a esa instancia
// - Inicialización lazy (se crea cuando se necesita)
// - Thread-safe (maneja llamadas simultáneas correctamente)
//
// BENEFICIOS:
// - Ahorro de recursos (no múltiples conexiones)
// - Consistencia (todos usan la misma conexión)
// - Performance (reutilización de conexión es muy rápido)
//
// ============================================
// CACHE GLOBAL EN NODE.JS:
// ============================================
// ¿Por qué usar global y no una variable de módulo?
//
// PROBLEMA con variable de módulo:
// let connection = null;
//
// En desarrollo (Next.js HMR), los módulos se recargan
// connection se resetea a null en cada recarga
// Pierdes la conexión existente y creas una nueva
//
// SOLUCIÓN con global:
// global.mongooseCache = { ... }
//
// El objeto global NO se resetea en HMR
// La conexión persiste entre recargas del módulo
// Evita el error: "MongoError: Topology was destroyed"
//
// ============================================
// ENTORNOS SERVERLESS:
// ============================================
// Este patrón es especialmente importante en serverless:
//
// VERCEL/AWS LAMBDA:
// - Cada función serverless puede ejecutarse múltiples veces
// - El runtime puede "congelar" la función entre invocaciones
// - Variables globales persisten entre invocaciones congeladas
// - Esto permite reutilizar conexiones = latencia mucho menor
//
// SIN CACHE:
// Request 1: conectar (500ms) + query (50ms) = 550ms
// Request 2: conectar (500ms) + query (50ms) = 550ms
// Request 3: conectar (500ms) + query (50ms) = 550ms
//
// CON CACHE:
// Request 1: conectar (500ms) + query (50ms) = 550ms
// Request 2: reutilizar (0ms) + query (50ms) = 50ms  ← 10x más rápido
// Request 3: reutilizar (0ms) + query (50ms) = 50ms  ← 10x más rápido
//
// ============================================
// BUFFERCOMMANDS: FALSE
// ============================================
// ¿Qué hace esta opción?
//
// bufferCommands: true (default):
// User.find() → guarda en buffer → espera conexión → ejecuta
//
// bufferCommands: false:
// User.find() → sin conexión → lanza error inmediatamente
//
// EN SERVERLESS:
// - Queremos saber inmediatamente si no hay conexión
// - No queremos comandos esperando indefinidamente
// - Mejor fallar rápido y reintentar
// - Evita timeouts misteriosos
//
// ============================================
// USO EN TU APLICACIÓN:
// ============================================
//
// En Server Actions o API Routes:
// import { connectToDatabase } from '@/lib/database/mongoose';
// import { User } from '@/lib/database/models/user.model';
//
// export async function getUser(id: string) {
//   await connectToDatabase();  // Asegura conexión
//   const user = await User.findById(id);
//   return user;
// }
//
// Llamadas múltiples en la misma request:
// await connectToDatabase();  // Conecta (o reutiliza)
// await User.find();
// await connectToDatabase();  // Reutiliza conexión existente (instantáneo)
// await Post.find();
// await connectToDatabase();  // Reutiliza conexión existente (instantáneo)
// await Comment.find();
//
// ============================================
// ERRORES COMUNES:
// ============================================
//
// 1. "MONGODB_URI must be set within .env"
//    → Falta variable de entorno en .env
//
// 2. "MongooseError: Topology was destroyed"
//    → Múltiples conexiones sin cache (este código previene esto)
//
// 3. "MongoServerError: Authentication failed"
//    → Usuario/contraseña incorrectos en MONGODB_URI
//
// 4. "buffering timed out after 10000ms"
//    → Conexión falló y comandos quedaron en buffer
//    → bufferCommands: false previene esto