import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Layout, Menu, Button, theme } from 'antd';
import {
  DashboardOutlined, EnvironmentOutlined, IdcardOutlined,
  CompassOutlined, OrderedListOutlined, ScanOutlined,
  CarOutlined, StarOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined
} from '@ant-design/icons';
import DashboardPage from './pages/DashboardPage';
import ScenicManagePage from './pages/ScenicManagePage';
import TicketManagePage from './pages/TicketManagePage';
import RouteManagePage from './pages/RouteManagePage';
import OrderManagePage from './pages/OrderManagePage';
import VerifyTicketPage from './pages/VerifyTicketPage';
import GuideManagePage from './pages/GuideManagePage';
import ReviewManagePage from './pages/ReviewManagePage';

const { Header, Sider, Content } = Layout;

const AdminApp: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: '/admin', icon: <DashboardOutlined />, label: '数据看板' },
    { key: '/admin/scenic', icon: <EnvironmentOutlined />, label: '景区管理' },
    { key: '/admin/ticket', icon: <IdcardOutlined />, label: '票种管理' },
    { key: '/admin/route', icon: <CompassOutlined />, label: '路线套餐管理' },
    { key: '/admin/order', icon: <OrderedListOutlined />, label: '订单管理' },
    { key: '/admin/verify', icon: <ScanOutlined />, label: '电子票核销' },
    { key: '/admin/guide', icon: <CarOutlined />, label: '交通攻略管理' },
    { key: '/admin/review', icon: <StarOutlined />, label: '评价管理' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark" style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100 }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: collapsed ? 14 : 18, fontWeight: 700 }}>
          {collapsed ? '乌东' : '乌东文旅·管理后台'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.3s' }}>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed(!collapsed)} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: 'var(--text-secondary)' }}>管理员</span>
            <Button icon={<LogoutOutlined />} type="text">退出</Button>
          </div>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 12, minHeight: 280 }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/scenic" element={<ScenicManagePage />} />
            <Route path="/ticket" element={<TicketManagePage />} />
            <Route path="/route" element={<RouteManagePage />} />
            <Route path="/order" element={<OrderManagePage />} />
            <Route path="/verify" element={<VerifyTicketPage />} />
            <Route path="/guide" element={<GuideManagePage />} />
            <Route path="/review" element={<ReviewManagePage />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/admin/*" element={<AdminApp />} />
    </Routes>
  </BrowserRouter>
);

export default App;
