export const types = {
    SET_VALUE: 'main/setValue',
    SET_VALUE_FROM_BACKEND: 'main/setValueFromBackend',
};

export const actions = {
    setValue: (payload) => ({ type: types.SET_VALUE, payload }),
    setValueFromBackend: (payload) => ({
        type: types.SET_VALUE_FROM_BACKEND,
        payload,
    }),
};

export const initialState = {
    value: '',
    valueFromBackend: '',
};

export const selectors = {
    getValue: (state) => state.main.value,
    getValueFromBackend: (state) => state.main.valueFromBackend,
};

export function mainReducer(state = initialState, action) {
    const { payload } = action;
    switch (action.type) {
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
