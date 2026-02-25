import React, { useEffect, useCallback } from 'react';
import { Row, Col, Card, Statistic, Table, Button, Tag, Space, Typography } from 'antd';
import { 
    ShoppingOutlined, 
    DatabaseOutlined, 
    AlertOutlined, 
    ContainerOutlined, 
    TeamOutlined,
    PlusOutlined,
    UserAddOutlined,
    FileAddOutlined,
    EditOutlined
} from '@ant-design/icons';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import { connect } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import { getDashboardStats } from '../../actions/dashboard';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';

const { Title } = Typography;

const Dashboard = ({ stats, actions }) => {
    const navigate = useNavigate();

    const fetchStats = useCallback(async () => {
        try {
            await actions.getDashboardStats();
        } catch (error) {
            console.error('Failed to fetch dashboard stats', error);
        }
    }, [actions]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const kpiCards = [
        { title: 'Total Products', value: stats.totalProducts, icon: <ShoppingOutlined />, color: '#1890ff' },
        { title: 'Available Qty', value: stats.totalAvailableQty, icon: <DatabaseOutlined />, color: '#52c41a' },
        { title: 'Low Stock Items', value: stats.lowStockItemsCount, icon: <AlertOutlined />, color: '#f5222d' },
        { title: 'Pending POs', value: stats.pendingPurchaseOrders, icon: <ContainerOutlined />, color: '#faad14' },
        { title: 'Total Suppliers', value: stats.totalSuppliers, icon: <TeamOutlined />, color: '#722ed1' },
    ];

    const lowStockColumns = [
        { title: 'SKU', dataIndex: 'sku', key: 'sku' },
        { title: 'Product', dataIndex: 'productName', key: 'productName' },
        { title: 'Qty', dataIndex: 'availableQty', key: 'availableQty' },
        { title: 'Level', dataIndex: 'reorderLevel', key: 'reorderLevel' },
        { 
            title: 'Shortage', 
            dataIndex: 'shortageQty', 
            key: 'shortageQty',
            render: (qty) => <span style={{ color: '#f5222d', fontWeight: 'bold' }}>{qty}</span>
        },
        {
            title: 'Action',
            key: 'action',
            render: () => (
                <Button type="primary" size="small" onClick={() => navigate('/purchase-orders')}>
                    Order
                </Button>
            )
        }
    ];

    const movementColumns = [
        { 
            title: 'Date', 
            dataIndex: 'timestamp', 
            key: 'timestamp',
            render: (ts) => moment(ts).format('MMM DD, HH:mm')
        },
        { title: 'Product', dataIndex: 'productName', key: 'productName' },
        { 
            title: 'Type', 
            dataIndex: 'type', 
            key: 'type',
            render: (type) => (
                <Tag color={type === 'IN' ? 'green' : (type === 'OUT' ? 'volcano' : 'blue')}>{type}</Tag>
            )
        },
        { title: 'Qty', dataIndex: 'quantity', key: 'quantity' },
        { title: 'User', dataIndex: 'updatedBy', key: 'updatedBy' }
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
            <Title level={2}>Inventory Dashboard</Title>
            
            {/* KPI Section */}
            <Row gutter={[16, 16]}>
                {kpiCards.map((card, index) => (
                    <Col xs={24} sm={12} lg={4} key={index}>
                        <Card hoverable styles={{ body: { padding: '20px' } }}>
                            <Statistic 
                                title={card.title} 
                                value={card.value} 
                                prefix={React.cloneElement(card.icon, { style: { color: card.color, marginRight: '8px' } })}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
                {/* Charts Section */}
                <Col xs={24} lg={16}>
                    <Card title="Stock Movement Trend (Last 7 Days)">
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats.movementTrend}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="inQty" name="Stock In" stroke="#52c41a" strokeWidth={2} activeDot={{ r: 8 }} />
                                    <Line type="monotone" dataKey="outQty" name="Stock Out" stroke="#f5222d" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="Top Products by Quantity">
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.topProducts} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={100} />
                                    <Tooltip />
                                    <Bar dataKey="quantity" fill="#1890ff">
                                        {stats.topProducts.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
                {/* Tables Section */}
                <Col xs={24} lg={12}>
                    <Card 
                        title="Low Stock Alerts ⚠️" 
                        extra={<Button type="link" onClick={() => navigate('/products')}>View All</Button>}
                        styles={{ body: { minHeight: '340px' } }}
                    >
                        <Table 
                            columns={lowStockColumns} 
                            dataSource={stats.lowStockAlerts} 
                            pagination={false} 
                            size="small"
                            rowKey="sku"
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card 
                        title="Recent Stock Movements" 
                        extra={<Button type="link" onClick={() => navigate('/audit-log')}>View History</Button>}
                        styles={{ body: { minHeight: '340px' } }}
                    >
                        <Table 
                            columns={movementColumns} 
                            dataSource={stats.recentMovements} 
                            pagination={false} 
                            size="small"
                            rowKey="id"
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
                {/* PO Summary & Quick Actions */}
                <Col xs={24} lg={12}>
                    <Card title="Purchase Order Summary">
                        <Row gutter={16}>
                            <Col span={8}>
                                <Statistic title="Created" value={stats.poStatusSummary?.CREATED || 0} valueStyle={{ color: '#1890ff' }} />
                            </Col>
                            <Col span={8}>
                                <Statistic title="Received" value={stats.poStatusSummary?.RECEIVED || 0} valueStyle={{ color: '#52c41a' }} />
                            </Col>
                            <Col span={8}>
                                <Statistic title="Cancelled" value={stats.poStatusSummary?.CANCELLED || 0} valueStyle={{ color: '#f5222d' }} />
                            </Col>
                        </Row>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Quick Actions">
                        <Space wrap>
                            <Button icon={<PlusOutlined />} onClick={() => navigate('/products')}>Add Product</Button>
                            <Button icon={<UserAddOutlined />} onClick={() => navigate('/suppliers')}>Add Supplier</Button>
                            <Button icon={<FileAddOutlined />} onClick={() => navigate('/purchase-orders')}>Create PO</Button>
                            <Button icon={<EditOutlined />} onClick={() => navigate('/inventory')}>Adjust Stock</Button>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

const mapStateToProps = (state) => ({
    stats: state.dashboard.stats
});

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({ getDashboardStats }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
