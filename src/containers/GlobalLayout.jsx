import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Layouts/Sidebar";
import AppHeader from "../components/Layouts/AppHeader";
import '../styles/Layouts.css';

const { Content } = Layout;

const GlobalLayout = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role || 'VIEWER';

  return (
    <Layout className="global-layout">
      <Sidebar role={role} />
      <Layout>
        <AppHeader />
        <Content className="global-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default GlobalLayout;
