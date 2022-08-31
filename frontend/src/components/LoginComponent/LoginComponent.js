import {
    Alert,
    Button,
    FormControl,
    IconButton,
    InputAdornment,
    TextField,
    Typography,
} from '@mui/material';
import React from 'react';
import { registerAccount } from '../../apis/app-api';
import './LoginComponent.scss';
import { MainActions } from '../../state/actions';
import { actions as MainSagaActions } from '../../state/sagas/main.saga';
import { MainSelectors } from '../../state/selectors';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import NavigateButton from '../NavigateButton';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { withSnackbar } from 'notistack';
import { initialLoginPageState, snackBarProps } from '../../constants/constants';

class LoginComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isRegister: this.props.isRegister,
            ...initialLoginPageState,
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (prevState.isRegister !== nextProps.isRegister) {
            return {
                isRegister: nextProps.isRegister,
                ...initialLoginPageState,
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
                        } else {
                            this.props.enqueueSnackbar(
                                `Successfully registered an account for [${this.state.username}]!`,
                                snackBarProps('success'),
                            );
                            this.props.navigate('/login');
                            console.log(this.props);
                        }
                    });
                } else {
                    // TODO Login logic
                    // loginAccount
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

    renderTextField = (isStandard, target, value, label, showPassword, showPassTarget) => {
        return (
            <TextField
                size="small"
                className={isStandard ? 'standard-panel-text-field' : 'helper-text-field'}
                onChange={(e) =>
                    this.updateState(target, e.target.value)
                }
                value={value}
                label={label}
                type={showPassTarget && !showPassword ? 'password' : 'text'}
                InputProps={{
                    endAdornment: showPassTarget ?
                        this.renderShowPasswordIcon(showPassTarget) : '',
                }}
                helperText={target === 'email' ? "We'll never share your email." : ''}
            />
        );
    }

    renderLoginForm = () => {
        return (
            <>
                {this.renderTextField(true, 'username', this.state.username, 'Username')}
                {this.renderTextField(true, 'password', this.state.password, 'Password', this.state.showPassword, 'showPassword')}
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
        // helperText="Only alphanumerics, maximum 30 characters. "
        // TODO add username regex validation
        // helperText="Must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters."
        // TODO add password regex validation
        return (
            <>
                {this.renderTextField(true, 'username', this.state.username, 'Username')}
                {this.renderTextField(false, 'email', this.state.email, 'Email')}
                {this.renderTextField(true, 'password', this.state.password, 'Password', this.state.showPassword, 'showPassword')}
                {this.renderTextField(true, 'confirmPassword', this.state.confirmPassword, 'Retype password', this.state.showConfirmPassword, 'showConfirmPassword')}
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
                    draggable={false}
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
    navigate: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(withSnackbar(LoginComponent));
