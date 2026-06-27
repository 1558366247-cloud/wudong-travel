import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Space, Tag, message, Popconfirm, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { guideAdminApi } from '../services/admin-api';

const GuideManagePage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [form] = Form.useForm();

  const loadData = () => {
    setLoading(true);
    guideAdminApi.list({ page, pageSize: 20 }).then((res: any) => {
      setData(res.list || []); setTotal(res.total || 0);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [page]);

  const handleCreate = () => { setEditing(null); form.resetFields(); setModalVisible(true); };
  const handleEdit = (r: any) => { setEditing(r); form.setFieldsValue(r); setModalVisible(true); };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (editing) {
      await guideAdminApi.update({ ...values, guideId: editing.guideId });
      message.success('更新成功');
    } else {
      await guideAdminApi.create(values);
      message.success('创建成功');
    }
    setModalVisible(false); loadData();
  };

  const toggleStatus = async (id: number, status: number) => { await guideAdminApi.toggleStatus(id, status); loadData(); };
  const handleDelete = async (id: number) => { await guideAdminApi.delete(id); message.success('已删除'); loadData(); };

  const columns = [
    { title: 'ID', dataIndex: 'guideId', width: 60 },
    { title: '标题', dataIndex: 'title', width: 220, ellipsis: true },
    { title: '出发地', dataIndex: 'departure', width: 80 },
    { title: '目的地', dataIndex: 'destination', width: 100 },
    { title: '交通方式', dataIndex: 'transportType', width: 100, render: (v: string) => <Tag color="processing">{v}</Tag> },
    { title: '时长', dataIndex: 'duration', width: 80 },
    { title: '费用(元)', dataIndex: 'estimatedCost', width: 80 },
    { title: '浏览', dataIndex: 'viewCount', width: 60 },
    { title: '状态', dataIndex: 'status', width: 80, render: (v: number, r: any) => <Switch checked={v === 1} onChange={(c) => toggleStatus(r.guideId, c ? 1 : 0)} /> },
    { title: '操作', width: 180, render: (_: any, r: any) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)}>编辑</Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(r.guideId)}>
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>🚗 交通攻略管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>新增攻略</Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="guideId" loading={loading}
        pagination={{ current: page, total, pageSize: 20, onChange: setPage }} size="middle" />
      <Modal title={editing ? '编辑攻略' : '新增攻略'} open={modalVisible} onCancel={() => setModalVisible(false)} onOk={handleSubmit} width={600}>
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="departure" label="出发地" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="destination" label="目的地" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="transportType" label="交通方式" rules={[{ required: true }]}>
            <Select options={['高铁', '自驾', '大巴', '飞机', '高铁+大巴'].map(v => ({ label: v, value: v }))} />
          </Form.Item>
          <Form.Item name="duration" label="预估时长" rules={[{ required: true }]}><Input placeholder="如：约3小时" /></Form.Item>
          <Form.Item name="estimatedCost" label="预估费用(元)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="description" label="详细说明" rules={[{ required: true }]}><Input.TextArea rows={5} /></Form.Item>
          <Form.Item name="coverImage" label="封面图URL"><Input /></Form.Item>
          <Form.Item name="sortOrder" label="排序"><InputNumber min={0} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GuideManagePage;
