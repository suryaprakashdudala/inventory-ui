
const initialState =  {
  auth: {
    user: null,
    loading: false,
    isAuthenticated: false
  },
  users: {
    list: [],
    loading: false
  },
  products: {
    list: []
  },
  dashboard: {
    stats: {
          totalProducts: 0,
          totalAvailableQty: 0,
          lowStockItemsCount: 0,
          pendingPurchaseOrders: 0,
          totalSuppliers: 0,
          totalInventoryValue: 0,
          lowStockAlerts: [],
          recentMovements: [],
          poStatusSummary: {},
          movementTrend: [],
          topProducts: []
      }
  }
};
export default initialState