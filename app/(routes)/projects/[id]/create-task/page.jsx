'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import {
    createTask,
    fetchUsers,
    resetTaskState,
    clearMessages,
} from '../../../../../redux/slices/taskSlice';

export default function CreateTaskPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState('');

    const router = useRouter();
    const params = useParams();
    const projectId = params.id;

    const dispatch = useDispatch();
    const { users, isLoading, isSuccess, isError, message } = useSelector((state) => state.task);

    const [showMessageBox, setShowMessageBox] = useState(false);
    const [messageBoxContent, setMessageBoxContent] = useState('');
    const [messageBoxType, setMessageBoxType] = useState('success');

    const showMessage = (content, type = 'success') => {
        setMessageBoxContent(content);
        setMessageBoxType(type);
        setShowMessageBox(true);
        setTimeout(() => {
            setShowMessageBox(false);
            setMessageBoxContent('');
            dispatch(clearMessages());
        }, 3000);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        dispatch(fetchUsers(token));

        return () => {
            dispatch(resetTaskState());
        };
    }, [router, dispatch]);

    useEffect(() => {
        if (isSuccess && message?.includes('oluşturuldu')) {
            showMessage(message, 'success');
            setTimeout(() => {
                router.push(`/projects/${projectId}`);
            }, 1000);
        }

        if (isError && message) {
            showMessage(message, 'error');
            if (message.includes('Unauthorized') || message.includes('token')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                router.push('/login');
            }
        }
    }, [isSuccess, isError, message, router, dispatch, projectId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(clearMessages());

        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        dispatch(createTask({ projectId, title, description, assignedTo, token }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            {showMessageBox && (
                <div
                    className={`fixed top-4 right-4 px-6 py-3 rounded shadow-lg text-white z-50 transition-all duration-300
                    ${messageBoxType === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
                >
                    {messageBoxContent}
                </div>
            )}

            <div className="bg-white w-full max-w-md sm:max-w-lg p-6 sm:p-8 rounded-xl shadow-md">
                <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
                    Yeni Görev Oluştur
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Görev Başlığı
                        </label>
                        <input
                            id="title"
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Açıklama
                        </label>
                        <textarea
                            id="description"
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 h-28 border rounded-lg resize-none focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
                            Atanacak Kişi
                        </label>
                        <select
                            id="assignedTo"
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        >
                            <option value="">Atanmadı</option>
                            {users.map((user) => (
                                <option key={user._id} value={user._id}>
                                    {user.username} ({user.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`px-5 py-2 rounded font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2
                                ${isLoading
                                    ? 'bg-green-400 cursor-not-allowed'
                                    : 'bg-green-500 hover:bg-green-600 focus:ring-green-400'
                                }`}
                        >
                            {isLoading ? 'Oluşturuluyor...' : 'Görev Oluştur'}
                        </button>

                        <Link
                            href={`/projects/${projectId}`}
                            className="text-sm font-semibold text-blue-500 hover:underline"
                        >
                            İptal
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
