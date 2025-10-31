// ============================================
// DIRECTIVA 'USE CLIENT'
// ============================================
// Esta directiva indica que este es un Client Component de Next.js
// Se ejecuta en el navegador porque necesita interactividad y hooks de React
'use client';

// ============================================
// IMPORTACIONES
// ============================================

// Importa useForm de react-hook-form para manejar el formulario complejo de registro
// Proporciona validación, manejo de estado y gestión de errores
import {useForm} from "react-hook-form";

// Importa el componente Button de shadcn/ui para el botón de envío
import {Button} from "@/components/ui/button";

// Importa el componente InputField personalizado para campos de texto simples
// (nombre, email, password)
import InputField from "@/components/forms/InputField";

// Importa SelectField para campos de selección/dropdown
// (goals, risk tolerance, preferred industry)
import SelectField from "@/components/forms/SelectField";

// Importa las opciones/constantes para los campos de selección
// Estas son arrays con las opciones disponibles para cada dropdown
import {INVESTMENT_GOALS, PREFERRED_INDUSTRIES, RISK_TOLERANCE_OPTIONS} from "@/lib/constants";

// Importa un componente especializado para seleccionar países
// Probablemente incluye banderas, búsqueda y una lista completa de países
import {CountrySelectField} from "@/components/forms/CountrySelectField";

// Importa el componente FooterLink que muestra el enlace para ir al login
// ("¿Ya tienes cuenta? Inicia sesión")
import FooterLink from "@/components/forms/FooterLink";

// Importa la Server Action que maneja el registro de usuarios en el servidor
import {signUpWithEmail} from "@/lib/actions/auth.actions";

// Importa useRouter de Next.js para navegación programática
// Redirigirá al usuario después de un registro exitoso
import {useRouter} from "next/navigation";

// Importa toast de sonner para mostrar notificaciones al usuario
// Se usará para mensajes de error si el registro falla
import {toast} from "sonner";

// ============================================
// COMPONENTE SIGNUP
// ============================================
// Componente funcional que renderiza el formulario completo de registro
// Incluye tanto datos de autenticación como preferencias de inversión del usuario
const SignUp = () => {
    
    // ============================================
    // HOOK DE NAVEGACIÓN
    // ============================================
    // Inicializa el router para redirigir después del registro exitoso
    const router = useRouter()
    
    // ============================================
    // CONFIGURACIÓN DEL FORMULARIO
    // ============================================
    // useForm inicializa y gestiona todo el estado del formulario
    const {
        // register: función para registrar inputs de texto simples
        // (fullName, email, password)
        register,
        
        // handleSubmit: envuelve la función onSubmit y maneja validaciones
        handleSubmit,
        
        // control: objeto especial necesario para campos controlados más complejos
        // como selects, radio buttons, etc. (usado con Controller de react-hook-form)
        control,
        
        // formState: estado actual del formulario
        formState: { 
            errors,       // objeto con todos los errores de validación
            isSubmitting  // boolean que indica si el formulario se está procesando
        },
    } = useForm<SignUpFormData>({
        // ============================================
        // VALORES INICIALES DEL FORMULARIO
        // ============================================
        // Define los valores por defecto para cada campo
        // Algunos están vacíos (inputs de texto) y otros tienen valores predefinidos (selects)
        defaultValues: {
            fullName: '',                    // Campo vacío, el usuario debe ingresarlo
            email: '',                       // Campo vacío, el usuario debe ingresarlo
            password: '',                    // Campo vacío, el usuario debe ingresarlo
            country: 'US',                   // Valor por defecto: Estados Unidos
            investmentGoals: 'Growth',       // Valor por defecto: Crecimiento
            riskTolerance: 'Medium',         // Valor por defecto: Riesgo medio
            preferredIndustry: 'Technology'  // Valor por defecto: Tecnología
        },
        // mode: 'onBlur' ejecuta validaciones cuando el usuario sale de un campo
        // Proporciona mejor UX que validar en cada tecla (onChange)
        mode: 'onBlur'
    }, );

    // ============================================
    // FUNCIÓN DE ENVÍO DEL FORMULARIO
    // ============================================
    // Se ejecuta solo si todas las validaciones pasan
    // data: objeto tipado con todos los valores del formulario
    const onSubmit = async (data: SignUpFormData) => {
        // Try-catch para manejar errores de forma segura
        try {
            // Llama a la Server Action que crea el usuario en la base de datos
            // await espera la respuesta del servidor antes de continuar
            // data contiene: fullName, email, password, country, investmentGoals, 
            // riskTolerance, preferredIndustry
            const result = await signUpWithEmail(data);
            
            // Si el registro fue exitoso (usuario creado y autenticado)
            // redirige al usuario a la página principal '/'
            if(result.success) router.push('/');
            
        } catch (e) {
            // Si algo sale mal durante el registro:
            
            // 1. Registra el error en la consola para debugging
            console.error(e);
            
            // 2. Muestra una notificación toast de error al usuario
            toast.error('Sign up failed', {
                // Si el error tiene un mensaje, lo muestra; si no, usa uno genérico
                description: e instanceof Error ? e.message : 'Failed to create an account.'
            })
        }
    }

    // ============================================
    // RENDERIZADO DEL COMPONENTE
    // ============================================
    return (
        <>
            {/* ============================================
                TÍTULO DEL FORMULARIO
                ============================================ */}
            {/* Título que indica que el usuario puede registrarse y personalizar su experiencia */}
            <h1 className="form-title">Sign Up & Personalize</h1>

            {/* ============================================
                FORMULARIO DE REGISTRO
                ============================================ */}
            {/* 
                onSubmit: handleSubmit maneja el evento de envío
                space-y-5: añade espacio vertical entre todos los campos
            */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                
                {/* ============================================
                    SECCIÓN 1: DATOS DE AUTENTICACIÓN
                    ============================================ */}
                
                {/* CAMPO: NOMBRE COMPLETO */}
                <InputField
                    name="fullName"                           // Identificador del campo
                    label="Full Name"                         // Etiqueta visible
                    placeholder="John Doe"                    // Texto de ejemplo
                    register={register}                       // Conecta con react-hook-form
                    error={errors.fullName}                   // Muestra errores si existen
                    validation={{                             // Reglas de validación
                        required: 'Full name is required',    // Campo obligatorio
                        minLength: 2                          // Mínimo 2 caracteres
                    }}
                />

                {/* CAMPO: EMAIL */}
                <InputField
                    name="email"                              // Identificador del campo
                    label="Email"                             // Etiqueta
                    placeholder="contact@jsmastery.com"       // Placeholder
                    register={register}                       // Registro en el formulario
                    error={errors.email}                      // Manejo de errores
                    validation={{                             // Validaciones
                        required: 'Email name is required',   // Obligatorio
                        pattern: /^\w+@\w+\.\w+$/,           // Regex para formato email válido
                        message: 'Email address is required'  // Mensaje adicional de error
                    }}
                />

                {/* CAMPO: PASSWORD */}
                <InputField
                    name="password"                           // Identificador
                    label="Password"                          // Etiqueta
                    placeholder="Enter a strong password"     // Placeholder
                    type="password"                           // Oculta el texto con asteriscos
                    register={register}                       // Registro
                    error={errors.password}                   // Errores
                    validation={{                             // Validaciones
                        required: 'Password is required',     // Obligatorio
                        minLength: 8                          // Mínimo 8 caracteres por seguridad
                    }}
                />

                {/* ============================================
                    SECCIÓN 2: PERSONALIZACIÓN Y PREFERENCIAS
                    ============================================ */}
                {/* Estos campos personalizan la experiencia del usuario
                    según sus intereses y perfil de inversión */}

                {/* CAMPO: PAÍS */}
                {/* Componente especializado para selección de país
                    Probablemente incluye búsqueda y banderas */}
                <CountrySelectField
                    name="country"                            // Identificador
                    label="Country"                           // Etiqueta
                    control={control}                         // Control de react-hook-form (necesario para selects)
                    error={errors.country}                    // Manejo de errores
                    required                                  // Campo obligatorio
                />

                {/* CAMPO: OBJETIVOS DE INVERSIÓN */}
                {/* Dropdown con opciones como: Growth, Income, Preservation, etc. */}
                <SelectField
                    name="investmentGoals"                    // Identificador
                    label="Investment Goals"                  // Etiqueta
                    placeholder="Select your investment goal" // Texto cuando no hay selección
                    options={INVESTMENT_GOALS}                // Array de opciones disponibles
                    control={control}                         // Control para campos complejos
                    error={errors.investmentGoals}            // Errores
                    required                                  // Obligatorio
                />

                {/* CAMPO: TOLERANCIA AL RIESGO */}
                {/* Dropdown con opciones como: Low, Medium, High, etc. */}
                <SelectField
                    name="riskTolerance"                      // Identificador
                    label="Risk Tolerance"                    // Etiqueta
                    placeholder="Select your risk level"      // Placeholder
                    options={RISK_TOLERANCE_OPTIONS}          // Opciones: Conservative, Moderate, Aggressive
                    control={control}                         // Control de react-hook-form
                    error={errors.riskTolerance}              // Manejo de errores
                    required                                  // Campo obligatorio
                />

                {/* CAMPO: INDUSTRIA PREFERIDA */}
                {/* Dropdown con sectores como: Technology, Healthcare, Finance, etc. */}
                <SelectField
                    name="preferredIndustry"                  // Identificador
                    label="Preferred Industry"                // Etiqueta
                    placeholder="Select your preferred industry" // Placeholder
                    options={PREFERRED_INDUSTRIES}            // Array con industrias disponibles
                    control={control}                         // Control para el select
                    error={errors.preferredIndustry}          // Errores de validación
                    required                                  // Obligatorio
                />

                {/* ============================================
                    BOTÓN DE ENVÍO
                    ============================================ */}
                <Button 
                    type="submit"                             // Tipo submit para enviar el form
                    disabled={isSubmitting}                   // Desactiva mientras procesa
                    className="yellow-btn w-full mt-5"        // Estilos: botón amarillo, ancho completo
                >
                    {/* Texto dinámico según el estado del formulario */}
                    {isSubmitting ? 'Creating Account' : 'Start Your Investing Journey'}
                </Button>

                {/* ============================================
                    ENLACE A LOGIN
                    ============================================ */}
                {/* Componente que muestra "Already have an account? Sign in" */}
                {/* Redirige a /sign-in si el usuario ya tiene cuenta */}
                <FooterLink 
                    text="Already have an account?" 
                    linkText="Sign in" 
                    href="/sign-in" 
                />
            </form>
        </>
    )
}

// ============================================
// EXPORTACIÓN
// ============================================
// Exporta el componente para usarlo en la aplicación
export default SignUp;

// ============================================
// FLUJO DE TRABAJO DEL CÓDIGO:
// ============================================
// 1. CARGA INICIAL:
//    - El formulario se renderiza con valores por defecto
//    - Campos de texto vacíos (fullName, email, password)
//    - Selects con valores predefinidos (US, Growth, Medium, Technology)
//
// 2. INTERACCIÓN DEL USUARIO - PARTE 1 (Autenticación):
//    - Usuario ingresa su nombre completo (mínimo 2 caracteres)
//    - Usuario ingresa email (formato válido requerido)
//    - Usuario crea contraseña (mínimo 8 caracteres)
//
// 3. INTERACCIÓN DEL USUARIO - PARTE 2 (Personalización):
//    - Usuario selecciona su país (puede cambiar del default 'US')
//    - Usuario elige su objetivo de inversión (Growth, Income, etc.)
//    - Usuario define su tolerancia al riesgo (Low, Medium, High)
//    - Usuario selecciona industria de interés (Technology, Healthcare, etc.)
//
// 4. VALIDACIÓN (onBlur):
//    - Cuando el usuario sale de cada campo, se valida
//    - Si hay errores, se muestran debajo del campo
//    - Validaciones: campos requeridos, longitud mínima, formato de email
//
// 5. ENVÍO DEL FORMULARIO:
//    - Usuario hace clic en "Start Your Investing Journey"
//    - handleSubmit ejecuta todas las validaciones finales
//    - Si hay errores, NO envía y muestra mensajes
//    - Si todo es válido, llama a onSubmit con todos los datos
//
// 6. PROCESAMIENTO:
//    - isSubmitting = true (botón cambia a "Creating Account" y se desactiva)
//    - Se llama a signUpWithEmail(data) en el servidor
//    - El servidor:
//      a) Crea el usuario en la base de datos
//      b) Guarda las preferencias de inversión
//      c) Autentica automáticamente al usuario
//      d) Crea una sesión
//
// 7. RESULTADO:
//    A) REGISTRO EXITOSO:
//       - result.success === true
//       - router.push('/') redirige a la página principal
//       - Usuario ya está autenticado y puede ver contenido personalizado
//    
//    B) REGISTRO FALLIDO:
//       - Se captura el error (ej: email ya existe, error de BD)
//       - Se muestra toast.error con el mensaje de error
//       - Usuario permanece en el formulario para corregir
//       - isSubmitting vuelve a false (botón se reactiva)
//
// ============================================
// PROPÓSITO GENERAL:
// ============================================
// Este componente crea un formulario de registro completo que:
// - Recopila datos de autenticación (nombre, email, password)
// - Personaliza la experiencia según perfil de inversión del usuario
// - Valida toda la información antes de enviarla
// - Maneja errores de forma user-friendly
// - Proporciona feedback visual durante el proceso
// - Redirige automáticamente después del éxito
//
// DIFERENCIAS CON SIGNIN:
// - Más campos (7 vs 2)
// - Usa 'control' para campos de selección complejos
// - Recopila preferencias además de credenciales
// - Permite personalización desde el inicio
//
// VENTAJA DE UX:
// Al recopilar preferencias durante el registro, la aplicación puede
// mostrar contenido personalizado inmediatamente después del login
// (ej: noticias de Technology, análisis de riesgo Medium, etc.)