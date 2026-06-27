import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Tag, Input, Carousel, Spin, Empty, Tabs, Rate } from 'antd';
import { SearchOutlined, EnvironmentOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { scenicApi, routeApi } from '../services/api';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [scenics, setScenics] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    Promise.all([
      scenicApi.list({ page: 1, pageSize: 8 }),
      routeApi.list({ page: 1, pageSize: 6 })
    ]).then(([scenicRes, routeRes]: any) => {
      setScenics(scenicRes.list || []);
      setRoutes(routeRes.list || []);
    }).finally(() => setLoading(false));
  }, []);

  const banners = [
    { img: 'https://example.com/images/banner1.jpg', title: '乌东苗寨·云端上的苗家', link: '/scenic/1' },
    { img: 'https://example.com/images/banner2.jpg', title: '雷公山·苗岭之巅', link: '/scenic/2' },
    { img: 'https://example.com/images/banner3.jpg', title: '苗寨深度研学之旅', link: '/route/4' },
  ];

  if (loading) return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;

  return (
    <div>
      {/* 全屏轮播 */}
      <Carousel autoplay style={{ marginBottom: 0 }}>
        {banners.map((b, i) => (
          <div key={i} onClick={() => navigate(b.link)} style={{ cursor: 'pointer' }}>
            <div style={{
              height: 480, background: `linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
            }}>
              <div style={{ textAlign: 'center' }}>
                <h1 style={{ fontSize: 42, fontWeight: 700, marginBottom: 16 }}>{b.title}</h1>
                <p style={{ fontSize: 18, opacity: 0.85 }}>探秘贵州苗族文化，体验苗寨山野之美</p>
              </div>
            </div>
          </div>
        ))}
      </Carousel>

      {/* 搜索与快捷预订 */}
      <div className="container" style={{ marginTop: -40, position: 'relative', zIndex: 10 }}>
        <Card style={{ borderRadius: 12, boxShadow: 'var(--shadow-deep)' }}>
          <Input.Search
            size="large"
            placeholder="搜索景区、路线、攻略..."
            enterButton={<><SearchOutlined /> 搜索</>}
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onSearch={kw => {
              if (kw) navigate(`/scenic?keyword=${kw}`);
            }}
          />
          <div style={{ marginTop: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Tag className="tag-primary" style={{ cursor: 'pointer' }} onClick={() => navigate('/routes?theme=亲子')}>👨‍👩‍👧 亲子游</Tag>
            <Tag className="tag-orange" style={{ cursor: 'pointer' }} onClick={() => navigate('/routes?theme=摄影')}>📷 摄影游</Tag>
            <Tag className="tag-green" style={{ cursor: 'pointer' }} onClick={() => navigate('/routes?theme=研学')}>📚 研学游</Tag>
            <Tag className="tag-gold" style={{ cursor: 'pointer' }} onClick={() => navigate('/routes?theme=节庆')}>🎉 节庆游</Tag>
          </div>
        </Card>
      </div>

      {/* 功能入口 */}
      <div className="container" style={{ marginTop: 40 }}>
        <Row gutter={[16, 16]}>
          {[
            { icon: '🎫', label: '景区门票', path: '/scenic', color: '#E8F1FB' },
            { icon: '🗺️', label: '路线套餐', path: '/routes', color: '#FFF1EA' },
            { icon: '🚗', label: '交通攻略', path: '/guides', color: '#F6FFED' },
            { icon: '📋', label: '我的订单', path: '/orders', color: '#FFFBF0' },
          ].map((item, i) => (
            <Col xs={12} sm={6} key={i}>
              <Card
                hoverable
                onClick={() => navigate(item.path)}
                style={{ textAlign: 'center', borderRadius: 12, background: item.color }}
              >
                <div style={{ fontSize: 36, marginBottom: 8 }}>{item.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>{item.label}</div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* 热门景区 */}
      <div className="container" style={{ marginTop: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700 }}>🏔️ 热门景区</h2>
          <a onClick={() => navigate('/scenic')} style={{ cursor: 'pointer' }}>查看全部 →</a>
        </div>
        <Row gutter={[20, 20]}>
          {scenics.map(scenic => (
            <Col xs={24} sm={12} lg={6} key={scenic.scenicId}>
              <Card
                hoverable
                className="card"
                cover={
                  <div style={{ height: 180, background: `linear-gradient(135deg, var(--color-primary-light), var(--color-primary))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
                    🏔️
                  </div>
                }
                onClick={() => navigate(`/scenic/${scenic.scenicId}`)}
              >
                <Card.Meta
                  title={scenic.name}
                  description={
                    <div>
                      <div><EnvironmentOutlined /> {scenic.address}</div>
                      <div><ClockCircleOutlined /> {scenic.openTime}</div>
                      <div style={{ marginTop: 8 }}>
                        {scenic.minPrice > 0 && (
                          <span className="price">¥<span className="price-symbol">{scenic.minPrice}</span>起</span>
                        )}
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* 热门路线 */}
      <div className="container" style={{ marginTop: 48, marginBottom: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700 }}>🗺️ 热门路线</h2>
          <a onClick={() => navigate('/routes')} style={{ cursor: 'pointer' }}>查看全部 →</a>
        </div>
        <Row gutter={[20, 20]}>
          {routes.slice(0, 4).map(route => (
            <Col xs={24} sm={12} lg={6} key={route.routeId}>
              <Card
                hoverable
                className="card"
                cover={
                  <div style={{ height: 180, background: `linear-gradient(135deg, #FFF1EA, var(--color-secondary-orange))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#fff', fontWeight: 700 }}>
                    {route.duration}
                  </div>
                }
                onClick={() => navigate(`/route/${route.routeId}`)}
              >
                <Card.Meta
                  title={route.title}
                  description={
                    <div>
                      <Tag className="tag-primary">{route.duration}</Tag>
                      {route.themes?.split(',').map((t: string) => (
                        <Tag key={t} className="tag-orange">{t}</Tag>
                      ))}
                      <div style={{ marginTop: 8 }}>
                        <Rate disabled defaultValue={route.rating} style={{ fontSize: 14 }} />
                        <span style={{ marginLeft: 8, color: 'var(--color-text-tertiary)' }}>{route.reviewCount}条评价</span>
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <span className="price">¥{route.price}</span>
                        <span className="market-price">¥{route.marketPrice}</span>
                        <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>/人</span>
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default HomePage;
