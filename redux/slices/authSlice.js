// frontend/redux/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Başlangıç durumu tamamen sunucu-güvenli olmalı
const initialState = {
  user: null, // Sunucuda başlangıçta null
  token: null, // Sunucuda başlangıçta null
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Asenkron Thunk'lar (API çağrıları ve localStorage yüklemesi için)

// Kullanıcı Kaydı
export const register = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post('https://taskappbackend-4kdw.onrender.com/api/auth/register', userData);
      if (response.data) {
        // Kayıt başarılıysa, otomatik olarak giriş yapıp token'ı kaydet
        // Bu işlem sadece tarayıcı ortamında çalışır
        if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('token', response.data.token);
        }
      }
      return response.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Kullanıcı Girişi
export const login = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post('https://taskappbackend-4kdw.onrender.com/api/auth/login', userData);
      if (response.data) {
        // Giriş başarılıysa, localStorage'a kaydet
        // Bu işlem sadece tarayıcı ortamında çalışır
        if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('token', response.data.token);
        }
      }
      return response.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Kullanıcı Çıkışı
export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    // Bu işlem sadece tarayıcı ortamında çalışır
    if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    }
  }
);

// YENİ THUNK: localStorage'dan kullanıcı verilerini yüklemek için
export const loadUserFromLocalStorage = createAsyncThunk(
  'auth/loadUserFromLocalStorage',
  async (_, thunkAPI) => {
    // Bu işlem sadece tarayıcı ortamında çalışır
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
        const storedToken = localStorage.getItem('token') || null;

        if (storedUser && storedToken) {
          return { user: storedUser, token: storedToken };
        }
        return { user: null, token: null }; // Yoksa boş dön
      } catch (e) {
        // JSON parse hatası veya başka bir localStorage hatası durumunda
        console.error("Failed to load user from localStorage:", e);
        return { user: null, token: null };
      }
    }
    return { user: null, token: null }; // Sunucu tarafında veya localStorage yoksa null dön
  }
);


export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    // setAuthData reducer'ına artık ihtiyacımız yok çünkü loadUserFromLocalStorage thunk'ı bunu yönetecek.
  },
  extraReducers: (builder) => {
    builder
      // Register durumları
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
        state.token = null;
      })
      // Login durumları
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
        state.user = null;
        state.token = null;
      })
      // Logout durumu
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isSuccess = false;
      })
      // YENİ THUNK'ın durumları (loadUserFromLocalStorage)
      // loadUserFromLocalStorage tamamlandığında state'i güncelle
      .addCase(loadUserFromLocalStorage.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      // loadUserFromLocalStorage reddedildiğinde veya hata aldığında state'i sıfırla
      .addCase(loadUserFromLocalStorage.rejected, (state) => {
        state.user = null;
        state.token = null;
      });
  },
});

export const { reset } = authSlice.actions; // reset action'ını dışa aktar
export default authSlice.reducer; // Reducer'ı dışa aktar