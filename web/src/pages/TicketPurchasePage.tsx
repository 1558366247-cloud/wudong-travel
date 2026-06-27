import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Form, Input, DatePicker, InputNumber, Button, message, Steps, Row, Col, Result } from 'antd';
import { ticketTypeApi, orderApi } from '../services/api';
import dayjs from 'dayjs';

const TicketPurchasePage: React.FC = () => {
  const { ticketTypeId } = useParams<{ ticketTypeId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();

  const quantity = parseInt(searchParams.get('quantity') || '1');
  const useDate = searchParams.get('date') || dayjs().add(1, 'day').format('YYYY-MM-DD');
  const [visitorCount, setVisitorCount] = useState(quantity);

  useEffect(() => {
    if (ticketTypeId) {
      ticketTypeApi.detail(Number(ticketTypeId)).then(setTicket);
    }
  }, [ticketTypeId]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const visitors = Array.from({ length: visitorCount }, (_, i) => ({
        name: values[`name_${i}`],
        idCard: values[`idCard_${i}`],
        phone: values[`phone_${i}`]
      }));

      const res: any = await orderApi.createTicket({
        ticketTypeId: Number(ticketTypeId),
        quantity: visitorCount,
        useDate,
        visitors: JSON.stringify(visitors),
        contactPhone: values.contactPhone
      });

      message.success('订单创建成功！');
      // 模拟支付
      await orderApi.payCallback({ orderNo: res.orderNo, transactionId: 'SIMULATED_' + Date.now() });
      navigate(`/order/${res.orderNo}`);
    } catch (err: any) {
      message.error(err.message || '下单失败');
    }
  };

  if (!ticket) return <div style={{ textAlign: 'center', padding: 100 }}>加载中...</div>;

  return (
    <div className="container" style={{ marginTop: 32, marginBottom: 48, maxWidth: 800 }}>
      <Steps current={currentStep} style={{ marginBottom: 32 }}>
        <Steps.Step title="填写信息" />
        <Steps.Step title="确认订单" />
        <Steps.Step title="支付" />
      </Steps>

      <Card style={{ borderRadius: 12 }}>
        <h2 style={{ marginBottom: 24 }}>购买门票</h2>
        <Row gutter={16} style={{ marginBottom: 24, padding: 16, background: 'var(--color-bg-secondary)', borderRadius: 8 }}>
          <Col span={12}>
            <strong>票种：</strong>{ticket.name}<br />
            <strong>景区：</strong>{ticket.scenicSpot?.name}
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <strong>单价：</strong><span className="price">¥{ticket.price}</span><br />
            <strong>使用日期：</strong>{useDate}
          </Col>
        </Row>

        <Form form={form} layout="vertical">
          <Form.Item label="购买数量">
            <InputNumber min={1} max={10} value={visitorCount} onChange={v => setVisitorCount(v || 1)} style={{ width: '100%' }} />
          </Form.Item>

          <h4 style={{ marginBottom: 16 }}>游客信息（R9-04: 须填写所有游客信息）</h4>
          {Array.from({ length: visitorCount }, (_, i) => (
            <Card size="small" key={i} style={{ marginBottom: 12, background: 'var(--color-bg-tertiary)' }}>
              <p style={{ fontWeight: 500, marginBottom: 8 }}>游客 {i + 1}</p>
              <Row gutter={12}>
                <Col span={8}>
                  <Form.Item name={`name_${i}`} label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
                    <Input placeholder="游客姓名" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name={`idCard_${i}`} label="身份证号" rules={[{ required: true, message: '请输入身份证号' }]}>
                    <Input placeholder="身份证号" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name={`phone_${i}`} label="手机号">
                    <Input placeholder="手机号（选填）" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          ))}

          <Form.Item name="contactPhone" label="联系人手机" rules={[{ required: true, message: '请输入联系人手机' }]}>
            <Input placeholder="接收订单通知的手机号" />
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: 24, padding: 16, background: 'var(--color-bg-secondary)', borderRadius: 8 }}>
            <div style={{ fontSize: 18 }}>
              合计：<span className="price" style={{ fontSize: 24 }}>¥{(ticket.price * visitorCount).toFixed(2)}</span>
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

export default TicketPurchasePage;
