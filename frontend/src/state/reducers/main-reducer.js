export const types = {
    SET_TOKEN: 'main/setToken',
    SET_IS_INIT_LOADING: 'main/setIsLoading',
    SET_VALUE: 'main/setValue',
    SET_VALUE_FROM_BACKEND: 'main/setValueFromBackend',
};

export const actions = {
    setIsLoading: (payload) => ({ type: types.SET_IS_INIT_LOADING, payload }),
    setToken: (payload) => ({ type: types.SET_TOKEN, payload }),
    setValue: (payload) => ({ type: types.SET_VALUE, payload }),
    setValueFromBackend: (payload) => ({
        type: types.SET_VALUE_FROM_BACKEND,
        payload,
    }),
};

export const initialState = {
    isLoading: false,
    token: null,
    value: '',
    valueFromBackend: '',
};

export const selectors = {
    getIsLoading: (state) => state.main.isLoading,
    getToken: (state) => state.main.token,
    getValue: (state) => state.main.value,
    getValueFromBackend: (state) => state.main.valueFromBackend,
};

export function mainReducer(state = initialState, action) {
    const { payload } = action;
    switch (action.type) {
        case types.SET_IS_INIT_LOADING:
            return {
                ...state,
                isLoading: payload,
            };
        case types.SET_TOKEN:
            return {
                ...state,
                token: payload,
            };
        case types.SET_VALUE:
            return {
                ...state,
                value: payload,
            };
        case types.SET_VALUE_FROM_BACKEND:
            return {
                ...state,
                valueFromBackend: payload,
            };
        default:
            return state;
    }
}
