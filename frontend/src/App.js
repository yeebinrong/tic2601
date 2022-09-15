import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { connect } from 'react-redux';
import React, { useEffect } from 'react';
import './App.scss';
import HomePage from './pages/home-page';
import SettingPage from './pages/setting-page';
import ErrorPage from './pages/error-page';
import LoginPage from './pages/login-page';
import { MainSelectors } from './state/selectors';
import { MainActions } from './state/actions';
import axios from 'axios';
import { verifyToken } from './apis/app-api';
import PropTypes from 'prop-types';

const App = (props) => {
    let navigate = useNavigate();

    useEffect(() => {
        const isLoginPage =
            window.location.pathname === '/login' ||
            window.location.pathname === 'register';
        let token = props.token;
        if (token) {
            if (isLoginPage) {
                props.navigate('/home');
            }
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            token = localStorage.getItem('token');
            if (!props.isLoading && token) {
                props.setIsLoading(true);
                verifyToken(`Bearer ${token}`).then((res) => {
                    if (!res.error) {
                        props.setToken(token);
                        if (isLoginPage) {
                            navigate('/home');
                        }
                    } else {
                        navigate('/login');
                    }
                    props.setIsLoading(false);
                });
            }
            if (token) {
                axios.defaults.headers.common[
                    'Authorization'
                ] = `Bearer ${token}`;
            } else if (!isLoginPage) {
                axios.defaults.headers.common['Authorization'] = '';
                // Maybe display snackbar to ask user to log in?
                navigate('/login');
            }
        }
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
                element={<HomePage navigate={navigate} />}
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
    setToken: MainActions.setToken,
    setIsLoading: MainActions.setIsLoading,
};

App.propTypes = {
    token: PropTypes.string,
    setToken: PropTypes.func,
    setIsLoading: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
