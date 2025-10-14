'use client'

import Image from "next/image"
import Link from "next/link"
import NavItems from "./NavItems"
import UserDropdown from "./UserDropdown"
import { useRouter } from "next/navigation"



const Header = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    router.push('/sign-in');
  }


  return (
    <header className="sticky top-0 header">
        <div className="container header-wrapper">
            <Link href="/">
                <Image src="/assets/icons/logo.svg" alt="Market Journal Logo" width={140} height={32}  className="h-8 w-auto cursor-pointer"/>
            </Link>
            <nav className="hidden sm:block">
                < NavItems />
            </nav>
            <UserDropdown />
        </div>
    </header>
  )
}

export default Header