import Link from "next/link";
import Image from "next/image";



const Layout = async ({ children }: { children : React.ReactNode }) => {
   



    return (
        <main className="auth-layout">
            <section className="auth-left-section scrollbar-hide-default">
                <Link href="/" className="auth-logo">
                    <Image src="/assets/icons/logo.svg" alt="Signalist logo" width={140} height={32} className='h-8 w-auto' />
                </Link>

                <div className="pb-6 lg:pb-8 flex-1">{children}</div>
            </section>

            <section className="auth-right-section">
                <div className="z-10 relative lg:mt-4 lg:mb-16">
                    <blockquote className="auth-blockquote">
                        MJ App es una aplicación de mercado de valores diseñada para monitorear precios en tiempo real, gestionar watchlists, recibir alertas personalizadas y explorar insights financieros generados por IA. Incluye un panel de administración para gestionar acciones, noticias y actividad de usuarios. Los flujos en background (Inngest) permiten automatizar alertas, resúmenes diarios y análisis de sentimiento.
                    </blockquote>
                    <div className="flex items-center justify-between">
                        <div>
                            <cite className="auth-testimonial-author">- Sly V.</cite>
                            <p className="max-md:text-xs text-gray-500">Web Developer & Trader</p>
                        </div>
                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Image src="/assets/icons/star.svg" alt="Star" key={star} width={20} height={20} className="w-5 h-5" />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-1 relative">
                    <Image src="/assets/images/dashboard.png" alt="Dashboard Preview" width={1440} height={1150} className="auth-dashboard-preview absolute top-0" />
                </div>
            </section>
        </main>
    )
}
export default Layout