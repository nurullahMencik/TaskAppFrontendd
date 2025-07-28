import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Base URL for your API
const API_BASE_URL = 'https://taskappbackend-j2zj.onrender.com/api';

// Helper function for handling common error and token removal logic
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
        // You might want to dispatch a logout action here if you have one
        // thunkAPI.dispatch(logout());
    }
    return thunkAPI.rejectWithValue(message);
};

// Async Thunk for creating a project
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

// Async Thunk: Fetch a single project by ID
export const fetchProjectById = createAsyncThunk(
    'projects/fetchProjectById',
    async ({ projectId, token }, thunkAPI) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/projects/${projectId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // Ensure consistency in the returned data structure if 'name' vs 'title' varies
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

// Async Thunk: Update an existing project
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

// Async Thunk: Fetch all projects
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

// Async Thunk: Delete a project
export const deleteProject = createAsyncThunk(
    'projects/deleteProject',
    async ({ projectId, token }, thunkAPI) => {
        try {
            await axios.delete(`${API_BASE_URL}/projects/${projectId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return projectId; // Return the ID of the deleted project
        } catch (error) {
            return handleApiError(error, thunkAPI);
        }
    }
);

// NEW Async Thunk: Fetch tasks for a specific project
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

// NEW Async Thunk: Delete a task
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

// NEW Async Thunk: Update a task's status
export const updateTaskStatus = createAsyncThunk(
    'projects/updateTaskStatus',
    async ({ taskId, nextStatus, token }, thunkAPI) => {
        try {
            const response = await axios.put(
                `${API_BASE_URL}/tasks/${taskId}`,
                { status: nextStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response.data; // Return the updated task data
        } catch (error) {
            return handleApiError(error, thunkAPI);
        }
    }
);


const initialState = {
    project: null, // Stores the single project data (for fetch/edit)
    projects: [], // Stores the list of all projects
    tasks: [], // NEW: Stores tasks for the currently viewed project
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
            state.tasks = []; // Clear tasks as well
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
            // Cases for createProject
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
            // Cases for fetchProjectById
            .addCase(fetchProjectById.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.isSuccess = false;
                state.message = '';
                state.project = null;
                state.tasks = []; // Clear tasks when fetching a new project
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
            // Cases for updateProject
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
            // Cases for fetchProjects (all projects)
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
            // Cases for deleteProject
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
            // NEW: Cases for fetchProjectTasks
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
            // NEW: Cases for deleteTask
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
            // NEW: Cases for updateTaskStatus
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
                // Find and update the task in the tasks array
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
