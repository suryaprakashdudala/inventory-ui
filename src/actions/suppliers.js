import api from '../api/api';

export const getAllSuppliers = () => async () => {
  try {
    return await api.get('/suppliers');
  } catch (error) {
    console.log(error);
    
  }
}

export const getSupplierById = (id) => async () => {
  try {
    return await api.get(`/suppliers/${id}`);
  } catch (error) {
    console.log(error);
    
  }
}

export const addSupplier = (supplier) => async () => {
  try {
    return await api.post('/suppliers', supplier);
  } catch (error) {
    console.log(error);
  }
}

export const updateSupplier = (id, supplier) => async () => {
  try {
    return await api.put(`/suppliers/${id}`, supplier);
  } catch (error) {
    console.log(error);
  }
}

export const deleteSupplier = (id) => async () => {
  try {
    await api.delete(`/suppliers/${id}`);
  } catch (error) {
    console.log(error);
  }
}