import axios from 'axios';

const HOST = 'http://localhost:3008';
const CONTENT_TYPE_JSON = 'application/json';

export function registerAccount(credentials) {
    return axios
        .post(`${HOST}/api/register`, {
            username: credentials.username,
            password: credentials.password,
            email: credentials.email,
            headers: {
                Accept: CONTENT_TYPE_JSON,
            },
        })
        .then((resp) => ({ data: resp.data, error: false }))
        .catch((err) => ({
            data: err && err.response ? err.response.data : '',
            error: true,
            status: err && err.response ? err.response.status : '',
        }));
}

export function loginAccount(credentials) {
    return axios
        .post(`${HOST}/api/login`, {
            username: credentials.username,
            password: credentials.password,
            headers: {
                Accept: CONTENT_TYPE_JSON,
            },
        })
        .then((resp) => ({ data: resp.data, error: false }))
        .catch((err) => ({
            data: err && err.response ? err.response.data : '',
            error: true,
            status: err && err.response ? err.response.status : '',
        }));
}

export function verifyToken(token) {
    return axios
        .post(`${HOST}/api/verify`, {
            token,
            headers: {
                Accept: CONTENT_TYPE_JSON,
            },
        })
        .then((resp) => ({ data: resp.data, error: false }))
        .catch((err) => ({
            data: err && err.response ? err.response.data : '',
            error: true,
            status: err && err.response ? err.response.status : '',
        }));
}

export function createCommunityApi(communityName) {
    return axios
        .post(`${HOST}/api/create_community`, {
            communityName,
            headers: {
                Accept: CONTENT_TYPE_JSON,
            },
        })
        .then((resp) => ({ data: resp.data, error: false }))
        .catch((err) => ({
            data: err && err.response ? err.response.data : '',
            error: true,
            status: err && err.response ? err.response.status : '',
        }));
}

export function retrieveAllPosts() {
    return axios
        .get(`${HOST}/api/all_posts`, {
            headers: {
                Accept: CONTENT_TYPE_JSON,
            },
        })
        .then((resp) => ({ data: resp.data, error: false }))
        .catch((err) => ({
            data: err && err.response ? err.response.data : '',
            error: true,
            status: err && err.response ? err.response.status : '',
        }));
}

export function searchForPostWithParams(params) {
    return axios
        .get(`${HOST}/api/search`, {
            params,
            headers: {
                Accept: CONTENT_TYPE_JSON,
            },
        })
        .then((resp) => ({ data: resp.data, error: false }))
        .catch((err) => ({
            data: err && err.response ? err.response.data : '',
            error: true,
            status: err && err.response ? err.response.status : '',
        }));
}

export function sendMessageApi(value) {
    return axios
        .get(`${HOST}/api/receive`, {
            params: {
                value,
            },
            headers: {
                Accept: CONTENT_TYPE_JSON,
            },
        })
        .then((resp) => ({ data: resp.data, error: false }))
        .catch((err) => ({
            data: err && err.response ? err.response.data : '',
            error: true,
            status: err && err.response ? err.response.status : '',
        }));
}

export function getBackEndValueApi() {
    return axios
        .get(`${HOST}/api/getbackendvalue`, {
            headers: {
                Accept: CONTENT_TYPE_JSON,
            },
        })
        .then((resp) => ({ data: resp.data, error: false }))
        .catch((err) => ({
            data: err && err.response ? err.response.data : '',
            error: true,
            status: err && err.response ? err.response.status : '',
        }));
}

export function retrievePostById(postId) {
    return axios
        .get(`${HOST}/api/posts/${postId}`, {
            headers: {
                Accept: CONTENT_TYPE_JSON,
                Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3RhY2NvdW50IiwiZW1haWwiOiJ0ZXN0QGdtYWlsLmNvbSIsInByb2ZpbGVfcGljdHVyZSI6bnVsbCwiZGVzY3JpcHRpb24iOiJIZWxsbyEgV2VsY29tZSB0byB0ZXN0YWNjb3VudCBwcm9maWxlIHBhZ2UiLCJkYXRldGltZV9jcmVhdGVkIjoiMjAyMi0wOS0yNlQxMjozODo0NS42MDZaIiwiaXNzIjoicmVhZGl0IiwiaWF0IjoxNjY0MjAzMTg1LjUyOH0.2ZIJYdRNrrLcSao9G2Lw950uUuSlcKna4RTIvwxgLsw',
            },
        })
        .then((resp) => ({ data: resp.data, error: false }))
        .catch((err) => ({
            data: err && err.response ? err.response.data : '',
            error: true,
            status: err && err.response ? err.response.status : '',
        }));
}
export function retrieveCommunityByName(communityName) {
    return axios
        .get(`${HOST}/api/community/${communityName}`, {
            headers: {
                Accept: CONTENT_TYPE_JSON,
                Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3RhY2NvdW50IiwiZW1haWwiOiJ0ZXN0QGdtYWlsLmNvbSIsInByb2ZpbGVfcGljdHVyZSI6bnVsbCwiZGVzY3JpcHRpb24iOiJIZWxsbyEgV2VsY29tZSB0byB0ZXN0YWNjb3VudCBwcm9maWxlIHBhZ2UiLCJkYXRldGltZV9jcmVhdGVkIjoiMjAyMi0wOS0yNlQxMjozODo0NS42MDZaIiwiaXNzIjoicmVhZGl0IiwiaWF0IjoxNjY0MjAzMTg1LjUyOH0.2ZIJYdRNrrLcSao9G2Lw950uUuSlcKna4RTIvwxgLsw',
            },
        })
        .then((resp) => ({ data: resp.data, error: false }))
        .catch((err) => ({
            data: err && err.response ? err.response.data : '',
            error: true,
            status: err && err.response ? err.response.status : '',
        }));
}
