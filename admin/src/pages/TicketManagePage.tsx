import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Space, message, Popconfirm, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ticketAdminApi, scenicAdminApi } from '../services/admin-api';

const TicketManagePage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [scenics, setScenics] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [form] = Form.useForm();

  useEffect(() => { scenicAdminApi.list({ pageSize: 999 }).then((r: any) => setScenics(r.list || [])); }, []);

  const loadData = () => {
    setLoading(true);
    ticketAdminApi.list({ page, pageSize: 20 }).then((res: any) => {
      setData(res.list || []);
      setTotal(res.total || 0);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [page]);

  const handleCreate = () => { setEditing(null); form.resetFields(); setModalVisible(true); };
  const handleEdit = (r: any) => { setEditing(r); form.setFieldsValue(r); setModalVisible(true); };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (editing) {
      await ticketAdminApi.update({ ...values, ticketTypeId: editing.ticketTypeId });
      message.success('更新成功');
    } else {
      await ticketAdminApi.create(values);
      message.success('创建成功');
    }
    setModalVisible(false);
    loadData();
  };

  const toggleStatus = async (id: number, status: number) => {
    await ticketAdminApi.toggleStatus(id, status);
    loadData();
  };

  const handleDelete = async (id: number) => { await ticketAdminApi.delete(id); message.success('已删除'); loadData(); };

  const columns = [
    { title: 'ID', dataIndex: 'ticketTypeId', width: 60 },
    { title: '票种名', dataIndex: 'name', width: 120 },
    { title: '景区ID', dataIndex: 'scenicId', width: 80 },
    { title: '价格(元)', dataIndex: 'price', width: 80, render: (v: number) => <span style={{ color: '#E85D2F', fontWeight: 700 }}>¥{v}</span> },
    { title: '市场价', dataIndex: 'marketPrice', width: 80 },
    { title: '库存', dataIndex: 'stock', width: 80 },
    { title: '有效期(天)', dataIndex: 'validityDays', width: 100 },
    { title: '状态', dataIndex: 'status', width: 80, render: (v: number, r: any) => <Switch checked={v === 1} onChange={(c) => toggleStatus(r.ticketTypeId, c ? 1 : 0)} /> },
    {
      title: '操作', width: 180,
      render: (_: any, r: any) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)}>编辑</Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(r.ticketTypeId)}>
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>🎫 票种管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>新增票种</Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="ticketTypeId" loading={loading}
        pagination={{ current: page, total, pageSize: 20, onChange: setPage }} size="middle" />
      <Modal title={editing ? '编辑票种' : '新增票种'} open={modalVisible} onCancel={() => setModalVisible(false)} onOk={handleSubmit} width={500}>
        <Form form={form} layout="vertical">
          <Form.Item name="scenicId" label="所属景区" rules={[{ required: true }]}>
            <Select options={scenics.map(s => ({ label: s.name, value: s.scenicId }))} />
          </Form.Item>
          <Form.Item name="name" label="票种名称" rules={[{ required: true }]}><Input placeholder="成人票/儿童票/学生票/家庭套票" /></Form.Item>
          <Form.Item name="price" label="价格(元)" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="marketPrice" label="市场价(元)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="stock" label="库存"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="dailyStock" label="日库存上限"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="validityDays" label="有效期(天)"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="usageNote" label="使用须知"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="image" label="图片URL"><Input /></Form.Item>
          <Form.Item name="sortOrder" label="排序"><InputNumber min={0} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TicketManagePage;
