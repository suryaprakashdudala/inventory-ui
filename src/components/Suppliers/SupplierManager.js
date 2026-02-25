import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Button, Modal, Form, Input, Space, message, Select, Row, Col } from 'antd';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { exportToCSV } from '../../utils/exportUtils';
import { getAllSuppliers, addSupplier, updateSupplier, deleteSupplier } from '../../actions/suppliers';
import { connect } from 'react-redux'
import { bindActionCreators } from '@reduxjs/toolkit'
import _ from 'lodash'

const { Option } = Select;

const SupplierManager = (props) => {
    const { actions, products } = props
    const productMap = _.keyBy(products, 'id');
    const user = JSON.parse(localStorage.getItem('user'));
    const role = user?.role || 'VIEWER';
    const isAdmin = role === 'ADMIN';

    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [countryCode, setCountryCode] = useState('IN');
    const [form] = Form.useForm();

    const fetchSuppliers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await actions.getAllSuppliers();
            setSuppliers(response.data);
        } catch (error) {
            message.error('Failed to fetch suppliers');
        } finally {
            setLoading(false);
        }
    }, [actions]);

    useEffect(() => {
        fetchSuppliers();
    }, [fetchSuppliers]);

    const filteredSuppliers = useMemo(() => {
        if (!searchText) return suppliers;
        const lowerSearch = searchText.toLowerCase();
        return _.filter(suppliers, s => 
            _.includes(s.name?.toLowerCase(), lowerSearch) ||
            _.includes(s.email?.toLowerCase(), lowerSearch) ||
            _.includes(s.phone?.toLowerCase(), lowerSearch) ||
            _.includes(s.address?.toLowerCase(), lowerSearch)
        );
    }, [suppliers, searchText]);

    const handleExport = () => {
        exportToCSV(filteredSuppliers, 'suppliers');
    };

    const showModal = (supplier = null) => {
        setEditingSupplier(supplier);
        if (supplier) {
            form.setFieldsValue(supplier);
            setCountryCode('IN'); 
        } else {
            form.resetFields();
            setCountryCode('IN');
        }
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const onFinish = async (values) => {
        try {
            if (editingSupplier) {
                await actions.updateSupplier(editingSupplier.id, values);
                message.success('Supplier updated successfully');
            } else {
                await actions.addSupplier(values);
                message.success('Supplier added successfully');
            }
            setIsModalVisible(false);
            fetchSuppliers();
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data || 'Operation failed';
            message.error(errorMsg);
        }
    };

    const handleDelete = async (id) => {
        try {
            await actions.deleteSupplier(id);
            message.success('Supplier deleted successfully');
            fetchSuppliers();
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data || 'Failed to delete supplier';
            message.error(errorMsg);
        }
    };

    const columns = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Phone', dataIndex: 'phone', key: 'phone' },
        { title: 'Address', dataIndex: 'address', key: 'address' },
        {
            title: 'Products',
            dataIndex: 'productsSupplied',
            key: 'productsSupplied',
            render: (productIds) => {
                if (_.isEmpty(productIds)) return 'None';

                const names = _.compact(
                    _.map(productIds, id => productMap[id]?.name)
                );
            
                return names.join(', ') || 'None';
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
                <h1>Supplier Management</h1>
                <Space>
                    <Input
                        placeholder="Search suppliers..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                        allowClear
                    />
                    <Button 
                        icon={<DownloadOutlined />} 
                        onClick={handleExport}
                        disabled={filteredSuppliers.length === 0}
                    >
                        Export CSV
                    </Button>
                    {isAdmin && (
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
                            Add Supplier
                        </Button>
                    )}
                </Space>
            </div>
            <Table columns={columns} dataSource={filteredSuppliers} rowKey="id" loading={loading} />

            <Modal
                title={editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item name="name" label="Supplier Name" rules={[{ required: true, message: 'Please input supplier name!' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="Email" rules={[
                        { required: true, message: 'Please input a valid email!' },
                        { pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: 'Please enter a valid email address!' }
                    ]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Phone">
                        <Space.Compact style={{ width: '100%' }}>
                            <Select 
                                value={countryCode} 
                                onChange={setCountryCode} 
                                style={{ width: '30%' }}
                            >
                                <Option value="IN">🇮🇳 +91</Option>
                                <Option value="US">🇺🇸 +1</Option>
                                <Option value="GB">🇬🇧 +44</Option>
                                <Option value="CA">🇨🇦 +1</Option>
                                <Option value="AU">🇦🇺 +61</Option>
                                <Option value="DE">🇩🇪 +49</Option>
                                <Option value="FR">🇫🇷 +33</Option>
                                <Option value="JP">🇯🇵 +81</Option>
                                <Option value="CN">🇨🇳 +86</Option>
                            </Select>
                            <Form.Item
                                name="phone"
                                noStyle
                                rules={[
                                    { required: true, message: 'Please input phone number!' },
                                    {
                                        validator: (_, value) => {
                                            if (!value) return Promise.resolve();
                                            if (isValidPhoneNumber(value, countryCode)) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error(`Please enter a valid phone number for ${countryCode}`));
                                        }
                                    }
                                ]}
                            >
                                <Input style={{ width: '70%' }} placeholder="Phone number" />
                            </Form.Item>
                        </Space.Compact>
                    </Form.Item>
                    <Form.Item name="address" label="Address">
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item name="productsSupplied" label="Products Supplied">
                        <Select mode="tags" placeholder="Enter products">
                            {_.map(products, p => (
                                <Option key={p.id} value={p.id}>
                                    {p.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                            {editingSupplier ? 'Update' : 'Add'}
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
            getAllSuppliers, 
            addSupplier, 
            updateSupplier, 
            deleteSupplier
        }, 
        dispatch
    ),
})

export default connect(mapStateToProps, mapDispatchToProps)(SupplierManager);
