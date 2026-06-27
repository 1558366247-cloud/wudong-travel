import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Badge, Space, Dropdown } from 'antd';
import {
  EnvironmentOutlined, CompassOutlined, CarOutlined,
  ShoppingCartOutlined, UserOutlined, HeartOutlined,
  OrderedListOutlined, HomeOutlined
} from '@ant-design/icons';
import './styles/global.css';

const { Header, Content, Footer } = Layout;

// 页面组件（懒加载简化处理）
import HomePage from './pages/HomePage';
import ScenicDetailPage from './pages/ScenicDetailPage';
import RouteListPage from './pages/RouteListPage';
import RouteDetailPage from './pages/RouteDetailPage';
import GuideListPage from './pages/GuideListPage';
import GuideDetailPage from './pages/GuideDetailPage';
import TicketPurchasePage from './pages/TicketPurchasePage';
import RoutePurchasePage from './pages/RoutePurchasePage';
import OrderListPage from './pages/OrderListPage';
import OrderDetailPage from './pages/OrderDetailPage';
import MyFavoritesPage from './pages/MyFavoritesPage';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  const navItems = [
    { key: '/', label: '首页', icon: <HomeOutlined /> },
    { key: '/scenic', label: '景区门票', icon: <EnvironmentOutlined /> },
    { key: '/routes', label: '路线套餐', icon: <CompassOutlined /> },
    { key: '/guides', label: '交通攻略', icon: <CarOutlined /> },
    { key: '/orders', label: '我的订单', icon: <OrderedListOutlined /> },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{
        background: '#fff', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 24px',
        boxShadow: 'var(--shadow-light)', position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/logo.png" alt="乌东文旅" style={{ height: 36 }} />
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-primary)' }}>
              乌东文旅
            </span>
          </Link>
          <Menu
            mode="horizontal"
            selectedKeys={[window.location.pathname]}
            items={navItems}
            onClick={({ key }) => navigate(key)}
            style={{ border: 'none', flex: 1 }}
          />
        </div>
        <Space>
          {isLoggedIn ? (
            <>
              <Button icon={<HeartOutlined />} onClick={() => navigate('/favorites')}>收藏</Button>
              <Dropdown menu={{
                items: [
                  { key: 'orders', label: '我的订单', onClick: () => navigate('/orders') },
                  { key: 'logout', label: '退出登录' },
                ]
              }}>
                <Button icon={<UserOutlined />}>个人中心</Button>
              </Dropdown>
            </>
          ) : (
            <Button type="primary" icon={<UserOutlined />}>登录/注册</Button>
          )}
        </Space>
      </Header>
      <Content>{children}</Content>
      <Footer style={{ textAlign: 'center', background: 'var(--color-primary-dark)', color: '#fff', padding: '32px 24px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
            <div>
              <h4 style={{ color: '#fff', marginBottom: 12 }}>乌东文旅</h4>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>贵州苗族特色村寨数字化文旅服务平台</p>
            </div>
            <div>
              <h4 style={{ color: '#fff', marginBottom: 8 }}>快速链接</h4>
              <p><Link to="/scenic" style={{ color: 'rgba(255,255,255,0.7)' }}>景区门票</Link></p>
              <p><Link to="/routes" style={{ color: 'rgba(255,255,255,0.7)' }}>路线套餐</Link></p>
              <p><Link to="/guides" style={{ color: 'rgba(255,255,255,0.7)' }}>交通攻略</Link></p>
            </div>
            <div>
              <h4 style={{ color: '#fff', marginBottom: 8 }}>联系我们</h4>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>客服电话：0855-xxxxxxx</p>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>地址：贵州省雷山县乌东村</p>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', marginTop: 24, paddingTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
            © 2026 乌东文旅 | AI创赢 版权所有
          </div>
        </div>
      </Footer>
    </Layout>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/scenic" element={<HomePage />} />
        <Route path="/scenic/:scenicId" element={<ScenicDetailPage />} />
        <Route path="/ticket/purchase/:ticketTypeId" element={<TicketPurchasePage />} />
        <Route path="/routes" element={<RouteListPage />} />
        <Route path="/route/:routeId" element={<RouteDetailPage />} />
        <Route path="/route/purchase/:routeId" element={<RoutePurchasePage />} />
        <Route path="/guides" element={<GuideListPage />} />
        <Route path="/guide/:guideId" element={<GuideDetailPage />} />
        <Route path="/orders" element={<OrderListPage />} />
        <Route path="/order/:orderNo" element={<OrderDetailPage />} />
        <Route path="/favorites" element={<MyFavoritesPage />} />
      </Routes>
    </AppLayout>
  </BrowserRouter>
);

export default App;
