"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProjectById,
  updateProject,
  resetProjectState,
  clearMessages,
} from "../../../../redux/slices/projectsSlice";

export default function EditProjectPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();
  const params = useParams();
  const projectId = params.id;

  const dispatch = useDispatch();
  const { project, isLoading, isSuccess, isError, message } = useSelector(
    (state) => state.project
  );

  useEffect(() => {
    if (projectId) {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      dispatch(fetchProjectById({ projectId, token }));
    }

    return () => {
      dispatch(resetProjectState());
    };
  }, [projectId, router, dispatch]);

  useEffect(() => {
    if (project) {
      setTitle(project.title || "");
      setDescription(project.description || "");
    }
  }, [project]);

  useEffect(() => {
    if (isSuccess && message.includes("güncellendi")) {
      console.log(message);
      setTimeout(() => {
        dispatch(resetProjectState());
        router.push("/dashboard");
      }, 1000);
    }

    if (isError) {
      console.error("Proje işlemi sırasında hata:", message);

      if (
        message.includes("Unauthorized") ||
        message.includes("Forbidden") ||
        message.includes("token")
      ) {
        router.push("/login");
      }

      setTimeout(() => {
        dispatch(clearMessages());
      }, 5000);
    }
  }, [isSuccess, isError, message, router, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearMessages());

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    dispatch(updateProject({ projectId, title, description, token }));
  };

  if (isLoading && !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-gray-700">Proje detayları yükleniyor...</p>
      </div>
    );
  }

  if (!project && !isLoading && isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-red-500">
          {message || "Projeyi yüklerken bir sorun oluştu veya bulunamadı."}
        </p>
      </div>
    );
  }

  if (!projectId && !isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-xl text-red-500">
          Geçerli bir proje ID'si bulunamadı.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Projeyi Düzenle
        </h1>
        {isError && <p className="text-red-500 text-center mb-4">{message}</p>}
        {isSuccess && message.includes("güncellendi") && (
          <p className="text-green-500 text-center mb-4">{message}</p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="projectTitle"
            >
              Proje Adı:
            </label>
            <input
              type="text"
              id="projectTitle"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="description"
            >
              Açıklama:
            </label>
            <textarea
              id="description"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32 resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none cursor-pointer focus:shadow-outline ${
                isLoading ? "opacity-50 cursor-not-allowed " : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Güncelleniyor..." : "Proje Güncelle"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-block align-baseline font-bold text-sm text-gray-500 hover:text-gray-800 cursor-pointer"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
