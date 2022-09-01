import { useSnackbar } from 'notistack'
import CloseIcon from '@mui/icons-material/Close';

export const snackBarProps = (variant) => {
    return {
        anchorOrigin: {
            horizontal: 'right',
            vertical: 'bottom',
        },
        variant,
        action: SnackBarAction,
    };
};

const SnackBarAction = snackbarId => {
    const { closeSnackbar } = useSnackbar();
    return (
        <CloseIcon style={{ cursor: 'pointer' }} onClick={() => { closeSnackbar(snackbarId) }} />
    );
}

export const initialLoginPageState = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    errorMessage: '',
    showPassword: false,
    showConfirmPassword: false,
    isButtonClicked: false,
};
