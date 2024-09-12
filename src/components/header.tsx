import Image from "next/image";
import Link from "next/link";
import MainNav from "./main-nav";
import SheetNav from "./SheetNav";

export const Header = () => {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 sm:gap-4">
            <Image src="/logo.svg" alt="Logo" width={40} height={40} className="w-8 h-8 sm:w-10 sm:h-10" />
            <h1 className="text-lg sm:text-2xl font-semibold">NFL Probabilities</h1>
          </Link>

          <nav className="hidden md:block">
            <MainNav />
          </nav>

          <nav className="md:hidden">
            <SheetNav />
          </nav>

        </div>
      </div>
    </header>
  );
};

export default Header;
