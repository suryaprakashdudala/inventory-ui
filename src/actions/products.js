import api from '../api/api';
import createActionType from '../utils/action';

export const RETRIEVE_PRODUCTS_SUCCESS = createActionType('RETRIEVE_PRODUCTS_SUCCESS');


export const getAllProducts = () => async (dispatch) => {
  try {
    const res = await api.get('/products');
    dispatch({ type: RETRIEVE_PRODUCTS_SUCCESS, products: res.data });
    return res
  } catch (error) {
    console.log(error);
    
  }
}

export const getProductById = (id) => async () => {
  try {
    return await api.get(`/products/${id}`);
  } catch (error) {
    console.log(error);
    
  }
}

export const addProduct = (product) => async () => {
  try {
    return await api.post('/products', product);
  } catch (error) {
    console.log(error);
  }
}

export const updateProduct = (id, product) => async () => {
  try {
    return await api.put(`/products/${id}`, product);
  } catch (error) {
    console.log(error);
  }
}

export const deleteProduct = (id) => async () => {
  try {
    await api.delete(`/products/${id}`);
  } catch (error) {
    console.log(error);
  }
}