import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Tag, Button, Rate, Timeline, Descriptions, List, Spin, message } from 'antd';
import { HeartOutlined, HeartFilled, ShoppingCartOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { routeApi, reviewApi, favoriteApi } from '../services/api';
import dayjs from 'dayjs';

const RouteDetailPage: React.FC = () => {
  const { routeId } = useParams<{ routeId: string }>();
  const navigate = useNavigate();
  const [route, setRoute] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!routeId) return;
    Promise.all([
      routeApi.detail(Number(routeId)),
      reviewApi.list({ routeId: Number(routeId) }),
      favoriteApi.check('route', Number(routeId))
    ]).then(([routeRes, reviewRes, favRes]: any) => {
      setRoute(routeRes);
      setReviews(reviewRes.list || []);
      setFavorited(favRes.favorited);
    }).finally(() => setLoading(false));
  }, [routeId]);

  const toggleFavorite = async () => {
    await favoriteApi.toggle('route', Number(routeId));
    setFavorited(!favorited);
    message.success(favorited ? '已取消收藏' : '已收藏');
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;
  if (!route) return <div style={{ textAlign: 'center', padding: 100 }}>路线不存在</div>;

  const includedItems = route.includedItems ? JSON.parse(route.includedItems) : [];

  return (
    <div>
      <div className="page-hero">
        <div className="container">
          <h1>{route.title}</h1>
          <p>{route.subtitle} | {route.departure} → {route.destination}</p>
        </div>
      </div>

      <div className="container" style={{ marginTop: 32, marginBottom: 48 }}>
        <Row gutter={[32, 24]}>
          <Col xs={24} lg={16}>
            {/* 路线主图 */}
            <div style={{ height: 360, background: 'linear-gradient(135deg, #FFF1EA, var(--color-secondary-orange))', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#fff', fontWeight: 700, marginBottom: 24 }}>
              {route.duration} - {route.title}
            </div>

            {/* 行程安排 */}
            <Card title="📋 行程安排" style={{ borderRadius: 12, marginBottom: 24 }}>
              <Timeline
                items={(route.itineraries || []).map((item: any) => ({
                  color: 'blue',
                  children: (
                    <Card size="small" style={{ marginBottom: 8 }}>
                      <h4>第{item.day}天</h4>
                      <p>{item.description}</p>
                      {item.spots && <p><strong>景点：</strong>{item.spots}</p>}
                      {item.meals && <p><strong>用餐：</strong>{item.meals}</p>}
                      {item.accommodation && <p><strong>住宿：</strong>{item.accommodation}</p>}
                      {item.transportation && <p><strong>交通：</strong>{item.transportation}</p>}
                    </Card>
                  )
                }))}
              />
            </Card>

            {/* 路线详情 */}
            <Card title="📝 路线详情" style={{ borderRadius: 12, marginBottom: 24 }}>
              <div dangerouslySetInnerHTML={{ __html: route.details }} />
            </Card>

            {/* 注意事项 */}
            {route.notes && (
              <Card title="⚠️ 注意事项" style={{ borderRadius: 12, marginBottom: 24 }}>
                <p style={{ whiteSpace: 'pre-wrap' }}>{route.notes}</p>
              </Card>
            )}

            {/* 用户评价 */}
            <Card title={`💬 用户评价 (${reviews.length})`} style={{ borderRadius: 12 }}>
              <List
                dataSource={reviews}
                renderItem={(review: any) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>}
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{review.userName}</span>
                          <Rate disabled defaultValue={review.rating} style={{ fontSize: 14 }} />
                        </div>
                      }
                      description={
                        <div>
                          <p>{review.content}</p>
                          {review.reply && <p style={{ color: 'var(--color-primary)', marginTop: 8, background: 'var(--color-primary-light)', padding: 8, borderRadius: 8 }}>商家回复：{review.reply}</p>}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            {/* 购买卡片 */}
            <Card style={{ borderRadius: 12, position: 'sticky', top: 80 }}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <span className="price" style={{ fontSize: 28 }}>¥{route.price}</span>
                <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>/人</span>
                {route.marketPrice && <div className="market-price">¥{route.marketPrice}</div>}
              </div>

              <Descriptions column={1} size="small" style={{ marginBottom: 16 }}>
                <Descriptions.Item label="行程天数">{route.duration}</Descriptions.Item>
                <Descriptions.Item label="出发地">{route.departure}</Descriptions.Item>
                <Descriptions.Item label="目的地">{route.destination}</Descriptions.Item>
                <Descriptions.Item label="剩余名额">{route.stock}人</Descriptions.Item>
                <Descriptions.Item label="评分">
                  <Rate disabled defaultValue={route.rating} style={{ fontSize: 13 }} />
                  <span style={{ marginLeft: 4 }}>{route.reviewCount}条评价</span>
                </Descriptions.Item>
                {route.accommodationStandard && (
                  <Descriptions.Item label="住宿标准">{route.accommodationStandard}</Descriptions.Item>
                )}
                {route.mealStandard && (
                  <Descriptions.Item label="餐饮标准">{route.mealStandard}</Descriptions.Item>
                )}
              </Descriptions>

              {includedItems.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <strong>费用包含：</strong>
                  {includedItems.map((item: string, i: number) => (
                    <div key={i} style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                      <CheckCircleOutlined style={{ color: 'var(--color-success)', marginRight: 4 }} />
                      {item}
                    </div>
                  ))}
                </div>
              )}

              <Button
                type="primary"
                size="large"
                block
                icon={<ShoppingCartOutlined />}
                onClick={() => navigate(`/route/purchase/${route.routeId}`)}
                disabled={route.stock <= 0}
              >
                {route.stock > 0 ? '立即预订' : '已售罄'}
              </Button>
              <Button
                block
                style={{ marginTop: 8 }}
                icon={favorited ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                onClick={toggleFavorite}
              >
                {favorited ? '已收藏' : '收藏'}
              </Button>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default RouteDetailPage;
