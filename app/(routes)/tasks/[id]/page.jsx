'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTaskById, resetTaskState } from "./../../../../redux/slices/taskSlice"

export default function TaskDetailsPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const params = useParams();
    const taskId = params.id; // Get task ID from URL

    // Select state from the Redux store
    const { task, isLoading, isError, message } = useSelector(
        (state) => state.task // Assuming your taskSlice is named 'tasks' in your Redux store configuration
    );

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        if (!taskId) {
            // If taskId is not yet available, do nothing. useEffect will re-run when it is.
            return;
        }

        dispatch(fetchTaskById({ taskId, token }));

        // Cleanup: Reset task state when the component unmounts or taskId changes
        return () => {
            dispatch(resetTaskState());
        };
    }, [taskId, router, dispatch]); // Add dispatch to the dependency array

    const getStatusText = (status) => {
        switch (status) {
            case 'pending':
                return 'Beklemede';
            case 'in-progress':
                return 'Devam Ediyor';
            case 'completed':
                return 'Tamamlandı';
            case 'blocked':
                return 'Engellendi';
            default:
                return 'Bilinmiyor';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-xl text-gray-700">Yükleniyor...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-red-500 text-xl">{message || 'Bir sorun oluştu.'}</p>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-700 text-xl">Görev bulunamadı.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">{task.title}</h1>
                <p className="text-gray-700 text-lg mb-4">{task.description}</p>
                <div className="grid grid-cols-2 gap-4 text-gray-600 mb-6">
                    <div>
                        <p className="font-semibold">Durum:</p>
                        <p>{getStatusText(task.status)}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Öncelik:</p>
                        <p className="capitalize">{task.priority}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Atanan Kişi:</p>
                        <p>{task.assignedTo ? task.assignedTo.username : 'Atanmadı'}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Proje:</p>
                        {/* Ensure task.project exists before trying to access its properties */}
                        <p>{task.project ? task.project.title || task.project.name : 'Yok'}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Oluşturulma Tarihi:</p>
                        <p>{new Date(task.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Son Güncelleme:</p>
                        <p>{new Date(task.updatedAt).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="flex justify-end space-x-4">
                    <Link href={`/tasks/${taskId}/edit`} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                        Görevi Düzenle
                    </Link>

                    {/* Check if task.project exists before trying to access its _id */}
                    {task.project && (
                        <Link href={`/projects/${task.project._id}`} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
                            Projeye Geri Dön
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
