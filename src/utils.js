let BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_URL
if (!BACKEND_BASE_URL.startsWith("http")) {
    BACKEND_BASE_URL = `https://${BACKEND_BASE_URL}`;
}
if (!BACKEND_BASE_URL.endsWith("/")) {
    BACKEND_BASE_URL = `${BACKEND_BASE_URL}/`;
}
const backendUrl = (endpoint, board) => `${BACKEND_BASE_URL}${endpoint}?board=${board}`;

export default backendUrl;