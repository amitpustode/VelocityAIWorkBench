import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Define the API base URL and timeout settings
const apiClient: AxiosInstance = axios.create({
  baseURL: 'https://api.openai.com/v1/completions', // Replace with your API base URL
  timeout: 10000, // Optional timeout (10 seconds)
});

// Custom Axios request configuration interface (Optional)
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  headers?: AxiosRequestConfig['headers'] & {
    'x-api-key'?: string; // Custom header for dynamic API key
  };
}

// Request interceptor to dynamically add API key
apiClient.interceptors.request.use(
  (config: CustomAxiosRequestConfig):any => {
    // Default API key
    let apiKey: string = 'default-api-key';

    // Check if a custom API key is passed in request config
    if (config.headers && config.headers['x-api-key']) {
      apiKey = config.headers['x-api-key'];
      delete config.headers['x-api-key']; // Clean up to avoid duplicating the header
    }

    // Ensure the headers object exists and add Authorization header
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${apiKey}`,
    };

    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response interceptor (Optional: for logging or error handling)
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Successful response logging (optional)
    console.log('API Response:', response);
    return response;
  },
  (error: any) => {
    // Error handling
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default apiClient;
