import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Input, Rate, Tag, Space, message, Popconfirm, Select } from 'antd';
import { EyeOutlined, MessageOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { reviewAdminApi } from '../services/admin-api';
import dayjs from 'dayjs';

const ReviewManagePage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [replyVisible, setReplyVisible] = useState(false);
  const [currentReview, setCurrentReview] = useState<any>(null);
  const [replyContent, setReplyContent] = useState('');

  const loadData = () => {
    setLoading(true);
    reviewAdminApi.list({ page, pageSize: 20 }).then((res: any) => {
      setData(res.list || []); setTotal(res.total || 0);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [page]);

  const handleReply = (review: any) => {
    setCurrentReview(review);
    setReplyContent(review.reply || '');
    setReplyVisible(true);
  };

  const submitReply = async () => {
    await reviewAdminApi.reply(currentReview.reviewId, replyContent);
    message.success('回复成功');
    setReplyVisible(false);
    loadData();
  };

  const toggleStatus = async (reviewId: number, status: number) => {
    await reviewAdminApi.toggleStatus(reviewId, status);
    message.success(status ? '已显示' : '已隐藏');
    loadData();
  };

  const columns = [
    { title: 'ID', dataIndex: 'reviewId', width: 60 },
    { title: '用户', dataIndex: 'userName', width: 100 },
    { title: '评分', dataIndex: 'rating', width: 140, render: (v: number) => <Rate disabled defaultValue={v} style={{ fontSize: 14 }} /> },
    { title: '内容', dataIndex: 'content', width: 250, ellipsis: true },
    { title: '景区/路线ID', key: 'target', width: 100, render: (_: any, r: any) => (
      <span>{r.scenicId ? `景区#${r.scenicId}` : ''}{r.routeId ? `路线#${r.routeId}` : ''}</span>
    )},
    { title: '回复', dataIndex: 'reply', width: 150, ellipsis: true, render: (v: string) => v ? <Tag color="processing">{v}</Tag> : <span style={{ color: '#BFBFBF' }}>未回复</span> },
    { title: '状态', dataIndex: 'status', width: 80, render: (v: number) => <Tag color={v ? 'green' : 'default'}>{v ? '显示' : '隐藏'}</Tag> },
    { title: '时间', dataIndex: 'createdAt', width: 140, render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm') },
    {
      title: '操作', width: 200,
      render: (_: any, r: any) => (
        <Space>
          <Button size="small" icon={<MessageOutlined />} onClick={() => handleReply(r)}>回复</Button>
          <Button size="small" icon={r.status ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            onClick={() => toggleStatus(r.reviewId, r.status ? 0 : 1)}>
            {r.status ? '隐藏' : '显示'}
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>⭐ 评价管理</h2>
      <Table columns={columns} dataSource={data} rowKey="reviewId" loading={loading}
        pagination={{ current: page, total, pageSize: 20, onChange: setPage }} size="middle" />

      <Modal title="回复评价" open={replyVisible} onCancel={() => setReplyVisible(false)} onOk={submitReply} okText="提交回复">
        {currentReview && (
          <div>
            <p><strong>用户：</strong>{currentReview.userName}</p>
            <p><strong>评分：</strong><Rate disabled defaultValue={currentReview.rating} style={{ fontSize: 14 }} /></p>
            <p><strong>内容：</strong>{currentReview.content}</p>
            <div style={{ marginTop: 16 }}>
              <label><strong>商家回复：</strong></label>
              <Input.TextArea rows={4} value={replyContent} onChange={e => setReplyContent(e.target.value)} placeholder="输入回复内容..." />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReviewManagePage;
