import { useSnackbar } from 'notistack';
import CloseIcon from '@mui/icons-material/Close';
import { useParams } from 'react-router-dom';

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

const SnackBarAction = (snackbarId) => {
    const { closeSnackbar } = useSnackbar();
    return (
        <CloseIcon
            style={{ cursor: 'pointer' }}
            onClick={() => {
                closeSnackbar(snackbarId);
            }}
        />
    );
};

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

export function withParams(Component) {
    return props => <Component {...props} params={useParams()} />;
};

export const getQueryParameters = str => {
    if (!str || !str.startsWith('?')) {
        return {};
    }
    const search = str.substring(1);
    const parsed = JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g,'":"') + '"}', function(key, value) { return key===""?value:decodeURIComponent(value) });
    if (!parsed.user) {
        parsed.user = '';
    }
    if (!parsed.flair) {
        parsed.flair = '';
    }
    if (!parsed.community) {
        parsed.community = '';
    }
    return parsed;
};

export const defaultFlairs = [
    {
        type: 'flair',
        inputValue: 'Text',
        title: 'Add flairs filter: Text',
    },
    {
        type: 'flair',
        inputValue: 'News',
        title: 'Add flairs filter: News',
    },
    {
        type: 'flair',
        inputValue: 'Discussion',
        title: 'Add flairs filter: Discussion',
    },
    {
        type: 'flair',
        inputValue: 'Photo',
        title: 'Add flairs filter: Photo',
    },
];