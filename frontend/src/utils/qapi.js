import axios from "axios";

const qapi = axios.create({
  baseURL: import.meta.env.VITE_QAPI_URL,
});

export default qapi;
