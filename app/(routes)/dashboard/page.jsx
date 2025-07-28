'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjects, deleteProject, resetProjectState, clearMessages } from "./../../../redux/slices/projectsSlice";
import { logout } from "./../../../redux/slices/authSlice";

export default function DashboardPage() {
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [projectIdToDelete, setProjectIdToDelete] = useState(null);
    const [showMessageBox, setShowMessageBox] = useState(false); 
    const [messageBoxContent, setMessageBoxContent] = useState(''); 
    const [messageBoxType, setMessageBoxType] = useState('success'); 

    const router = useRouter();
    const dispatch = useDispatch();

    const { projects, isLoading, isError, message, isSuccess } = useSelector(
        (state) => state.project 
    );

    // Mesaj kutusunu göstermek için yardımcı fonksiyon
    const showMessage = (content, type = 'success') => {
        setMessageBoxContent(content);
        setMessageBoxType(type); // Şimdi bu bir fonksiyon
        setShowMessageBox(true);
        setTimeout(() => {
            setShowMessageBox(false);
            setMessageBoxContent('');
            dispatch(clearMessages()); 
        }, 3000); 
    };

    // Projeleri çekmek için useEffect
    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null; 
        if (!token) {
            router.push('/login'); 
            return;
        }
        dispatch(fetchProjects(token)); 

        return () => {
            dispatch(resetProjectState());
        };
    }, [router, dispatch]); 

    // Redux state'indeki başarı/hata mesajlarını dinlemek ve UI'da göstermek için useEffect
    useEffect(() => {
        if (isSuccess && message) {
            if (message.includes('silindi') || message.includes('yüklendi') || message.includes('oluşturuldu') || message.includes('güncellendi')) {
                showMessage(message, 'success');
            }
        }
        if (isError && message) {
            showMessage(message, 'error');
            if (message.includes('Unauthorized') || message.includes('Forbidden') || message.includes('token')) {
                typeof window !== 'undefined' && localStorage.removeItem('token');
                typeof window !== 'undefined' && localStorage.removeItem('user');
                setTimeout(() => { 
                    router.push('/login');
                }, 2000);
            }
        }
    }, [isSuccess, isError, message, router, dispatch]);

    const handleDeleteClick = (projectId) => {
        setProjectIdToDelete(projectId);
        setShowConfirmModal(true); 
    };

    const confirmDelete = () => {
        setShowConfirmModal(false); 
        if (!projectIdToDelete) return; 

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
            router.push('/login'); 
            return;
        }
        dispatch(deleteProject({ projectId: projectIdToDelete, token }));
        setProjectIdToDelete(null); 
    };

    const cancelDelete = () => {
        setShowConfirmModal(false);
        setProjectIdToDelete(null);
    };

    const handleLogout = () => {
        dispatch(logout()); 
        router.push('/login'); 
    };

    // Yükleme durumu gösterimi
    if (isLoading && projects.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center text-gray-700">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-4 border-blue-500 border-gray-200 mb-4"></div> {/* Basit spinner */}
                    <p className="text-xl">Projeler yükleniyor...</p>
                </div>
            </div>
        );
    }

    // Yükleme bittiğinde (isLoading false) ve (isError true) ve proje listesi boşsa hata mesajı göster
    if (!isLoading && isError && projects.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center text-red-600 p-4 text-center">
                    <p className="text-2xl font-bold mb-4">Hata!</p>
                    <p className="text-xl">{message || 'Projeleri yüklerken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.'}</p>
                    <button
                        onClick={() => {
                            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                            dispatch(fetchProjects(token)); 
                        }}
                        className="mt-6 bg-red-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-600 transition duration-200 font-semibold"
                    >
                        Tekrar Dene
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Mesaj Kutusu bileşeni */}
            {showMessageBox && (
                <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white z-50 transform transition-all duration-300 ${
                    messageBoxType === 'success' ? 'bg-green-600' : 'bg-red-600'
                } animate-fade-in-right`}
                >
                    {messageBoxContent}
                </div>
            )}

            {/* Onay Modalı bileşeni */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center transform scale-95 animate-scale-in">
                        <span className="text-red-500 text-5xl mb-5 block">⚠️</span> 
                        <h3 className="text-xl font-bold mb-3 text-gray-800">Projeyi Silmek İstiyor Musunuz?</h3>
                        <p className="text-gray-600 mb-6">Bu işlem geri alınamaz.</p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={confirmDelete}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-200"
                            >
                                Sil
                            </button>
                            <button
                                onClick={cancelDelete}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-200"
                            >
                                İptal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sabit Header Bölümü */}
            <header className="sticky top-0 z-40 bg-white shadow-lg p-4 sm:px-8 flex justify-between items-center flex-wrap gap-4">
                <Link href="/dashboard" className="flex items-center text-blue-700 hover:text-blue-900 transition duration-200">
                    <span className="text-blue-500 text-3xl mr-3">📊</span> 
                    <h1 className="text-3xl font-extrabold text-gray-800">Projelerim</h1>
                </Link>
                
                <div className="flex items-center space-x-3 sm:space-x-4">
                    <Link href="/create-project" 
                        className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
                        <span>➕</span> 
                        Yeni Proje Oluştur
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
                    >
                        <span>➡️</span> 
                        Çıkış Yap
                    </button>
                </div>
            </header>

            {/* Ana İçerik Alanı */}
            <main className="flex-1 p-6 sm:p-8">
                {projects.length === 0 && !isLoading && !isError ? ( 
                    <div className="flex flex-col items-center justify-center h-[calc(100vh-180px)] text-gray-600">
                        <span className="text-gray-400 text-7xl mb-6">📂</span> 
                        <p className="text-2xl font-semibold mb-4">Henüz hiç proje oluşturmadınız.</p>
                        <p className="text-lg mb-8 text-center max-w-md">
                            İlk projenizi oluşturarak görev yönetimine başlayın ve işlerinizi kolayca takip edin!
                        </p>
                        <Link href="/create-project" 
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2">
                            <span>➕</span> 
                            İlk Projeyi Oluştur
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
                        {projects.map(project => (
                            <div key={project._id} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-100">
                                <h2 className="text-2xl font-bold text-gray-800 mb-3 leading-tight">{project.title || project.name}</h2>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{project.description}</p>
                                
                                {project.owner && project.owner.username && (
                                    <p className="text-gray-500 text-xs font-medium mb-4">
                                        Oluşturan: <span className="text-gray-700">{project.owner.username}</span>
                                    </p>
                                )}
                                
                                <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end space-x-3">
                                    <Link href={`/projects/${project._id}`} 
                                        className="flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg text-sm transition duration-200">
                                        <span>👁️</span> Detaylar 
                                    </Link>
                                    <Link href={`/edit-project/${project._id}`} 
                                        className="flex items-center bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-semibold py-2 px-4 rounded-lg text-sm transition duration-200">
                                        <span>✍️</span> Düzenle 
                                    </Link>
                                    <button
                                        onClick={() => handleDeleteClick(project._id)}
                                        className="flex items-center bg-red-100 hover:bg-red-200 text-red-700 font-semibold py-2 px-4 rounded-lg text-sm transition duration-200"
                                    >
                                        <span>🗑️</span> Sil 
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
