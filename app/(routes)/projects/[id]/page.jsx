"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchProjectById,
    fetchProjectTasks,
    deleteTask,
    updateTaskStatus,
    resetProjectState, 
} from "./../../../../redux/slices/projectsSlice"; 

export default function ProjectDetailsPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const params = useParams();
    const projectId = params.id;


    const { project, tasks, isLoading, isError, message } = useSelector(
        (state) => state.project 
    );

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        if (!projectId) {
            // Handle case where projectId is not available yet (e.g., initial render)
            return;
        }

        // Dispatch actions to fetch project details and tasks
        dispatch(fetchProjectById({ projectId, token }));
        dispatch(fetchProjectTasks({ projectId, token }));

        // Clean up state when component unmounts or projectId changes
        return () => {
            dispatch(resetProjectState());
        };
    }, [projectId, router, dispatch]);

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm("Bu görevi silmek istediğinizden emin misiniz?")) {
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        dispatch(deleteTask({ taskId, token }))
            .unwrap() // Use unwrap to handle fulfilled/rejected promises
            .then(() => {
                alert("Görev başarıyla silindi.");
            })
            .catch((error) => {
                console.error("Görev silinirken hata oluştu:", error);
                // Error handling is already in Redux slice, message will be in state.projects.message
            });
    };

    const handleUpdateTaskStatus = async (taskId, currentStatus) => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        let nextStatus;
        let alertMessage;

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
                nextStatus = "pending";
                alertMessage = 'Görev durumu "Beklemede" olarak güncellendi.';
                break;
            default:
                nextStatus = "pending";
                alertMessage = 'Görev durumu "Beklemede" olarak güncellendi.';
        }

        dispatch(updateTaskStatus({ taskId, nextStatus, token }))
            .unwrap()
            .then(() => {
                alert(alertMessage);
            })
            .catch((error) => {
                console.error("Görev durumu güncellenirken hata oluştu:", error);
                // Error handling already in Redux slice
            });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-xl text-gray-700">Yükleniyor...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-red-500 text-xl">{message || "Bir sorun oluştu."}</p>
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
            default:
                return "bg-purple-500 hover:bg-purple-600 text-white";
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-4xl font-bold text-gray-800">{project.title}</h1>
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
                            className={`bg-white p-6 rounded-lg shadow-md border-t-4 ${getStatusColorClass(
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
                            <div className="mt-4 flex flex-wrap justify-end gap-2">
                                <button
                                    onClick={() => handleUpdateTaskStatus(task._id, task.status)}
                                    className={`py-1 px-3 rounded text-sm font-bold ${getButtonColorClass(
                                        task.status
                                    )}`}
                                >
                                    {getButtonText(task.status)}
                                </button>
                                <Link
                                    href={`/tasks/${task._id}`}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-3 rounded text-sm"
                                >
                                    Detaylar
                                </Link>
                                <Link
                                    href={`/tasks/${task._id}/logs`}
                                    className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-1 px-3 rounded text-sm"
                                >
                                    Logları Görüntüle
                                </Link>
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
