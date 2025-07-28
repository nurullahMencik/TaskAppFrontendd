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

        if (!projectId) return;

        dispatch(fetchProjectById({ projectId, token }));
        dispatch(fetchProjectTasks({ projectId, token }));

        return () => {
            dispatch(resetProjectState());
        };
    }, [projectId, router, dispatch]);

    const handleDeleteTask = (taskId) => {
        if (!window.confirm("Bu görevi silmek istediğinizden emin misiniz?")) return;

        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        dispatch(deleteTask({ taskId, token }))
            .unwrap()
            .then(() => alert("Görev başarıyla silindi."))
            .catch((error) => console.error("Görev silinirken hata oluştu:", error));
    };

    const handleUpdateTaskStatus = (taskId, currentStatus) => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
            return;
        }

        let nextStatus, alertMessage;
        switch (currentStatus) {
            case "pending":
                nextStatus = "in-progress";
                alertMessage = 'Görev "Devam Ediyor" olarak güncellendi.';
                break;
            case "in-progress":
                nextStatus = "completed";
                alertMessage = 'Görev "Tamamlandı" olarak güncellendi.';
                break;
            case "completed":
                nextStatus = "pending";
                alertMessage = 'Görev "Beklemede" olarak güncellendi.';
                break;
            default:
                nextStatus = "pending";
                alertMessage = 'Görev "Beklemede" olarak güncellendi.';
        }

        dispatch(updateTaskStatus({ taskId, nextStatus, token }))
            .unwrap()
            .then(() => alert(alertMessage))
            .catch((error) => console.error("Durum güncellenirken hata:", error));
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
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-10">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h1 className="text-2xl sm:text-4xl font-bold text-gray-800">
                        {project.title}
                    </h1>
                    <Link
                        href="/dashboard"
                        className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded"
                    >
                        Dashboard'a Dön
                    </Link>
                </div>

                <p className="text-gray-600 mb-2">{project.description}</p>
                <p className="text-gray-500 text-sm mb-6">
                    Oluşturan: {project.owner?.username || "Bilinmiyor"}
                </p>

                <hr className="my-8" />

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h2 className="text-xl sm:text-3xl font-bold text-gray-800">Görevler</h2>
                    <Link
                        href={`/projects/${projectId}/create-task`}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                    >
                        Yeni Görev
                    </Link>
                </div>

                {tasks.length === 0 ? (
                    <p className="text-center text-gray-600 text-lg mt-10">
                        Bu projede henüz görev yok.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tasks.map((task) => (
                            <div
                                key={task._id}
                                className={`bg-white rounded-xl p-5 shadow-sm border-t-4 ${getStatusColorClass(
                                    task.status
                                )}`}
                            >
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">{task.title}</h3>
                                <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                                <p className="text-sm text-gray-500">
                                    Durum:{" "}
                                    <span
                                        className={`font-semibold ${getStatusColorClass(
                                            task.status
                                        ).replace("border", "text")}`}
                                    >
                                        {getStatusText(task.status)}
                                    </span>
                                </p>
                                <p className="text-sm text-gray-500 mb-4">
                                    Atanan: {task.assignedTo?.username || "Atanmadı"}
                                </p>

                                <div className="flex flex-wrap gap-2 justify-end">
                                    <button
                                        onClick={() =>
                                            handleUpdateTaskStatus(task._id, task.status)
                                        }
                                        className={`py-1 px-3 rounded text-xs font-semibold ${getButtonColorClass(
                                            task.status
                                        )}`}
                                    >
                                        {getButtonText(task.status)}
                                    </button>

                                    <Link
                                        href={`/tasks/${task._id}`}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold py-1 px-3 rounded"
                                    >
                                        Detay
                                    </Link>

                                    <Link
                                        href={`/tasks/${task._id}/logs`}
                                        className="bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold py-1 px-3 rounded"
                                    >
                                        Loglar
                                    </Link>

                                    <Link
                                        href={`/tasks/${task._id}/edit`}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold py-1 px-3 rounded"
                                    >
                                        Düzenle
                                    </Link>

                                    <button
                                        onClick={() => handleDeleteTask(task._id)}
                                        className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-1 px-3 rounded"
                                    >
                                        Sil
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
