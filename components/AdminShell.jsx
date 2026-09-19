'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const isAuthPage = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    setMounted(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('kt_admin_token') : null;
    if (!token && !isAuthPage) {
      router.push('/login');
    }
  }, [pathname, isAuthPage, router]);

  if (isAuthPage) {
    return (
      <main className="w-full h-full min-h-screen overflow-y-auto bg-[#06090E]">
        {children}
      </main>
    );
  }

  return (
    <div className="flex w-full h-full">
      <Sidebar />
      <main className="flex-1 lg:pl-64 h-full overflow-y-auto bg-slate-50 dark:bg-[#080C14] flex flex-col transition-colors duration-200">
        {children}
      </main>
    </div>
  );
}
