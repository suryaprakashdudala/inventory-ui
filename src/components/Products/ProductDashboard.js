import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Select, Space, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { getAllProducts, addProduct, updateProduct, deleteProduct } from '../../actions/products';
import { connect } from 'react-redux'
import { bindActionCreators } from '@reduxjs/toolkit';
import _ from 'lodash';
import { exportToCSV } from '../../utils/exportUtils';
import { validationMessages } from '../../constants/constants';

const {ENTER_PRICE, ENTER_PRODUCT_NAME, ENTER_RECORD_LEVEL, ENTER_SKU, SELECT_CATEGORY, SELECT_STATUS, INVALID_PRICE, INVALID_RECORD_LEVEL} = validationMessages;

const { Option } = Select;

const ProductDashboard = (props) => {
    const { actions, products } = props
    const user = JSON.parse(localStorage.getItem('user'));
    const role = user?.role || 'VIEWER';
    const isAdmin = role === 'ADMIN';
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [form] = Form.useForm();

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            await actions.getAllProducts();
        } catch (error) {
            message.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    }, [actions]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const filteredProducts = React.useMemo(() => {
        if (!searchText) return products;
        const lowerSearch = searchText.toLowerCase();
        return _.filter(products, p => 
            _.includes(p.name?.toLowerCase(), lowerSearch) ||
            _.includes(p.sku?.toLowerCase(), lowerSearch) ||
            _.includes(p.category?.toLowerCase(), lowerSearch)
        );
    }, [products, searchText]);

    const handleExport = () => {
        exportToCSV(filteredProducts, 'products');
    };

    const showModal = (product = null) => {
        setEditingProduct(product);
        if (product) {
            form.setFieldsValue(product);
        } else {
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const onFinish = async (values) => {
        try {
            if (editingProduct) {
                await actions.updateProduct(editingProduct.id, values);
                message.success('Product updated successfully');
            } else {
                await actions.addProduct(values);
                message.success('Product added successfully');
            }
            setIsModalVisible(false);
            fetchProducts();
        } catch (error) {
            message.error(error.response?.data || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        try {
            await actions.deleteProduct(id);
            message.success('Product deleted successfully');
            fetchProducts();
        } catch (error) {
            message.error('Failed to delete product');
        }
    };

    const columns = [
        { title: 'SKU', dataIndex: 'sku', key: 'sku' },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Category', dataIndex: 'category', key: 'category' },
        { title: 'Price', dataIndex: 'price', key: 'price', render: (price) => `${price.toFixed(2)}` },
        { title: 'Reorder Level', dataIndex: 'reorderLevel', key: 'reorderLevel' },
        { 
            title: 'Status', 
            dataIndex: 'status', 
            key: 'status',
            render: (status) => {
                let color = 'green';
                if (status === 'INACTIVE') color = 'volcano';
                if (status === 'DISCONTINUED') color = 'default';
                return (
                    <Tag color={color}>
                        {status}
                    </Tag>
                );
            }
        },
    ];

    if (isAdmin) {
        columns.push({
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
                    <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} />
                </Space>
            ),
        });
    }

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Product Management</h1>
                <Space>
                    <Input
                        placeholder="Search products..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                        allowClear
                    />
                    <Button 
                        icon={<DownloadOutlined />} 
                        onClick={handleExport}
                        disabled={filteredProducts.length === 0}
                    >
                        Export CSV
                    </Button>
                    {isAdmin && (
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
                            Add Product
                        </Button>
                    )}
                </Space>
            </div>
            <Table columns={columns} dataSource={filteredProducts} rowKey="id" loading={loading} />

            <Modal
                title={editingProduct ? 'Edit Product' : 'Add Product'}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item 
                        name="sku" 
                        label="SKU" 
                        rules={[
                            { required: true, message: ENTER_SKU },
                            // { pattern: /^[A-Z0-9-]+$/, message: 'SKU must be uppercase alphanumeric!' }
                        ]}
                    >
                    <Input disabled={!!editingProduct} placeholder="Enter Stock Keeping Unit" />
                    </Form.Item>
                    <Form.Item name="name" label="Product Name" rules={[{ required: true, message: ENTER_PRODUCT_NAME }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="category" label="Category" rules={[{ required: true, message: SELECT_CATEGORY }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item 
                        name="price" 
                        label="Price" 
                        rules={[
                            { required: true, message: ENTER_PRICE },
                            { type: 'number', min: 0.01, message: INVALID_PRICE }
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} precision={2} />
                    </Form.Item>
                    <Form.Item 
                        name="reorderLevel" 
                        label="Reorder Level" 
                        rules={[
                            { required: true, message: ENTER_RECORD_LEVEL },
                            { type: 'number', min: 1, message: INVALID_RECORD_LEVEL }
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="status" label="Status" rules={[{ required: true, message: SELECT_STATUS }]}>
                        <Select>
                            <Option value="ACTIVE">ACTIVE</Option>
                            <Option value="INACTIVE">INACTIVE</Option>
                            <Option value="DISCONTINUED">DISCONTINUED</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                            {editingProduct ? 'Update' : 'Add'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
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
            addProduct, 
            updateProduct, 
            deleteProduct
        }, 
        dispatch
    ),
})

export default connect(mapStateToProps, mapDispatchToProps)(ProductDashboard);