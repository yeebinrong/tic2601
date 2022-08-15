import axios from "axios";

const HOST = "http://localhost:3008";
const CONTENT_TYPE_JSON = "application/json";

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
      data: err && err.response ? JSON.stringify(err.response.data) : "",
      error: true,
      status: err && err.response ? err.response.status : "",
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
      data: err && err.response ? JSON.stringify(err.response.data) : "",
      error: true,
      status: err && err.response ? err.response.status : "",
    }));
}
