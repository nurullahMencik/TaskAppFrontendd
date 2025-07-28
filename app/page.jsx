// frontend/app/page.jsx (GÜNCELLENMİŞ HALİ)
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center p-8 text-center bg-gray-50"> {/* Header yüksekliği kadar boşluk bırakıldı */}
      <h1 className="text-5xl font-extrabold text-gray-900 mb-6 animate-fade-in-down">
        Görev Yönetim Uygulamasına Hoş Geldiniz!
      </h1>
      <p className="text-xl text-gray-700 mb-8 max-w-2xl">
        Projelerinizi ve görevlerinizi kolayca takip edin, ekip üyeleriyle işbirliği yapın.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/login"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          Giriş Yap
        </Link>
        <Link
          href="/register"
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          Kayıt Ol
        </Link>
      </div>
    </main>
  );
}