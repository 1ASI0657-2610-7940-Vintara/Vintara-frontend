import axios from "axios";  

const platformApi = import.meta.env.VITE_WINESOFT_PLATFORM_API_URL || 'http://localhost:5008/api/v1';

/**
 * BaseApi class to handle HTTP requests using Axios.
 * It initializes an Axios instance with a base URL from environment variables.
 * Provides a getter for the Axios instance to be used in derived classes.
 */
export class BaseApi {
    /**
     * @type {import("axios").AxiosInstance}
     */
    #http;

    /**
     * Initializes the Axios instance with the base URL.
     */
    constructor() {
        this.#http = axios.create({ baseURL: platformApi, withCredentials: true });

        // Attach token from localStorage (if present) to each request
        this.#http.interceptors.request.use((config) => {
            try {
                const token = localStorage.getItem('auth_token');
                if (token) {
                    if (!config.headers) config.headers = {};
                    // only set if not already provided
                    if (!config.headers.Authorization && !config.headers.authorization) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                }
            } catch (e) {
                // ignore localStorage access errors
            }
            return config;
        }, (error) => Promise.reject(error));
    }

    /**
     * Getter for the Axios instance.
     * @returns {AxiosInstance}
     */
    get http() { return this.#http;}
}