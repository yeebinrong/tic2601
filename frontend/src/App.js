import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { connect } from 'react-redux';
import React, { useEffect } from 'react';
import './App.scss';
import DemoPage from './pages/demo-page';
import SettingPage from './pages/setting-page';
import ErrorPage from './pages/error-page';
import LoginPage from './pages/login-page';
import { MainSelectors } from './state/selectors';
import { MainActions } from './state/actions';
import axios from 'axios';
import { verifyToken } from './apis/app-api';

const App = (props) => {
    let navigate = useNavigate();

    useEffect(() => {
        const isLoginPage =
            window.location.pathname === '/login' ||
            window.location.pathname === 'register';
        let token = props.token;
        if (token) {
            if (isLoginPage) {
                navigate('/home');
            }
        } else {
            token = localStorage.getItem('token');
            if (!props.isLoading && token) {
                props.setIsLoading(true);
                verifyToken(`Bearer ${token}`).then((res) => {
                    if (!res.error) {
                        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                        props.setToken(token);
                        if (isLoginPage) {
                            navigate('/home');
                        }
                    } else {
                        axios.defaults.headers.common['Authorization'] = '';
                        localStorage.removeItem('token');
                        navigate('/login');
                    }
                    props.setIsLoading(false);
                    props.setIsVerifyDone(true);
                });
            }
            if (token) {
                axios.defaults.headers.common[
                    'Authorization'
                ] = `Bearer ${token}`;
            } else if (!isLoginPage) {
                // TODO Maybe display snackbar to ask user to log in?
                axios.defaults.headers.common['Authorization'] = '';
                navigate('/login');
            }
        }
       // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Routes>
            <Route path="" exact element={<Navigate replace to="/login" />} />
            <Route
                path="/login"
                exact
                element={
                    <LoginPage navigate={navigate} isRegisterPage={false} />
                }
            />
            <Route
                path="/register"
                exact
                element={<LoginPage navigate={navigate} isRegisterPage />}
            />
            <Route
                path="/home"
                exact
                element={<DemoPage navigate={navigate} />}
            />
            <Route
                path="/settings"
                exact
                element={<SettingPage navigate={navigate} />}
            />
            <Route path="*" element={<ErrorPage navigate={navigate} />} />
        </Routes>
    );
};

const mapStateToProps = (state) => ({
    token: MainSelectors.getToken(state),
    isLoading: MainSelectors.getIsLoading(state),
});

const mapDispatchToProps = {
    setIsVerifyDone: MainActions.setIsVerifyDone,
    setToken: MainActions.setToken,
    setIsLoading: MainActions.setIsLoading,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
