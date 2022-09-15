import React from 'react';
import LoginComponent from '../components/LoginComponent/LoginComponent';
import BasePage from './base-page';

class LoginPage extends React.Component {
    render() {
        return (
            <BasePage
                navigate={this.props.navigate}
                isLoginPage
                component={
                    <LoginComponent
                        navigate={this.props.navigate}
                        isRegisterPage={this.props.isRegisterPage}
                    />
                }
            />
        );
    }
}

export default LoginPage;
