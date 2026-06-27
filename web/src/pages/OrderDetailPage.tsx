import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Row, Col, Spin, message, Modal, QRCode } from 'antd';
import { orderApi, reviewApi } from '../services/api';
import dayjs from 'dayjs';

const OrderDetailPage: React.FC = () => {
  const { orderNo } = useParams<{ orderNo: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewVisible, setReviewVisible] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, content: '', images: [] as string[] });

  useEffect(() => {
    if (orderNo) {
      orderApi.detail(orderNo).then((res: any) => setOrder(res)).finally(() => setLoading(false));
    }
  }, [orderNo]);

  const handleCancel = async () => {
    Modal.confirm({
      title: '确认取消订单？',
      onOk: async () => {
        await orderApi.cancel(orderNo!);
        message.success('已取消');
        orderApi.detail(orderNo!).then(setOrder);
      }
    });
  };

  const handleRefund = async () => {
    Modal.confirm({
      title: '申请退款',
      content: '确认申请退款？未使用的电子票将被标记为退款状态。',
      onOk: async () => {
        try {
          await orderApi.refund({ orderNo: orderNo!, reason: '用户申请退款' });
          message.success('退款申请已提交');
          orderApi.detail(orderNo!).then(setOrder);
        } catch (err: any) {
          message.error(err.message);
        }
      }
    });
  };

  const submitReview = async () => {
    const targetId = order?.orderType === 'ticket'
      ? order.ticketType?.scenicId
      : order?.routeId || order?.targetId;

    await reviewApi.create({
      orderNo: orderNo!,
      scenicId: order?.orderType === 'ticket' ? order?.targetId : undefined,
      routeId: order?.orderType === 'route' ? order?.targetId : undefined,
      rating: reviewForm.rating,
      content: reviewForm.content,
      images: reviewForm.images
    });
    message.success('评价成功！');
    setReviewVisible(false);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;
  if (!order) return <div style={{ textAlign: 'center', padding: 100 }}>订单不存在</div>;

  const statusMap: Record<string, { label: string; color: string }> = {
    pending_pay: { label: '待支付', color: 'warning' },
    paid: { label: '已支付', color: 'processing' },
    refunding: { label: '退款中', color: 'warning' },
    refunded: { label: '已退款', color: 'default' },
    completed: { label: '已完成', color: 'success' },
    cancelled: { label: '已取消', color: 'default' }
  };

  return (
    <div className="container" style={{ marginTop: 32, marginBottom: 48, maxWidth: 900 }}>
      <Card style={{ borderRadius: 12, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2>订单详情</h2>
          <Tag color={statusMap[order.orderStatus]?.color}>
            {statusMap[order.orderStatus]?.label}
          </Tag>
        </div>

        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="订单号">{order.orderNo}</Descriptions.Item>
          <Descriptions.Item label="订单类型">
            <Tag className={order.orderType === 'ticket' ? 'tag-primary' : 'tag-orange'}>
              {order.orderType === 'ticket' ? '门票' : '路线'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="商品名称">{order.targetName}</Descriptions.Item>
          <Descriptions.Item label="票种">{order.ticketTypeName || '-'}</Descriptions.Item>
          <Descriptions.Item label="单价">¥{order.unitPrice}</Descriptions.Item>
          <Descriptions.Item label="数量">{order.quantity}</Descriptions.Item>
          <Descriptions.Item label="总金额"><span className="price">¥{order.totalAmount}</span></Descriptions.Item>
          <Descriptions.Item label="使用/出发日期">{order.useDate}</Descriptions.Item>
          <Descriptions.Item label="联系人手机">{order.contactPhone}</Descriptions.Item>
          <Descriptions.Item label="下单时间">{dayjs(order.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
          {order.paidAt && <Descriptions.Item label="支付时间">{dayjs(order.paidAt).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>}
        </Descriptions>

        {/* 操作按钮 */}
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          {order.orderStatus === 'pending_pay' && (
            <Button danger onClick={handleCancel}>取消订单</Button>
          )}
          {(order.orderStatus === 'paid' || order.orderStatus === 'completed') && (
            <>
              <Button onClick={handleRefund}>申请退款</Button>
              <Button type="primary" onClick={() => setReviewVisible(true)}>去评价</Button>
            </>
          )}
        </div>
      </Card>

      {/* 电子票 */}
      {order.eTickets?.length > 0 && order.orderStatus === 'paid' && (
        <Card title="🎫 电子票（R9-02: 每张电子票对应唯一二维码）" style={{ borderRadius: 12, marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            {order.eTickets.map((ticket: any) => (
              <Col xs={24} sm={12} key={ticket.eTicketId}>
                <Card size="small" style={{
                  borderRadius: 12, border: '2px dashed var(--color-primary)',
                  background: 'linear-gradient(135deg, #fff, var(--color-primary-light))'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <QRCode
                      value={ticket.qrCode}
                      size={150}
                      style={{ marginBottom: 12 }}
                    />
                    <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', wordBreak: 'break-all' }}>
                      票号：{ticket.qrCode}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <Tag color={ticket.status === 'unused' ? 'blue' : ticket.status === 'used' ? 'green' : 'red'}>
                        {ticket.status === 'unused' ? '未使用' : ticket.status === 'used' ? '已使用' : ticket.status === 'refunded' ? '已退款' : '已过期'}
                      </Tag>
                    </div>
                    <p style={{ marginTop: 8, fontWeight: 500 }}>
                      {ticket.visitorName} | 使用日期: {ticket.useDate}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                      有效期至: {ticket.expireDate}
                    </p>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* 游客信息 */}
      <Card title="👥 游客信息" style={{ borderRadius: 12 }}>
        {(() => {
          try {
            const visitors = JSON.parse(order.visitors || '[]');
            return visitors.map((v: any, i: number) => (
              <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border-secondary)' }}>
                <strong>{v.name}</strong> | 身份证: {v.idCard} | 手机: {v.phone || '-'}
              </div>
            ));
          } catch { return <p>无游客信息</p>; }
        })()}
      </Card>

      {/* 评价弹窗 */}
      <Modal
        title="发表评价"
        open={reviewVisible}
        onCancel={() => setReviewVisible(false)}
        onOk={submitReview}
        okText="提交评价"
      >
        <div style={{ marginBottom: 16 }}>
          <label>评分：</label>
          <div>
            {[1, 2, 3, 4, 5].map(s => (
              <span
                key={s}
                onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                style={{ fontSize: 28, cursor: 'pointer', color: s <= reviewForm.rating ? '#FAAD14' : '#E5E5E5' }}
              >
                ★
              </span>
            ))}
          </div>
        </div>
        <div>
          <label>评价内容：</label>
          <textarea
            rows={4}
            placeholder="分享您的旅行体验..."
            value={reviewForm.content}
            onChange={e => setReviewForm({ ...reviewForm, content: e.target.value })}
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid var(--color-border-primary)', marginTop: 8 }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default OrderDetailPage;
