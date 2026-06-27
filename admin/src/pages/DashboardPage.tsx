import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Spin } from 'antd';
import { DollarOutlined, ShoppingOutlined, EnvironmentOutlined, CompassOutlined, WarningOutlined } from '@ant-design/icons';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, TitleComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { statsApi } from '../services/admin-api';

echarts.use([BarChart, LineChart, PieChart, GridComponent, TooltipComponent, TitleComponent, LegendComponent, CanvasRenderer]);

const DashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    statsApi.dashboard().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 100 }}><Spin size="large" /></div>;
  if (!data) return <div>数据加载失败</div>;

  const topScenicOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: data.topScenics?.map((s: any) => s.name) || [] },
    yAxis: { type: 'value' },
    series: [{ name: '销量', type: 'bar', data: data.topScenics?.map((s: any) => parseInt(s.count)) || [], itemStyle: { color: '#1F5FA8' } }]
  };

  const topRouteOption = {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: data.topRoutes?.map((r: any) => r.name) || [] },
    yAxis: { type: 'value' },
    series: [{ name: '销量', type: 'bar', data: data.topRoutes?.map((r: any) => parseInt(r.count)) || [], itemStyle: { color: '#E85D2F' } }]
  };

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>📊 行·线路订票 数据看板</h1>
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}><Card><Statistic title="今日订单" value={data.todayOrders} prefix={<ShoppingOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="今日营收(元)" value={data.todayRevenue} precision={2} prefix={<DollarOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="景区数量" value={data.scenicCount} prefix={<EnvironmentOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="路线数量" value={data.routeCount} prefix={<CompassOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="待处理退款" value={data.pendingRefunds} prefix={<WarningOutlined />} valueStyle={{ color: data.pendingRefunds > 0 ? '#FF4D4F' : undefined }} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="本月GMV(元)" value={data.monthlyGmv} precision={2} prefix={<DollarOutlined />} /></Card></Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={12}>
          <Card title="🏔️ 热门景区 TOP5">
            {data.topScenics?.length > 0 ? (
              <ReactEChartsCore echarts={echarts} option={topScenicOption} style={{ height: 300 }} />
            ) : <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: 60 }}>暂无数据</p>}
          </Card>
        </Col>
        <Col span={12}>
          <Card title="🗺️ 热门路线 TOP5">
            {data.topRoutes?.length > 0 ? (
              <ReactEChartsCore echarts={echarts} option={topRouteOption} style={{ height: 300 }} />
            ) : <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: 60 }}>暂无数据</p>}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
