import { AppBar, Backdrop, Button, CircularProgress, Toolbar } from '@mui/material';
import React from 'react';
import PropTypes from 'prop-types';
import { MainSelectors } from '../state/selectors';
import { connect } from 'react-redux';
import { MainActions } from '../state/actions';
import { logoutAccount } from '../apis/app-api';

class BasePage extends React.Component {

    logoutUser = () => {
        // TODO remove user from backend using logoutAccount
        this.props.setToken(null);
        localStorage.removeItem('token');
        this.props.navigate('/login');
    }

    render() {
        return (
            <>
                {!this.props.isLoginPage && (
                    <AppBar
                        className={'app-bar'}
                        position="static"
                        open
                        variant="dense"
                    >
                        <Toolbar>
                            <img
                                draggable={false}
                                src="/static/readit_logo.png"
                                className={'app-bar-logo'}
                                alt="readit logo"
                            />
                            <Button
                                disableRipple
                                variant="contained"
                                color="primary"
                                onClick={() => this.logoutUser()}
                                style={{ marginLeft: 'auto' }}
                            >
                                Logout
                            </Button>
                        </Toolbar>
                    </AppBar>
                )}
                <div>
                    <Backdrop
                        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                        open={this.props.isLoading}
                        >
                        <CircularProgress color="inherit" />
                    </Backdrop>
                </div>
                {this.props.component}
            </>
        );
    }
}

const mapStateToProps = (state) => ({
    token: MainSelectors.getToken(state),
    isLoading: MainSelectors.getIsLoading(state),
});

const mapDispatchToProps = {
    setToken: MainActions.setToken,
    setIsLoading: MainActions.setIsLoading,
};

BasePage.propTypes = {
    component: PropTypes.object,
    isLoginPage: PropTypes.bool,
    navigate: PropTypes.func,
    token: PropTypes.string,
    setToken: PropTypes.func,
    isLoading: PropTypes.bool,
    setIsLoading: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(BasePage);
