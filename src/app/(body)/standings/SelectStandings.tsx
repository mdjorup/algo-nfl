'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SelectStandings = () => {
  const pathname = usePathname()

  return (
    <nav className='flex rounded gap-4 '>
      <Link className={`flex items-center justify-center p-2 rounded ${pathname.endsWith("/division") ? 'bg-primary text-primary-foreground' : ''}`} href="/standings/division">
        Division
      </Link>

      <Link className={`flex items-center justify-center p-2 rounded ${pathname.endsWith("/conference") ? 'bg-primary text-primary-foreground' : ''}`} href="/standings/conference">
        Conference
      </Link>
    </nav>
  )
}

export default SelectStandings;