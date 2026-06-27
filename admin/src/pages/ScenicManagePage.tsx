import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, Tag, message, Popconfirm, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { scenicAdminApi } from '../services/admin-api';

const ScenicManagePage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [form] = Form.useForm();

  const loadData = () => {
    setLoading(true);
    scenicAdminApi.list({ page, pageSize: 20 }).then((res: any) => {
      setData(res.list || []);
      setTotal(res.total || 0);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [page]);

  const handleCreate = () => { setEditing(null); form.resetFields(); setModalVisible(true); };
  const handleEdit = (record: any) => { setEditing(record); form.setFieldsValue(record); setModalVisible(true); };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (editing) {
      await scenicAdminApi.update({ ...values, scenicId: editing.scenicId });
      message.success('更新成功');
    } else {
      await scenicAdminApi.create(values);
      message.success('创建成功');
    }
    setModalVisible(false);
    loadData();
  };

  const toggleStatus = async (scenicId: number, status: number) => {
    await scenicAdminApi.toggleStatus(scenicId, status);
    message.success(status ? '已上架' : '已下架');
    loadData();
  };

  const handleDelete = async (scenicId: number) => {
    await scenicAdminApi.delete(scenicId);
    message.success('已删除');
    loadData();
  };

  const columns = [
    { title: 'ID', dataIndex: 'scenicId', width: 60 },
    { title: '景区名称', dataIndex: 'name', width: 150 },
    { title: '地址', dataIndex: 'address', ellipsis: true },
    { title: '开放时间', dataIndex: 'openTime', width: 120 },
    {
      title: '状态', dataIndex: 'status', width: 80,
      render: (v: number, record: any) => (
        <Switch checked={v === 1} onChange={(c) => toggleStatus(record.scenicId, c ? 1 : 0)} />
      )
    },
    {
      title: '操作', width: 200,
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.scenicId)}>
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>🏔️ 景区管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>新增景区</Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="scenicId" loading={loading}
        pagination={{ current: page, total, pageSize: 20, onChange: setPage }} size="middle" />
      <Modal title={editing ? '编辑景区' : '新增景区'} open={modalVisible} onCancel={() => setModalVisible(false)} onOk={handleSubmit} width={600}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="景区名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="address" label="地址" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="openTime" label="开放时间"><Input placeholder="如：08:00-18:00" /></Form.Item>
          <Form.Item name="description" label="景区介绍"><Input.TextArea rows={4} /></Form.Item>
          <Form.Item name="mainImage" label="主图URL"><Input placeholder="图片URL" /></Form.Item>
          <Form.Item name="longitude" label="经度"><Input /></Form.Item>
          <Form.Item name="latitude" label="纬度"><Input /></Form.Item>
          <Form.Item name="sortOrder" label="排序"><InputNumber min={0} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ScenicManagePage;
