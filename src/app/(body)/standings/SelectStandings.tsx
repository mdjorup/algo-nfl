'use client';

import { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SelectStandings = () => {
  const pathname = usePathname()

  return (
    <nav className='flex rounded gap-4 '>
      <Link className={buttonVariants({ "variant": pathname.endsWith("/conference") ? "outline" : "secondary" })} href="/standings/division">
        Division
      </Link>
      <Link className={buttonVariants({ "variant": pathname.endsWith("/division") ? "outline" : "secondary" })} href="/standings/conference">
        Conference
      </Link>
    </nav>
  )
}

export default SelectStandings;