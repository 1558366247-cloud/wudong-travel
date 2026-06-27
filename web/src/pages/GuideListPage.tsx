import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Tag, Select, Spin, Empty, Pagination } from 'antd';
import { CarOutlined, EyeOutlined, HeartOutlined } from '@ant-design/icons';
import { guideApi } from '../services/api';

const GuideListPage: React.FC = () => {
  const navigate = useNavigate();
  const [guides, setGuides] = useState<any[]>([]);
  const [departures, setDepartures] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [departure, setDeparture] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    guideApi.departures().then((res: any) => setDepartures(res || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    guideApi.list({ departure: departure || undefined, page, pageSize: 8 })
      .then((res: any) => {
        setGuides(res.list || []);
        setTotal(res.total || 0);
      }).finally(() => setLoading(false));
  }, [departure, page]);

  const transportIcons: Record<string, string> = {
    '高铁': '🚄', '自驾': '🚗', '大巴': '🚌', '飞机': '✈️',
    '高铁+大巴': '🚄🚌'
  };

  return (
    <div>
      <div className="page-hero">
        <div className="container">
          <h1>🚗 交通攻略</h1>
          <p>从各地出发前往乌东苗寨的交通指南</p>
        </div>
      </div>

      <div className="container" style={{ marginTop: 32, marginBottom: 48 }}>
        <Card style={{ borderRadius: 12, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>出发地筛选：</span>
            <Select
              placeholder="全部出发地"
              value={departure || undefined}
              onChange={v => { setDeparture(v || ''); setPage(1); }}
              allowClear
              style={{ width: 200 }}
              options={departures.map(d => ({ label: d, value: d }))}
            />
          </div>
        </Card>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><Spin size="large" /></div>
        ) : guides.length === 0 ? (
          <Empty description="暂无交通攻略" />
        ) : (
          <>
            <Row gutter={[20, 20]}>
              {guides.map(guide => (
                <Col xs={24} sm={12} lg={8} key={guide.guideId}>
                  <Card
                    hoverable
                    className="card"
                    onClick={() => navigate(`/guide/${guide.guideId}`)}
                  >
                    <Card.Meta
                      title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span>{transportIcons[guide.transportType] || '🚗'}</span>
                          <span>{guide.title}</span>
                        </div>
                      }
                      description={
                        <div>
                          <div style={{ marginBottom: 8 }}>
                            <Tag className="tag-primary">{guide.transportType}</Tag>
                            <Tag>{guide.departure} → {guide.destination}</Tag>
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                            <span>⏱ {guide.duration}</span>
                            {guide.estimatedCost > 0 && (
                              <span style={{ marginLeft: 12 }}>💰 约¥{guide.estimatedCost}</span>
                            )}
                          </div>
                          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                            <EyeOutlined /> {guide.viewCount} 浏览 | <HeartOutlined /> {guide.favCount} 收藏
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
            {total > 8 && (
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <Pagination current={page} total={total} pageSize={8} onChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GuideListPage;
