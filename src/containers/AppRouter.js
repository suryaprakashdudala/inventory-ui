import { Routes, Route, Navigate } from "react-router-dom";

import Login from './Login';
import ForgotPassword from '../components/Login/ForgotPassword'
import ResetPassword from '../components/Login/ResetPassword';
import RegisterUser from '../components/UserManagement/RegisterUser'
import ViewUser from "../components/UserManagement/ViewUser";
import SessionExpiry from "../components/SessionExpiry/SessionExpiry";
import GlobalLayout from "./GlobalLayout";
import ProductDashboard from "../components/Products/ProductDashboard";
import InventoryManager from "../components/Inventory/InventoryManager";
import SupplierManager from "../components/Suppliers/SupplierManager";
import PurchaseOrderManager from "../components/PurchaseOrders/PurchaseOrderManager";
import StockAuditLog from "../components/Audit/StockAuditLog";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/register" element={<RegisterUser />} />
      <Route path="/session-expired" element={<SessionExpiry />} />

      <Route element={<GlobalLayout />}>
        <Route path="/" element={<Navigate to="/products" replace />} />
        <Route path="/products" element={<ProductDashboard />} />
        <Route path="/inventory" element={<InventoryManager />} />
        <Route path="/suppliers" element={<SupplierManager />} />
        <Route path="/purchase-orders" element={<PurchaseOrderManager />} />
        <Route path="/audit-log" element={<StockAuditLog />} />
        
        <Route path="/users/add" element={<RegisterUser />} />
        <Route path="/users/view" element={<ViewUser />} />
        <Route path="/users/edit/:id" element={<RegisterUser />} />
      </Route>

      {/* <Route path="*" element={<Navigate to="/products" replace />} /> */}
    </Routes>
  );
};

export default AppRouter;
