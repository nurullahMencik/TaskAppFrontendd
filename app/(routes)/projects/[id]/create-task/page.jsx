// frontend/app/projects/[id]/create-task/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { createTask, fetchUsers, resetTaskState, clearMessages } from '../../../../../redux/slices/taskSlice';

export default function CreateTaskPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    
    const router = useRouter();
    const params = useParams();
    const projectId = params.id;

    const dispatch = useDispatch();
    // tasksSlice'tan gerekli state'leri çekiyoruz
    const { users, isLoading, isSuccess, isError, message } = useSelector(
        (state) => state.task // store'unuzda taskSlice'ı 'tasks' anahtarı altında tanımladığınızı varsayıyoruz
    );

    // Mesaj kutusu için yerel state'ler
    const [showMessageBox, setShowMessageBox] = useState(false);
    const [messageBoxContent, setMessageBoxContent] = useState('');
    const [messageBoxType, setMessageBoxType] = useState('success');

    // Mesaj kutusunu göstermek için yardımcı fonksiyon
    const showMessage = (content, type = 'success') => {
        setMessageBoxContent(content);
        setMessageBoxType(type);
        setShowMessageBox(true);
        setTimeout(() => {
            setShowMessageBox(false);
            setMessageBoxContent('');
            dispatch(clearMessages()); // Mesaj kutusu kapandığında Redux mesajını da temizle
        }, 3000);
    };

    // Kullanıcıları çekmek için useEffect
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        dispatch(fetchUsers(token)); // Kullanıcıları çekmek için thunk'ı dispatch et

        // Cleanup: Bileşen unmount olduğunda state'i temizle
        return () => {
            dispatch(resetTaskState());
        };
    }, [router, dispatch]);

    // Redux state'indeki başarı/hata mesajlarını dinlemek ve UI'da göstermek için useEffect
    useEffect(() => {
        if (isSuccess && message) {
            if (message.includes('oluşturuldu')) {
                showMessage(message, 'success');
                setTimeout(() => {
                    router.push(`/projects/${projectId}`); // Görev oluşturulduktan sonra proje detay sayfasına yönlendir
                }, 1000); // Mesajı gösterdikten sonra yönlendir
            }
        }
        if (isError && message) {
            showMessage(message, 'error');
            if (message.includes('Unauthorized') || message.includes('Forbidden') || message.includes('token')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                router.push('/login');
            }
        }
    }, [isSuccess, isError, message, router, dispatch, projectId]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(clearMessages()); // Yeni gönderimden önce önceki mesajları temizle

        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        // createTask thunk'ını dispatch et
        dispatch(createTask({ projectId, title, description, assignedTo, token }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            {/* Mesaj Kutusu */}
            {showMessageBox && (
                <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white z-50
                    ${messageBoxType === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
                >
                    {messageBoxContent}
                </div>
            )}

            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Yeni Görev Oluştur</h1>
                {/* Hata mesajı artık Redux state'inden gelecek */}
                {/* {error && <p className="text-red-500 text-center mb-4">{error}</p>} */}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                            Görev Başlığı:
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
                    <div className="mb-4">
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
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="assignedTo">
                            Atanacak Kişi:
                        </label>
                        <select
                            id="assignedTo"
                            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                        >
                            <option value="">Atanmadı</option>
                            {users.map(user => (
                                <option key={user._id} value={user._id}>{user.username} ({user.email})</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            type="submit"
                            className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Oluşturuluyor...' : 'Görev Oluştur'}
                        </button>
                        <Link href={`/projects/${projectId}`} className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
                            İptal
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
