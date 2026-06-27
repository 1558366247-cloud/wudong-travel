import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Tabs, List, Tag, Button, Pagination, Spin, Empty, message, Modal } from 'antd';
import { orderApi } from '../services/api';
import dayjs from 'dayjs';

const statusMap: Record<string, { label: string; color: string }> = {
  pending_pay: { label: '待支付', color: 'warning' },
  paid: { label: '已支付', color: 'processing' },
  refunding: { label: '退款中', color: 'warning' },
  refunded: { label: '已退款', color: 'default' },
  completed: { label: '已完成', color: 'success' },
  cancelled: { label: '已取消', color: 'default' }
};

const OrderListPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);

  const tabs = [
    { key: 'all', label: '全部' },
    { key: 'pending_pay', label: '待支付' },
    { key: 'paid', label: '已支付' },
    { key: 'completed', label: '已完成' },
    { key: 'refunding', label: '退款中' },
  ];

  useEffect(() => {
    setLoading(true);
    const params: any = { page, pageSize: 10 };
    if (activeTab !== 'all') params.orderStatus = activeTab;

    orderApi.list(params).then((res: any) => {
      setOrders(res.list || []);
      setTotal(res.total || 0);
    }).finally(() => setLoading(false));
  }, [activeTab, page]);

  const handleCancel = async (orderNo: string) => {
    Modal.confirm({
      title: '确认取消订单？',
      content: '取消后订单将无法恢复',
      onOk: async () => {
        await orderApi.cancel(orderNo);
        message.success('订单已取消');
        setOrders(orders.map(o => o.orderNo === orderNo ? { ...o, orderStatus: 'cancelled' } : o));
      }
    });
  };

  const handleRefund = async (orderNo: string) => {
    Modal.confirm({
      title: '申请退款',
      content: (
        <div>
          <p>确认申请退款？</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
            R9-03: 路线出发前3天以上可免费退；出发前3天内不可退
          </p>
        </div>
      ),
      onOk: async () => {
        try {
          await orderApi.refund({ orderNo, reason: '用户主动申请退款' });
          message.success('退款申请已提交');
          setOrders(orders.map(o => o.orderNo === orderNo ? { ...o, orderStatus: 'refunding' } : o));
        } catch (err: any) {
          message.error(err.message);
        }
      }
    });
  };

  return (
    <div>
      <div className="page-hero">
        <div className="container">
          <h1>📋 我的订单</h1>
          <p>管理您的门票和路线订单</p>
        </div>
      </div>

      <div className="container" style={{ marginTop: 32, marginBottom: 48 }}>
        <Card style={{ borderRadius: 12 }}>
          <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabs.map(t => ({
            key: t.key,
            label: t.label
          }))} />

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60 }}><Spin /></div>
          ) : orders.length === 0 ? (
            <Empty description="暂无订单" />
          ) : (
            <List
              dataSource={orders}
              renderItem={(order: any) => (
                <List.Item
                  style={{ padding: '16px 0', cursor: 'pointer' }}
                  onClick={() => navigate(`/order/${order.orderNo}`)}
                  extra={
                    <div style={{ textAlign: 'right' }}>
                      <span className="price">¥{order.totalAmount}</span>
                      <br />
                      <Tag color={statusMap[order.orderStatus]?.color}>
                        {statusMap[order.orderStatus]?.label}
                      </Tag>
                    </div>
                  }
                >
                  <List.Item.Meta
                    avatar={
                      <div style={{ width: 80, height: 80, borderRadius: 8, background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                        {order.orderType === 'ticket' ? '🎫' : '🗺️'}
                      </div>
                    }
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Tag className={order.orderType === 'ticket' ? 'tag-primary' : 'tag-orange'}>
                          {order.orderType === 'ticket' ? '门票' : '路线'}
                        </Tag>
                        {order.targetName}
                      </div>
                    }
                    description={
                      <div>
                        <p>订单号：{order.orderNo}</p>
                        <p>使用日期：{order.useDate} | 数量：{order.quantity}</p>
                        <p>下单时间：{dayjs(order.createdAt).format('YYYY-MM-DD HH:mm')}</p>
                        <div style={{ marginTop: 4 }}>
                          {order.orderStatus === 'pending_pay' && (
                            <Button size="small" danger onClick={(e) => { e.stopPropagation(); handleCancel(order.orderNo); }}>
                              取消订单
                            </Button>
                          )}
                          {order.orderStatus === 'paid' && (
                            <Button size="small" onClick={(e) => { e.stopPropagation(); handleRefund(order.orderNo); }}>
                              申请退款
                            </Button>
                          )}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}

          {total > 10 && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Pagination current={page} total={total} pageSize={10} onChange={setPage} />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default OrderListPage;
