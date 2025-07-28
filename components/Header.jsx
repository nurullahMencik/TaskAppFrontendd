'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [username, setUsername] = useState('Kullanıcı');
    const router = useRouter();
    const pathname = usePathname();

    const updateAuthStates = () => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (token && user && typeof user === 'string' && user.trim() !== '' && user !== 'undefined' && user !== 'null') {
            try {
                const userData = JSON.parse(user);
                setIsLoggedIn(true);
                setUserRole(userData.role);
                setUsername(userData.username || userData.email || 'Kullanıcı');
            } catch (e) {
                console.error("Kullanıcı verisi parse edilirken hata:", e);
                setIsLoggedIn(false);
                setUserRole(null);
                setUsername('Kullanıcı');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        } else {
            setIsLoggedIn(false);
            setUserRole(null);
            setUsername('Kullanıcı');
            if (user === 'undefined' || user === 'null' || (typeof user === 'string' && user.trim() === '')) {
                localStorage.removeItem('user');
            }
        }
    };

    useEffect(() => {
        updateAuthStates();
        const handleStorageChange = () => {
            updateAuthStates();
        };
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUserRole(null);
        setUsername('Kullanıcı');
        router.push('/login');
    };

    return (
        <header className="bg-gray-800 text-white p-4 shadow-md sticky top-0 z-50">
            <nav className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold hover:text-gray-300 transition-colors">
                    Görev App
                </Link>

                <ul className="flex space-x-6 items-center">
                    {/* Dashboard linkini her zaman görünür yapmak için buraya taşıdık */}
                    <li>
                        {/* Next.js App Router'da /dashboard yolu mu yoksa /routes/dashboard mı?
                            Eğer dashboard sayfası /routes/dashboard altında ise, href'i '/routes/dashboard' yapmalısınız.
                            Eğer root altında /dashboard ise, '/dashboard' kalabilir.
                            Önceki konuşmalarımızda /routes/dashboard olarak ayarlamıştık, o yüzden onu kullanıyorum.
                        */}
                        <Link href="/dashboard" className={`hover:text-gray-300 transition-colors ${pathname === '/dashboard' ? 'font-bold text-blue-300' : ''}`}>
                            Dashboard
                        </Link>
                    </li>

                    {isLoggedIn ? (
                        <>
                            {userRole === 'manager' && (
                                <li>
                                    {/* Manager'a özel linkler eklenebilir */}
                                </li>
                            )}
                            <li>
                                <span className="text-gray-400">Merhaba, <span className="font-semibold">{username}</span></span>
                            </li>
                            <li>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                >
                                    Çıkış Yap
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <Link href="/login" className={`hover:text-gray-300 transition-colors ${pathname === '/login' ? 'font-bold text-blue-300' : ''}`}>
                                    Giriş Yap
                                </Link>
                            </li>
                            <li>
                                <Link href="/register" className={`hover:text-gray-300 transition-colors ${pathname === '/register' ? 'font-bold text-blue-300' : ''}`}>
                                    Kayıt Ol
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </nav>
        </header>
    );
}
