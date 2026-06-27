import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Tag, Button, Rate, Descriptions, Tabs, List, Spin, message, Modal, InputNumber, DatePicker } from 'antd';
import { EnvironmentOutlined, ClockCircleOutlined, HeartOutlined, HeartFilled, ShoppingCartOutlined } from '@ant-design/icons';
import { scenicApi, reviewApi, favoriteApi } from '../services/api';
import dayjs from 'dayjs';

const ScenicDetailPage: React.FC = () => {
  const { scenicId } = useParams<{ scenicId: string }>();
  const navigate = useNavigate();
  const [scenic, setScenic] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchaseVisible, setPurchaseVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [useDate, setUseDate] = useState<string>(dayjs().add(1, 'day').format('YYYY-MM-DD'));

  useEffect(() => {
    if (!scenicId) return;
    Promise.all([
      scenicApi.detail(Number(scenicId)),
      reviewApi.list({ scenicId: Number(scenicId) }),
      favoriteApi.check('scenic', Number(scenicId))
    ]).then(([scenicRes, reviewRes, favRes]: any) => {
      setScenic(scenicRes);
      setReviews(reviewRes.list || []);
      setFavorited(favRes.favorited);
    }).finally(() => setLoading(false));
  }, [scenicId]);

  const toggleFavorite = async () => {
    await favoriteApi.toggle('scenic', Number(scenicId));
    setFavorited(!favorited);
    message.success(favorited ? '已取消收藏' : '已收藏');
  };

  const handlePurchase = (ticket: any) => {
    setSelectedTicket(ticket);
    setQuantity(1);
    setPurchaseVisible(true);
  };

  const confirmPurchase = () => {
    if (!selectedTicket) return;
    navigate(`/ticket/purchase/${selectedTicket.ticketTypeId}?quantity=${quantity}&date=${useDate}`);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;
  if (!scenic) return <div style={{ textAlign: 'center', padding: 100 }}>景区不存在</div>;

  return (
    <div>
      <div className="page-hero">
        <div className="container">
          <h1>{scenic.name}</h1>
          <p><EnvironmentOutlined /> {scenic.address} | <ClockCircleOutlined /> {scenic.openTime}</p>
        </div>
      </div>

      <div className="container" style={{ marginTop: 32, marginBottom: 48 }}>
        <Row gutter={[32, 24]}>
          <Col xs={24} lg={16}>
            {/* 景区介绍 */}
            <Card title="景区介绍" style={{ borderRadius: 12, marginBottom: 24 }}>
              <div style={{ height: 320, background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-primary))', borderRadius: 8, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>
                🏔️
              </div>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--color-text-secondary)' }}>{scenic.description}</p>
            </Card>

            {/* 用户评价 */}
            <Card title={`用户评价 (${reviews.length})`} style={{ borderRadius: 12 }}>
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
                          {review.reply && <p style={{ color: 'var(--color-primary)', marginTop: 8, background: 'var(--color-primary-light)', padding: '8px 12px', borderRadius: 8 }}>商家回复：{review.reply}</p>}
                          <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{dayjs(review.createdAt).format('YYYY-MM-DD')}</span>
                        </div>
                      }
                    />
                  </List.Item>
                )}
                locale={{ emptyText: '暂无评价' }}
              />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            {/* 票种列表 */}
            <Card
              title="门票选购"
              style={{ borderRadius: 12, position: 'sticky', top: 80 }}
              extra={
                <Button
                  type="text"
                  icon={favorited ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                  onClick={toggleFavorite}
                >
                  {favorited ? '已收藏' : '收藏'}
                </Button>
              }
            >
              {scenic.tickets?.map((ticket: any) => (
                <div key={ticket.ticketTypeId} style={{
                  border: '1px solid var(--color-border-primary)', borderRadius: 8,
                  padding: 16, marginBottom: 12
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 500 }}>{ticket.name}</span>
                    <Tag className="tag-primary">库存{ticket.stock}</Tag>
                  </div>
                  {ticket.usageNote && (
                    <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginBottom: 8 }}>{ticket.usageNote}</p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span className="price">¥{ticket.price}</span>
                      {ticket.marketPrice && <span className="market-price">¥{ticket.marketPrice}</span>}
                    </div>
                    <Button type="primary" icon={<ShoppingCartOutlined />} onClick={() => handlePurchase(ticket)}>
                      购买
                    </Button>
                  </div>
                </div>
              ))}
              {(!scenic.tickets || scenic.tickets.length === 0) && <p style={{ color: 'var(--color-text-tertiary)' }}>暂无可售票种</p>}
            </Card>
          </Col>
        </Row>
      </div>

      {/* 购买弹窗 */}
      <Modal
        title="购买门票"
        open={purchaseVisible}
        onCancel={() => setPurchaseVisible(false)}
        onOk={confirmPurchase}
        okText="去下单"
      >
        {selectedTicket && (
          <div>
            <p><strong>票种：</strong>{selectedTicket.name}</p>
            <p><strong>单价：</strong><span style={{ color: 'var(--color-secondary-orange)' }}>¥{selectedTicket.price}</span></p>
            <div style={{ marginTop: 16 }}>
              <label>使用日期：</label>
              <DatePicker
                value={dayjs(useDate)}
                onChange={(d) => setUseDate(d?.format('YYYY-MM-DD') || '')}
                disabledDate={(d) => d && d < dayjs().startOf('day')}
                style={{ width: '100%', marginTop: 8 }}
              />
            </div>
            <div style={{ marginTop: 16 }}>
              <label>数量：</label>
              <InputNumber min={1} max={10} value={quantity} onChange={v => setQuantity(v || 1)} style={{ width: '100%', marginTop: 8 }} />
            </div>
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-border-primary)' }}>
              <strong>合计：</strong><span className="price">¥{(selectedTicket.price * quantity).toFixed(2)}</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ScenicDetailPage;
