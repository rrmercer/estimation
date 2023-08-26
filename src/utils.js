const BACKEND_URL = "192.168.1.230:4000";
const backendUrl = (endpoint) => `http://${BACKEND_URL}/${endpoint}`;

export default backendUrl;