import { Menu } from 'lucide-react';
import Link from "next/link";
import React from 'react';
import { Button } from './ui/button';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';

const NavLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <SheetClose asChild>
    <Link
      href={href}
      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
    >
      {children}
    </Link>
  </SheetClose>
);

export const SheetNav = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="text-left">Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col space-y-4 mt-4">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/standings">Standings</NavLink>
          <NavLink href="/playoff-picture">Playoff Picture</NavLink>
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default SheetNav;

