import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = "https://taskappbackend-j2zj.onrender.com/api"

export const fetchTaskAndLogs = createAsyncThunk(
  'logs/fetchTaskAndLogs',
  async ({ taskId, token }, thunkAPI) => {
    try {

      const taskRes = await axios.get(`${API_BASE_URL}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const task = taskRes.data;


      const logsRes = await axios.get(`${API_BASE_URL}/logs/task/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const logs = logsRes.data;

  
      return { task, logs };
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

const initialState = {
  task: null, 
  logs: [], 
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

export const logSlice = createSlice({
  name: 'logs',
  initialState,
  reducers: {
    resetLogState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
      state.task = null;
      state.logs = [];
    },
    clearMessages: (state) => {
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      
      .addCase(fetchTaskAndLogs.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
        state.message = '';
        state.task = null;
        state.logs = [];
      })
      .addCase(fetchTaskAndLogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.task = action.payload.task;
        state.logs = action.payload.logs;
        state.message = 'Görev logları başarıyla yüklendi.';
      })
      .addCase(fetchTaskAndLogs.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.task = null;
        state.logs = [];
      });
  },
});

export const { resetLogState, clearMessages } = logSlice.actions;
export default logSlice.reducer;
