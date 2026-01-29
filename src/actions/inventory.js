import api from '../api/api';

export const getInventoryByProductId = (productId) => async () => {
  try {
    return await api.get(`/inventory/${productId}`);
  } catch (error) {
    console.log(error);
    
  }
}

export const stockIn = (data) => async () => {
  try {
    return await api.post('/inventory/stock-in', data);
  } catch (error) {
    console.log(error);
  }
}

export const stockOut = (data) => async () => {
  try {
    return await api.post('/inventory/stock-out', data);
  } catch (error) {
    console.log(error);
  }
}

export const adjustStock = (data) => async () => {
  try {
    return await api.post('/inventory/adjust', data);
  } catch (error) {
    console.log(error);
  }
}

export const getStockHistory = (productId) => async () => {
  try {
    return await api.get(`/inventory/history/${productId}`);
  } catch (error) {
    console.log(error);
  }
}

export const getAllStockHistory = () => async () => {
  try {
    return await api.get('/inventory/history');
  } catch (error) {
    console.log(error);
  }
}