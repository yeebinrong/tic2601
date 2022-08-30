import {
    Alert,
    Button,
    FormControl,
    FormGroup,
    FormHelperText,
    IconButton,
    Input,
    InputAdornment,
    InputLabel,
    TextField,
    Typography,
} from '@mui/material';
import React from 'react';
import { registerAccount, sendMessageApi } from '../../apis/app-api';
import './LoginComponent.scss';
import { MainActions } from '../../state/actions';
import { actions as MainSagaActions } from '../../state/sagas/main.saga';
import { MainSelectors } from '../../state/selectors';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import NavigateButton from '../NavigateButton';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';

const initialState = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    errorMessage: '',
    showPassword: false,
    showConfirmPassword: false,
};

class LoginComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isRegister: this.props.isRegister,
            ...initialState,
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (prevState.isRegister !== nextProps.isRegister) {
            return {
                isRegister: nextProps.isRegister,
                ...initialState,
            };
        }

        // Return null to indicate no change to state.
        return null;
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.setState(
            {
                errorMessage: '',
            },
            () => {
                if (this.props.isRegister) {
                    registerAccount({
                        username: this.state.username,
                        password: this.state.password,
                        email: this.state.email,
                    }).then((res) => {
                        if (res.error) {
                            this.setState({
                                errorMessage: JSON.parse(res.data).message,
                            });
                            // display error
                        } else {
                            // display snack bar for register success
                            // go to login page
                        }
                    });
                } else {
                    // Login logic
                }
            },
        );
    };

    updateState = (target, value) => {
        this.setState({
            [target]: value,
        });
    };

    inverseState = (target) => {
        this.setState((prevState) => {
            return {
                ...prevState,
                [target]: !prevState[target],
            };
        });
    };

    renderShowPasswordIcon = (target) => {
        return (
            <InputAdornment position="end">
                <IconButton
                    disableRipple
                    aria-label="toggle password visibility"
                    onClick={() => this.inverseState(target)}
                    onMouseDown={(e) => e.preventDefault}
                    edge="end"
                >
                    {this.state[target] ? (
                        <VisibilityOffIcon />
                    ) : (
                        <VisibilityIcon />
                    )}
                </IconButton>
            </InputAdornment>
        );
    };

    renderLoginForm = () => {
        return (
            <>
                <TextField
                    id="login-username"
                    size="small"
                    className={'standard-panel-text-field'}
                    onChange={(e) =>
                        this.updateState('username', e.target.value)
                    }
                    value={this.state.username}
                    label="Username"
                />
                <TextField
                    id="login-password"
                    size="small"
                    className={'standard-panel-text-field'}
                    onChange={(e) =>
                        this.updateState('password', e.target.value)
                    }
                    value={this.state.password}
                    label="Password"
                    type={this.state.showPassword ? 'text' : 'password'}
                    InputProps={{
                        endAdornment:
                            this.renderShowPasswordIcon('showPassword'),
                    }}
                />
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        margin: '0px 32px 0px 32px',
                    }}
                >
                    <NavigateButton
                        url="/register"
                        disableRipple
                        style={{
                            backgroundColor: 'transparent',
                            fontSize: '12px',
                        }}
                        text="Need an account?"
                    />
                    <Button
                        type="submit"
                        className={'login-panel-main-button'}
                        variant="contained"
                    >
                        Login
                    </Button>
                </div>
            </>
        );
    };

    renderRegisterForm = () => {
        return (
            <>
                <TextField
                    id="register-username"
                    size="small"
                    className={'standard-panel-text-field'}
                    label="Username"
                    onChange={(e) =>
                        this.updateState('username', e.target.value)
                    }
                    value={this.state.username}
                    // helperText="Only alphanumerics, maximum 30 characters. "
                    // TODO add username regex validation
                />
                <TextField
                    id="register-email"
                    size="small"
                    className={'helper-text-field'}
                    label="Email"
                    onChange={(e) => this.updateState('email', e.target.value)}
                    value={this.state.email}
                    helperText="We'll never share your email."
                    // TODO add email regex validation
                />
                <TextField
                    id="register-password"
                    size="small"
                    className={'standard-panel-text-field'}
                    label="Password"
                    type={this.state.showPassword ? 'text' : 'password'}
                    onChange={(e) =>
                        this.updateState('password', e.target.value)
                    }
                    value={this.state.password}
                    InputProps={{
                        endAdornment:
                            this.renderShowPasswordIcon('showPassword'),
                    }}
                    // helperText="Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters."
                    // TODO add password regex validation
                />
                <TextField
                    id="register-confirm-password"
                    size="small"
                    className={'standard-panel-text-field'}
                    label="Retype password"
                    type={this.state.showConfirmPassword ? 'text' : 'password'}
                    onChange={(e) =>
                        this.updateState('confirmPassword', e.target.value)
                    }
                    value={this.state.confirmPassword}
                    InputProps={{
                        endAdornment: this.renderShowPasswordIcon(
                            'showConfirmPassword',
                        ),
                    }}
                    // TODO add password regex validation
                />
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        margin: '0px 32px 0px 32px',
                    }}
                >
                    <NavigateButton
                        url="/login"
                        disableRipple
                        style={{
                            backgroundColor: 'transparent',
                            fontSize: '12px',
                        }}
                        text="Already have an account?"
                    />
                    <Button
                        type="submit"
                        className={'login-panel-main-button'}
                        variant="contained"
                    >
                        Register
                    </Button>
                </div>
            </>
        );
    };

    render() {
        return (
            <div className={'login-container'}>
                <img
                    src="/static/readit_logo.png"
                    className={'main-logo'}
                    alt="readit logo"
                />
                <div
                    className={`${
                        this.props.isRegister ? 'register-panel' : 'login-panel'
                    } main-panel`}
                >
                    <Typography className={'login-panel-main-title'}>
                        {this.props.isRegister
                            ? 'Sign up with readit'
                            : 'Login with Readit'}
                    </Typography>
                    {this.state.errorMessage !== '' && (
                        <Alert className="main-panel-error" severity="error">
                            {this.state.errorMessage}
                        </Alert>
                    )}
                    <form
                        onSubmit={this.handleSubmit}
                        className={'full-width-class'}
                    >
                        <FormControl className={'full-width-class'}>
                            {this.props.isRegister
                                ? this.renderRegisterForm()
                                : this.renderLoginForm()}
                        </FormControl>
                    </form>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    value: MainSelectors.getValue(state),
    valueFromBackend: MainSelectors.getValueFromBackend(state),
});

const mapDispatchToProps = {
    setValue: MainActions.setValue,
    getValueFromBackend: MainSagaActions.getBackEndValue,
};

LoginComponent.propTypes = {
    isRegister: PropTypes.string,
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginComponent);
