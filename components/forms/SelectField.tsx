// ============================================
// IMPORTACIONES
// ============================================

// Importa el componente Label de shadcn/ui
// Label es una etiqueta <label> estilizada para formularios
import {Label} from "@/components/ui/label";

// Importa Controller de react-hook-form
// Controller es un componente HOC (Higher Order Component) necesario para conectar
// componentes de UI complejos (como selects personalizados) con react-hook-form
// Los inputs simples usan register(), pero selects personalizados necesitan Controller
import {Controller} from "react-hook-form";

// Importa componentes del Select de shadcn/ui
// Select es un dropdown personalizado y estilizado (no usa <select> nativo HTML)
import {
    Select,          // Componente contenedor principal del select
    SelectContent,   // Contenedor del dropdown (la lista que se despliega)
    SelectItem,      // Cada opción individual en la lista
    SelectTrigger,   // El botón/campo que abre el dropdown
    SelectValue,     // Muestra el valor seleccionado actual
} from "@/components/ui/select"

// ============================================
// COMPONENTE SELECTFIELD
// ============================================
// Componente reutilizable que encapsula un campo select completo con:
// - Label (etiqueta)
// - Select (dropdown personalizado)
// - Validación integrada con react-hook-form
// - Mensaje de error
const SelectField = ({ 
    name,                // Identificador único del campo (ej: 'investmentGoals', 'riskTolerance')
    label,               // Texto de la etiqueta visible (ej: 'Investment Goals', 'Risk Tolerance')
    placeholder,         // Texto que se muestra cuando no hay selección (ej: 'Select your goal...')
    options,             // Array de opciones disponibles [{ value: 'Growth', label: 'Growth' }, ...]
    control,             // Objeto control de react-hook-form (necesario para Controller)
    error,               // Objeto de error de validación (si existe)
    required = false     // Boolean que indica si el campo es obligatorio (default: false)
}: SelectFieldProps) => {
    return (
        // ============================================
        // CONTENEDOR DEL CAMPO
        // ============================================
        // Wrapper que agrupa label, select y mensaje de error
        // space-y-2: añade espacio vertical de 0.5rem entre elementos hijos
        <div className="space-y-2">
            
            {/* ============================================
                LABEL (Etiqueta del campo)
                ============================================ */}
            {/* Etiqueta que describe el campo de selección */}
            {/* htmlFor: vincula la etiqueta con el select (accesibilidad) */}
            {/* form-label: clase CSS personalizada para estilos consistentes */}
            <Label htmlFor={name} className="form-label">
                {/* Texto de la etiqueta (ej: 'Investment Goals') */}
                {label}
            </Label>

            {/* ============================================
                CONTROLLER (Integración con react-hook-form)
                ============================================ */}
            {/* Controller es necesario porque Select es un componente personalizado complejo */}
            {/* Los componentes nativos usan register(), pero los personalizados necesitan Controller */}
            <Controller
                // ============================================
                // PROPS DE CONTROLLER
                // ============================================
                
                // name: identificador del campo en el formulario
                // Este es el key que usarás para acceder al valor: formData.investmentGoals
                name={name}
                
                // control: objeto de control de react-hook-form
                // Conecta este Controller con el formulario padre
                // Pasado desde el useForm() del componente padre
                control={control}
                
                // ============================================
                // REGLAS DE VALIDACIÓN
                // ============================================
                // rules: objeto con las reglas de validación
                rules={{
                    // required: si el campo es obligatorio
                    // Si required prop es true, el campo es obligatorio
                    // Si es false, no se valida (el campo es opcional)
                    // El mensaje de error se genera dinámicamente: "Please select investment goals"
                    required: required ? `Please select ${label.toLowerCase()}` : false,
                }}
                
                // ============================================
                // RENDER PROP
                // ============================================
                // render: función que recibe { field } y retorna el componente UI
                // field contiene: { value, onChange, onBlur, ref, name }
                // Estos son los métodos que Controller proporciona para conectar con el formulario
                render={({ field }) => (
                    // ============================================
                    // SELECT COMPONENT (shadcn/ui)
                    // ============================================
                    // Componente Select personalizado que reemplaza <select> nativo
                    // Proporciona mejor estilización y control
                    <Select 
                        // value: valor actual seleccionado (ej: 'Growth', 'Medium')
                        // field.value viene del estado del formulario en react-hook-form
                        value={field.value} 
                        
                        // onValueChange: función que se ejecuta cuando el usuario selecciona una opción
                        // field.onChange actualiza el valor en react-hook-form
                        // Nota: Select usa onValueChange (no onChange como inputs normales)
                        onValueChange={field.onChange}
                    >
                        {/* ============================================
                            SELECT TRIGGER (Botón/Campo clickeable)
                            ============================================ */}
                        {/* El elemento que el usuario ve y hace clic para abrir el dropdown */}
                        {/* select-trigger: clase CSS personalizada para estilos */}
                        <SelectTrigger className="select-trigger">
                            {/* SelectValue muestra el texto del item seleccionado */}
                            {/* Si no hay selección, muestra el placeholder */}
                            {/* Ejemplo: si value='Growth', busca en options y muestra 'Growth' */}
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        
                        {/* ============================================
                            SELECT CONTENT (Dropdown/Lista desplegable)
                            ============================================ */}
                        {/* Contenedor del dropdown que aparece al hacer clic en el trigger */}
                        {/* bg-gray-800: fondo gris oscuro (tema dark) */}
                        {/* border-gray-600: borde gris medio */}
                        {/* text-white: texto blanco para contraste en fondo oscuro */}
                        <SelectContent className="bg-gray-800 border-gray-600 text-white">
                            
                            {/* ============================================
                                MAPEO DE OPCIONES
                                ============================================ */}
                            {/* Itera sobre el array de opciones y crea un SelectItem por cada una */}
                            {/* options es un array como: */}
                            {/* [ */}
                            {/*   { value: 'Growth', label: 'Growth' }, */}
                            {/*   { value: 'Income', label: 'Income' }, */}
                            {/*   { value: 'Preservation', label: 'Capital Preservation' } */}
                            {/* ] */}
                            {options.map((option) => (
                                // ============================================
                                // SELECT ITEM (Cada opción individual)
                                // ============================================
                                <SelectItem 
                                    // value: el valor que se guardará en el formulario
                                    // Este es el valor interno (ej: 'Growth')
                                    value={option.value} 
                                    
                                    // key: identificador único para React (necesario en listas)
                                    key={option.value} 
                                    
                                    // Clases CSS para estilos del item
                                    // focus:bg-gray-600: fondo gris al hacer hover/focus
                                    // focus:text-white: texto blanco al hacer hover/focus
                                    className="focus:bg-gray-600 focus:text-white"
                                >
                                    {/* Texto visible de la opción (ej: 'Growth', 'Capital Preservation') */}
                                    {/* Este es lo que el usuario ve en la lista */}
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                        
                        {/* ============================================
                            MENSAJE DE ERROR (Condicional)
                            ============================================ */}
                        {/* Se renderiza SOLO si existe un error de validación */}
                        {/* Nota: Este error está DENTRO del Select pero debería estar FUERA */}
                        {/* (Probablemente un pequeño bug en el código original) */}
                        {error && <p className="text-sm text-red-500">{error.message}</p>}
                    </Select>
                )}
            />
        </div>
    )
}

// ============================================
// EXPORTACIÓN
// ============================================
// Exporta el componente para usarlo en formularios
export default SelectField

// ============================================
// FLUJO DE TRABAJO DEL CÓDIGO:
// ============================================
//
// RENDERIZADO INICIAL:
// 1. El formulario padre (SignUp) renderiza SelectField
// 2. Pasa las props necesarias:
//    - name: 'investmentGoals'
//    - label: 'Investment Goals'
//    - placeholder: 'Select your investment goal'
//    - options: [{ value: 'Growth', label: 'Growth' }, ...]
//    - control: objeto de react-hook-form
//    - required: true
// 3. SelectField renderiza:
//    - Label con texto 'Investment Goals'
//    - Controller que conecta con react-hook-form
//    - Select con el valor inicial (ej: 'Growth' del defaultValue)
//    - SelectTrigger muestra 'Growth' o el placeholder si está vacío
//
// CUANDO EL USUARIO HACE CLIC EN EL SELECT:
// 1. Usuario hace clic en el SelectTrigger
// 2. SelectContent se abre (dropdown aparece)
// 3. Se muestran todas las opciones del array options
// 4. Cada opción es un SelectItem clickeable
//
// CUANDO EL USUARIO SELECCIONA UNA OPCIÓN:
// 1. Usuario hace clic en un SelectItem (ej: 'Income')
// 2. onValueChange se ejecuta con el nuevo valor ('Income')
// 3. field.onChange('Income') actualiza el valor en react-hook-form
// 4. El estado del formulario se actualiza
// 5. SelectTrigger ahora muestra 'Income'
// 6. SelectContent se cierra automáticamente
//
// VALIDACIÓN:
// 1. Si required=true y el usuario no selecciona nada
// 2. Al intentar enviar el formulario, react-hook-form valida
// 3. Si el campo está vacío, genera un error
// 4. Controller detecta el error y lo pasa al componente
// 5. Se muestra: "Please select investment goals"
//
// ============================================
// PROPÓSITO GENERAL:
// ============================================
// Este componente encapsula un campo select personalizado completo con:
// - Integración con react-hook-form
// - Validación automática
// - Estilos consistentes (tema oscuro)
// - Mensaje de error integrado
// - API simple y reutilizable
//
// VENTAJAS SOBRE <select> NATIVO:
// 1. Estilización completa y consistente
// 2. No limitado por estilos nativos del navegador
// 3. Mejor UX con animaciones y transiciones
// 4. Estados hover/focus personalizados
// 5. Tema oscuro integrado
// 6. Mejor accesibilidad (ARIA roles)
//
// ============================================
// CASOS DE USO EN TU APP:
// ============================================
//
// 1. OBJETIVOS DE INVERSIÓN (SignUp):
// <SelectField
//   name="investmentGoals"
//   label="Investment Goals"
//   placeholder="Select your investment goal"
//   options={INVESTMENT_GOALS}           // [{ value: 'Growth', label: 'Growth' }, ...]
//   control={control}
//   error={errors.investmentGoals}
//   required
// />
//
// 2. TOLERANCIA AL RIESGO (SignUp):
// <SelectField
//   name="riskTolerance"
//   label="Risk Tolerance"
//   placeholder="Select your risk level"
//   options={RISK_TOLERANCE_OPTIONS}     // [{ value: 'Low', label: 'Conservative' }, ...]
//   control={control}
//   error={errors.riskTolerance}
//   required
// />
//
// 3. INDUSTRIA PREFERIDA (SignUp):
// <SelectField
//   name="preferredIndustry"
//   label="Preferred Industry"
//   placeholder="Select your preferred industry"
//   options={PREFERRED_INDUSTRIES}       // [{ value: 'Technology', label: 'Technology' }, ...]
//   control={control}
//   error={errors.preferredIndustry}
//   required
// />
//
// ============================================
// DIFERENCIAS CON INPUTFIELD:
// ============================================
//
// InputField:
// - Usa register() directamente con {...register(name, validation)}
// - Para inputs simples (text, password, email, number)
// - onChange nativo del HTML
//
// SelectField:
// - Usa Controller porque Select es un componente personalizado complejo
// - Para dropdowns/selects personalizados
// - onValueChange personalizado (no onChange)
// - Necesita render prop para conectar field.value y field.onChange
//
// ============================================
// ESTRUCTURA DE OPTIONS:
// ============================================
// El array options debe tener esta estructura:
//
// const INVESTMENT_GOALS = [
//   { value: 'Growth', label: 'Growth' },
//   { value: 'Income', label: 'Income' },
//   { value: 'Preservation', label: 'Capital Preservation' },
//   { value: 'Speculation', label: 'Speculation' }
// ]
//
// - value: lo que se guarda en el formulario (interno)
// - label: lo que el usuario ve en la interfaz (externo)
//
// value y label pueden ser diferentes:
// { value: 'tech', label: 'Technology Sector' }
//
// ============================================
// CONTROLLER VS REGISTER:
// ============================================
//
// ¿Por qué SelectField usa Controller en lugar de register?
//
// register() funciona con inputs nativos HTML que tienen:
// - Atributo 'name'
// - Evento onChange que retorna event.target.value
// - Referencia DOM directa
//
// Select personalizado de shadcn/ui:
// - No es un <select> nativo HTML
// - Usa onValueChange (no onChange)
// - No tiene event.target.value
// - Retorna el valor directamente, no un evento
//
// Controller proporciona una capa de abstracción que:
// - Convierte field.onChange para que funcione con onValueChange
// - Maneja el valor de forma controlada
// - Conecta componentes personalizados con react-hook-form
//
// ============================================
// NOTA: POSIBLE BUG
// ============================================
// El mensaje de error está dentro de <Select>:
//
// <Select>
//   ...
//   {error && <p>...</p>}
// </Select>
//
// Debería estar FUERA del Select, después del Controller:
//
// <Controller
//   ...
//   render={...}
// />
// {error && <p>...</p>}
//
// Esto podría causar problemas de renderizado o estilos.
// Es mejor mover el error message fuera del Select.
//
// ============================================
// PATRÓN DE DISEÑO:
// ============================================
// Este componente implementa el patrón "Controlled Component Wrapper":
// - Envuelve un componente UI complejo (Select)
// - Lo conecta con un sistema de formularios (react-hook-form)
// - Proporciona validación y manejo de errores
// - Expone una API simple y declarativa
//
// PRINCIPIOS APLICADOS:
// - Abstraction: oculta la complejidad de Controller y Select
// - Reusability: se puede usar con cualquier lista de opciones
// - Consistency: todos los selects se ven y comportan igual
// - Integration: conecta perfectamente con react-hook-form