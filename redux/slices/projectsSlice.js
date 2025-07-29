import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = "https://taskappbackend-j2zj.onrender.com/api"

const handleApiError = (error, thunkAPI) => {
    const message =
        (error.response &&
            error.response.data &&
            error.response.data.message) ||
        error.message ||
        error.toString();

    if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

    }
    return thunkAPI.rejectWithValue(message);
};


export const createProject = createAsyncThunk(
    'projects/createProject',
    async ({ title, description, token }, thunkAPI) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/projects`,
                { title, description },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            return handleApiError(error, thunkAPI);
        }
    }
);


export const fetchProjectById = createAsyncThunk(
    'projects/fetchProjectById',
    async ({ projectId, token }, thunkAPI) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/projects/${projectId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        
            return {
                id: response.data._id,
                title: response.data.name || response.data.title,
                description: response.data.description,
                owner: response.data.owner, // Include owner for display
            };
        } catch (error) {
            return handleApiError(error, thunkAPI);
        }
    }
);


export const updateProject = createAsyncThunk(
    'projects/updateProject',
    async ({ projectId, title, description, token }, thunkAPI) => {
        try {
            const response = await axios.put(
                `${API_BASE_URL}/projects/${projectId}`,
                { title, description },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            return handleApiError(error, thunkAPI);
        }
    }
);


export const fetchProjects = createAsyncThunk(
    'projects/fetchProjects',
    async (token, thunkAPI) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/projects`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            return handleApiError(error, thunkAPI);
        }
    }
);


export const deleteProject = createAsyncThunk(
    'projects/deleteProject',
    async ({ projectId, token }, thunkAPI) => {
        try {
            await axios.delete(`${API_BASE_URL}/projects/${projectId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return projectId; 
        } catch (error) {
            return handleApiError(error, thunkAPI);
        }
    }
);


export const fetchProjectTasks = createAsyncThunk(
    'projects/fetchProjectTasks',
    async ({ projectId, token }, thunkAPI) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/projects/${projectId}/tasks`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            return handleApiError(error, thunkAPI);
        }
    }
);


export const deleteTask = createAsyncThunk(
    'projects/deleteTask',
    async ({ taskId, token }, thunkAPI) => {
        try {
            await axios.delete(`${API_BASE_URL}/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return taskId; // Return the ID of the deleted task
        } catch (error) {
            return handleApiError(error, thunkAPI);
        }
    }
);


export const updateTaskStatus = createAsyncThunk(
    'projects/updateTaskStatus',
    async ({ taskId, nextStatus, token }, thunkAPI) => {
        try {
            const response = await axios.put(
                `${API_BASE_URL}/tasks/${taskId}`,
                { status: nextStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data; 
        } catch (error) {
            return handleApiError(error, thunkAPI);
        }
    }
);


const initialState = {
    project: null, 
    projects: [], 
    tasks: [], 
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: '',
};

export const projectsSlice = createSlice({
    name: 'projects',
    initialState,
    reducers: {
        resetProjectState: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = '';
            state.project = null;
            state.tasks = []; 
        },
        clearMessages: (state) => {
            state.isSuccess = false;
            state.isError = false;
            state.message = '';
        },
        removeProjectFromList: (state, action) => {
            state.projects = state.projects.filter(project => project._id !== action.payload);
        }
    },
    extraReducers: (builder) => {
        builder

            .addCase(createProject.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.isSuccess = false;
                state.message = '';
            })
            .addCase(createProject.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.project = action.payload;
                state.message = 'Proje başarıyla oluşturuldu!';
                state.projects.push(action.payload);
            })
            .addCase(createProject.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.project = null;
            })

            .addCase(fetchProjectById.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.isSuccess = false;
                state.message = '';
                state.project = null;
                state.tasks = []; 
            })
            .addCase(fetchProjectById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.project = action.payload;
                state.message = 'Proje detayları başarıyla yüklendi.';
            })
            .addCase(fetchProjectById.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.project = null;
                state.tasks = [];
            })
  
            .addCase(updateProject.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.isSuccess = false;
                state.message = '';
            })
            .addCase(updateProject.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.project = action.payload;
                state.message = 'Proje başarıyla güncellendi!';
                const index = state.projects.findIndex(p => p._id === action.payload._id);
                if (index !== -1) {
                    state.projects[index] = action.payload;
                }
            })
            .addCase(updateProject.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })

            .addCase(fetchProjects.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.isSuccess = false;
                state.message = '';
                state.projects = [];
            })
            .addCase(fetchProjects.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.projects = action.payload;
                state.message = 'Projeler başarıyla yüklendi.';
            })
            .addCase(fetchProjects.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.projects = [];
            })

            .addCase(deleteProject.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.isSuccess = false;
                state.message = '';
            })
            .addCase(deleteProject.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.message = 'Proje başarıyla silindi.';
                state.projects = state.projects.filter(project => project._id !== action.payload);
            })
            .addCase(deleteProject.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
  
            .addCase(fetchProjectTasks.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.isSuccess = false;
                state.message = '';
                state.tasks = [];
            })
            .addCase(fetchProjectTasks.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.tasks = action.payload;
                state.message = 'Görevler başarıyla yüklendi.';
            })
            .addCase(fetchProjectTasks.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.tasks = [];
            })

            .addCase(deleteTask.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.isSuccess = false;
                state.message = '';
            })
            .addCase(deleteTask.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.message = 'Görev başarıyla silindi.';
                state.tasks = state.tasks.filter(task => task._id !== action.payload);
            })
            .addCase(deleteTask.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })

            .addCase(updateTaskStatus.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.isSuccess = false;
                state.message = '';
            })
            .addCase(updateTaskStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.message = 'Görev durumu başarıyla güncellendi.';

                state.tasks = state.tasks.map(task =>
                    task._id === action.payload._id ? action.payload : task
                );
            })
            .addCase(updateTaskStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { resetProjectState, clearMessages, removeProjectFromList } = projectsSlice.actions;
export default projectsSlice.reducer;
