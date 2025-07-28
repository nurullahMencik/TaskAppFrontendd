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
        role: 'developer', // Varsayılan rol
    });

    const { username, email, password, role } = formData;

    const dispatch = useDispatch();
    const router = useRouter();

    const { user, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth 
    );

    useEffect(() => {
        if (isError) {
            alert(message); // Hata mesajını göster
        }

        if (isSuccess || user) { // Kayıt başarılıysa veya zaten login ise dashboard'a yönlendir
            router.push('/dashboard');
        }

        dispatch(reset()); // Durumu sıfırla
    }, [user, isError, isSuccess, message, router, dispatch]);

    const handleChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(register(formData)); 
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Kayıt Ol</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-gray-700 font-bold mb-2">Kullanıcı Adı</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-gray-700 font-bold mb-2">E-posta</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-gray-700 font-bold mb-2">Şifre</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="role" className="block text-gray-700 font-bold mb-2">Rol</label>
                        <select
                            id="role"
                            name="role"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={role}
                            onChange={handleChange}
                        >
                            <option value="developer">Developer</option>
                            <option value="manager">Manager</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Kaydediliyor...' : 'Kayıt Ol'}
                    </button>
                </form>
                <p className="text-center text-gray-600 mt-4">
                    Zaten bir hesabın var mı?{' '}
                    <Link href="/login" className="text-blue-500 hover:underline">
                        Giriş Yap
                    </Link>
                </p>
            </div>
        </div>
    );
}