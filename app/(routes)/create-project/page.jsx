'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux'; 
import { createProject, resetProjectState } from './../../../redux/slices/projectsSlice';  

export default function CreateProjectPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const router = useRouter();
    const dispatch = useDispatch(); 

    
    const { isLoading, isSuccess, isError, message } = useSelector(
        (state) => state.project 
    );


    useEffect(() => {

        if (isSuccess) {
         
            
            console.log(message); 
            
            setTimeout(() => {
                dispatch(resetProjectState()); 
                router.push('/dashboard'); 
            }, 1000); 
        }

   
        if (isError) {
            console.error('Proje oluşturulurken hata:', message);
           
            if (message.includes('Unauthorized') || message.includes('Forbidden') || message.includes('token')) {
                router.push('/login');
            }
        }

        
        return () => {
            dispatch(resetProjectState());
        };
    }, [isSuccess, isError, message, router, dispatch]);


    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        
        dispatch(createProject({ title, description, token }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Yeni Proje Oluştur</h1>
           
                {isError && <p className="text-red-500 text-center mb-4">{message}</p>}
               
                {isSuccess && <p className="text-green-500 text-center mb-4">{message}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                            Proje Adı:
                        </label>
                        <input
                            type="text"
                            id="title"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                            Açıklama:
                        </label>
                        <textarea
                            id="description"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32 resize-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        ></textarea>
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isLoading} // Disable button while loading
                        >
                            {isLoading ? 'Oluşturuluyor...' : 'Proje Oluştur'}
                        </button>
                        <Link href="/dashboard" className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
                            İptal
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
