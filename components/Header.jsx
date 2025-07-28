'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [username, setUsername] = useState('Kullanıcı');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Manages mobile menu visibility
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
        setIsMobileMenuOpen(false); // Close mobile menu when logging out
        router.push('/login');
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="bg-gray-800 text-white p-4 shadow-lg sticky top-0 z-50">
            <nav className="container mx-auto flex justify-between items-center">
                {/* Brand/Logo */}
                <Link href="/" className="text-2xl font-bold hover:text-blue-300 transition-colors duration-200">
                    Görev App
                </Link>

                {/* Hamburger menu button for small screens */}
                <div className="md:hidden">
                    <button onClick={toggleMobileMenu} className="text-white hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-2">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
                        </svg>
                    </button>
                </div>

                {/* Desktop Navigation Links */}
                <ul className="hidden md:flex space-x-6 items-center">
                    <li>
                        <Link href="/dashboard" className={`hover:text-blue-300 transition-colors duration-200 ${pathname === '/dashboard' ? 'font-bold text-blue-400' : ''}`}>
                            Dashboard
                        </Link>
                    </li>

                    {isLoggedIn ? (
                        <>
                            {userRole === 'manager' && (
                                <li>
                                    <Link href="/admin" className={`hover:text-blue-300 transition-colors duration-200 ${pathname.startsWith('/admin') ? 'font-bold text-blue-400' : ''}`}>
                                        Yönetici Paneli
                                    </Link>
                                </li>
                            )}
                            <li>
                                <span className="text-gray-300">Merhaba, <span className="font-semibold text-blue-200">{username}</span></span>
                            </li>
                            <li>
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                                >
                                    Çıkış Yap
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <Link href="/login" className={`hover:text-blue-300 transition-colors duration-200 ${pathname === '/login' ? 'font-bold text-blue-400' : ''}`}>
                                    Giriş Yap
                                </Link>
                            </li>
                            <li>
                                <Link href="/register" className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg ${pathname === '/register' ? 'ring-2 ring-blue-300' : ''}`}>
                                    Kayıt Ol
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </nav>

            {/* Mobile Menu - Shown when isMobileMenuOpen is true */}
            <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} bg-gray-700 mt-4 rounded-b-lg shadow-inner py-2`}>
                <ul className="flex flex-col space-y-3 p-4">
                    <li>
                        <Link href="/dashboard" onClick={closeMobileMenu} className={`block py-2 px-3 rounded-md hover:bg-gray-600 transition-colors duration-200 ${pathname === '/dashboard' ? 'font-bold text-blue-300 bg-gray-600' : 'text-white'}`}>
                            Dashboard
                        </Link>
                    </li>
                    {isLoggedIn ? (
                        <>
                            {userRole === 'manager' && (
                                <li>
                                    <Link href="/admin" onClick={closeMobileMenu} className={`block py-2 px-3 rounded-md hover:bg-gray-600 transition-colors duration-200 ${pathname.startsWith('/admin') ? 'font-bold text-blue-300 bg-gray-600' : 'text-white'}`}>
                                        Yönetici Paneli
                                    </Link>
                                </li>
                            )}
                            <li>
                                <span className="block py-2 px-3 text-gray-300">Merhaba, <span className="font-semibold text-blue-200">{username}</span></span>
                            </li>
                            <li>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-md transition-colors duration-200 shadow-md"
                                >
                                    Çıkış Yap
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <Link href="/login" onClick={closeMobileMenu} className={`block py-2 px-3 rounded-md hover:bg-gray-600 transition-colors duration-200 ${pathname === '/login' ? 'font-bold text-blue-300 bg-gray-600' : 'text-white'}`}>
                                    Giriş Yap
                                </Link>
                            </li>
                            <li>
                                <Link href="/register" onClick={closeMobileMenu} className={`block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-md transition-colors duration-200 shadow-md ${pathname === '/register' ? 'ring-2 ring-blue-300' : ''}`}>
                                    Kayıt Ol
                                </Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </header>
    );
}
