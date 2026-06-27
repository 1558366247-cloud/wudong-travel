import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Input, DatePicker, InputNumber, Button, message, Row, Col } from 'antd';
import { routeApi, orderApi } from '../services/api';
import dayjs from 'dayjs';

const RoutePurchasePage: React.FC = () => {
  const { routeId } = useParams<{ routeId: string }>();
  const navigate = useNavigate();
  const [route, setRoute] = useState<any>(null);
  const [form] = Form.useForm();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (routeId) routeApi.detail(Number(routeId)).then(setRoute);
  }, [routeId]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const useDate = values.useDate.format('YYYY-MM-DD');

      // R9-03: 路线套餐须提前1天购买
      const tomorrow = dayjs().add(1, 'day').startOf('day');
      if (dayjs(useDate).isBefore(tomorrow)) {
        message.error('路线套餐须提前1天购买');
        return;
      }

      const visitors = Array.from({ length: quantity }, (_, i) => ({
        name: values[`name_${i}`],
        idCard: values[`idCard_${i}`],
        phone: values[`phone_${i}`]
      }));

      const res: any = await orderApi.createRoute({
        routeId: Number(routeId),
        quantity,
        useDate,
        visitors: JSON.stringify(visitors),
        contactPhone: values.contactPhone
      });

      message.success('订单创建成功！');
      await orderApi.payCallback({ orderNo: res.orderNo, transactionId: 'SIMULATED_' + Date.now() });
      navigate(`/order/${res.orderNo}`);
    } catch (err: any) {
      message.error(err.message || '下单失败');
    }
  };

  if (!route) return <div style={{ textAlign: 'center', padding: 100 }}>加载中...</div>;

  return (
    <div className="container" style={{ marginTop: 32, marginBottom: 48, maxWidth: 800 }}>
      <Card style={{ borderRadius: 12 }}>
        <h2 style={{ marginBottom: 24 }}>预订路线套餐</h2>

        <Row gutter={16} style={{ marginBottom: 24, padding: 16, background: 'var(--color-bg-secondary)', borderRadius: 8 }}>
          <Col span={16}>
            <strong>{route.title}</strong><br />
            <span style={{ color: 'var(--color-text-tertiary)' }}>{route.duration} | {route.departure}→{route.destination}</span>
          </Col>
          <Col span={8} style={{ textAlign: 'right' }}>
            <span className="price">¥{route.price}</span><span style={{ fontSize: 12 }}>/人</span>
          </Col>
        </Row>

        <Form form={form} layout="vertical">
          <Form.Item name="useDate" label="出发日期" rules={[{ required: true, message: '请选择出发日期' }]}>
            <DatePicker
              style={{ width: '100%' }}
              disabledDate={(d) => d && d < dayjs().add(1, 'day').startOf('day')}
              placeholder="R9-03: 须提前1天购买"
            />
          </Form.Item>

          <Form.Item label="出行人数">
            <InputNumber min={1} max={route.stock} value={quantity} onChange={v => setQuantity(v || 1)} style={{ width: '100%' }} />
            <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>剩余名额：{route.stock}人</span>
          </Form.Item>

          <h4 style={{ marginBottom: 16 }}>游客信息（R9-04: 须填写所有游客姓名与身份证号）</h4>
          {Array.from({ length: quantity }, (_, i) => (
            <Card size="small" key={i} style={{ marginBottom: 12, background: 'var(--color-bg-tertiary)' }}>
              <p style={{ fontWeight: 500 }}>游客 {i + 1}</p>
              <Row gutter={12}>
                <Col span={8}>
                  <Form.Item name={`name_${i}`} label="姓名" rules={[{ required: true }]}>
                    <Input placeholder="游客姓名" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name={`idCard_${i}`} label="身份证号" rules={[{ required: true }]}>
                    <Input placeholder="身份证号" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name={`phone_${i}`} label="手机号">
                    <Input placeholder="手机号" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          ))}

          <Form.Item name="contactPhone" label="联系人手机" rules={[{ required: true }]}>
            <Input placeholder="接收通知的手机号" />
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: 24, padding: 16, background: 'var(--color-bg-secondary)', borderRadius: 8 }}>
            <div style={{ fontSize: 18 }}>
              合计：<span className="price" style={{ fontSize: 24 }}>¥{(route.price * quantity).toFixed(2)}</span>
            </div>
            <Button type="primary" size="large" onClick={handleSubmit} style={{ marginTop: 16, width: 200 }}>
              确认并支付
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RoutePurchasePage;
