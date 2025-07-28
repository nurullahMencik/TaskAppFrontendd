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

    // Specific error handling for authentication/authorization issues
    if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Optionally, dispatch a global logout action here if you have one
        // thunkAPI.dispatch(logoutUser());
    }
    return thunkAPI.rejectWithValue(message);
};

// Async Thunk: Create a new task
export const createTask = createAsyncThunk(
    'tasks/createTask',
    async ({ projectId, title, description, assignedTo, token }, thunkAPI) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/projects/${projectId}/tasks`,
                { title, description, assignedTo: assignedTo || null },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            return response.data;
        } catch (error) {
            return handleApiError(error, thunkAPI);
        }
    }
);

// Async Thunk: Fetch a single task by ID
export const fetchTaskById = createAsyncThunk(
    'tasks/fetchTaskById',
    async ({ taskId, token }, thunkAPI) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            return handleApiError(error, thunkAPI);
        }
    }
);

// Async Thunk: Update an existing task
export const updateTask = createAsyncThunk(
    'tasks/updateTask',
    async ({ taskId, updatedData, token }, thunkAPI) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/tasks/${taskId}`, updatedData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            return handleApiError(error, thunkAPI);
        }
    }
);

// Async Thunk: Fetch all users (needed for assigning tasks)
export const fetchUsers = createAsyncThunk(
    'tasks/fetchUsers',
    async (token, thunkAPI) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            return handleApiError(error, thunkAPI);
        }
    }
);

const initialState = {
    task: null, // Stores a single task (for details/edit)
    tasks: [], // Could be used for a list of tasks, but not directly used in this specific component's refactor.
    users: [], // Stores users for assignment dropdowns
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: '',
};

export const taskSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        resetTaskState: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = '';
            state.task = null;
            // We don't reset 'users' here as they might be needed for other task-related operations
            // We also don't reset 'tasks' array as it's not strictly tied to a single task's details
        },
        clearMessages: (state) => {
            state.isSuccess = false;
            state.isError = false;
            state.message = '';
        },
    },
    extraReducers: (builder) => {
        builder
            // Cases for createTask
            .addCase(createTask.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.isSuccess = false;
                state.message = '';
            })
            .addCase(createTask.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.task = action.payload; // Newly created task
                state.message = 'Görev başarıyla oluşturuldu!';
            })
            .addCase(createTask.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.task = null;
            })
            // Cases for fetchTaskById
            .addCase(fetchTaskById.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.isSuccess = false;
                state.message = '';
                state.task = null; // Clear previous task data
            })
            .addCase(fetchTaskById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.task = action.payload; // Fetched task
                state.message = 'Görev detayları başarıyla yüklendi.';
            })
            .addCase(fetchTaskById.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.task = null;
            })
            // Cases for updateTask
            .addCase(updateTask.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.isSuccess = false;
                state.message = '';
            })
            .addCase(updateTask.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.task = action.payload; // Updated task
                state.message = 'Görev başarıyla güncellendi!';
            })
            .addCase(updateTask.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Cases for fetchUsers
            .addCase(fetchUsers.pending, (state) => {
                // We're setting isLoading to true globally, so no need to repeat
                state.isError = false;
                state.message = '';
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                // We're setting isLoading to false globally, so no need to repeat
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                // We're setting isLoading to false globally, so no need to repeat
                state.isError = true;
                state.message = action.payload;
                state.users = [];
            });
    },
});

export const { resetTaskState, clearMessages } = taskSlice.actions;
export default taskSlice.reducer;
