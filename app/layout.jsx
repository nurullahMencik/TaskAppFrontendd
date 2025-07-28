// frontend/app/layout.jsx
import { Inter } from 'next/font/google';
import './globals.css';
import Header from './../components/Header'; // Doğru yol
import ReduxClientProvider from "./../components/ReduxClientProvider"; // Doğru yol

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Proje Yönetim Sistemi',
  description: 'Proje ve Görev Takip Uygulaması',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxClientProvider>
          <main>{children}</main>
        </ReduxClientProvider>
      </body>
    </html>
  );
}