import Image from "next/image";
import Link from "next/link";
import MainNav from "./main-nav";

export const Header = () => {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 sm:gap-4">
            <Image src="/logo.svg" alt="Logo" width={40} height={40} className="w-8 h-8 sm:w-10 sm:h-10" />
            <h1 className="text-lg sm:text-2xl font-semibold">nflprobabilities.com</h1>
          </Link>

          <nav className="hidden md:block">
            <MainNav />
          </nav>

          <div className="md:hidden">
            <button
              className="p-2"
              aria-label="Toggle menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
