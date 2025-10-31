// ============================================
// IMPORTACIONES DE MONGOOSE
// ============================================

// Importa funciones y tipos de Mongoose (ODM - Object Document Mapper para MongoDB)
// Schema: clase para definir la estructura de documentos
// model: función para crear modelos de Mongoose
// models: objeto que contiene todos los modelos ya registrados
// Document: tipo TypeScript para documentos de MongoDB
// Model: tipo TypeScript para modelos de Mongoose
import { Schema, model, models, type Document, type Model } from 'mongoose';

// ============================================
// INTERFAZ TYPESCRIPT: WATCHLISTITEM
// ============================================
// Define la estructura de tipo TypeScript para un item de watchlist
// Extiende Document de Mongoose para heredar métodos y propiedades de documentos MongoDB
// (_id, save(), delete(), etc.)
export interface WatchlistItem extends Document {
  // userId: ID del usuario dueño de este item de watchlist
  // String porque viene de Better Auth (puede ser UUID o similar)
  // Permite asociar cada acción favorita con un usuario específico
  userId: string;
  
  // symbol: símbolo ticker de la acción (ej: 'AAPL', 'TSLA', 'GOOGL')
  // Este es el identificador único de la acción en el mercado
  symbol: string;
  
  // company: nombre completo de la empresa (ej: 'Apple Inc.', 'Tesla Inc.')
  // Se almacena para no tener que buscarlo cada vez que se muestra la lista
  company: string;
  
  // addedAt: fecha y hora en que se agregó la acción a la watchlist
  // Útil para ordenar por "añadido recientemente" o hacer análisis temporales
  addedAt: Date;
}

// ============================================
// SCHEMA DE MONGOOSE: WATCHLISTSCHEMA
// ============================================
// Define la estructura y reglas de validación para documentos en la colección 'watchlists'
// Schema<WatchlistItem> le dice a TypeScript que use la interfaz WatchlistItem
const WatchlistSchema = new Schema<WatchlistItem>(
  // ============================================
  // DEFINICIÓN DE CAMPOS
  // ============================================
  // Primer argumento: objeto con la definición de cada campo
  {
    // ============================================
    // CAMPO: userId
    // ============================================
    // Almacena el ID del usuario dueño de esta acción en watchlist
    userId: { 
      type: String,        // Tipo de dato: String
      required: true,      // Campo obligatorio: no puede ser null/undefined
      index: true          // Crea un índice en este campo para búsquedas rápidas
                          // Importante porque SIEMPRE buscarás por userId
                          // Ejemplo: "Dame todas las acciones watchlist del usuario X"
    },
    
    // ============================================
    // CAMPO: symbol
    // ============================================
    // Símbolo ticker de la acción (identificador en el mercado)
    symbol: { 
      type: String,        // Tipo de dato: String
      required: true,      // Obligatorio
      uppercase: true,     // Convierte automáticamente a mayúsculas
                          // Si guardas 'aapl', Mongoose lo convierte a 'AAPL'
                          // Importante porque los símbolos siempre son uppercase por convención
      trim: true           // Elimina espacios al inicio y final
                          // Si guardas ' AAPL ', se convierte a 'AAPL'
                          // Previene errores por espacios accidentales
    },
    
    // ============================================
    // CAMPO: company
    // ============================================
    // Nombre completo de la empresa
    company: { 
      type: String,        // Tipo de dato: String
      required: true,      // Obligatorio
      trim: true           // Elimina espacios al inicio y final
                          // ' Apple Inc. ' → 'Apple Inc.'
    },
    
    // ============================================
    // CAMPO: addedAt
    // ============================================
    // Fecha en que se agregó a la watchlist
    addedAt: { 
      type: Date,          // Tipo de dato: Date (objeto fecha de JavaScript)
      default: Date.now    // Valor por defecto: fecha/hora actual
                          // Si no especificas addedAt al crear, usa la fecha actual
                          // Date.now es una función que retorna el timestamp actual
    },
  },
  
  // ============================================
  // OPCIONES DEL SCHEMA
  // ============================================
  // Segundo argumento: opciones de configuración del schema
  { 
    // timestamps: si es true, Mongoose añade automáticamente createdAt y updatedAt
    // timestamps: false desactiva esta funcionalidad
    // En este caso no necesitas createdAt/updatedAt porque ya tienes addedAt
    timestamps: false 
  }
);

// ============================================
// ÍNDICE COMPUESTO (Composite Index)
// ============================================
// Crea un índice único en la combinación de userId + symbol
// Esto garantiza que un usuario NO pueda agregar la misma acción dos veces
WatchlistSchema.index(
  // ============================================
  // CAMPOS DEL ÍNDICE
  // ============================================
  // Objeto que define los campos incluidos en el índice
  { 
    userId: 1,    // 1 = orden ascendente
    symbol: 1     // Incluye userId y symbol en el índice
  }, 
  
  // ============================================
  // OPCIONES DEL ÍNDICE
  // ============================================
  // unique: true hace que esta combinación sea única en la base de datos
  // Si intentas insertar un documento con userId='user123' y symbol='AAPL'
  // y YA EXISTE ese par, MongoDB rechazará la inserción con un error
  { unique: true }
);

// EJEMPLO DE CÓMO FUNCIONA EL ÍNDICE ÚNICO:
// Usuario 'user123' añade 'AAPL' → ✅ Se guarda
// Usuario 'user123' añade 'TSLA' → ✅ Se guarda (diferente symbol)
// Usuario 'user456' añade 'AAPL' → ✅ Se guarda (diferente usuario)
// Usuario 'user123' añade 'AAPL' de nuevo → ❌ ERROR (duplicado)

// ============================================
// EXPORTACIÓN DEL MODELO
// ============================================
// Crea y exporta el modelo Watchlist
// Este patrón es necesario para Next.js con Hot Module Replacement (HMR)
export const Watchlist: Model<WatchlistItem> =
  // ============================================
  // PATRÓN ANTI-DUPLICACIÓN
  // ============================================
  // En desarrollo, Next.js recarga los módulos cuando cambias código (HMR)
  // Sin este patrón, Mongoose intentaría registrar el modelo múltiples veces
  // y arrojaría un error: "Cannot overwrite model once compiled"
  
  // Operador OR (||):
  // 1. Primero verifica: ¿ya existe models.Watchlist?
  //    - SI existe → usa el modelo existente (evita re-creación)
  //    - NO existe → crea un nuevo modelo con model()
  
  // (models?.Watchlist as Model<WatchlistItem>)
  // - models?: optional chaining, retorna undefined si models no existe
  // - as Model<WatchlistItem>: cast de TypeScript para tipo correcto
  
  // ||
  // - Operador OR: si la izquierda es falsy, evalúa la derecha
  
  // model<WatchlistItem>('Watchlist', WatchlistSchema)
  // - Crea un nuevo modelo con nombre 'Watchlist'
  // - Usa WatchlistSchema como definición
  // - MongoDB creará una colección llamada 'watchlists' (plural lowercase)
  (models?.Watchlist as Model<WatchlistItem>) || model<WatchlistItem>('Watchlist', WatchlistSchema);

// ============================================
// FLUJO DE TRABAJO DEL CÓDIGO:
// ============================================
//
// PRIMERA EJECUCIÓN (App inicia):
// 1. Mongoose carga este archivo
// 2. models.Watchlist no existe (undefined)
// 3. Se ejecuta model('Watchlist', WatchlistSchema)
// 4. Mongoose crea el modelo y lo registra en models.Watchlist
// 5. MongoDB crea la colección 'watchlists' si no existe
// 6. Se crean los índices definidos (userId, userId+symbol único)
//
// EJECUCIONES POSTERIORES (HMR en desarrollo):
// 1. Next.js recarga el módulo
// 2. models.Watchlist YA existe
// 3. Se usa el modelo existente (no se crea uno nuevo)
// 4. Evita error "Cannot overwrite model"
//
// ============================================
// USO DEL MODELO EN TU APP:
// ============================================
//
// EJEMPLO 1: AÑADIR ACCIÓN A WATCHLIST
// import { Watchlist } from '@/lib/database/models/watchlist.model';
//
// const addToWatchlist = async (userId: string, symbol: string, company: string) => {
//   try {
//     const item = await Watchlist.create({
//       userId,
//       symbol: 'aapl',  // Se convierte automáticamente a 'AAPL'
//       company: ' Apple Inc. ',  // Se convierte a 'Apple Inc.' (trim)
//       // addedAt se añade automáticamente con Date.now
//     });
//     return item;
//   } catch (error) {
//     // Si el usuario ya tiene AAPL, lanza error de duplicado
//     console.error('Error adding to watchlist:', error);
//   }
// };
//
// EJEMPLO 2: OBTENER WATCHLIST DE UN USUARIO
// const getUserWatchlist = async (userId: string) => {
//   // Busca todos los items donde userId coincida
//   // El índice en userId hace esta búsqueda muy rápida
//   const watchlist = await Watchlist.find({ userId })
//     .sort({ addedAt: -1 });  // Ordena por más reciente primero
//   return watchlist;
// };
//
// EJEMPLO 3: ELIMINAR DE WATCHLIST
// const removeFromWatchlist = async (userId: string, symbol: string) => {
//   await Watchlist.deleteOne({ userId, symbol: symbol.toUpperCase() });
// };
//
// EJEMPLO 4: VERIFICAR SI EXISTE EN WATCHLIST
// const isInWatchlist = async (userId: string, symbol: string): Promise<boolean> => {
//   const exists = await Watchlist.exists({ userId, symbol: symbol.toUpperCase() });
//   return !!exists;  // Convierte a boolean
// };
//
// ============================================
// PROPÓSITO GENERAL:
// ============================================
// Este modelo representa la "lista de seguimiento" o "favoritos" del usuario
// en tu aplicación de análisis bursátil.
//
// FUNCIONALIDADES QUE HABILITA:
// - Usuarios pueden marcar acciones como favoritas
// - Ver lista personalizada de acciones que les interesan
// - Recibir alertas solo de acciones en su watchlist
// - Análisis enfocado en sus inversiones preferidas
// - Dashboard personalizado con sus acciones seguidas
//
// VENTAJAS DE ESTE DISEÑO:
// 1. Índice en userId: búsquedas rápidas de watchlist por usuario
// 2. Índice único compuesto: previene duplicados automáticamente
// 3. uppercase + trim: consistencia en los datos (AAPL vs aapl vs aapl )
// 4. addedAt con default: no necesitas especificarlo al crear
// 5. Almacena company: evita llamadas API para mostrar nombres
//
// ============================================
// ESTRUCTURA EN MONGODB:
// ============================================
// Colección: 'watchlists'
// Documento ejemplo:
// {
//   _id: ObjectId("507f1f77bcf86cd799439011"),
//   userId: "user_abc123",
//   symbol: "AAPL",
//   company: "Apple Inc.",
//   addedAt: ISODate("2024-10-30T10:30:00Z")
// }
//
// Índices:
// 1. { userId: 1 }                    ← Búsquedas rápidas por usuario
// 2. { userId: 1, symbol: 1 }         ← Previene duplicados + búsqueda específica
//
// ============================================
// MONGOOSE ODM (Object Document Mapper):
// ============================================
// Mongoose es una capa sobre MongoDB que proporciona:
// - Schemas: estructura y validación de datos
// - Modelos: API para interactuar con colecciones
// - Middleware: hooks pre/post operaciones
// - Validación: reglas de negocio a nivel de schema
// - Type casting: conversión automática de tipos
// - Queries: API fluida para consultas
//
// SIN MONGOOSE (MongoDB nativo):
// db.collection('watchlists').insertOne({...})
//
// CON MONGOOSE:
// Watchlist.create({...})
//
// VENTAJAS DE MONGOOSE:
// - TypeScript integration
// - Validación automática
// - Transformaciones (uppercase, trim)
// - Índices declarativos
// - Código más limpio y mantenible