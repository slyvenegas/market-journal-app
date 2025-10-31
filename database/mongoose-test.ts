// ============================================
// IMPORTACIONES
// ============================================

// Importa la función que establece conexión con MongoDB
// Esta función maneja la lógica de conexión usando Mongoose
import { connectToDatabase } from "./mongoose";

// ============================================
// IIFE (Immediately Invoked Function Expression)
// ============================================
// Este patrón (async () => { ... })() ejecuta una función inmediatamente
// Es necesario porque:
// 1. No puedes usar 'await' en el nivel superior (top-level) en algunos entornos
// 2. Necesitas una función async para usar await
// 3. Quieres ejecutar el código inmediatamente al cargar el archivo

// Estructura del IIFE:
// (async () => {        ← Define función async anónima
//   // código aquí
// })();                 ← () al final la ejecuta inmediatamente

(async () => {
  // ============================================
  // TRY-CATCH BLOCK (Manejo de errores)
  // ============================================
  // Envuelve código que puede fallar para manejar errores gracefully
  try {
    // ============================================
    // INTENTO DE CONEXIÓN
    // ============================================
    // Intenta conectar a MongoDB usando la función importada
    // await espera a que la promesa se resuelva antes de continuar
    // Si la conexión falla, salta al bloque catch
    await connectToDatabase();
    
    // ============================================
    // MENSAJE DE ÉXITO
    // ============================================
    // Si llegamos aquí, la conexión fue exitosa
    // console.log imprime en la terminal/consola
    // ✅ es un emoji que indica éxito visualmente
    console.log("✅ MongoDB connection test successful");
    
    // ============================================
    // SALIDA EXITOSA DEL PROCESO
    // ============================================
    // process.exit(0) termina el proceso de Node.js
    // 0 = código de salida exitoso (convención en sistemas Unix/Linux)
    // En scripts/CI/CD, código 0 indica "todo salió bien"
    process.exit(0);
    
  } catch (error) {
    // ============================================
    // MANEJO DE ERRORES
    // ============================================
    // Este bloque se ejecuta si connectToDatabase() lanza un error
    // 'error' contiene información sobre qué salió mal
    
    // console.error imprime en stderr (salida de error estándar)
    // Diferente de console.log (stdout) - importante para logging/debugging
    // ❌ emoji que indica error visualmente
    console.error("❌ MongoDB connection failed:", error);
    
    // ============================================
    // SALIDA CON ERROR DEL PROCESO
    // ============================================
    // process.exit(1) termina el proceso con código de error
    // 1 = código de salida con error (convención en sistemas Unix/Linux)
    // Cualquier número > 0 indica error
    // En scripts/CI/CD, código != 0 indica "algo falló"
    process.exit(1);
  }
})();

// ============================================
// FLUJO DE TRABAJO DEL CÓDIGO:
// ============================================
//
// EJECUCIÓN:
// 1. El archivo se carga (ej: ejecutas 'node test-connection.ts')
// 2. La IIFE se ejecuta inmediatamente
// 3. Se llama a connectToDatabase()
// 4. Mongoose intenta conectar a MongoDB usando la URI en variables de entorno
//
// ESCENARIO A - CONEXIÓN EXITOSA:
// 1. connectToDatabase() se conecta exitosamente
// 2. await se resuelve sin errores
// 3. Se imprime: "✅ MongoDB connection test successful"
// 4. process.exit(0) termina el script con código de éxito
// 5. El proceso Node.js se cierra
//
// ESCENARIO B - CONEXIÓN FALLIDA:
// 1. connectToDatabase() no puede conectar (red caída, credenciales incorrectas, etc.)
// 2. Mongoose lanza un error
// 3. await lanza el error que es capturado por catch
// 4. Se imprime: "❌ MongoDB connection failed: [detalles del error]"
// 5. process.exit(1) termina el script con código de error
// 6. El proceso Node.js se cierra
//
// ============================================
// PROPÓSITO GENERAL:
// ============================================
// Este es un SCRIPT DE PRUEBA/DIAGNÓSTICO para verificar la conexión a MongoDB
// 
// NO ES PARTE DE LA APLICACIÓN PRINCIPAL - Es una utilidad de desarrollo/testing
//
// CASOS DE USO:
// 1. Verificar que las credenciales de MongoDB son correctas
// 2. Probar conectividad de red a la base de datos
// 3. Debugging cuando hay problemas de conexión
// 4. Validar configuración en diferentes entornos (dev, staging, prod)
// 5. Parte de health checks en CI/CD pipelines
// 6. Verificar que MongoDB está corriendo y accesible
//
// ============================================
// CÓMO USAR ESTE SCRIPT:
// ============================================
//
// OPCIÓN 1 - Node.js directo (si es JavaScript):
// $ node lib/database/test-connection.js
//
// OPCIÓN 2 - Con ts-node (si es TypeScript):
// $ npx ts-node lib/database/test-connection.ts
//
// OPCIÓN 3 - Con un script en package.json:
// // En package.json:
// {
//   "scripts": {
//     "test:db": "ts-node lib/database/test-connection.ts"
//   }
// }
// // Luego ejecutas:
// $ npm run test:db
//
// ============================================
// SALIDA ESPERADA:
// ============================================
//
// SI TODO ESTÁ BIEN:
// ✅ MongoDB connection test successful
// [El proceso termina con código 0]
//
// SI HAY UN ERROR:
// ❌ MongoDB connection failed: MongoServerError: Authentication failed
// [Detalles del error...]
// [El proceso termina con código 1]
//
// ============================================
// CÓDIGOS DE SALIDA (Exit Codes):
// ============================================
// Los códigos de salida son convenciones en sistemas operativos:
//
// 0 = Éxito
// - El programa completó su tarea sin errores
// - En scripts de CI/CD, permite continuar el pipeline
//
// 1 (o cualquier número > 0) = Error
// - El programa encontró un error
// - En scripts de CI/CD, detiene el pipeline
// - Diferentes números pueden indicar diferentes tipos de error
//
// EJEMPLO EN CI/CD (GitHub Actions, GitLab CI):
// - Script termina con 0 → build continúa
// - Script termina con 1 → build falla, no se despliega
//
// ============================================
// PATRÓN IIFE ASYNC:
// ============================================
// ¿Por qué usar IIFE en lugar de código directo?
//
// NO FUNCIONA (top-level await sin IIFE en algunos entornos):
// await connectToDatabase();  // ❌ SyntaxError en Node.js < 14.8
//
// FUNCIONA (IIFE async):
// (async () => {
//   await connectToDatabase();  // ✅ Funciona en todas las versiones
// })();
//
// ALTERNATIVA MODERNA (Node.js 14.8+ con ES Modules):
// // En package.json: "type": "module"
// await connectToDatabase();  // ✅ Top-level await
//
// ============================================
// VARIABLES DE ENTORNO NECESARIAS:
// ============================================
// Este script requiere que tengas configuradas las variables de entorno:
//
// .env o .env.local:
// MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/database
//
// O para MongoDB local:
// MONGODB_URI=mongodb://localhost:27017/signalist
//
// Si falta MONGODB_URI, connectToDatabase() fallará
//
// ============================================
// ERRORES COMUNES:
// ============================================
//
// 1. MongoServerError: Authentication failed
//    → Usuario/contraseña incorrectos en MONGODB_URI
//
// 2. MongoNetworkError: connection refused
//    → MongoDB no está corriendo o firewall bloquea conexión
//
// 3. MongooseServerSelectionError: Could not connect to any servers
//    → URI incorrecta, MongoDB Atlas IP whitelist, o red sin conexión
//
// 4. Error: MONGODB_URI is not defined
//    → Variable de entorno falta en .env
//
// ============================================
// INTEGRACIÓN CON CI/CD:
// ============================================
// Este script es perfecto para pipelines de CI/CD:
//
// # GitHub Actions ejemplo:
// - name: Test MongoDB Connection
//   run: npm run test:db
//   env:
//     MONGODB_URI: ${{ secrets.MONGODB_URI }}
//
// Si el test falla (exit code 1), el build se detiene
// Si el test pasa (exit code 0), el build continúa
//
// ============================================
// ALTERNATIVAS Y MEJORAS:
// ============================================
//
// VERSIÓN CON MÁS INFO:
// (async () => {
//   try {
//     const startTime = Date.now();
//     await connectToDatabase();
//     const duration = Date.now() - startTime;
//     console.log(`✅ Connected in ${duration}ms`);
//     process.exit(0);
//   } catch (error) {
//     console.error("❌ Connection failed:", error.message);
//     console.error("Stack:", error.stack);
//     process.exit(1);
//   }
// })();
//
// VERSIÓN CON TIMEOUT:
// const timeout = setTimeout(() => {
//   console.error("❌ Connection timeout after 10s");
//   process.exit(1);
// }, 10000);
//
// (async () => {
//   try {
//     await connectToDatabase();
//     clearTimeout(timeout);
//     console.log("✅ Connected successfully");
//     process.exit(0);
//   } catch (error) {
//     clearTimeout(timeout);
//     console.error("❌ Connection failed:", error);
//     process.exit(1);
//   }
// })();
//
// ============================================
// DIFERENCIA ENTRE SCRIPT VS MÓDULO:
// ============================================
// Este es un SCRIPT (se ejecuta directamente):
// - Se ejecuta cuando lo llamas: node test-connection.js
// - Termina con process.exit()
// - No exporta nada
// - Propósito: testing/diagnóstico
//
// Un MÓDULO (se importa en otros archivos):
// - export function testConnection() { ... }
// - NO usa process.exit()
// - Se importa: import { testConnection } from '...'
// - Propósito: funcionalidad reutilizable