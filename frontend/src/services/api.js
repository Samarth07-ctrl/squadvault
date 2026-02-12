import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

export const getContractParams = () => api.get('/contract/params');
export const createPoolInDb = (data) => api.post('/pools/create', data);
export const getPools = () => api.get('/pools');
export const joinPoolInDb = (data) => api.post('/pools/join', data);
export const loginUser = (walletAddress) => api.post('/users/login', { walletAddress });
export const getUserProfile = (walletAddress) => api.get(`/users/${walletAddress}`);
export const recordTransaction = (data) => api.post('/transactions', data);
export const getPoolTransactions = (poolId) => api.get(`/transactions/${poolId}`);

export default api;
