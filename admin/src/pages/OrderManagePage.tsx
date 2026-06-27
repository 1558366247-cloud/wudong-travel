import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Select, Space, Modal, Descriptions, message, Tabs } from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';
import { orderAdminApi } from '../services/admin-api';
import dayjs from 'dayjs';

const OrderManagePage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [orderType, setOrderType] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);

  const loadData = () => {
    setLoading(true);
    orderAdminApi.list({ page, pageSize: 10, orderType: orderType || undefined, orderStatus: orderStatus || undefined })
      .then((res: any) => { setData(res.list || []); setTotal(res.total || 0); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [page, orderType, orderStatus]);

  const showDetail = (order: any) => {
    setCurrentOrder(order);
    setDetailVisible(true);
  };

  const handleRefundAudit = async (orderNo: string, approved: boolean) => {
    Modal.confirm({
      title: approved ? '确认退款？' : '驳回退款？',
      onOk: async () => {
        await orderAdminApi.refundAudit(orderNo, approved);
        message.success(approved ? '已退款' : '已驳回');
        loadData();
        setDetailVisible(false);
      }
    });
  };

  const statusMap: Record<string, { label: string; color: string }> = {
    pending_pay: { label: '待支付', color: 'warning' },
    paid: { label: '已支付', color: 'processing' },
    refunding: { label: '退款中', color: 'warning' },
    refunded: { label: '已退款', color: 'default' },
    completed: { label: '已完成', color: 'success' },
    cancelled: { label: '已取消', color: 'default' }
  };

  const columns = [
    { title: '订单号', dataIndex: 'orderNo', width: 180 },
    { title: '类型', dataIndex: 'orderType', width: 70, render: (v: string) => v === 'ticket' ? <Tag color="processing">门票</Tag> : <Tag color="warning">路线</Tag> },
    { title: '商品', dataIndex: 'targetName', width: 180, ellipsis: true },
    { title: '金额', dataIndex: 'totalAmount', width: 80, render: (v: number) => <span style={{ color: '#E85D2F', fontWeight: 700 }}>¥{v}</span> },
    { title: '数量', dataIndex: 'quantity', width: 60 },
    { title: '使用日期', dataIndex: 'useDate', width: 100 },
    { title: '状态', dataIndex: 'orderStatus', width: 80, render: (v: string) => <Tag color={statusMap[v]?.color}>{statusMap[v]?.label}</Tag> },
    { title: '下单时间', dataIndex: 'createdAt', width: 160, render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm') },
    {
      title: '操作', width: 200,
      render: (_: any, r: any) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => showDetail(r)}>详情</Button>
          {r.orderStatus === 'refunding' && (
            <>
              <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => handleRefundAudit(r.orderNo, true)}>退款</Button>
              <Button size="small" danger icon={<CloseOutlined />} onClick={() => handleRefundAudit(r.orderNo, false)}>驳回</Button>
            </>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>📋 订单管理</h2>
      <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
        <Select placeholder="订单类型" value={orderType || undefined} onChange={v => { setOrderType(v || ''); setPage(1); }} allowClear style={{ width: 120 }}
          options={[{ label: '门票', value: 'ticket' }, { label: '路线', value: 'route' }]} />
        <Select placeholder="订单状态" value={orderStatus || undefined} onChange={v => { setOrderStatus(v || ''); setPage(1); }} allowClear style={{ width: 120 }}
          options={Object.entries(statusMap).map(([k, v]) => ({ label: v.label, value: k }))} />
      </div>
      <Table columns={columns} dataSource={data} rowKey="orderNo" loading={loading}
        pagination={{ current: page, total, pageSize: 10, onChange: setPage }} size="middle" />

      <Modal title="订单详情" open={detailVisible} onCancel={() => setDetailVisible(false)} footer={null} width={700}>
        {currentOrder && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="订单号">{currentOrder.orderNo}</Descriptions.Item>
            <Descriptions.Item label="状态"><Tag color={statusMap[currentOrder.orderStatus]?.color}>{statusMap[currentOrder.orderStatus]?.label}</Tag></Descriptions.Item>
            <Descriptions.Item label="类型">{currentOrder.orderType === 'ticket' ? '门票' : '路线'}</Descriptions.Item>
            <Descriptions.Item label="商品">{currentOrder.targetName}</Descriptions.Item>
            <Descriptions.Item label="单价">¥{currentOrder.unitPrice}</Descriptions.Item>
            <Descriptions.Item label="数量">{currentOrder.quantity}</Descriptions.Item>
            <Descriptions.Item label="总金额"><span style={{ color: '#E85D2F', fontWeight: 700 }}>¥{currentOrder.totalAmount}</span></Descriptions.Item>
            <Descriptions.Item label="使用日期">{currentOrder.useDate}</Descriptions.Item>
            <Descriptions.Item label="联系人手机">{currentOrder.contactPhone}</Descriptions.Item>
            <Descriptions.Item label="下单时间">{dayjs(currentOrder.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
            {currentOrder.paidAt && <Descriptions.Item label="支付时间">{dayjs(currentOrder.paidAt).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>}
            {currentOrder.refundReason && <Descriptions.Item label="退款原因" span={2}>{currentOrder.refundReason}</Descriptions.Item>}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default OrderManagePage;
