// frontend/app/dashboard/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
// Proje işlemleri için projectsSlice'tan gerekli thunk'ları ve action'ları import ediyoruz
import { fetchProjects, deleteProject, resetProjectState, clearMessages } from "./../../../redux/slices/projectsSlice";
// Auth işlemleri için authSlice'tan logout thunk'ını import ediyoruz
import { logout } from "./../../../redux/slices/authSlice";

export default function DashboardPage() {
    // Projeler artık Redux state'inden gelecek, yerel state'e gerek yok
    // const [projects, setProjects] = useState([]);
    // Loading ve error durumları da Redux state'inden yönetilecek
    // const [loading, setLoading] = useState(true);
    // const [error, setError] = useState('');

    // UI ile ilgili yerel state'ler korunuyor
    const [showConfirmModal, setShowConfirmModal] = useState(false); // Onay modalı için state
    const [projectIdToDelete, setProjectIdToDelete] = useState(null); // Silinecek proje ID'si için state
    const [showMessageBox, setShowMessageBox] = useState(false); // Mesaj kutusu için state
    const [messageBoxContent, setMessageBoxContent] = useState(''); // Mesaj kutusu içeriği
    const [messageBoxType, setMessageBoxType] = useState('success'); // Mesaj kutusu tipi (success/error)

    const router = useRouter();
    const dispatch = useDispatch();

    // Redux store'dan projectsSlice'ın state'ini çekiyoruz
    const { projects, isLoading, isError, message, isSuccess } = useSelector(
        (state) => state.project // store'unuzda projectsSlice'ı 'projects' anahtarı altında tanımladığınızı varsayıyoruz
    );

    // Mesaj kutusunu göstermek için yardımcı fonksiyon
    const showMessage = (content, type = 'success') => {
        setMessageBoxContent(content);
        setMessageBoxType(type);
        setShowMessageBox(true);
        setTimeout(() => {
            setShowMessageBox(false);
            setMessageBoxContent('');
            dispatch(clearMessages()); // Mesaj kutusu kapandığında Redux mesajını da temizle
        }, 3000); // 3 saniye sonra otomatik kapanır
    };

    // Projeleri çekmek için useEffect
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login'); // Token yoksa login sayfasına yönlendir
            return;
        }
        dispatch(fetchProjects(token)); // Tüm projeleri çekmek için fetchProjects thunk'ını dispatch et

        // Component unmount olduğunda veya token değiştiğinde Redux state'ini temizle
        return () => {
            dispatch(resetProjectState());
        };
    }, [router, dispatch]); // router ve dispatch bağımlılık olarak eklendi

    // Redux state'indeki başarı/hata mesajlarını dinlemek ve UI'da göstermek için useEffect
    useEffect(() => {
        if (isSuccess && message) {
            // Sadece başarılı proje işlemleri için (yükleme, silme, oluşturma/güncelleme)
            if (message.includes('silindi') || message.includes('yüklendi') || message.includes('oluşturuldu') || message.includes('güncellendi')) {
                showMessage(message, 'success');
            }
        }
        if (isError && message) {
            showMessage(message, 'error');
            // Kimlik doğrulama hatası durumunda kullanıcıyı login sayfasına yönlendir
            if (message.includes('Unauthorized') || message.includes('Forbidden') || message.includes('token')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                router.push('/login');
            }
        }
    }, [isSuccess, isError, message, router, dispatch]); // dispatch'i de bağımlılıklara ekledik

    // Proje silme onay modalını tetikleyen fonksiyon
    const handleDeleteClick = (projectId) => {
        setProjectIdToDelete(projectId);
        setShowConfirmModal(true); // Onay modalını göster
    };

    // Proje silme işlemini onaylayan ve thunk'ı dispatch eden fonksiyon
    const confirmDelete = async () => {
        setShowConfirmModal(false); // Onay modalını kapat
        if (!projectIdToDelete) return; // Silinecek proje ID'si yoksa çık

        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login'); // Token yoksa login sayfasına yönlendir
            return;
        }
        // deleteProject thunk'ını dispatch et
        dispatch(deleteProject({ projectId: projectIdToDelete, token }));
        setProjectIdToDelete(null); // Silme işlemini sıfırla
    };

    // Proje silme işlemini iptal eden fonksiyon
    const cancelDelete = () => {
        setShowConfirmModal(false);
        setProjectIdToDelete(null);
    };

    // Çıkış yapma fonksiyonu, authSlice'taki logout thunk'ını kullanır
    const handleLogout = () => {
        dispatch(logout()); // Redux logout thunk'unu dispatch et
        router.push('/login'); // Çıkış sonrası giriş sayfasına yönlendir
    };

    // Yükleme durumu gösterimi
    // isLoading true ise ve henüz hiç proje yüklenmemişse (projects dizisi boşsa) yükleniyor mesajı göster
    if (isLoading && projects.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-xl text-gray-700">Projeler yükleniyor...</p>
            </div>
        );
    }

    // Yükleme bittiğinde (isLoading false) ve hata varsa (isError true) ve proje listesi boşsa hata mesajı göster
    if (!isLoading && isError && projects.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-xl text-red-500">{message || 'Projeleri yüklerken bir sorun oluştu.'}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-sans">
            {/* Mesaj Kutusu bileşeni */}
            {showMessageBox && (
                <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white z-50
                    ${messageBoxType === 'success' ? 'bg-green-500' : 'bg-red-500'}`}
                >
                    {messageBoxContent}
                </div>
            )}

            {/* Onay Modalı bileşeni */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
                        <h3 className="text-xl font-semibold mb-4 text-gray-800">Projeyi Silmek İstiyor Musunuz?</h3>
                        <p className="text-gray-600 mb-6">Bu işlem geri alınamaz.</p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={confirmDelete}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                            >
                                Sil
                            </button>
                            <button
                                onClick={cancelDelete}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-200"
                            >
                                İptal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sayfa başlığı ve aksiyon düğmeleri */}
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-md">
                <h1 className="text-4xl font-bold text-gray-800">Projelerim</h1>
                <div className="flex items-center space-x-4">
                    <Link href="/create-project" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200">
                        Yeni Proje Oluştur
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                    >
                        Çıkış Yap
                    </button>
                </div>
            </div>

            {/* Proje listesi veya "Henüz hiç proje oluşturmadınız" mesajı */}
            {projects.length === 0 && !isLoading ? ( // isLoading false olduğunda ve proje yoksa bu mesajı göster
                <p className="text-center text-gray-600 text-lg mt-10">Henüz hiç proje oluşturmadınız.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(project => (
                        <div key={project._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                            {/* Backend'den gelen veriye göre project.title veya project.name kullanabiliriz */}
                            <h2 className="text-2xl font-semibold text-gray-800 mb-2">{project.title || project.name}</h2>
                            <p className="text-gray-600 mb-4">{project.description}</p>
                            {/* Proje sahibi bilgisi varsa göster */}
                            {project.owner && (
                                <p className="text-gray-500 text-sm">Oluşturan: {project.owner.username || project.owner.email}</p>
                            )}
                            <div className="mt-4 flex justify-end space-x-2">
                                <Link href={`/projects/${project._id}`} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-3 rounded-lg text-sm transition duration-200">
                                    Detaylar
                                </Link>
                                <Link href={`/edit-project/${project._id}`} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-3 rounded-lg text-sm transition duration-200">
                                    Düzenle
                                </Link>
                                <button
                                    onClick={() => handleDeleteClick(project._id)}
                                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-3 rounded-lg text-sm transition duration-200"
                                >
                                    Sil
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
