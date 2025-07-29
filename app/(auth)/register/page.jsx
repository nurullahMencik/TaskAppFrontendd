'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { register, reset } from '../../../redux/slices/authSlice'; 

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'manager', // Varsayılan rol
    });
    // Hata/başarı mesajlarını göstermek için yeni state
    const [displayMessage, setDisplayMessage] = useState({ type: '', text: '' }); 

    const { username, email, password, role } = formData;

    const dispatch = useDispatch();
    const router = useRouter();

    const { user, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth 
    );

    useEffect(() => {
        if (isError) {
            // Hata mesajını göster
            setDisplayMessage({ type: 'error', text: message || 'Bir hata oluştu.' }); 
        } else if (isSuccess) {
            // Başarı mesajını göster
            setDisplayMessage({ type: 'success', text: 'Kayıt başarılı! Yönlendiriliyorsunuz...' }); 
        } else {
            // Durum değiştiğinde mesajı temizle
            setDisplayMessage({ type: '', text: '' }); 
        }

        if (isSuccess || user) { 
            // Kayıt başarılıysa veya zaten login ise dashboard'a yönlendir
            const timer = setTimeout(() => { // Kullanıcının mesajı görmesi için kısa gecikme
                router.push('/dashboard');
            }, 1500); 
            return () => clearTimeout(timer); 
        }

        dispatch(reset()); // Redux durumunu sıfırla
    }, [user, isError, isSuccess, message, router, dispatch]);

    const handleChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Yeni bir istek öncesi mesajı temizle
        setDisplayMessage({ type: '', text: '' }); 
        dispatch(register(formData)); 
    };

    return (
        // Ana kapsayıcı: tam ekran, ortalanmış, basit gradyan arka plan (yeşil tonlarında)
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-teal-600 p-4 font-sans">
            {/* Kart: ortalanmış, responsive genişlik, gölge, yuvarlak köşeler */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-sm md:max-w-md animate-fade-in-up">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-7">
                    Kayıt Ol
                </h1>

                {/* Dinamik mesaj alanı */}
                {displayMessage.text && (
                    <div className={`p-3 mb-6 rounded-lg text-sm sm:text-base text-center font-medium ${
                        displayMessage.type === 'error' 
                            ? 'bg-red-100 text-red-700 border border-red-200' 
                            : 'bg-green-100 text-green-700 border border-green-200'
                    } animate-fade-in-down`}>
                        {displayMessage.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Kullanıcı Adı alanı */}
                    <div>
                        <label htmlFor="username" className="block text-gray-700 font-medium mb-2">
                            Kullanıcı Adı
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition duration-200"
                            value={username}
                            onChange={handleChange}
                            required
                            placeholder="Kullanıcı adınızı girin"
                            aria-label="Kullanıcı adınızı girin"
                        />
                    </div>

                    {/* E-posta alanı */}
                    <div>
                        <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                            E-posta
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition duration-200"
                            value={email}
                            onChange={handleChange}
                            required
                            placeholder="eposta@example.com"
                            aria-label="E-posta adresinizi girin"
                        />
                    </div>

                    {/* Şifre alanı */}
                    <div>
                        <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
                            Şifre
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition duration-200"
                            value={password}
                            onChange={handleChange}
                            required
                            placeholder="Şifrenizi girin"
                            aria-label="Şifrenizi girin"
                        />
                    </div>

                    {/* Rol seçimi */}
                    <div>
                        <label htmlFor="role" className="block text-gray-700 font-medium mb-2">
                            Rol
                        </label>
                        <div className="relative">
                            <select
                                id="role"
                                name="role"
                                className="block appearance-none w-full bg-white border border-gray-300 text-gray-800 py-2.5 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-gray-500 focus:ring-2 focus:ring-green-400 transition duration-200"
                                value={role}
                                onChange={handleChange}
                                aria-label="Rol seçimi"
                            >
                                <option value="developer">Developer</option>
                                <option value="manager">Manager</option>
                                <option value="admin">Admin</option>
                            </select>
                            {/* Özel ok ikonu */}
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                            </div>
                        </div>
                    </div>

                    {/* Kayıt Ol butonu */}
                    <button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                        disabled={isLoading}
                        aria-live="polite"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Kaydediliyor...
                            </>
                        ) : (
                            'Kayıt Ol'
                        )}
                    </button>
                </form>

                {/* Giriş Yap linki */}
                <p className="text-center text-gray-600 mt-5 text-sm sm:text-base">
                    Zaten bir hesabın var mı?{' '}
                    <Link href="/login" className="text-green-600 hover:text-green-800 hover:underline font-semibold transition duration-200">
                        Giriş Yap
                    </Link>
                </p>
            </div>
        </div>
    );
}
