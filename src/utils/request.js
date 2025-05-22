import axios from "axios"
import {ElNotification} from "element-plus"

// const BASE_URL = "http://10.30.22.82:8000"
const BASE_URL = "http://127.0.0.1:8000"
// const BASE_URL = "http://192.168.186.41:8000"



const request = axios.create({
    baseURL: BASE_URL, // 设置基础 URL
    timeout: 5000, // 设置超时时间
})

// 请求拦截器
// 请求拦截器：动态设置 Content-Type
request.interceptors.request.use(
  (config) => {
    // 动态判断请求体类型，如果是 FormData，则移除 Content-Type 让浏览器自动添加 multipart/form-data
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// 响应拦截器
request.interceptors.response.use(
    (response) => {
        if (response.status !== 200) {
            ElNotification({
                message: response.data.message,
                type: response.data.code,
            })
        }
        return response
    },
    (error) => {
        if (error.response) {
            ElNotification({
                message: error.response.data.message,
                type: error.response.data.code,
            })
        } else {
            ElNotification({
                message: error.message || '网络错误',
                type: "error",
            })
        }
        return Promise.reject(error);
    }
);

export {request, BASE_URL}