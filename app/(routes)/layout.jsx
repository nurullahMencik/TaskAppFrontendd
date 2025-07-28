// frontend/app/routes/layout.js
import Header from '../../components/Header'; // Header bileşenini import edin

export default function AuthenticatedLayout({ children }) {
  return (
    <>
      <Header /> {/* Header bileşenini buraya yerleştirin */}
      <main className="min-h-[calc(100vh-64px)]"> {/* Header yüksekliği kadar boşluk bırakabiliriz, 64px varsayılan p-4 header yüksekliği */}
        {children} {/* Dashboard, Create Project vb. sayfalar burada render edilecek */}
      </main>
    </>
  );
}