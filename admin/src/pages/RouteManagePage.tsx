import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Space, message, Popconfirm, Switch, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, OrderedListOutlined } from '@ant-design/icons';
import { routeAdminApi } from '../services/admin-api';

const RouteManagePage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [itineraryVisible, setItineraryVisible] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [form] = Form.useForm();

  const loadData = () => {
    setLoading(true);
    routeAdminApi.list({ page, pageSize: 20 }).then((res: any) => {
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
      await routeAdminApi.update({ ...values, routeId: editing.routeId });
      message.success('更新成功');
    } else {
      await routeAdminApi.create(values);
      message.success('创建成功');
    }
    setModalVisible(false);
    loadData();
  };

  const handleItineraries = async (route: any) => {
    setEditing(route);
    const res: any = await routeAdminApi.getItineraries(route.routeId);
    setItineraries(res || []);
    setItineraryVisible(true);
  };

  const saveItineraries = async (newList: any[]) => {
    await routeAdminApi.saveItineraries(editing.routeId, newList);
    message.success('行程保存成功');
    setItineraryVisible(false);
  };

  const toggleStatus = async (id: number, status: number) => {
    await routeAdminApi.toggleStatus(id, status);
    loadData();
  };

  const handleDelete = async (id: number) => { await routeAdminApi.delete(id); message.success('已删除'); loadData(); };

  const columns = [
    { title: 'ID', dataIndex: 'routeId', width: 60 },
    { title: '路线标题', dataIndex: 'title', width: 200 },
    { title: '天数', dataIndex: 'duration', width: 80 },
    { title: '价格(元)', dataIndex: 'price', width: 80, render: (v: number) => <span style={{ color: '#E85D2F', fontWeight: 700 }}>¥{v}</span> },
    { title: '出发地', dataIndex: 'departure', width: 80 },
    { title: '目的地', dataIndex: 'destination', width: 100 },
    { title: '库存', dataIndex: 'stock', width: 80 },
    { title: '已售', dataIndex: 'soldCount', width: 80 },
    { title: '评分', dataIndex: 'rating', width: 60 },
    { title: '状态', dataIndex: 'status', width: 80, render: (v: number, r: any) => <Switch checked={v === 1} onChange={(c) => toggleStatus(r.routeId, c ? 1 : 0)} /> },
    {
      title: '操作', width: 250,
      render: (_: any, r: any) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)}>编辑</Button>
          <Button size="small" icon={<OrderedListOutlined />} onClick={() => handleItineraries(r)}>行程</Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(r.routeId)}>
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>🗺️ 路线套餐管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>新增路线</Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="routeId" loading={loading}
        pagination={{ current: page, total, pageSize: 20, onChange: setPage }} size="middle" />

      <Modal title={editing && !itineraryVisible ? '编辑路线' : '新增路线'} open={modalVisible} onCancel={() => setModalVisible(false)} onOk={handleSubmit} width={700}>
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="路线标题" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="subtitle" label="副标题"><Input /></Form.Item>
          <Form.Item name="duration" label="行程天数" rules={[{ required: true }]}>
            <Select options={[{ label: '一日游', value: '一日游' }, { label: '两日游', value: '两日游' }, { label: '多日游', value: '多日游' }]} />
          </Form.Item>
          <Form.Item name="themes" label="主题标签"><Input placeholder="逗号分隔，如：亲子,研学" /></Form.Item>
          <Form.Item name="price" label="价格(元/人)" rules={[{ required: true }]}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="marketPrice" label="市场价"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="departure" label="出发地" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="destination" label="目的地" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="accommodationStandard" label="住宿标准"><Input /></Form.Item>
          <Form.Item name="mealStandard" label="餐饮标准"><Input /></Form.Item>
          <Form.Item name="notes" label="注意事项"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="mainImage" label="主图URL"><Input /></Form.Item>
          <Form.Item name="details" label="路线详情(富文本)"><Input.TextArea rows={4} /></Form.Item>
          <Form.Item name="stock" label="库存"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="sortOrder" label="排序"><InputNumber min={0} /></Form.Item>
        </Form>
      </Modal>

      {/* 行程管理弹窗 */}
      <Modal title={`行程安排 - ${editing?.title || ''}`} open={itineraryVisible} onCancel={() => setItineraryVisible(false)}
        onOk={() => saveItineraries(itineraries)} width={700} okText="保存行程">
        {itineraries.map((item, index) => (
          <div key={index} style={{ border: '1px solid #E5E5E5', borderRadius: 8, padding: 12, marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <span>第</span>
              <InputNumber min={1} value={item.day} onChange={v => { const list = [...itineraries]; list[index].day = v; setItineraries(list); }} style={{ width: 60 }} />
              <span>天</span>
              <Button size="small" danger onClick={() => setItineraries(itineraries.filter((_, i) => i !== index))}>删除</Button>
            </div>
            <Input.TextArea value={item.description} onChange={e => { const list = [...itineraries]; list[index].description = e.target.value; setItineraries(list); }} placeholder="行程描述" rows={2} style={{ marginBottom: 8 }} />
            <Input placeholder="景点" value={item.spots} onChange={e => { const list = [...itineraries]; list[index].spots = e.target.value; setItineraries(list); }} style={{ marginBottom: 4 }} />
            <Input placeholder="用餐" value={item.meals} onChange={e => { const list = [...itineraries]; list[index].meals = e.target.value; setItineraries(list); }} style={{ marginBottom: 4 }} />
            <Input placeholder="住宿" value={item.accommodation} onChange={e => { const list = [...itineraries]; list[index].accommodation = e.target.value; setItineraries(list); }} style={{ marginBottom: 4 }} />
            <Input placeholder="交通" value={item.transportation} onChange={e => { const list = [...itineraries]; list[index].transportation = e.target.value; setItineraries(list); }} />
          </div>
        ))}
        <Button onClick={() => setItineraries([...itineraries, { day: itineraries.length + 1, description: '', spots: '', meals: '', accommodation: '', transportation: '' }])} block>
          + 添加行程日
        </Button>
      </Modal>
    </div>
  );
};

export default RouteManagePage;
