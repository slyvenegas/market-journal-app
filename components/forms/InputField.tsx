// ============================================
// IMPORTACIONES
// ============================================

// Importa React (necesario en algunos casos para JSX, aunque en versiones modernas es opcional)
import React from 'react'

// Importa el componente Label de shadcn/ui
// Label es una etiqueta <label> estilizada y accesible para formularios
import {Label} from "@/components/ui/label";

// Importa el componente Input de shadcn/ui
// Input es un campo de entrada <input> con estilos predefinidos y consistentes
import {Input} from "@/components/ui/input";

// Importa la utilidad cn para combinar clases CSS condicionalmente
// Útil para aplicar estilos dinámicos basados en props o estado
import {cn} from "@/lib/utils";

// ============================================
// COMPONENTE INPUTFIELD
// ============================================
// Componente reutilizable que encapsula un campo de entrada de formulario completo
// Incluye: label, input, validación y mensaje de error
// Se usa en formularios de login, registro, y cualquier otro formulario de la app
const InputField = ({ 
    name,           // Nombre único del campo (key en el formulario, ej: 'email', 'password')
    label,          // Texto de la etiqueta visible (ej: 'Email', 'Password')
    placeholder,    // Texto placeholder dentro del input (ej: 'Enter your email')
    type = "text",  // Tipo de input HTML (text, password, email, number, etc.) - default: 'text'
    register,       // Función register de react-hook-form para conectar el input
    error,          // Objeto de error de validación (contiene mensaje de error si existe)
    validation,     // Objeto con reglas de validación (required, minLength, pattern, etc.)
    disabled,       // Boolean que indica si el campo está deshabilitado
    value           // Valor controlado del input (opcional, para inputs controlados)
}: FormInputProps) => {
    return (
        // ============================================
        // CONTENEDOR DEL CAMPO
        // ============================================
        // Wrapper que agrupa label, input y mensaje de error
        // space-y-2: añade espacio vertical de 0.5rem entre elementos hijos
        <div className="space-y-2">
            
            {/* ============================================
                LABEL (Etiqueta del campo)
                ============================================ */}
            {/* Etiqueta que describe el campo de entrada */}
            {/* htmlFor: vincula la etiqueta con el input usando el 'name' */}
            {/*   - Mejora accesibilidad: al hacer clic en la etiqueta, el input recibe foco */}
            {/*   - Importante para usuarios con lectores de pantalla */}
            {/* form-label: clase CSS personalizada para estilos consistentes */}
            <Label htmlFor={name} className="form-label">
                {/* Texto de la etiqueta (ej: 'Email', 'Full Name', 'Password') */}
                {label}
            </Label>
            
            {/* ============================================
                INPUT (Campo de entrada)
                ============================================ */}
            <Input
                // ============================================
                // ATRIBUTOS HTML BÁSICOS
                // ============================================
                
                // type: tipo de input HTML
                // - 'text': texto normal
                // - 'password': oculta el texto con asteriscos
                // - 'email': validación HTML5 de formato email + teclado optimizado en móvil
                // - 'number': solo acepta números + teclado numérico en móvil
                type={type}
                
                // id: identificador único del input
                // Debe coincidir con el htmlFor del Label para vincularlos
                id={name}
                
                // placeholder: texto de ayuda dentro del input cuando está vacío
                // Desaparece cuando el usuario empieza a escribir
                placeholder={placeholder}
                
                // disabled: si es true, el input no se puede editar ni interactuar
                // El input aparece grisado y el cursor cambia a 'not-allowed'
                disabled={disabled}
                
                // value: valor controlado del input (opcional)
                // Si se proporciona, convierte el input en un "controlled component"
                // React controla el valor en lugar del DOM
                value={value}
                
                // ============================================
                // CLASES CSS DINÁMICAS
                // ============================================
                // cn() combina múltiples clases, aplicando algunas condicionalmente
                className={cn(
                    'form-input',  // Clase base con estilos del input
                    // Objeto de clases condicionales:
                    // Si disabled es true, aplica opacity-50 y cursor-not-allowed
                    // Esto da feedback visual de que el campo está deshabilitado
                    { 
                        'opacity-50 cursor-not-allowed': disabled 
                    }
                )}
                
                // ============================================
                // INTEGRACIÓN CON REACT-HOOK-FORM
                // ============================================
                // {...register(name, validation)} es el spread operator que:
                // 1. Llama a register() de react-hook-form con:
                //    - name: identificador del campo en el formulario
                //    - validation: reglas de validación (required, minLength, pattern, etc.)
                // 2. register() retorna un objeto con props necesarias:
                //    - onChange: función para actualizar el valor en react-hook-form
                //    - onBlur: función que se ejecuta cuando el campo pierde el foco
                //    - ref: referencia al elemento DOM
                //    - name: nombre del campo
                // 3. El spread operator (...) aplica todas esas props al Input
                //
                // Ejemplo de lo que register() retorna:
                // {
                //   onChange: (e) => updateFormValue(e),
                //   onBlur: () => triggerValidation(),
                //   ref: (element) => saveRef(element),
                //   name: 'email'
                // }
                //
                // Es equivalente a escribir manualmente:
                // onChange={register(name, validation).onChange}
                // onBlur={register(name, validation).onBlur}
                // ref={register(name, validation).ref}
                // name={register(name, validation).name}
                {...register(name, validation)}
            />
            
            {/* ============================================
                MENSAJE DE ERROR (Condicional)
                ============================================ */}
            {/* Se renderiza SOLO si existe un error de validación */}
            {/* error && ... es un patrón común de renderizado condicional en React */}
            {/* Si error es undefined/null/false, no se renderiza nada */}
            {/* Si error existe, renderiza el <p> con el mensaje */}
            {error && (
                // Párrafo que muestra el mensaje de error
                // text-sm: tamaño de texto pequeño (0.875rem / 14px)
                // text-red-500: color rojo para indicar error
                <p className="text-sm text-red-500">
                    {/* error.message contiene el texto del error */}
                    {/* Ejemplos: 'Email is required', 'Password must be at least 8 characters' */}
                    {error.message}
                </p>
            )}
        </div>
    )
}

// ============================================
// EXPORTACIÓN
// ============================================
// Exporta el componente para usarlo en formularios
export default InputField

// ============================================
// FLUJO DE TRABAJO DEL CÓDIGO:
// ============================================
//
// RENDERIZADO INICIAL:
// 1. El formulario padre (SignIn, SignUp, etc.) renderiza InputField
// 2. Pasa todas las props necesarias:
//    - name: 'email'
//    - label: 'Email'
//    - placeholder: 'contact@example.com'
//    - type: 'email'
//    - register: función de react-hook-form
//    - validation: { required: 'Email is required', pattern: /.../ }
// 3. InputField renderiza:
//    - Label con el texto 'Email'
//    - Input de tipo 'email' con placeholder
//    - NO renderiza mensaje de error (todavía no hay errores)
// 4. register() conecta el input con react-hook-form
//
// INTERACCIÓN DEL USUARIO:
// 1. Usuario hace clic en el input (recibe foco)
// 2. Usuario escribe texto (ej: 'user@example')
// 3. onChange (proporcionado por register) actualiza el valor en react-hook-form
// 4. Usuario sale del campo (blur)
// 5. onBlur (proporcionado por register) dispara la validación
// 6. Si hay errores de validación:
//    - react-hook-form actualiza el objeto errors
//    - El componente se re-renderiza con error.message
//    - Aparece el mensaje de error en rojo debajo del input
//
// VALIDACIÓN:
// Ejemplo de validation props:
// validation={{ 
//   required: 'Email is required',           // Campo obligatorio
//   pattern: {                                // Formato válido
//     value: /^\w+@\w+\.\w+$/,
//     message: 'Invalid email format'
//   },
//   minLength: {                              // Longitud mínima
//     value: 5,
//     message: 'Email must be at least 5 characters'
//   }
// }}
//
// CAMPO DESHABILITADO:
// Si disabled={true}:
// 1. El input no se puede editar
// 2. opacity-50 hace que se vea semi-transparente
// 3. cursor-not-allowed muestra cursor de prohibido al hover
// 4. Los eventos onChange/onBlur no se disparan
//
// ============================================
// PROPÓSITO GENERAL:
// ============================================
// Este componente encapsula toda la lógica visual y de validación
// de un campo de formulario en un componente reutilizable.
//
// VENTAJAS:
// 1. DRY (Don't Repeat Yourself):
//    - No necesitas escribir Label + Input + Error en cada campo
//    - Un solo componente para todos los inputs de texto
//
// 2. Consistencia:
//    - Todos los campos se ven y se comportan igual
//    - Estilos consistentes en toda la aplicación
//    - Manejo de errores uniforme
//
// 3. Mantenibilidad:
//    - Cambios de diseño en un solo lugar
//    - Fácil agregar funcionalidad a todos los campos
//
// 4. Accesibilidad:
//    - Label vinculado con htmlFor/id
//    - Errores asociados al input
//    - Estados deshabilitados claros
//
// 5. Integración con react-hook-form:
//    - Conexión automática con {...register}
//    - Validación integrada
//    - Manejo de errores automático
//
// ============================================
// CASOS DE USO EN TU APP:
// ============================================
//
// 1. LOGIN (SignIn):
// <InputField
//   name="email"
//   label="Email"
//   placeholder="contact@example.com"
//   type="email"
//   register={register}
//   error={errors.email}
//   validation={{ 
//     required: 'Email is required',
//     pattern: /^\w+@\w+\.\w+$/
//   }}
// />
//
// 2. REGISTRO (SignUp):
// <InputField
//   name="fullName"
//   label="Full Name"
//   placeholder="John Doe"
//   register={register}
//   error={errors.fullName}
//   validation={{ 
//     required: 'Name is required',
//     minLength: 2
//   }}
// />
//
// 3. PASSWORD:
// <InputField
//   name="password"
//   label="Password"
//   placeholder="Enter password"
//   type="password"              // Oculta el texto
//   register={register}
//   error={errors.password}
//   validation={{ 
//     required: 'Password is required',
//     minLength: 8
//   }}
// />
//
// 4. CAMPO DESHABILITADO:
// <InputField
//   name="email"
//   label="Email"
//   value="user@example.com"
//   disabled={true}              // No editable
//   register={register}
// />
//
// ============================================
// ALTERNATIVA SIN ESTE COMPONENTE:
// ============================================
// Sin InputField, cada campo requeriría escribir:
//
// <div className="space-y-2">
//   <Label htmlFor="email" className="form-label">Email</Label>
//   <Input
//     type="email"
//     id="email"
//     placeholder="contact@example.com"
//     className="form-input"
//     {...register('email', { required: 'Email is required' })}
//   />
//   {errors.email && (
//     <p className="text-sm text-red-500">{errors.email.message}</p>
//   )}
// </div>
//
// REPETIDO para CADA campo en CADA formulario.
// Con InputField, una sola línea hace todo eso.
//
// ============================================
// PATRÓN DE DISEÑO:
// ============================================
// Este es un "Wrapper Component" o "Container Component":
// - Agrupa elementos relacionados (label, input, error)
// - Abstrae la complejidad de react-hook-form
// - Proporciona una API simple y declarativa
// - Reutilizable en múltiples contextos
//
// PRINCIPIOS APLICADOS:
// - Single Responsibility: solo maneja campos de entrada de texto
// - DRY: evita duplicación de código
// - Encapsulation: oculta detalles de implementación
// - Composition: se puede componer en formularios más grandes