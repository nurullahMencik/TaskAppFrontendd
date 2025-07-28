'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchTaskById,
    updateTask,
    fetchUsers,
    resetTaskState,
    clearMessages
} from '../../../../../redux/slices/taskSlice';

export default function EditTaskPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('pending');
    const [priority, setPriority] = useState('medium');
    const [assignedTo, setAssignedTo] = useState('');

    const [showMessageBox, setShowMessageBox] = useState(false);
    const [messageBoxContent, setMessageBoxContent] = useState('');
    const [messageBoxType, setMessageBoxType] = useState('success');

    const router = useRouter();
    const params = useParams();
    const taskId = params.id;

    const dispatch = useDispatch();
    const { task, users, isLoading, isSuccess, isError, message } = useSelector(
        (state) => state.task
    );

    const showMessage = (content, type = 'success') => {
        setMessageBoxContent(content);
        setMessageBoxType(type);
        setShowMessageBox(true);
        setTimeout(() => {
            setShowMessageBox(false);
            setMessageBoxContent('');
            dispatch(clearMessages());
        }, 2500);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return router.push('/login');
        if (taskId) {
            dispatch(fetchTaskById({ taskId, token }));
            dispatch(fetchUsers(token));
        }
        return () => dispatch(resetTaskState());
    }, [taskId]);

    useEffect(() => {
        if (task) {
            setTitle(task.title || '');
            setDescription(task.description || '');
            setStatus(task.status || 'pending');
            setPriority(task.priority || 'medium');
            setAssignedTo(task.assignedTo?._id || '');
        }
    }, [task]);

    useEffect(() => {
        if (isSuccess && message?.includes('güncellendi')) {
            showMessage(message, 'success');
            setTimeout(() => {
                if (task?.project?._id) {
                    router.push(`/projects/${task.project._id}`);
                } else {
                    router.push('/dashboard');
                }
            }, 1000);
        }
        if (isError && message) {
            showMessage(message, 'error');
            if (message.includes('token') || message.includes('Unauthorized')) {
                localStorage.clear();
                router.push('/login');
            }
        }
    }, [isSuccess, isError, message]);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(clearMessages());
        const token = localStorage.getItem('token');
        if (!token) return router.push('/login');
        dispatch(updateTask({
            taskId,
            updatedData: {
                title,
                description,
                status,
                priority,
                assignedTo: assignedTo || null
            },
            token
        }));
    };

    if (isLoading && !task) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-lg text-gray-600">Yükleniyor...</p>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-600 text-lg">Görev bulunamadı.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-8">
            {showMessageBox && (
                <div className={`fixed top-4 right-4 z-50 p-3 rounded-md text-white shadow-lg 
                    ${messageBoxType === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                    {messageBoxContent}
                </div>
            )}

            <div className="max-w-xl mx-auto border rounded-lg p-6 shadow-sm bg-gray-50">
                <h1 className="text-2xl font-semibold text-gray-800 mb-6">
                    Görevi Düzenle
                </h1>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Başlık</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Açıklama</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Durum</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm"
                        >
                            <option value="pending">Beklemede</option>
                            <option value="in-progress">Devam Ediyor</option>
                            <option value="completed">Tamamlandı</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Öncelik</label>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm"
                        >
                            <option value="low">Düşük</option>
                            <option value="medium">Orta</option>
                            <option value="high">Yüksek</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Atanan Kişi</label>
                        <select
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border rounded-md shadow-sm"
                        >
                            <option value="">Atanmadı</option>
                            {users.map((user) => (
                                <option key={user._id} value={user._id}>
                                    {user.username}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col-reverse sm:flex-row justify-between gap-3">
                        <Link
                            href={task.project?._id ? `/projects/${task.project._id}` : '/dashboard'}
                            className="text-center bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-md"
                        >
                            İptal
                        </Link>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
                        >
                            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
