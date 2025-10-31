// ============================================
// DIRECTIVA ESLINT
// ============================================
/* eslint-disable @typescript-eslint/no-explicit-any */
// Desactiva la regla de TypeScript que prohíbe usar 'any'
// Necesario porque react-hook-form usa Control<any> para mayor flexibilidad
// En producción, idealmente deberías tipar esto con tu tipo de formulario exacto

// ============================================
// DIRECTIVA 'USE CLIENT'
// ============================================
'use client';
// Este componente necesita ejecutarse en el cliente porque:
// - Usa useState para manejar estado local
// - Tiene interactividad (abrir/cerrar popover, búsqueda)
// - Usa eventos del navegador

// ============================================
// IMPORTACIONES
// ============================================

// Importa useState de React para manejar el estado de apertura/cierre del popover
import { useState } from 'react';

// Importa tipos y componentes de react-hook-form
// Control: tipo para el objeto de control del formulario
// Controller: componente HOC que conecta inputs personalizados con react-hook-form
// FieldError: tipo para los errores de validación
import { Control, Controller, FieldError } from 'react-hook-form';

// Importa componentes de Popover de shadcn/ui
// Popover es un contenedor flotante que aparece al hacer clic
// Similar a un dropdown pero más flexible
import {
    Popover,        // Contenedor principal
    PopoverContent, // Contenido del popover (la lista de países)
    PopoverTrigger, // Elemento que abre el popover (el botón)
} from '@/components/ui/popover';

// Importa componentes de Command de shadcn/ui
// Command es un componente de búsqueda y selección tipo "command palette"
// Similar al Command+K de VSCode o Spotlight de Mac
import {
    Command,        // Contenedor principal del command
    CommandEmpty,   // Mensaje cuando no hay resultados
    CommandGroup,   // Agrupa items relacionados
    CommandInput,   // Input de búsqueda
    CommandItem,    // Cada opción seleccionable
    CommandList,    // Lista scrolleable de items
} from '@/components/ui/command';

// Importa el componente Button de shadcn/ui
import { Button } from '@/components/ui/button';

// Importa el componente Label para etiquetas de formulario
import { Label } from '@/components/ui/label';

// Importa iconos de lucide-react (librería de iconos)
// Check: icono de checkmark/palomita para items seleccionados
// ChevronsUpDown: icono de flechas arriba/abajo para indicar dropdown
import { Check, ChevronsUpDown } from 'lucide-react';

// Importa utilidad cn (className utility) para combinar clases CSS condicionalmente
// Probablemente usa clsx o tailwind-merge internamente
import { cn } from '@/lib/utils';

// Importa librería que proporciona lista completa de países
// Incluye códigos ISO (US, GB, MX) y nombres completos
import countryList from 'react-select-country-list';

// ============================================
// TIPOS TYPESCRIPT
// ============================================

// Define el tipo para las props del componente CountrySelectField (el wrapper público)
type CountrySelectProps = {
    name: string;              // Nombre del campo en el formulario (ej: 'country')
    label: string;             // Etiqueta visible (ej: 'Country')
    control: Control<any>;     // Objeto de control de react-hook-form
    error?: FieldError;        // Error de validación (opcional)
    required?: boolean;        // Si el campo es obligatorio (opcional, default: false)
};

// ============================================
// COMPONENTE INTERNO: COUNTRYSELECT
// ============================================
// Este es el componente "presentacional" que maneja la UI del selector
// Separado del wrapper para mantener la lógica de react-hook-form aparte
const CountrySelect = ({
    value,    // Valor actual seleccionado (código del país, ej: 'US')
    onChange, // Función callback para actualizar el valor
}: {
    value: string;
    onChange: (value: string) => void;
}) => {
    // ============================================
    // ESTADO LOCAL
    // ============================================
    // Estado que controla si el popover está abierto o cerrado
    // true = popover visible, false = popover oculto
    const [open, setOpen] = useState(false);

    // ============================================
    // OBTENCIÓN DE DATOS DE PAÍSES
    // ============================================
    // countryList() crea una instancia de la librería
    // getData() retorna un array de objetos: [{ value: 'US', label: 'United States' }, ...]
    // Este array contiene todos los países del mundo con sus códigos ISO
    const countries = countryList().getData();

    // ============================================
    // FUNCIÓN HELPER: CONVERTIR CÓDIGO A BANDERA EMOJI
    // ============================================
    // Convierte un código de país (ej: 'US') en su emoji de bandera (🇺🇸)
    const getFlagEmoji = (countryCode: string) => {
        // Algoritmo para convertir código ISO a emoji:
        // 1. Convierte el código a mayúsculas ('us' → 'US')
        // 2. Divide en caracteres individuales (['U', 'S'])
        // 3. Convierte cada letra a su "Regional Indicator Symbol"
        //    - 'U' (Unicode 85) → 127462 (🇺)
        //    - 'S' (Unicode 83) → 127480 (🇸)
        //    - Formula: 127397 + código ASCII de la letra
        const codePoints = countryCode
            .toUpperCase()                           // 'us' → 'US'
            .split('')                               // ['U', 'S']
            .map((char) => 127397 + char.charCodeAt(0)); // [127462, 127480]
        
        // 4. Convierte los code points en el emoji de bandera
        // String.fromCodePoint combina los símbolos regionales en una bandera
        // [127462, 127480] → '🇺🇸'
        return String.fromCodePoint(...codePoints);
    };

    // ============================================
    // RENDERIZADO DEL SELECTOR
    // ============================================
    return (
        // ============================================
        // POPOVER CONTAINER
        // ============================================
        // Componente principal que maneja el estado de apertura/cierre
        // open: estado actual (abierto/cerrado)
        // onOpenChange: callback cuando el estado cambia
        <Popover open={open} onOpenChange={setOpen}>
            
            {/* ============================================
                TRIGGER BUTTON (Botón que abre el popover)
                ============================================ */}
            {/* asChild: hace que PopoverTrigger pase sus props al hijo Button
                sin crear un wrapper div adicional */}
            <PopoverTrigger asChild>
                <Button
                    variant='outline'                  // Estilo outline (borde sin relleno sólido)
                    role='combobox'                    // Rol ARIA para accesibilidad
                    aria-expanded={open}               // Indica a lectores de pantalla si está expandido
                    className='country-select-trigger' // Clase CSS personalizada
                >
                    {/* ============================================
                        CONTENIDO DEL BOTÓN (Condicional)
                        ============================================ */}
                    {/* Si hay un valor seleccionado, muestra bandera + nombre del país */}
                    {value ? (
                        <span className='flex items-center gap-2'>
                            {/* Emoji de la bandera del país */}
                            <span>{getFlagEmoji(value)}</span>
                            
                            {/* Nombre completo del país */}
                            {/* Busca en el array de países el que coincida con el value */}
                            {/* find() retorna el objeto país, ?.label obtiene su nombre */}
                            <span>{countries.find((c) => c.value === value)?.label}</span>
                        </span>
                    ) : (
                        // Si NO hay valor, muestra placeholder
                        'Select your country...'
                    )}
                    
                    {/* ============================================
                        ICONO DE CHEVRON (flechas arriba/abajo)
                        ============================================ */}
                    {/* Icono que indica que es un dropdown */}
                    {/* ml-2: margin left de 0.5rem */}
                    {/* h-4 w-4: tamaño de 1rem (16px) */}
                    {/* shrink-0: no se encoge si falta espacio */}
                    {/* opacity-50: semi-transparente para menor énfasis */}
                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                </Button>
            </PopoverTrigger>
            
            {/* ============================================
                POPOVER CONTENT (Contenido flotante)
                ============================================ */}
            {/* Contenedor del dropdown que aparece al hacer clic */}
            <PopoverContent
                className='w-full p-0 bg-gray-800 border-gray-600' // Estilos: ancho completo, sin padding, fondo oscuro
                align='start'                                       // Alineación: empieza en el borde izquierdo del trigger
            >
                {/* ============================================
                    COMMAND COMPONENT (Búsqueda y selección)
                    ============================================ */}
                {/* Command proporciona funcionalidad de búsqueda tipo "command palette" */}
                <Command className='bg-gray-800 border-gray-600'>
                    
                    {/* ============================================
                        INPUT DE BÚSQUEDA
                        ============================================ */}
                    {/* Campo de texto para filtrar países */}
                    {/* El usuario puede escribir para buscar */}
                    <CommandInput
                        placeholder='Search countries...'
                        className='country-select-input'
                    />
                    
                    {/* ============================================
                        MENSAJE CUANDO NO HAY RESULTADOS
                        ============================================ */}
                    {/* Se muestra si la búsqueda no encuentra ningún país */}
                    <CommandEmpty className='country-select-empty'>
                        No country found.
                    </CommandEmpty>
                    
                    {/* ============================================
                        LISTA DE PAÍSES
                        ============================================ */}
                    {/* Lista scrolleable con todos los países */}
                    {/* max-h-60: altura máxima de 15rem (240px) */}
                    {/* scrollbar-hide-default: oculta la scrollbar por defecto */}
                    <CommandList className='max-h-60 bg-gray-800 scrollbar-hide-default'>
                        
                        {/* ============================================
                            GRUPO DE COMANDOS
                            ============================================ */}
                        {/* Agrupa todos los países (podrías tener múltiples grupos) */}
                        <CommandGroup className='bg-gray-800'>
                            
                            {/* ============================================
                                MAPEO DE PAÍSES A ITEMS
                                ============================================ */}
                            {/* Itera sobre cada país y crea un item seleccionable */}
                            {countries.map((country) => (
                                <CommandItem
                                    key={country.value}                              // Key única (ej: 'US', 'MX')
                                    value={`${country.label} ${country.value}`}      // Valor de búsqueda (incluye nombre y código)
                                    onSelect={() => {                                // Callback cuando se selecciona
                                        onChange(country.value);                     // Actualiza el valor del formulario
                                        setOpen(false);                              // Cierra el popover
                                    }}
                                    className='country-select-item'                  // Clase CSS personalizada
                                >
                                    {/* ============================================
                                        ICONO DE CHECK (Indicador de selección)
                                        ============================================ */}
                                    {/* Muestra un checkmark si este país está seleccionado */}
                                    {/* cn() combina clases condicionalmente */}
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4 text-yellow-500',           // Estilos base: margen, tamaño, color amarillo
                                            // Condicional: si este país está seleccionado, opacity 100%, si no, 0% (invisible)
                                            value === country.value ? 'opacity-100' : 'opacity-0'
                                        )}
                                    />
                                    
                                    {/* ============================================
                                        BANDERA Y NOMBRE DEL PAÍS
                                        ============================================ */}
                                    {/* Contenedor flex con la bandera y el nombre */}
                                    <span className='flex items-center gap-2'>
                                        {/* Emoji de la bandera */}
                                        <span>{getFlagEmoji(country.value)}</span>
                                        
                                        {/* Nombre completo del país */}
                                        <span>{country.label}</span>
                                    </span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

// ============================================
// COMPONENTE EXPORTADO: COUNTRYSELECTFIELD
// ============================================
// Este es el componente "wrapper" que integra el selector con react-hook-form
// Es el componente que usas en tus formularios
export const CountrySelectField = ({
    name,                    // Nombre del campo (ej: 'country')
    label,                   // Etiqueta visible (ej: 'Country')
    control,                 // Control de react-hook-form
    error,                   // Error de validación (si existe)
    required = false,        // Si es obligatorio (default: false)
}: CountrySelectProps) => {
    return (
        // ============================================
        // CONTENEDOR DEL CAMPO
        // ============================================
        // Wrapper con espaciado vertical entre elementos
        <div className='space-y-2'>
            
            {/* ============================================
                LABEL DEL CAMPO
                ============================================ */}
            {/* Etiqueta del campo (ej: "Country") */}
            {/* htmlFor vincula la etiqueta con el campo (accesibilidad) */}
            <Label htmlFor={name} className='form-label'>
                {label}
            </Label>
            
            {/* ============================================
                CONTROLLER DE REACT-HOOK-FORM
                ============================================ */}
            {/* Controller es un HOC (Higher Order Component) que conecta
                componentes personalizados con react-hook-form */}
            <Controller
                name={name}                                          // Nombre del campo en el formulario
                control={control}                                    // Objeto control del formulario
                rules={{                                             // Reglas de validación
                    // Si required es true, el campo es obligatorio
                    // Si es false, no hay validación
                    required: required ? `Please select ${label.toLowerCase()}` : false,
                }}
                render={({ field }) => (
                    // render recibe un objeto 'field' con value y onChange
                    // Los pasa al componente CountrySelect
                    // Esto conecta el estado del formulario con el selector personalizado
                    <CountrySelect 
                        value={field.value}      // Valor actual del formulario
                        onChange={field.onChange} // Función para actualizar el valor
                    />
                )}
            />
            
            {/* ============================================
                MENSAJE DE ERROR
                ============================================ */}
            {/* Se muestra solo si hay un error de validación */}
            {/* Por ejemplo: si el campo es required y el usuario no selecciona nada */}
            {error && <p className='text-sm text-red-500'>{error.message}</p>}
            
            {/* ============================================
                TEXTO DE AYUDA
                ============================================ */}
            {/* Mensaje informativo que explica para qué sirve este campo */}
            {/* Ayuda al usuario a entender por qué se pide esta información */}
            <p className='text-xs text-gray-500'>
                Helps us show market data and news relevant to you.
            </p>
        </div>
    );
};

// ============================================
// FLUJO DE TRABAJO DEL CÓDIGO:
// ============================================
//
// RENDERIZADO INICIAL:
// 1. CountrySelectField se renderiza con las props del formulario
// 2. Controller conecta el campo con react-hook-form
// 3. CountrySelect se renderiza con el valor inicial (ej: 'US')
// 4. El botón muestra 🇺🇸 United States
// 5. El popover está cerrado (open = false)
//
// CUANDO EL USUARIO HACE CLIC EN EL BOTÓN:
// 1. PopoverTrigger detecta el clic
// 2. setOpen(true) cambia el estado
// 3. PopoverContent se vuelve visible
// 4. Command renderiza la lista de países
// 5. countryList().getData() proporciona ~250 países
// 6. Se muestran todos con sus banderas y nombres
//
// CUANDO EL USUARIO BUSCA:
// 1. Usuario escribe en CommandInput (ej: "mexi")
// 2. Command filtra automáticamente los países
// 3. Solo se muestran países que coincidan (ej: "Mexico")
// 4. Si no hay coincidencias, muestra "No country found."
//
// CUANDO EL USUARIO SELECCIONA UN PAÍS:
// 1. Usuario hace clic en un CommandItem (ej: "Mexico")
// 2. onSelect se ejecuta
// 3. onChange(country.value) actualiza el valor ('MX')
// 4. El valor se propaga a react-hook-form a través de Controller
// 5. setOpen(false) cierra el popover
// 6. El botón ahora muestra 🇲🇽 Mexico
// 7. El check aparece junto a Mexico en la lista
//
// VALIDACIÓN:
// 1. Si el campo es required y el usuario no selecciona nada
// 2. Al intentar enviar el formulario, react-hook-form valida
// 3. Si falta el país, genera un error
// 4. Controller pasa el error al componente
// 5. Se muestra el mensaje: "Please select country"
//
// ============================================
// PROPÓSITO GENERAL:
// ============================================
// Este componente crea un selector de países sofisticado con:
// - Búsqueda en tiempo real
// - Banderas emoji para cada país
// - Integración con react-hook-form
// - Validación automática
// - UI moderna con popover
// - Accesibilidad (ARIA roles)
// - Indicador visual de selección
//
// VENTAJAS DE ESTE DISEÑO:
// 1. Reutilizable: se puede usar en cualquier formulario
// 2. Búsqueda: fácil encontrar países entre 250+ opciones
// 3. Visual: las banderas ayudan a identificar rápido
// 4. Validación: integrada con react-hook-form
// 5. UX: se cierra automáticamente al seleccionar
// 6. Accesible: usa roles ARIA correctos
// 7. Performante: virtual scrolling con Command
//
// PATRONES IMPLEMENTADOS:
// - Compound Components (Popover + Command)
// - Controlled Components (react-hook-form)
// - Render Props (Controller)
// - Helper Functions (getFlagEmoji)
// - Conditional Rendering (error messages, checkmark)