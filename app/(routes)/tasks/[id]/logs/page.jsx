// frontend/app/tasks/[id]/logs/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTaskAndLogs, resetLogState, clearMessages } from '../../../../../redux/slices/logSlice'; // logSlice'tan import ediyoruz

export default function TaskLogsPage() {
    // Tüm state'ler artık Redux store'dan yönetilecek
    // const [task, setTask] = useState(null);
    // const [logs, setLogs] = useState([]);
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState('');

    const router = useRouter();
    const params = useParams();
    const taskId = params.id;

    const dispatch = useDispatch();
    // logSlice'tan gerekli state'leri çekiyoruz
    const { task, logs, isLoading, isError, message, isSuccess } = useSelector(
        (state) => state.log // store'unuzda logSlice'ı 'logs' anahtarı altında tanımladığınızı varsayıyoruz
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

    // Görev detaylarını ve logları çekmek için useEffect
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        if (taskId) {
            dispatch(fetchTaskAndLogs({ taskId, token })); // Hem görev hem de logları çeken thunk'ı dispatch et
        }

        // Cleanup: Bileşen unmount olduğunda state'i temizle
        return () => {
            dispatch(resetLogState());
        };
    }, [taskId, router, dispatch]);

    // Redux state'indeki başarı/hata mesajlarını dinlemek ve UI'da göstermek için useEffect
    useEffect(() => {
        if (isSuccess && message) {
            // Sadece log yükleme başarı mesajı için
            if (message.includes('yüklendi')) {
                showMessage(message, 'success');
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
    }, [isSuccess, isError, message, router, dispatch]);

    // Yükleme durumu gösterimi
    if (isLoading && !task && logs.length === 0) { // İlk yüklemede ve veri yokken loading göster
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-xl text-gray-700">Loglar yükleniyor...</p>
            </div>
        );
    }

    // Yükleme bittiğinde ve hata varsa (ve görev/loglar yüklenememişse) hata mesajı göster
    if (!isLoading && isError && !task) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-100 text-red-700 p-4">
                <p className="text-xl">Hata: {message || 'Görev veya loglar yüklenirken bir sorun oluştu.'}</p>
            </div>
        );
    }

    // Görev bulunamadıysa (ve yükleme veya hata durumu değilse)
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

            <div className="bg-white p-8 rounded-lg shadow-md max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">
                        "{task.title}" Görev Logları
                    </h1>
                    {/* Görevin ait olduğu projeye geri dönmek için Link */}
                    {task.project && (
                        <Link href={`/projects/${task.project._id}`} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105">
                            Projeye Geri Dön
                        </Link>
                    )}
                </div>

                <p className="text-gray-600 mb-6">Bu görevin geçmişteki tüm değişiklikleri ve olayları aşağıda listelenmiştir.</p>

                {logs.length === 0 ? (
                    <p className="text-center text-gray-600 text-lg mt-10">Bu göreve ait henüz hiç log kaydı yok.</p>
                ) : (
                    <div className="space-y-6">
                        {logs.map(log => (
                            <div key={log._id} className="bg-gray-50 p-5 rounded-lg border border-gray-200 shadow-sm">
                                <p className="text-gray-800 text-lg font-semibold mb-2">{log.description}</p>
                                <div className="text-sm text-gray-600 flex items-center space-x-4">
                                    <span>
                                        Kullanıcı: <span className="font-medium text-blue-700">{log.user ? log.user.username : 'Bilinmiyor'}</span>
                                    </span>
                                    <span>
                                        Tarih: <span className="font-medium">{new Date(log.timestamp).toLocaleString()}</span>
                                    </span>
                                    <span>
                                        Eylem: <span className="font-medium capitalize">{log.action.replace(/_/g, ' ')}</span>
                                    </span>
                                </div>
                                {(log.oldValue || log.newValue) && (
                                    <details className="mt-4 text-sm text-gray-700">
                                        <summary className="cursor-pointer font-semibold text-blue-700 hover:text-blue-800 transition-colors">
                                            Detaylı Değişiklikler
                                        </summary>
                                        <div className="bg-gray-100 p-3 rounded-md mt-2 overflow-auto text-xs">
                                            {log.oldValue && (
                                                <div className="mb-2">
                                                    <p className="font-bold text-gray-800">Eski Değerler:</p>
                                                    <pre className="whitespace-pre-wrap break-all">{JSON.stringify(log.oldValue, null, 2)}</pre>
                                                </div>
                                            )}
                                            {log.newValue && (
                                                <div>
                                                    <p className="font-bold text-gray-800">Yeni Değerler:</p>
                                                    <pre className="whitespace-pre-wrap break-all">{JSON.stringify(log.newValue, null, 2)}</pre>
                                                </div>
                                            )}
                                        </div>
                                    </details>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
