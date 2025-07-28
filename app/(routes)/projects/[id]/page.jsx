"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function ProjectDetailsPage() {
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const params = useParams();
  const projectId = params.id;

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      if (!projectId) {
        setLoading(false);
        return;
      }

      try {
        // Proje detaylarını çek
        const projectRes = await axios.get(
          `http://localhost:5000/api/projects/${projectId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProject(projectRes.data);

        // Görevleri çek
        const tasksRes = await axios.get(
          `http://localhost:5000/api/projects/${projectId}/tasks`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTasks(tasksRes.data);
      } catch (err) {
        console.error(
          "Veri çekilirken hata oluştu:",
          err.response?.data?.message || err.message
        );
        setError("Proje veya görevleri yüklerken bir sorun oluştu.");
        if (
          err.response?.status === 401 ||
          err.response?.status === 403 ||
          err.response?.status === 404
        ) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, router]);

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Bu görevi silmek istediğinizden emin misiniz?")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.filter((task) => task._id !== taskId));
      alert("Görev başarıyla silindi.");
    } catch (err) {
      console.error(
        "Görev silinirken hata oluştu:",
        err.response?.data?.message || err.message
      );
      setError("Görevi silerken bir sorun oluştu.");
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
      }
    }
  };

  // DEĞİŞİKLİK BURADA: handleUpdateTaskStatus
  const handleUpdateTaskStatus = async (taskId, currentStatus) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    let nextStatus;
    let alertMessage;

    // Task modelinizdeki enum değerlerine göre geçiş mantığı
    switch (currentStatus) {
      case "pending":
        nextStatus = "in-progress";
        alertMessage = 'Görev durumu "Devam Ediyor" olarak güncellendi.';
        break;
      case "in-progress":
        nextStatus = "completed";
        alertMessage = 'Görev durumu "Tamamlandı" olarak güncellendi.';
        break;
      case "completed":
        nextStatus = "pending"; // Tamamlanmış bir görevi tekrar beklemeye al
        alertMessage = 'Görev durumu "Beklemede" olarak güncellendi.';
        break;
      default: // Bilinmeyen veya 'blocked' gibi durumlar için varsayılan
        nextStatus = "pending";
        alertMessage = 'Görev durumu "Beklemede" olarak güncellendi.';
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/tasks/${taskId}`,
        { status: nextStatus }, // 'status' alanını gönderiyoruz
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedTaskData = response.data;

      console.log("API yanıtı (updatedTaskData):", updatedTaskData); // Debug için ekledim

      setTasks(
        tasks.map(
          (task) =>
            task._id === taskId
              ? {
                  ...task,
                  status: updatedTaskData.status,
                  completed: updatedTaskData.completed,
                }
              : task
          // Backend'den gelen 'completed' bilgisini de güncelliyoruz
        )
      );
      alert(alertMessage);
    } catch (err) {
      console.error(
        "Görev durumu güncellenirken hata oluştu:",
        err.response?.data?.message || err.message
      );
      setError("Görev durumunu güncellerken bir sorun oluştu.");
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">Yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-500 text-xl">{error}</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-700 text-xl">Proje bulunamadı.</p>
      </div>
    );
  }

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Beklemede";
      case "in-progress":
        return "Devam Ediyor";
      case "completed":
        return "Tamamlandı";
      // case 'blocked': return 'Engellendi'; // Task modelinizde 'blocked' yoksa kaldırın
      default:
        return "Bilinmiyor";
    }
  };

  const getStatusColorClass = (status) => {
    switch (status) {
      case "pending":
        return "border-yellow-500";
      case "in-progress":
        return "border-blue-500";
      case "completed":
        return "border-green-500";
      // case 'blocked': return 'border-red-500'; // Task modelinizde 'blocked' yoksa kaldırın
      default:
        return "border-gray-400";
    }
  };

  const getButtonText = (status) => {
    switch (status) {
      case "pending":
        return "Başlat";
      case "in-progress":
        return "Tamamla";
      case "completed":
        return "Tekrar Başlat";
      // case 'blocked': return 'Durum Değiştir'; // Task modelinizde 'blocked' yoksa kaldırın
      default:
        return "Durum Güncelle";
    }
  };

  const getButtonColorClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-blue-500 hover:bg-blue-600 text-white";
      case "in-progress":
        return "bg-green-500 hover:bg-green-600 text-white";
      case "completed":
        return "bg-yellow-500 hover:bg-yellow-600 text-white";
      // case 'blocked': return 'bg-gray-500 hover:bg-gray-600 text-white'; // Task modelinizde 'blocked' yoksa kaldırın
      default:
        return "bg-purple-500 hover:bg-purple-600 text-white";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800">{project.title}</h1>{" "}
        {/* project.name yerine project.title */}
        <Link
          href="/dashboard"
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
        >
          Dashboard'a Geri Dön
        </Link>
      </div>
      <p className="text-gray-600 text-lg mb-4">{project.description}</p>
      <p className="text-gray-500 text-sm mb-8">
        Oluşturan:{" "}
        {project.owner && project.owner.username
          ? project.owner.username
          : "Bilinmiyor"}
      </p>

      <hr className="my-8" />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Görevler</h2>
        <Link
          href={`/projects/${projectId}/create-task`}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Yeni Görev Oluştur
        </Link>
      </div>

      {tasks.length === 0 ? (
        <p className="text-center text-gray-600 text-lg mt-10">
          Bu projede henüz hiç görev yok.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map((task) => (
            <div
              key={task._id}
              className={`bg-white p-6 rounded-lg shadow-md ${getStatusColorClass(
                task.status
              )}`}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {task.title}
              </h3>
              <p className="text-gray-600 mb-4">{task.description}</p>
              <p className="text-gray-500 text-sm">
                Durum:{" "}
                <span
                  className={`font-semibold ${getStatusColorClass(
                    task.status
                  ).replace("border", "text")}`}
                >
                  {getStatusText(task.status)}
                </span>
              </p>
              <p className="text-gray-500 text-sm">
                Atanan:{" "}
                {task.assignedTo ? task.assignedTo.username : "Atanmadı"}
              </p>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => handleUpdateTaskStatus(task._id, task.status)}
                  className={`py-1 px-3 rounded text-sm font-bold ${getButtonColorClass(
                    task.status
                  )}`}
                >
                  {getButtonText(task.status)}
                </button>
                {/* Detaylar linki */}
                <Link
                  href={`/tasks/${task._id}`}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-3 rounded text-sm"
                >
                  Detaylar
                </Link>
                <Link
                  href={`/tasks/${task._id}/logs`}
                  className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded"
                >
                  Logları Görüntüle
                </Link>
                {/* Düzenle linki */}
                <Link
                  href={`/tasks/${task._id}/edit`}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded text-sm"
                >
                  Düzenle
                </Link>
                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm"
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
