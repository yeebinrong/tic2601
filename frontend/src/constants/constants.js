export const snackBarProps = variant => {
    return {
        anchorOrigin: {
            horizontal: 'right',
            vertical: 'bottom',
        },
        variant,
    };
}

export const initialLoginPageState = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    errorMessage: '',
    showPassword: false,
    showConfirmPassword: false,
};