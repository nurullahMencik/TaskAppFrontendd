## TaskAPP

## 🔗 Projenin Canlı Adresi
*https://task-app-frontendd-139r.vercel.app/

*Hızlı Giriş: admin@gmail.com / 123456

## 🛠️ Kullanılan Teknolojiler

Bu projenin geliştirilmesinde aşağıdaki temel teknolojiler ve kütüphaneler kullanılmıştır:

**Frontend:**
* **React / Next.js:** Kullanıcı arayüzü ve sunucu tarafı renderlama için.
* **Tailwind CSS:** Hızlı ve esnek UI tasarımı için.
* **Axios:** Backend API ile iletişim kurmak için HTTP istemcisi.
* **Next.js Router:** Sayfalar arası navigasyon için.
* **React Hooks (useState, useEffect vb.):** Bileşenlerin durum yönetimi ve yan etkileri için.


## 🏛️ Mimari ve Proje Dizini

Proje, Client ve Server olmak üzere iki ana bölümden oluşan bir monorepo veya ayrı dizin yapısı kullanılarak geliştirilmiştir.

**Genel Yapı:**

```proje-ana-dizini/
├── Client/                             # Next.js istemci uygulaması
│   ├── app/                            # Next.js uygulaması (App Router kullanır)
│   │   ├── (auth)/                     # Kimlik doğrulama sayfaları (login, register vb.)
│   │   │   ├── login/page.jsx          # - Giriş sayfası
│   │   │   └── register/page.jsx       # - Kayıt sayfası
│   │   ├── (routes)/                   # rotalar
│   │   │   ├── create-project/page.jsx # Yeni proje oluşturma arayüzü
│   │   │   ├── dashboard/page.jsx      # Yönetim paneli sayfası
│   │   │   ├── projects/               # Proje listeleme ve detay görünümleri
│   │   │   │   ├── page.jsx            # - Proje listeleme sayfası
│   │   │   │   └── [id]/               # Dinamik proje ID'sine göre detay sayfaları
│   │   │   │       ├── page.jsx        #   - Proje detay sayfası
│   │   │   │       └── edit/page.jsx   #   - Proje düzenleme sayfası
│   │   │   └── tasks/                  # Görev listeleme ve detay görünümleri
│   │   │       ├── page.jsx            # - Görev listeleme sayfası
│   │   │       └── [id]/               # Dinamik görev ID'sine göre detay sayfaları
│   │   │           ├── page.jsx        #   - Görev detay sayfası
│   │   │           ├── edit/page.jsx   #   - Görev düzenleme sayfası
│   │   │           └── logs/page.jsx   #   - Görev logları sayfası
│   │   ├── globals.css                 # Global CSS stilleri
│   │   ├── layout.jsx                  # Uygulamanın ana düzen (layout) dosyası
│   │   └── page.jsx                    # Ana giriş sayfası (root page)
│   ├── components/                     # Uygulama genelinde kullanılan bileşenleri
│   ├── constans/                       # global değişkenler
│   ├── redux/                          # redux toolkit
│   │   ├── slices/                     # slicelar
│   │   │   ├── authSlice.js            # auth slice
│   │   │   ├── logSlice.js             # log slice
│   │   │   ├── projectsSlice.js        # projects slice
│   │   │   ├── taskSlice.js            # task slice
│   │   ├── store.js                    # store dosyası
│   ├── package.json                    # Frontend bağımlılıkları ve scriptleri          


## ✨ Ekstra Özellikler

* **Detaylı Loglama Sistemi:** Görevlerin oluşturulması, güncellenmesi ve silinmesi gibi kritik işlemlerin kayıtları `Log` modeli aracılığıyla tutulmaktadır. Her görev için ayrı ayrı log geçmişi görüntülenebilir. Bu sayede görevlerde yapılan tüm değişiklikler ve bu değişiklikleri kimin yaptığı takip edilebilir.
* **Rol Tabanlı Erişim Kontrolü:** Kullanıcılar `admin`, `manager`, `developer` gibi rollere sahip olabilirler. Bu roller, belirli API endpoint'lerine erişimi (örneğin, tüm logları yalnızca adminlerin görmesi gibi) kısıtlamak için kullanılır.
* **Token Tabanlı Kimlik Doğrulama:** JWT kullanılarak kullanıcı oturumları güvenli bir şekilde yönetilir. Her istekte kullanıcının yetkisi doğrulanır.
* **Global Hata Yönetimi:** Middleware aracılığıyla merkezi bir hata işleme sistemi bulunmaktadır, bu da sunucu hatalarının daha düzenli bir şekilde ele alınmasını sağlar.

## 📊 (Opsiyonel) Kısa Diyagram

+------------+        +--------------+        +----------+
|  Kullanıcı | <----> |   Frontend   | <----> |  Backend |
| (Tarayıcı) |        |  (Next.js)   |        | (Node.js/|
+------------+        +--------------+        | Express) |
+----------+
|
V
+----------+
| MongoDB  |

+----------+



