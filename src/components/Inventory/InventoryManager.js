import { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Space, message, Tag } from 'antd';
import { ImportOutlined, ExportOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { exportToCSV } from '../../utils/exportUtils';
import { getAllProducts } from '../../actions/products';
import { stockIn, stockOut, adjustStock, getInventoryByProductId } from '../../actions/inventory';
import { connect } from 'react-redux'
import { bindActionCreators } from '@reduxjs/toolkit';
import { validationMessages } from '../../constants/constants';

const {ENTER_QUANTITY, INVALID_QUANTITY, ENTER_REASON} = validationMessages

const InventoryManager = (props) => {
    const {actions, loProducts} = props
    const user = JSON.parse(localStorage.getItem('user'));
    const role = user?.role || 'VIEWER';
    const isViewer = role === 'VIEWER';
    const canAdjust = role === 'ADMIN' || role === 'MANAGER';
    const canMoveStock = !isViewer;

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalType, setModalType] = useState('IN');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [form] = Form.useForm();

    const fetchProductsAndInventory = useCallback(async () => {
        setLoading(true);
        try {
            const productsWithStock = await Promise.all(
                loProducts.map(async (p) => {
                    try {
                        const iResponse = await actions.getInventoryByProductId(p.id);
                        return { ...p, inventory: iResponse.data };
                    } catch (e) {
                        return {
                            ...p,
                            inventory: { availableQty: 0, reservedQty: 0 }
                        };
                    }
                })
            );

            setProducts(productsWithStock);
        } catch (error) {
            message.error('Failed to fetch inventory data');
        } finally {
            setLoading(false);
        }
    }, [loProducts, actions]);


    useEffect(() => {
        fetchProductsAndInventory();
    }, [fetchProductsAndInventory]);

    const filteredProducts = useMemo(() => {
        if (!searchText) return products;
        const lowerSearch = searchText.toLowerCase();
        return _.filter(products, p => 
            _.includes(p.name?.toLowerCase(), lowerSearch) ||
            _.includes(p.sku?.toLowerCase(), lowerSearch)
        );
    }, [products, searchText]);

    const handleExport = () => {
        const exportData = filteredProducts.map(p => ({
            SKU: p.sku,
            'Product Name': p.name,
            'Available Qty': p.inventory?.availableQty || 0,
            'Reserved Qty': p.inventory?.reservedQty || 0,
            'Reorder Level': p.reorderLevel
        }));
        exportToCSV(exportData, 'inventory');
    };

    const showModal = (product, type) => {
        setSelectedProduct(product);
        setModalType(type);
        form.setFieldsValue({ productId: product.id });
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const onFinish = async (values) => {
        const user = JSON.parse(localStorage.getItem('user'));
        const requestData = {
            ...values,
            userId: user?.id || 'anonymous'
        };

        try {
            if (modalType === 'IN') {
                await actions.stockIn(requestData);
                message.success('Stock added successfully');
            } else if (modalType === 'OUT') {
                await actions.stockOut(requestData);
                message.success('Stock removed successfully');
            } else if (modalType === 'ADJUST') {
                await actions.adjustStock(requestData);
                message.success('Stock adjusted successfully');
            }
            setIsModalVisible(false);
            fetchProductsAndInventory();
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data || 'Operation failed';
            message.error(errorMsg);
        }
    };

    const columns = [
        { title: 'SKU', dataIndex: 'sku', key: 'sku' },
        { 
            title: 'Product Name', 
            dataIndex: 'name', 
            key: 'name',
            render: (text, record) => (
                <span>
                    {text} {record.inventory?.availableQty < record.reorderLevel && (
                        <Tag color="error">Low Stock</Tag>
                    )}
                </span>
            )
        },
        { 
            title: 'Available Qty', 
            key: 'availableQty',
            render: (_, record) => (
                <span style={{ 
                    color: record.inventory?.availableQty < record.reorderLevel ? '#cf1322' : 'inherit',
                    fontWeight: record.inventory?.availableQty < record.reorderLevel ? 'bold' : 'normal'
                }}>
                    {record.inventory?.availableQty || 0}
                </span>
            )
        },
        { 
            title: 'Reserved Qty', 
            key: 'reservedQty',
            render: (_, record) => record.inventory?.reservedQty || 0
        },
        { title: 'Reorder Level', dataIndex: 'reorderLevel', key: 'reorderLevel' },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => {
                const isDiscontinued = record.status === 'DISCONTINUED';
                const isInactive = record.status === 'INACTIVE';

                return (
                    <Space size="middle">
                        <Button 
                            icon={<ImportOutlined />} 
                            type="primary" 
                            onClick={() => showModal(record, 'IN')}
                            disabled={isDiscontinued || !canMoveStock}
                        >
                            In
                        </Button>
                        <Button 
                            icon={<ExportOutlined />} 
                            danger 
                            onClick={() => showModal(record, 'OUT')}
                            disabled={isDiscontinued || isInactive || !canMoveStock}
                        >
                            Out
                        </Button>
                        <Button 
                            onClick={() => showModal(record, 'ADJUST')}
                            disabled={isDiscontinued || !canAdjust}
                        >
                            Adjust
                        </Button>
                    </Space>
                );
            },
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Inventory Management</h1>
                <Space>
                    <Input
                        placeholder="Search inventory..."
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
                </Space>
            </div>
            <Table columns={columns} dataSource={filteredProducts} rowKey="id" loading={loading} />

            <Modal
                title={`${modalType === 'IN' ? 'Stock In' : modalType === 'OUT' ? 'Stock Out' : 'Adjust Stock'} - ${selectedProduct?.name}`}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item name="productId" hidden><Input /></Form.Item>
                    <Form.Item 
                        name="quantity" 
                        label={modalType === 'ADJUST' ? 'New Total Quantity' : 'Quantity'} 
                        rules={[
                            { required: true, message: ENTER_QUANTITY },
                            { type: 'number', min: 1, message: INVALID_QUANTITY }
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} min={1} />
                    </Form.Item>
                    <Form.Item name="reason" label="Reason" rules={[{ required: true, message: ENTER_REASON }]}>
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};


const mapStateToProps = (state) => ({
  loProducts: state.products.list || []
});

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(
        {
            getAllProducts,
            stockIn, 
            stockOut, 
            adjustStock, 
            getInventoryByProductId
        }, 
        dispatch
    ),
})

export default connect(mapStateToProps, mapDispatchToProps)(InventoryManager);