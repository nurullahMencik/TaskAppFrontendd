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
    task: null, 
    tasks: [], 
    users: [], 
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
            
        },
        clearMessages: (state) => {
            state.isSuccess = false;
            state.isError = false;
            state.message = '';
        },
    },
    extraReducers: (builder) => {
        builder
            
            .addCase(createTask.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.isSuccess = false;
                state.message = '';
            })
            .addCase(createTask.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.task = action.payload; // created task
                state.message = 'Görev başarıyla oluşturuldu!';
            })
            .addCase(createTask.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.task = null;
            })
      
            .addCase(fetchTaskById.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.isSuccess = false;
                state.message = '';
                state.task = null; 
            })
            .addCase(fetchTaskById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.task = action.payload; 
                state.message = 'Görev detayları başarıyla yüklendi.';
            })
            .addCase(fetchTaskById.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.task = null;
            })
    
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
          
            .addCase(fetchUsers.pending, (state) => {

                state.isError = false;
                state.message = '';
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
               
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
              
                state.isError = true;
                state.message = action.payload;
                state.users = [];
            });
    },
});

export const { resetTaskState, clearMessages } = taskSlice.actions;
export default taskSlice.reducer;
