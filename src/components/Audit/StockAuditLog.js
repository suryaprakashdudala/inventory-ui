import React, { useState, useEffect, useMemo } from 'react';
import { Table, Tag, Space, message, Select, Input, Button } from 'antd';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { exportToCSV } from '../../utils/exportUtils';
import { getAllStockHistory, getStockHistory } from '../../actions/inventory';
import { getAllProducts } from '../../actions/products';
import moment from 'moment';
import { bindActionCreators } from '@reduxjs/toolkit';
import { connect } from 'react-redux';
import _ from 'lodash'

const { Option } = Select;

const StockAuditLog = (props) => {
    const { actions, products } = props
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState('ALL');
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        // fetchProducts();
        fetchHistory('ALL');
    }, []);

    const fetchProducts = async () => {
        try {
            await actions.getAllProducts();
        } catch (error) {
            message.error('Failed to fetch products');
        }
    };

    const fetchHistory = async (productId) => {
        setLoading(true);
        try {
            const response = productId === 'ALL' 
                ? await actions.getAllStockHistory() 
                : await actions.getStockHistory(productId);
            setHistory(response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        } catch (error) {
            message.error('Failed to fetch history');
        } finally {
            setLoading(false);
        }
    };

    const handleProductChange = (value) => {
        setSelectedProduct(value);
        fetchHistory(value);
    };

    const filteredHistory = useMemo(() => {
        if (!searchText) return history;
        const lowerSearch = searchText.toLowerCase();
        return _.filter(history, h => {
            const productName = products.find(p => p.id === h.productId)?.name || h.productId;
            return _.includes(productName.toLowerCase(), lowerSearch) ||
                   _.includes(h.type?.toLowerCase(), lowerSearch) ||
                   _.includes(h.reason?.toLowerCase(), lowerSearch) ||
                   _.includes(h.updatedBy?.toLowerCase(), lowerSearch);
        });
    }, [history, searchText, products]);

    const handleExport = () => {
        const exportData = filteredHistory.map(h => ({
            Timestamp: moment(h.timestamp).format('YYYY-MM-DD HH:mm:ss'),
            Product: products.find(p => p.id === h.productId)?.name || h.productId,
            Type: h.type,
            Quantity: h.quantity,
            Reason: h.reason,
            'Performed By': h.updatedBy
        }));
        exportToCSV(exportData, 'stock_movement_audit_log');
    };

    const columns = [
        { 
            title: 'Timestamp', 
            dataIndex: 'timestamp', 
            key: 'timestamp',
            render: (ts) => moment(ts).format('YYYY-MM-DD HH:mm:ss')
        },
        { 
            title: 'Product', 
            dataIndex: 'productId', 
            key: 'productId',
            render: (id) => products.find(p => p.id === id)?.name || id
        },
        { 
            title: 'Type', 
            dataIndex: 'type', 
            key: 'type',
            render: (type) => (
                <Tag color={type === 'IN' ? 'green' : type === 'OUT' ? 'volcano' : 'blue'}>
                    {type}
                </Tag>
            )
        },
        { 
            title: 'Quantity', 
            dataIndex: 'quantity', 
            key: 'quantity',
            render: (qty, record) => {
                let prefix = '';
                let color = '';
                
                if (record.type === 'IN' || record.type === 'ADJUST') {
                    prefix = '+';
                    color = '#52c41a';
                } else if (record.type === 'OUT') {
                    prefix = '-';
                    color = '#f5222d';
                }

                return (
                    <span style={{ color, fontWeight: 'bold' }}>
                        {prefix}{Math.abs(qty)}
                    </span>
                );
            }
        },
        { title: 'Reason', dataIndex: 'reason', key: 'reason' },
        { title: 'Performed By', dataIndex: 'updatedBy', key: 'updatedBy' },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Stock Movement Audit Log</h1>
                <Space>
                    <Input
                        placeholder="Search logs..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                        allowClear
                    />
                    <Button 
                        icon={<DownloadOutlined />} 
                        onClick={handleExport}
                        disabled={filteredHistory.length === 0}
                    >
                        Export CSV
                    </Button>
                    <Select 
                        defaultValue="ALL" 
                        style={{ width: 200 }} 
                        onChange={handleProductChange}
                    >
                        <Option value="ALL">All Products</Option>
                        {_.map(products, p => <Option key={p.id} value={p.id}>{p.name}</Option>)}
                    </Select>
                </Space>
            </div>
            <Table columns={columns} dataSource={filteredHistory} rowKey="id" loading={loading} />
        </div>
    );
};

const mapStateToProps = (state) => ({
  products: state.products.list || []
});

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(
        {
            getAllProducts,
            getAllStockHistory, 
            getStockHistory
        }, 
        dispatch
    ),
})

export default connect(mapStateToProps,mapDispatchToProps)(StockAuditLog);
