import axios from "axios";
import { getBackendUrl } from "../config";

const backendUrl = getBackendUrl() || "http://localhost:8080";

const api = axios.create({
	baseURL: backendUrl,
	withCredentials: true,
});

// Interceptor para tratar erros de rede
api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
			console.error("Erro de rede. Verifique se o backend está rodando em:", backendUrl);
		}
		return Promise.reject(error);
	}
);

export const openApi = axios.create({
	baseURL: backendUrl
});

// Interceptor para tratar erros de rede
openApi.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
			console.error("Erro de rede. Verifique se o backend está rodando em:", backendUrl);
		}
		return Promise.reject(error);
	}
);

export default api;
