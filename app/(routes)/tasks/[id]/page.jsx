// frontend/app/tasks/[id]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function TaskDetailsPage() {
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();
    const params = useParams();
    const taskId = params.id; // URL'den görev ID'sini alıyoruz

    useEffect(() => {
        const fetchTaskDetails = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }
            if (!taskId) {
                setLoading(false);
                return;
            }

            try {
                // Backend'den görevi çek
                const res = await axios.get(`http://localhost:5000/api/tasks/${taskId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTask(res.data);
            } catch (err) {
                console.error('Görev detayları çekilirken hata oluştu:', err.response?.data?.message || err.message);
                setError('Görev detayları yüklenirken bir sorun oluştu veya görev bulunamadı.');
                if (err.response?.status === 401 || err.response?.status === 403 || err.response?.status === 404) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    router.push('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchTaskDetails();
    }, [taskId, router]);

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Beklemede';
            case 'in-progress': return 'Devam Ediyor';
            case 'completed': return 'Tamamlandı';
            case 'blocked': return 'Engellendi';
            default: return 'Bilinmiyor';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-xl text-gray-700">Yükleniyor...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-red-500 text-xl">{error}</p>
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
                        <p>{task.project ? task.project.name : 'Yok'}</p>
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
                    
                    <Link href={`/projects/${task.project._id}`} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
                        Projeye Geri Dön
                    </Link>
                </div>
            </div>
        </div>
    );
}