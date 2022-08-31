import React from 'react';
import LoginComponent from '../components/LoginComponent/LoginComponent';
import BasePage from './base-page';
import PropTypes from 'prop-types';

class LoginPage extends React.Component {
    render() {
        return (
            <BasePage
                isLogin
                component={<LoginComponent navigate={this.props.navigate} isRegister={this.props.isRegister} />}
            />
        );
    }
}

LoginPage.propTypes = {
    isRegister: PropTypes.bool,
    navigate: PropTypes.func,
};

export default LoginPage;
