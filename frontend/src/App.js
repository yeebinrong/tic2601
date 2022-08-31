import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import React from 'react';
import './App.scss';
import HomePage from './pages/home-page';
import SettingPage from './pages/setting-page';
import store from './state/store';
import ErrorPage from './pages/error-page';
import LoginPage from './pages/login-page';

const App = () => {
    let navigate = useNavigate();
    return (
        <React.StrictMode>
            <Provider store={store}>
                <Routes>
                    <Route
                        path="/login"
                        exact
                        element={
                            <LoginPage navigate={navigate} isRegister={false} />
                        }
                    />
                    <Route
                        path="/register"
                        exact
                        element={<LoginPage navigate={navigate} isRegister />}
                    />
                    <Route path="/home" exact element={<HomePage />} />
                    <Route path="/settings" exact element={<SettingPage />} />
                    <Route
                        path=""
                        exact
                        element={<Navigate replace to="/login" />}
                    />
                    <Route path="*" element={<ErrorPage />} />
                </Routes>
            </Provider>
        </React.StrictMode>
    );
};

export default App;
