// frontend/app/edit-project/[id]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjectById, updateProject, resetProjectState, clearMessages } from '../../../../redux/slices/projectsSlice';

export default function EditProjectPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const router = useRouter();
    const params = useParams();
    const projectId = params.id;

    const dispatch = useDispatch();
    const { project, isLoading, isSuccess, isError, message } = useSelector(
        (state) => state.project
    );

    // Effect to fetch project data when component mounts or projectId changes
    useEffect(() => {
        if (projectId) {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }
            dispatch(fetchProjectById({ projectId, token }));
        }

        // Cleanup: Reset state when component unmounts
        return () => {
            dispatch(resetProjectState());
        };
    }, [projectId, router, dispatch]);

    // Effect to populate form fields once project data is loaded
    useEffect(() => {
        if (project) {
            setTitle(project.title || '');
            setDescription(project.description || '');
        }
    }, [project]);

    // Effect to handle success/error messages after an update attempt
    useEffect(() => {
        // If update was successful, show message and redirect
        if (isSuccess && message.includes('güncellendi')) { // Check for update success specific message
            console.log(message); // Log success message
            // In a real app, you'd use a proper notification system
            setTimeout(() => {
                dispatch(resetProjectState()); // Reset state after a short delay
                router.push('/dashboard'); // Redirect to dashboard
            }, 1000); // Give user a moment to see success
        }

        // If there was an error, log it and potentially redirect for auth issues
        if (isError) {
            console.error('Proje işlemi sırasında hata:', message);
            // Check if the error is due to authentication (401/403 handled in thunk)
            if (message.includes('Unauthorized') || message.includes('Forbidden') || message.includes('token')) {
                router.push('/login');
            }
            // Optionally, clear error message after some time if it's not critical
            setTimeout(() => {
                dispatch(clearMessages());
            }, 5000);
        }
    }, [isSuccess, isError, message, router, dispatch]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(clearMessages()); // Clear previous messages before new submission

        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        // Dispatch the updateProject async thunk
        dispatch(updateProject({ projectId, title, description, token }));
    };

    // Show loading indicator while fetching or updating
    if (isLoading && !project) { // Only show loading if no project data is available yet
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-xl text-gray-700">Proje detayları yükleniyor...</p>
            </div>
        );
    }

    // If project data is not loaded and not loading, or an error occurred during fetch
    if (!project && !isLoading && isError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-xl text-red-500">{message || 'Projeyi yüklerken bir sorun oluştu veya bulunamadı.'}</p>
            </div>
        );
    }

    // If projectId is missing and not loading
    if (!projectId && !isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-xl text-red-500">Geçerli bir proje ID'si bulunamadı.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Projeyi Düzenle</h1>
                {isError && <p className="text-red-500 text-center mb-4">{message}</p>}
                {isSuccess && message.includes('güncellendi') && <p className="text-green-500 text-center mb-4">{message}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="projectTitle">
                            Proje Adı:
                        </label>
                        <input
                            type="text"
                            id="projectTitle"
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
                            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Güncelleniyor...' : 'Proje Güncelle'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="inline-block align-baseline font-bold text-sm text-gray-500 hover:text-gray-800"
                        >
                            İptal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
