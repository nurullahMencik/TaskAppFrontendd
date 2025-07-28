"// frontend/redux/store.js"
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice'; // authSlice'dan gelen reducer'ı import edin 
import projectsReducer from './slices/projectsSlice'; // authSlice'dan gelen reducer'ı import edin 
import taskReducer from './slices/taskSlice';
import logReducer from './slices/logSlice';
const store = configureStore({
  reducer: { 
    auth: authReducer, 
    project : projectsReducer,
    task : taskReducer,
    log:logReducer
  },

});

export default store;