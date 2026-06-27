import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tag, Spin, Button, Descriptions } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { guideApi } from '../services/api';

const GuideDetailPage: React.FC = () => {
  const { guideId } = useParams<{ guideId: string }>();
  const navigate = useNavigate();
  const [guide, setGuide] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (guideId) guideApi.detail(Number(guideId)).then(setGuide).finally(() => setLoading(false));
  }, [guideId]);

  if (loading) return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;
  if (!guide) return <div style={{ textAlign: 'center', padding: 100 }}>攻略不存在</div>;

  return (
    <div>
      <div className="page-hero">
        <div className="container">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} ghost style={{ marginBottom: 16 }}>
            返回
          </Button>
          <h1>{guide.title}</h1>
          <p>{guide.departure} → {guide.destination} | {guide.transportType} | {guide.duration}</p>
        </div>
      </div>

      <div className="container" style={{ marginTop: 32, marginBottom: 48, maxWidth: 900 }}>
        <Card style={{ borderRadius: 12, marginBottom: 24 }}>
          <div style={{ height: 300, background: 'var(--color-bg-secondary)', borderRadius: 8, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>
            🚗
          </div>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="出发地">{guide.departure}</Descriptions.Item>
            <Descriptions.Item label="目的地">{guide.destination}</Descriptions.Item>
            <Descriptions.Item label="交通方式">
              <Tag className="tag-primary">{guide.transportType}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="预估时长">{guide.duration}</Descriptions.Item>
            {guide.estimatedCost > 0 && (
              <Descriptions.Item label="预估费用" span={2}>
                <span className="price">¥{guide.estimatedCost}</span>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        <Card title="📝 详细说明" style={{ borderRadius: 12 }}>
          <div style={{ fontSize: 15, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{guide.description}</div>
        </Card>
      </div>
    </div>
  );
};

export default GuideDetailPage;
