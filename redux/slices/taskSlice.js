// frontend/redux/slices/taskSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async Thunk: Create a new task
export const createTask = createAsyncThunk(
  'tasks/createTask',
  async ({ projectId, title, description, assignedTo, token }, thunkAPI) => {
    try {
      const response = await axios.post(
        `https://taskappbackend-4kdw.onrender.com/api/projects/${projectId}/tasks`,
        { title, description, assignedTo: assignedTo || null },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Async Thunk: Fetch a single task by ID
export const fetchTaskById = createAsyncThunk(
  'tasks/fetchTaskById',
  async ({ taskId, token }, thunkAPI) => {
    try {
      const response = await axios.get(`https://taskappbackend-4kdw.onrender.com/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      if (error.response?.status === 401 || error.response?.status === 403 || error.response?.status === 404) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Async Thunk: Update an existing task
export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, updatedData, token }, thunkAPI) => {
    try {
      const response = await axios.put(`https://taskappbackend-4kdw.onrender.com/api/tasks/${taskId}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Async Thunk: Fetch all users (needed for assigning tasks)
export const fetchUsers = createAsyncThunk(
  'tasks/fetchUsers', // Users are fetched in the context of tasks
  async (token, thunkAPI) => {
    try {
      const response = await axios.get('https://taskappbackend-4kdw.onrender.com/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  task: null, // Stores a single task (for details/edit)
  tasks: [], // Stores a list of tasks (if you add a fetch all tasks for a project)
  users: [], // Stores users for assignment dropdowns
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

export const taskSlice = createSlice({
  name: 'tasks', // Slice adı 'tasks'
  initialState,
  reducers: {
    resetTaskState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
      state.task = null;
      // users listesini sıfırlamıyoruz, çünkü tekrar kullanılabilecek bir veri
      // tasks listesini de burada sıfırlamıyoruz, eğer projeye özgü görev listesi varsa
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
        // isLoading'i global olarak yönettiğimiz için burada sadece users'ı temizleyebiliriz
        // state.isLoading = true; // Zaten ana isLoading tarafından yönetiliyor
        state.isError = false;
        state.message = '';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        // state.isLoading = false; // Zaten ana isLoading tarafından yönetiliyor
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        // state.isLoading = false; // Zaten ana isLoading tarafından yönetiliyor
        state.isError = true;
        state.message = action.payload;
        state.users = [];
      });
  },
});

export const { resetTaskState, clearMessages } = taskSlice.actions;
export default taskSlice.reducer;
