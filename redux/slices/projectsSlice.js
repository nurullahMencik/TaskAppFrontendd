// frontend/redux/slices/projectsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async Thunk for creating a project
export const createProject = createAsyncThunk(
  'projects/createProject',
  async ({ title, description, token }, thunkAPI) => {
    try {
      const response = await axios.post(
        'https://taskappbackend-4kdw.onrender.com/api/projects',
        { title, description },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
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
    }
  }
);

// Async Thunk: Fetch a single project by ID
export const fetchProjectById = createAsyncThunk(
  'projects/fetchProjectById',
  async ({ projectId, token }, thunkAPI) => {
    try {
      const response = await axios.get(`https://taskappbackend-4kdw.onrender.com/api/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return {
        id: response.data._id,
        title: response.data.name || response.data.title,
        description: response.data.description,
      };
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
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

// Async Thunk: Update an existing project
export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ projectId, title, description, token }, thunkAPI) => {
    try {
      const response = await axios.put(
        `https://taskappbackend-4kdw.onrender.com/api/projects/${projectId}`,
        { title, description },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
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
    }
  }
);

// Yeni Async Thunk: Fetch all projects
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (token, thunkAPI) => {
    try {
      const response = await axios.get('https://taskappbackend-4kdw.onrender.com/api/projects', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
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
    }
  }
);

// Yeni Async Thunk: Delete a project
export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async ({ projectId, token }, thunkAPI) => {
    try {
      await axios.delete(`https://taskappbackend-4kdw.onrender.com/api/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return projectId; // Return the ID of the deleted project
    } catch (error) {
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
    }
  }
);


const initialState = {
  project: null, // Stores the single project data (for fetch/edit)
  projects: [], // Stores the list of all projects
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
      // projects listesini burada sıfırlamıyoruz, çünkü dashboard'da kalması istenebilir
      // Eğer dashboard'dan çıkıldığında sıfırlanması isteniyorsa buraya projects: [] eklenebilir.
    },
    clearMessages: (state) => {
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    // Proje silindikten sonra projeler listesini manuel olarak güncellemek için
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
        // Yeni oluşturulan projeyi listeye ekleyebiliriz
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
        // Projeler listesindeki güncellenen projeyi bulup değiştirebiliriz
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
        state.projects = []; // Clear projects list before fetching
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.projects = action.payload; // Store all fetched projects
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
        // Remove the deleted project from the projects list
        state.projects = state.projects.filter(project => project._id !== action.payload);
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetProjectState, clearMessages, removeProjectFromList } = projectsSlice.actions;
export default projectsSlice.reducer;
