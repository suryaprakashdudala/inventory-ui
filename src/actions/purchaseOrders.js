import api from '../api/api';

export const getAllOrders = () => async () => {
  try {
    return await api.get('/purchase-orders');
  } catch (error) {
    console.log(error);
    
  }
}

export const getOrderById = (id) => async () => {
  try {
    return await api.get(`/purchase-orders/${id}`);
  } catch (error) {
    console.log(error);
    
  }
}

export const createOrder = (order) => async () => {
  try {
    return await api.post('/purchase-orders', order);
  } catch (error) {
    console.log(error);
  }
}

export const updateOrderStatus = (id, status, userId) => async () => {
  try {
    return await api.put(`/purchase-orders/${id}/status`, { status, userId });
  } catch (error) {
    console.log(error);
  }
}
