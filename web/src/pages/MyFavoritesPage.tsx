import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Tabs, List, Tag, Button, Spin, Empty, message, Pagination } from 'antd';
import { HeartFilled, DeleteOutlined } from '@ant-design/icons';
import { favoriteApi } from '../services/api';

const MyFavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<string>('');
  const [page, setPage] = useState(1);

  const typeMap: Record<string, string> = {
    scenic: '景区', route: '路线', guide: '攻略'
  };

  useEffect(() => {
    setLoading(true);
    favoriteApi.list({ targetType: type || undefined, page, pageSize: 10 })
      .then((res: any) => {
        setItems(res.list || []);
        setTotal(res.total || 0);
      }).finally(() => setLoading(false));
  }, [type, page]);

  const handleRemove = async (targetType: string, targetId: number) => {
    await favoriteApi.toggle(targetType, targetId);
    message.success('已取消收藏');
    setItems(items.filter(i => !(i.targetType === targetType && i.targetId === targetId)));
  };

  const handleClick = (item: any) => {
    const pathMap: Record<string, string> = {
      scenic: `/scenic/${item.targetId}`,
      route: `/route/${item.targetId}`,
      guide: `/guide/${item.targetId}`
    };
    navigate(pathMap[item.targetType] || '/');
  };

  return (
    <div>
      <div className="page-hero">
        <div className="container">
          <h1>❤️ 我的收藏</h1>
          <p>收藏的景区、路线和交通攻略</p>
        </div>
      </div>

      <div className="container" style={{ marginTop: 32, marginBottom: 48 }}>
        <Card style={{ borderRadius: 12 }}>
          <Tabs
            activeKey={type}
            onChange={t => { setType(t); setPage(1); }}
            items={[
              { key: '', label: '全部' },
              { key: 'scenic', label: '景区' },
              { key: 'route', label: '路线' },
              { key: 'guide', label: '攻略' },
            ]}
          />

          {loading ? (
            <div style={{ textAlign: 'center', padding: 60 }}><Spin /></div>
          ) : items.length === 0 ? (
            <Empty description="暂无收藏" />
          ) : (
            <List
              dataSource={items}
              renderItem={(item: any) => (
                <List.Item
                  style={{ cursor: 'pointer', padding: '12px 0' }}
                  onClick={() => handleClick(item)}
                  extra={
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={(e) => { e.stopPropagation(); handleRemove(item.targetType, item.targetId); }}
                    >
                      取消收藏
                    </Button>
                  }
                >
                  <List.Item.Meta
                    avatar={<HeartFilled style={{ color: '#ff4d4f', fontSize: 24 }} />}
                    title={
                      <div>
                        <Tag className="tag-primary">{typeMap[item.targetType] || item.targetType}</Tag>
                        ID: {item.targetId}
                      </div>
                    }
                    description={`收藏时间: ${new Date(item.createdAt).toLocaleDateString('zh-CN')}`}
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

export default MyFavoritesPage;
