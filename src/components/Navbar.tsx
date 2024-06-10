"use client";
import { User } from 'next-auth';
import Link from 'next/link';
import { Button } from './ui/button';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

const Navbar = () => {
    const {data: session} = useSession();
    const user = session?.user as User;
    const pathname = usePathname();
    // console.log(pathname)
  return (
    <nav className="p-4 md:p-6 shadow-md bg-gray-900 text-white">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <a href="#" className="text-xl font-bold mb-4 md:mb-0">
        MysteryBox
        </a>
        <div>
        {session ? (
          <div className='flex items-center gap-x-5'>
            <span className="mr-4 text-lg font-medium">
              Welcome {user.username || user.email}
            </span>
            <Button className="w-full md:w-auto bg-slate-100 text-black" variant='outline'>
            {
              pathname === '/dashboard' ? <Link href='/'>Home</Link> : <Link href='/dashboard'>Dashboard</Link>
            }
            </Button>
            <Button onClick={() => signOut()} className="w-full md:w-auto bg-slate-100 text-black" variant='outline'>
              Logout
            </Button>
          </div>
        ) : (
          <Link href="/sign-in">
            <Button className="w-full md:w-auto bg-slate-100 text-black" variant={'outline'}>Login</Button>
          </Link>
        )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
