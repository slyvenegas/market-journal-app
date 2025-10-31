// ============================================
// DIRECTIVA 'USE CLIENT'
// ============================================
// Esta directiva le indica a Next.js que este es un Client Component
// Significa que se ejecutará en el navegador del usuario, no en el servidor
// Es necesario porque usa hooks de React (useForm, useRouter) e interactividad del usuario
'use client';

// ============================================
// IMPORTACIONES
// ============================================

// Importa useForm de react-hook-form, una librería para manejar formularios en React
// Proporciona validación, manejo de estado del formulario y gestión de errores de forma eficiente
import { useForm } from 'react-hook-form';

// Importa el componente Button de shadcn/ui (librería de componentes UI)
// Es un botón pre-estilizado y accesible que se puede personalizar
import { Button } from '@/components/ui/button';

// Importa un componente personalizado para los campos de entrada (input)
// Encapsula la lógica de mostrar label, input, errores, etc.
import InputField from '@/components/forms/InputField';

// Importa un componente que muestra el enlace al final del formulario
// ("¿No tienes cuenta? Crear cuenta")
import FooterLink from '@/components/forms/FooterLink';

// Importa las Server Actions que manejan la autenticación
// signInWithEmail: función que procesa el login en el servidor
// signUpWithEmail: función para registro (importada pero no usada en este componente)
import {signInWithEmail, signUpWithEmail} from "@/lib/actions/auth.actions";

// Importa toast de sonner, una librería para mostrar notificaciones/alertas
// Se usará para mostrar mensajes de error si el login falla
import {toast} from "sonner";

// Importa signInEmail de better-auth (no se usa directamente en este código)
import {signInEmail} from "better-auth/api";

// Importa useRouter de Next.js para navegación programática
// Permite redirigir al usuario después de un login exitoso
import {useRouter} from "next/navigation";

// ============================================
// COMPONENTE SIGNIN
// ============================================
// Componente funcional que renderiza el formulario de inicio de sesión
const SignIn = () => {
    
    // ============================================
    // HOOK DE NAVEGACIÓN
    // ============================================
    // Inicializa el router de Next.js para poder redirigir al usuario
    // después de un inicio de sesión exitoso
    const router = useRouter()
    
    // ============================================
    // CONFIGURACIÓN DEL FORMULARIO CON REACT-HOOK-FORM
    // ============================================
    // useForm() retorna varios métodos y estados para manejar el formulario
    const {
        // register: función para registrar los inputs en el formulario
        // conecta cada campo con react-hook-form para rastrear su valor y validaciones
        register,
        
        // handleSubmit: función que envuelve tu función onSubmit
        // maneja la prevención del comportamiento por defecto del form
        // ejecuta las validaciones antes de llamar a onSubmit
        handleSubmit,
        
        // formState: objeto con el estado actual del formulario
        formState: { 
            errors,       // objeto con los errores de validación de cada campo
            isSubmitting  // boolean que indica si el formulario se está enviando
        },
    } = useForm<SignInFormData>({
        // Valores iniciales del formulario (campos vacíos)
        defaultValues: {
            email: '',
            password: '',
        },
        // mode: 'onBlur' significa que las validaciones se ejecutan cuando
        // el usuario sale de un campo (pierde el foco/blur)
        // Otras opciones: 'onChange', 'onSubmit', 'onTouched', 'all'
        mode: 'onBlur',
    });

    // ============================================
    // FUNCIÓN DE ENVÍO DEL FORMULARIO
    // ============================================
    // Esta función se ejecuta cuando el formulario pasa todas las validaciones
    // data: objeto con los valores del formulario { email: string, password: string }
    const onSubmit = async (data: SignInFormData) => {
        // Bloque try-catch para manejar errores de forma segura
        try {
            // Llama a la Server Action signInWithEmail pasando los datos del formulario
            // Esta función se ejecuta en el servidor y verifica las credenciales
            // await espera la respuesta antes de continuar
            const result = await signInWithEmail(data);
            
            // Si el login fue exitoso (result.success === true)
            // redirige al usuario a la página principal '/'
            if(result.success) router.push('/');
            
        } catch (e) {
            // Si ocurre algún error durante el proceso de login:
            
            // 1. Lo registra en la consola para debugging
            console.error(e);
            
            // 2. Muestra una notificación de error al usuario usando sonner
            toast.error('Sign in failed', {
                // Si 'e' es una instancia de Error, muestra su mensaje
                // Si no, muestra un mensaje genérico
                description: e instanceof Error ? e.message : 'Failed to sign in.'
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
            {/* Título de bienvenida con clase CSS personalizada */}
            <h1 className="form-title">Welcome back</h1>

            {/* ============================================
                FORMULARIO DE INICIO DE SESIÓN
                ============================================ */}
            {/* 
                onSubmit: handleSubmit envuelve nuestra función onSubmit
                - Previene el comportamiento por defecto del form (recargar la página)
                - Ejecuta todas las validaciones
                - Si todo es válido, llama a nuestra función onSubmit con los datos
                
                space-y-5: añade espaciado vertical de 1.25rem entre elementos hijos
            */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                
                {/* ============================================
                    CAMPO DE EMAIL
                    ============================================ */}
                <InputField
                    name="email"                              // Nombre del campo (key en el objeto de datos)
                    label="Email"                             // Texto de la etiqueta que se muestra
                    placeholder="contact@jsmastery.com"       // Texto placeholder dentro del input
                    register={register}                       // Función register para conectar con react-hook-form
                    error={errors.email}                      // Objeto de error para este campo (si existe)
                    validation={{                             // Reglas de validación
                        required: 'Email is required',        // Campo obligatorio, mensaje si está vacío
                        pattern: /^\w+@\w+\.\w+$/             // Expresión regular para validar formato de email
                    }}
                />

                {/* ============================================
                    CAMPO DE PASSWORD
                    ============================================ */}
                <InputField
                    name="password"                           // Nombre del campo
                    label="Password"                          // Etiqueta visible
                    placeholder="Enter your password"         // Texto placeholder
                    type="password"                           // type="password" oculta el texto con asteriscos
                    register={register}                       // Conecta con react-hook-form
                    error={errors.password}                   // Errores de validación específicos de password
                    validation={{                             // Reglas de validación
                        required: 'Password is required',     // Campo obligatorio
                        minLength: 8                          // Longitud mínima de 8 caracteres
                    }}
                />

                {/* ============================================
                    BOTÓN DE ENVÍO
                    ============================================ */}
                <Button 
                    type="submit"                             // type="submit" hace que envíe el formulario al hacer clic
                    disabled={isSubmitting}                   // Desactiva el botón mientras se procesa el formulario
                    className="yellow-btn w-full mt-5"        // Clases CSS: botón amarillo, ancho completo, margen superior
                >
                    {/* Texto condicional: muestra "Signing In" mientras se procesa, "Sign In" cuando está listo */}
                    {isSubmitting ? 'Signing In' : 'Sign In'}
                </Button>

                {/* ============================================
                    ENLACE A REGISTRO
                    ============================================ */}
                {/* Componente que muestra "Don't have an account? Create an account" */}
                {/* Al hacer clic en "Create an account" redirige a /sign-up */}
                <FooterLink 
                    text="Don't have an account?" 
                    linkText="Create an account" 
                    href="/sign-up" 
                />
            </form>
        </>
    );
};

// ============================================
// EXPORTACIÓN
// ============================================
// Exporta el componente SignIn para usarlo en otras partes de la aplicación
export default SignIn;

// ============================================
// FLUJO DE TRABAJO DEL CÓDIGO:
// ============================================
// 1. CARGA INICIAL:
//    - El componente se renderiza con el formulario vacío
//    - react-hook-form inicializa el estado con email: '' y password: ''
//
// 2. INTERACCIÓN DEL USUARIO:
//    - Usuario escribe en los campos de email y password
//    - react-hook-form rastrea los valores en tiempo real
//
// 3. VALIDACIÓN (onBlur):
//    - Cuando el usuario sale de un campo (blur), se ejecutan las validaciones
//    - Si hay errores, se muestran debajo del campo correspondiente
//    - Email: verifica que no esté vacío y tenga formato válido
//    - Password: verifica que no esté vacío y tenga mínimo 8 caracteres
//
// 4. ENVÍO DEL FORMULARIO:
//    - Usuario hace clic en el botón "Sign In"
//    - handleSubmit ejecuta todas las validaciones una última vez
//    - Si hay errores, NO llama a onSubmit y muestra los errores
//    - Si todo es válido, llama a onSubmit con los datos
//
// 5. PROCESAMIENTO (onSubmit):
//    - isSubmitting cambia a true (botón se desactiva y muestra "Signing In")
//    - Se llama a signInWithEmail(data) en el servidor
//    - El servidor verifica las credenciales en la base de datos
//
// 6. RESULTADO:
//    A) LOGIN EXITOSO:
//       - result.success === true
//       - router.push('/') redirige a la página principal
//       - El usuario ya está autenticado
//    
//    B) LOGIN FALLIDO:
//       - Se captura el error en el catch
//       - Se muestra una notificación toast con el mensaje de error
//       - El usuario permanece en la página de login
//       - isSubmitting vuelve a false (botón se reactiva)
//
// ============================================
// PROPÓSITO GENERAL:
// ============================================
// Este componente proporciona una interfaz completa de inicio de sesión con:
// - Validación de formularios en tiempo real
// - Manejo de errores user-friendly
// - Feedback visual durante el proceso (botón desactivado, texto cambiante)
// - Notificaciones de error claras
// - Navegación automática después del login exitoso
// - Enlace para usuarios nuevos que necesitan registrarse
//
// PATRONES IMPLEMENTADOS:
// - Controlled components con react-hook-form
// - Validación declarativa
// - Error handling con try-catch
// - Loading states (isSubmitting)
// - Server Actions para lógica del servidor
// - Toast notifications para feedback al usuario