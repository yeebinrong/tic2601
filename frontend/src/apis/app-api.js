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

export function retrieveCommunityPosts(community_name) {
    // console.log("api-function called");
    console.log(community_name);
    return axios
        .get(`${HOST}/api/community`, {
            params: {
                community_name,
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

// export function retrieveCommunityAdmin() {
//     return axios
//         .get(`${HOST}/api/Community_Admin`, {
//             headers: {
//                 Accept: CONTENT_TYPE_JSON,
//             },
//         })
//         .then((resp) => ({ data: resp.data, error: false }))
//         .catch((err) => ({
//             data: err && err.response ? err.response.data : '',
//             error: true,
//             status: err && err.response ? err.response.status : '',
//         }));
// }

// export function retrieveCommunityInfo() {
//     return axios
//         .get(`${HOST}/api/Community_Info`, {
//             headers: {
//                 Accept: CONTENT_TYPE_JSON,
//             },
//         })
//         .then((resp) => ({ data: resp.data, error: false }))
//         .catch((err) => ({
//             data: err && err.response ? err.response.data : '',
//             error: true,
//             status: err && err.response ? err.response.status : '',
//         }));
// }

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
