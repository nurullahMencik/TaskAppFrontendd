'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTaskAndLogs,
  resetLogState,
  clearMessages,
} from '../../../../../redux/slices/logSlice';

export default function TaskLogsPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id;

  const dispatch = useDispatch();
  const { task, logs, isLoading, isError, message, isSuccess } = useSelector(
    (state) => state.log
  );

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
    if (taskId) {
      dispatch(fetchTaskAndLogs({ taskId, token }));
    }

    return () => {
      dispatch(resetLogState());
    };
  }, [taskId, router, dispatch]);

  useEffect(() => {
    if (isSuccess && message && message.includes('yüklendi')) {
      showMessage(message, 'success');
    }
    if (isError && message) {
      showMessage(message, 'error');
      if (
        message.includes('Unauthorized') ||
        message.includes('Forbidden') ||
        message.includes('token')
      ) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
      }
    }
  }, [isSuccess, isError, message, router, dispatch]);

  if (isLoading && !task && logs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <p className="text-xl text-gray-700 text-center">Loglar yükleniyor...</p>
      </div>
    );
  }

  if (!isLoading && isError && !task) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-100 text-red-700 p-4">
        <p className="text-xl text-center">
          Hata: {message || 'Görev veya loglar yüklenirken bir sorun oluştu.'}
        </p>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <p className="text-gray-700 text-xl text-center">Görev bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
      {showMessageBox && (
        <div
          className={`fixed top-4 right-4 p-3 sm:p-4 rounded-lg shadow-lg text-white z-50 ${
            messageBoxType === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {messageBoxContent}
        </div>
      )}

      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center sm:text-left">
            "{task.title}" Görev Logları
          </h1>
          {task.project && (
            <Link
              href={`/projects/${task.project._id}`}
              className="w-full sm:w-auto text-center bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Projeye Geri Dön
            </Link>
          )}
        </div>

        <p className="text-gray-600 mb-6 text-base sm:text-lg">
          Bu görevin geçmişteki tüm değişiklikleri ve olayları aşağıda
          listelenmiştir.
        </p>

        {logs.length === 0 ? (
          <p className="text-center text-gray-600 text-base sm:text-lg mt-10">
            Bu göreve ait henüz hiç log kaydı yok.
          </p>
        ) : (
          <div className="space-y-6">
            {logs.map((log) => (
              <div
                key={log._id}
                className="bg-gray-50 p-4 sm:p-5 rounded-lg border border-gray-200 shadow-sm"
              >
                <p className="text-gray-800 text-lg sm:text-xl font-semibold mb-2">
                  {log.description}
                </p>
                <div className="text-xs sm:text-sm text-gray-600 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <span>
                    Kullanıcı:{' '}
                    <span className="font-medium text-blue-700">
                      {log.user ? log.user.username : 'Bilinmiyor'}
                    </span>
                  </span>
                  <span>
                    Tarih:{' '}
                    <span className="font-medium">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </span>
                  <span>
                    Eylem:{' '}
                    <span className="font-medium capitalize">
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </span>
                </div>
                {(log.oldValue || log.newValue) && (
                  <details className="mt-4 text-sm text-gray-700">
                    <summary className="cursor-pointer font-semibold text-blue-700 hover:text-blue-800 transition-colors">
                      Detaylı Değişiklikler
                    </summary>
                    <div className="bg-gray-100 p-3 rounded-md mt-2 overflow-auto text-xs sm:text-sm">
                      {log.oldValue && (
                        <div className="mb-2">
                          <p className="font-bold text-gray-800">
                            Eski Değerler:
                          </p>
                          <pre className="whitespace-pre-wrap break-all text-xs">
                            {JSON.stringify(log.oldValue, null, 2)}
                          </pre>
                        </div>
                      )}
                      {log.newValue && (
                        <div>
                          <p className="font-bold text-gray-800">
                            Yeni Değerler:
                          </p>
                          <pre className="whitespace-pre-wrap break-all text-xs">
                            {JSON.stringify(log.newValue, null, 2)}
                          </pre>
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
