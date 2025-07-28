'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux'; 
import { createProject, resetProjectState } from './../../../redux/slices/projectsSlice';  

export default function CreateProjectPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    // Mesajları yönetmek için yeni state
    const [displayMessage, setDisplayMessage] = useState({ type: '', text: '' });

    const router = useRouter();
    const dispatch = useDispatch(); 

    const { isLoading, isSuccess, isError, message } = useSelector(
        (state) => state.project 
    );

    useEffect(() => {
        // Başarı durumunda mesajı göster ve dashboard'a yönlendir
        if (isSuccess) {
            setDisplayMessage({ type: 'success', text: message || 'Proje başarıyla oluşturuldu!' });
            setTimeout(() => {
                dispatch(resetProjectState()); 
                router.push('/dashboard'); 
            }, 1500); 
        }

        
        if (isError) {
            const errorText = message || 'Proje oluşturulurken bir hata oluştu.';
            setDisplayMessage({ type: 'error', text: errorText });
            
            // Eğer yetkilendirme hatası varsa login sayfasına yönlendir
            if (errorText.includes('Unauthorized') || errorText.includes('Forbidden') || errorText.includes('token')) {
                setTimeout(() => {
                    router.push('/login');
                }, 2000); 
            }
        }


        return () => {
            dispatch(resetProjectState());
        };
    }, [isSuccess, isError, message, router, dispatch]);


    const handleSubmit = async (e) => {
        e.preventDefault();

 
        setDisplayMessage({ type: '', text: '' }); 

        const token = localStorage.getItem('token');
        if (!token) {
            setDisplayMessage({ type: 'error', text: 'Giriş yapmanız gerekiyor.' });
            router.push('/login');
            return;
        }
        
        dispatch(createProject({ title, description, token }));
    };

    return (

        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-4 font-sans">

            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 animate-fade-in-up">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-900 mb-8 tracking-tight">
                    Yeni Proje Oluştur
                </h1>
           
                {/* Dinamik mesaj alanı (hata/başarı) */}
                {displayMessage.text && (
                    <div className={`p-3 mb-6 rounded-lg text-sm sm:text-base text-center font-medium ${
                        displayMessage.type === 'error' 
                            ? 'bg-red-100 text-red-700 border border-red-200' 
                            : 'bg-green-100 text-green-700 border border-green-200'
                    } animate-fade-in-down`}>
                        {displayMessage.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Proje Adı alanı */}
                    <div>
                        <label className="block text-gray-800 font-semibold mb-2 text-lg" htmlFor="title">
                            Proje Adı:
                        </label>
                        <input
                            type="text"
                            id="title"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition duration-200 text-gray-800 placeholder-gray-400"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder="Projenizin adını girin"
                        />
                    </div>
                    {/* Açıklama alanı */}
                    <div>
                        <label className="block text-gray-800 font-semibold mb-2 text-lg" htmlFor="description">
                            Açıklama:
                        </label>
                        <textarea
                            id="description"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition duration-200 text-gray-800 placeholder-gray-400 h-32 resize-y"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            placeholder="Projenizin açıklamasını yazın"
                        ></textarea>
                    </div>
                    {/* Butonlar */}
                    <div className="flex items-center justify-between gap-4">
                        <button
                            type="submit"
                            className={`flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition duration-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} flex items-center justify-center gap-2`}
                            disabled={isLoading}
                            aria-live="polite"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Oluşturuluyor...
                                </>
                            ) : (
                                'Proje Oluştur'
                            )}
                        </button>
                        <Link 
                            href="/dashboard" 
                            className="flex-1 text-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 transition duration-200"
                        >
                            İptal
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
