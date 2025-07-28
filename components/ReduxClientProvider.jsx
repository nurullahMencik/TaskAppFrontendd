// frontend/app/components/ReduxClientProvider.jsx
'use client'; // Bu bir Client Component'tir

import { Provider } from 'react-redux';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import store from '../redux/store'; // Redux store'u import et
import { loadUserFromLocalStorage } from '../redux/slices/authSlice'; // loadUserFromLocalStorage thunk'ı import et

// Bu bileşen, Provider'ın context'ine eriştikten sonra dispatch işlemini yapacak
function AuthStateInitializer({ children }) {
    const dispatch = useDispatch(); // <-- Şimdi bu çağrı, Provider'ın içindedir.

    useEffect(() => {
        // Bu sadece client tarafında ve bileşen yüklendiğinde bir kez çalışacak
        dispatch(loadUserFromLocalStorage());
    }, [dispatch]);

    return children; // Sadece çocuklarını render eder
}

// Ana ReduxClientProvider bileşeni
export default function ReduxClientProvider({ children }) {
    return (
        <Provider store={store}>
            {/* AuthStateInitializer bileşenini Provider'ın çocuğu olarak render ediyoruz */}
            <AuthStateInitializer>
                {children}
            </AuthStateInitializer>
        </Provider>
    );
}