import './globals.css';
import Sidebar from '@/components/Sidebar';
import { ThemeProvider } from './ThemeContext';
import { ModalProvider } from './ModalContext';

export const metadata = {
  title: 'Krishna Textiles - Enterprise Management Portal',
  description: 'Enterprise ERP for Krishna Textiles: Inventory, Order Fulfillment, CRM & Analytics',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('kt_admin_theme');
                if (theme === 'light') {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                } else {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-slate-50 dark:bg-[#080C14] text-slate-900 dark:text-slate-100 h-screen overflow-hidden antialiased flex transition-colors duration-200">
        <ThemeProvider>
          <ModalProvider>
            <div className="flex w-full h-full">
              <Sidebar />
              <main className="flex-1 lg:pl-64 h-full overflow-y-auto bg-slate-50 dark:bg-[#080C14] flex flex-col transition-colors duration-200">
                {children}
              </main>
            </div>
          </ModalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
