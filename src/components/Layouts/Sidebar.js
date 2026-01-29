import { Layout, Menu } from "antd";
import {
  UserOutlined,
  ShoppingOutlined,
  DatabaseOutlined,
  TeamOutlined,
  HistoryOutlined,
  ContainerOutlined
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import '../../styles/Layouts.css';

const { Sider } = Layout;

const Sidebar = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/products',
      icon: <ShoppingOutlined />,
      label: 'Products',
      onClick: () => navigate('/products')
    },
    {
      key: '/inventory',
      icon: <DatabaseOutlined />,
      label: 'Inventory',
      onClick: () => navigate('/inventory')
    },
    {
      key: '/suppliers',
      icon: <TeamOutlined />,
      label: 'Suppliers',
      onClick: () => navigate('/suppliers')
    },
    {
      key: '/purchase-orders',
      icon: <ContainerOutlined />,
      label: 'Purchase Orders',
      onClick: () => navigate('/purchase-orders')
    },
    {
      key: '/audit-log',
      icon: <HistoryOutlined />,
      label: 'Audit Log',
      onClick: () => navigate('/audit-log')
    },
    {
      key: 'user-management',
      icon: <UserOutlined />,
      label: 'User Management',
      children: [
        {
          key: '/users/add',
          label: 'Add User',
          onClick: () => navigate('/users/add')
        },
        {
          key: '/users/view',
          label: 'View Users',
          onClick: () => navigate('/users/view')
        }
      ]
    }
  ].filter(item => {
    if (role === 'ADMIN') return true;
    if (item.key === 'user-management') return false;
    if (role === 'VIEWER') {
        return ['/products', '/inventory', '/purchase-orders', '/audit-log'].includes(item.key);
    }
    return true;
  });

  return (
    <Sider width={250} className="app-sidebar">
      <div className="sidebar-logo-container" style={{ color: 'white', padding: '16px', fontSize: '1.2rem', fontWeight: 'bold' }}>
        Inventory Manager
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
      />
    </Sider>
  );
}
export default Sidebar;