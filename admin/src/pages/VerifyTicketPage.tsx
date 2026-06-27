import React, { useState } from 'react';
import { Card, Input, Button, Result, message, Descriptions, Tag, Spin } from 'antd';
import { ScanOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { verifyApi } from '../services/admin-api';

const VerifyTicketPage: React.FC = () => {
  const [qrCode, setQrCode] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!qrCode.trim()) return message.warning('请输入或扫描票号');
    setLoading(true);
    try {
      const res: any = await verifyApi.verifyTicket(qrCode.trim());
      setResult({ success: true, ...res });
      message.success(`核销成功！游客：${res.visitorName}`);
    } catch (err: any) {
      setResult({ success: false, message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 24 }}>📱 电子票核销（R9-05）</h2>
      <Card style={{ borderRadius: 12, marginBottom: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>
            <ScanOutlined /> 输入电子票号或扫描二维码进行核销
          </p>
          <Input.Search
            size="large"
            placeholder="请输入电子票号（如 TKxxx...）"
            value={qrCode}
            onChange={e => setQrCode(e.target.value)}
            onSearch={handleVerify}
            enterButton={
              <Button type="primary" loading={loading} icon={<ScanOutlined />}>
                核销
              </Button>
            }
          />
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
          R9-02: 每张电子票对应唯一二维码，核销后不可重复使用<br />
          R9-05: 请在景区营业时间（08:00-18:00）内进行核销
        </div>
      </Card>

      {result && (
        <Card style={{ borderRadius: 12 }}>
          {result.success ? (
            <Result
              status="success"
              title="核销成功"
              subTitle={`游客：${result.visitorName}`}
              icon={<CheckCircleOutlined />}
            />
          ) : (
            <Result
              status="error"
              title="核销失败"
              subTitle={result.message}
            />
          )}
        </Card>
      )}
    </div>
  );
};

export default VerifyTicketPage;
