import { call, fork, put, takeEvery } from 'redux-saga/effects';
import { getBackEndValueApi } from '../../apis/app-api';
import { MainActions } from '../actions';

const types = {
    GET_BACKEND_VALUE: 'main/sagas/getValueFromBackendAndStore',
};

export const actions = {
    getBackEndValue: (payload) => ({ type: types.GET_BACKEND_VALUE, payload }),
};

export function* getBackEndValue() {
    console.log('yes');
    const resp = yield call(getBackEndValueApi);
    if (!resp.error) {
        yield put(MainActions.setValueFromBackend(resp.data.value));
    }
}

export function* watcher() {
    yield takeEvery(types.GET_BACKEND_VALUE, getBackEndValue);
}

export default function* rootSaga() {
    yield fork(watcher);
}
