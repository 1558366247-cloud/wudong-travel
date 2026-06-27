import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Row, Col, Card, Tag, Rate, Select, Input, Pagination, Spin, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { routeApi } from '../services/api';

const RouteListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [routes, setRoutes] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    duration: searchParams.get('duration') || '',
    theme: searchParams.get('theme') || '',
    keyword: searchParams.get('keyword') || '',
    sortBy: 'default',
    page: 1,
    pageSize: 8
  });

  useEffect(() => {
    setLoading(true);
    routeApi.list(filters).then((res: any) => {
      setRoutes(res.list || []);
      setTotal(res.total || 0);
    }).finally(() => setLoading(false));
  }, [filters]);

  return (
    <div>
      <div className="page-hero">
        <div className="container">
          <h1>🗺️ 苗寨游路线套餐</h1>
          <p>一日游、两日游、多日深度游，全方位体验苗族文化</p>
        </div>
      </div>

      <div className="container" style={{ marginTop: 32, marginBottom: 48 }}>
        {/* 筛选栏 */}
        <Card style={{ borderRadius: 12, marginBottom: 24 }}>
          <Row gutter={[16, 12]} align="middle">
            <Col xs={24} sm={6}>
              <Input
                placeholder="搜索路线..."
                prefix={<SearchOutlined />}
                value={filters.keyword}
                onChange={e => setFilters({ ...filters, keyword: e.target.value, page: 1 })}
              />
            </Col>
            <Col xs={12} sm={4}>
              <Select
                placeholder="行程天数"
                value={filters.duration || undefined}
                onChange={v => setFilters({ ...filters, duration: v || '', page: 1 })}
                allowClear
                style={{ width: '100%' }}
                options={[
                  { label: '一日游', value: '一日游' },
                  { label: '两日游', value: '两日游' },
                  { label: '多日游', value: '多日游' },
                ]}
              />
            </Col>
            <Col xs={12} sm={4}>
              <Select
                placeholder="主题"
                value={filters.theme || undefined}
                onChange={v => setFilters({ ...filters, theme: v || '', page: 1 })}
                allowClear
                style={{ width: '100%' }}
                options={[
                  { label: '亲子', value: '亲子' },
                  { label: '摄影', value: '摄影' },
                  { label: '研学', value: '研学' },
                  { label: '节庆', value: '节庆' },
                ]}
              />
            </Col>
            <Col xs={12} sm={4}>
              <Select
                placeholder="排序"
                value={filters.sortBy}
                onChange={v => setFilters({ ...filters, sortBy: v, page: 1 })}
                style={{ width: '100%' }}
                options={[
                  { label: '默认', value: 'default' },
                  { label: '价格从低到高', value: 'price_asc' },
                  { label: '价格从高到低', value: 'price_desc' },
                  { label: '评分最高', value: 'rating' },
                ]}
              />
            </Col>
          </Row>
        </Card>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>
        ) : routes.length === 0 ? (
          <Empty description="暂无符合条件的路线" />
        ) : (
          <>
            <Row gutter={[20, 20]}>
              {routes.map(route => (
                <Col xs={24} sm={12} lg={6} key={route.routeId}>
                  <Card
                    hoverable
                    className="card"
                    cover={
                      <div style={{ height: 200, background: `linear-gradient(135deg, #FFF1EA, var(--color-secondary-orange))`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 700 }}>
                        {route.duration}
                      </div>
                    }
                    onClick={() => navigate(`/route/${route.routeId}`)}
                  >
                    <Card.Meta
                      title={<div style={{ fontSize: 16 }}>{route.title}</div>}
                      description={
                        <div>
                          <div style={{ marginBottom: 4 }}>
                            <Tag className="tag-primary">{route.duration}</Tag>
                            {route.themes?.split(',').map((t: string) => (
                              <Tag key={t} className="tag-orange">{t}</Tag>
                            ))}
                          </div>
                          <div style={{ marginBottom: 4 }}>
                            <Rate disabled defaultValue={route.rating} style={{ fontSize: 13 }} />
                            <span style={{ marginLeft: 4, fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                              {route.reviewCount}条
                            </span>
                          </div>
                          <div>
                            <span className="price">¥{route.price}</span>
                            <span className="market-price">¥{route.marketPrice}</span>
                            <span style={{ fontSize: 12 }}>/人</span>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Pagination
                current={filters.page}
                total={total}
                pageSize={filters.pageSize}
                onChange={page => setFilters({ ...filters, page })}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RouteListPage;
