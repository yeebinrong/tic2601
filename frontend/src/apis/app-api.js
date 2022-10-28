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

export function retrieveHomePagePosts(params) {
    return axios
        .get(`${HOST}/api/homepage_posts`, {
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

export function modifyFavour(params) {
    return axios
        .post(`${HOST}/api/update_favour`, {
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

export function approveBan(params) {
    return axios
        .post(`${HOST}/api/approveBan`, {
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

export function deleteFromBanlist(params) {
    return axios
        .post(`${HOST}/api/deleteFromBanlist`, {
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
export function updateColour(params) {
    return axios
    .post(`${HOST}/api/updateColour`, {
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

export function updateFollow(params) {
    return axios
        .post(`${HOST}/api/updateFollow`, {
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

export function retrieveModPageStats(community_name) {
    return axios
        .get(`${HOST}/api/moderator`, {
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

export function retrieveCommunityPosts(community_name) {
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

export function updateUserDescription(description) {
    return axios
        .post(`${HOST}/api/update_description`, {
            description,
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

export function getUserProfile(userName) {
    return axios
        .get(`${HOST}/api/users/${userName}`, {
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

export function uploadProfilePicture(formData) {
    return axios
        .post(`${HOST}/api/upload`, formData, {
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


export function retrieveAllFollowedCommunities() {
    return axios
        .get(`${HOST}/api/all_followed_communities`, {
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

export function createTextPostApi(selectedCommunity, title, content, selectedFlair) {
    return axios
        .post(`${HOST}/api/create_text_post`,
        {
            selectedCommunity, title, content, selectedFlair,
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

export function createImagePostApi(formData) {
    return axios
        .post(`${HOST}/api/create_image_post`, formData,
        {
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

export function createLinkPostApi(selectedCommunity, title, link, selectedFlair) {
    return axios
        .post(`${HOST}/api/create_link_post`,
        {
            selectedCommunity, title, link, selectedFlair,
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

export function retrievePostByIdAndCommunityName(postId, communityName) {
    return axios
        .get(`${HOST}/api/community/${communityName}/posts/${postId}`, {
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

export function createComment(communityName, postId, content, replyTo) {
    return axios
        .post(
            `${HOST}/api/community/${communityName}/posts/${postId}/comments`,
            {
                content,
                replyTo,
            },
            {
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

export function updateComment(communityName, postId, commentId, content) {
    return axios
        .put(
            `${HOST}/api/community/${communityName}/posts/${postId}/comments/${commentId}`,
            {
                content,
            },
            {
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

export function retrieveCommunityByName(communityName) {
    return axios
        .get(`${HOST}/api/community/${communityName}`, {
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

export function reportUserInCommunity(userName, communityName) {
    return axios
        .post(`${HOST}/api/report`, {
                userName,
                communityName,
            },
            {
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
