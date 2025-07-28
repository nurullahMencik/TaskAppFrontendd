// frontend/app/tasks/[id]/edit/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTaskById, updateTask, fetchUsers, resetTaskState, clearMessages } from '../../../../../redux/slices/taskSlice';

export default function EditTaskPage() {
    // Görev ve kullanıcı bilgileri Redux state'inden gelecek
    // const [task, setTask] = useState(null);
    // const [users, setUsers] = useState([]);
    // Loading ve error durumları Redux state'inden yönetilecek
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState('');

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('pending');
    const [priority, setPriority] = useState('medium');
    const [assignedTo, setAssignedTo] = useState('');

    const router = useRouter();
    const params = useParams();
    const taskId = params.id;

    const dispatch = useDispatch();
    // tasksSlice'tan gerekli state'leri çekiyoruz
    const { task, users, isLoading, isSuccess, isError, message } = useSelector(
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

    // Görev detaylarını ve kullanıcıları çekmek için useEffect
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        if (taskId) {
            dispatch(fetchTaskById({ taskId, token })); // Görev detaylarını çek
            dispatch(fetchUsers(token)); // Kullanıcıları çek
        }

        // Cleanup: Bileşen unmount olduğunda state'i temizle
        return () => {
            dispatch(resetTaskState());
        };
    }, [taskId, router, dispatch]);

    // Görev verisi yüklendiğinde form alanlarını doldurmak için useEffect
    useEffect(() => {
        if (task) {
            setTitle(task.title || '');
            setDescription(task.description || '');
            setStatus(task.status || 'pending');
            setPriority(task.priority || 'medium');
            setAssignedTo(task.assignedTo ? task.assignedTo._id : '');
        }
    }, [task]);

    // Redux state'indeki başarı/hata mesajlarını dinlemek ve UI'da göstermek için useEffect
    useEffect(() => {
        if (isSuccess && message) {
            if (message.includes('güncellendi')) {
                showMessage(message, 'success');
                setTimeout(() => {
                    // Görevin ait olduğu proje sayfasına dönmek için task.project._id'yi kullanıyoruz
                    // task null olabilir, bu yüzden kontrol ekledik
                    if (task && task.project && task.project._id) {
                        router.push(`/projects/${task.project._id}`);
                    } else {
                        router.push('/dashboard'); // Proje ID'si yoksa dashboard'a git
                    }
                }, 1000);
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
    }, [isSuccess, isError, message, router, dispatch, task]); // task'ı bağımlılıklara ekledik

    const handleSubmit = async (e) => {
        e.preventDefault();
        dispatch(clearMessages()); // Yeni gönderimden önce önceki mesajları temizle

        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        const updatedData = {
            title,
            description,
            status,
            priority,
            assignedTo: assignedTo || null,
        };

        // updateTask thunk'ını dispatch et
        dispatch(updateTask({ taskId, updatedData, token }));
    };

    // Yükleme durumu gösterimi
    if (isLoading && !task) { // İlk yüklemede ve görev verisi henüz yokken loading göster
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-xl text-gray-700">Yükleniyor...</p>
            </div>
        );
    }

    // Görev verisi yüklenemediğinde ve yükleme bittiğinde hata göster
    if (!isLoading && isError && !task) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-red-500 text-xl">{message || 'Görev yüklenirken bir sorun oluştu veya bulunamadı.'}</p>
            </div>
        );
    }

    // Görev verisi yoksa (ve yükleme veya hata durumu değilse)
    if (!task) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-700 text-xl">Görev bulunamadı.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            {/* Mesaj Kutusu */}
            {showMessageBox && (
                <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white z-50
                    ${messageBoxType === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
                >
                    {messageBoxContent}
                </div>
            )}

            <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Görevi Düzenle: {task.title}</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-gray-700 font-bold mb-2">Başlık</label>
                        <input
                            type="text"
                            id="title"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-gray-700 font-bold mb-2">Açıklama</label>
                        <textarea
                            id="description"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="4"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                    </div>
                    <div>
                        <label htmlFor="status" className="block text-gray-700 font-bold mb-2">Durum</label>
                        <select
                            id="status"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="pending">Beklemede</option>
                            <option value="in-progress">Devam Ediyor</option>
                            <option value="completed">Tamamlandı</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="priority" className="block text-gray-700 font-bold mb-2">Öncelik</label>
                        <select
                            id="priority"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                        >
                            <option value="low">Düşük</option>
                            <option value="medium">Orta</option>
                            <option value="high">Yüksek</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="assignedTo" className="block text-gray-700 font-bold mb-2">Atanan Kişi</label>
                        <select
                            id="assignedTo"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                        >
                            <option value="">Atanmadı</option>
                            {users.map(user => (
                                <option key={user._id} value={user._id}>{user.username}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-4">
                        <Link href={task && task.project && task.project._id ? `/projects/${task.project._id}` : '/dashboard'} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
                            İptal
                        </Link>
                        <button
                            type="submit"
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Güncelleniyor...' : 'Görevi Güncelle'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
