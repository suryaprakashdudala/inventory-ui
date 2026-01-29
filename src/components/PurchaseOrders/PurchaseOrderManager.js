import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table, Button, Modal, Form, Input, Space, message, Select, Tag, List } from 'antd';
import { PlusOutlined, CheckCircleOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { exportToCSV } from '../../utils/exportUtils';
import { connect } from 'react-redux';
import { bindActionCreators } from '@reduxjs/toolkit';
import _ from 'lodash';

import {
  getAllOrders,
  createOrder,
  updateOrderStatus
} from '../../actions/purchaseOrders';
import { getAllSuppliers } from '../../actions/suppliers';
import { getAllProducts } from '../../actions/products';

const { Option } = Select;

const PurchaseOrderManager = ({ actions, products }) => {

  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role || 'VIEWER';
  const canManageOrders = role === 'ADMIN' || role === 'MANAGER';

  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [searchText, setSearchText] = useState('');

  const [form] = Form.useForm();

  const productMap = useMemo(
    () => _.keyBy(products, 'id'),
    [products]
  );

  const filteredProducts = useMemo(() => {
    if (!selectedSupplierId) return [];
    const supplier = _.find(suppliers, p =>
        p.id === selectedSupplierId
    );
    console.log(_.filter(products, p =>
      _.includes(supplier.productsSupplied, p.id)
    ));
    
    return _.filter(products, p =>
      _.includes(supplier.productsSupplied, p.id)
    );
  }, [products, selectedSupplierId]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [oRes, sRes] = await Promise.all([
        actions.getAllOrders(),
        actions.getAllSuppliers()
      ]);
      setOrders(oRes.data || []);
      setSuppliers(sRes.data || []);
    } catch (err) {
      message.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [actions]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredOrders = useMemo(() => {
    if (!searchText) return orders;
    const lowerSearch = searchText.toLowerCase();
    return _.filter(orders, o => {
      const supplierName = suppliers.find(s => s.id === o.supplierId)?.name || 'Unknown';
      return _.includes(o.id?.toLowerCase(), lowerSearch) ||
             _.includes(supplierName.toLowerCase(), lowerSearch) ||
             _.includes(o.status?.toLowerCase(), lowerSearch);
    });
  }, [orders, searchText, suppliers]);

  const handleExport = () => {
    const exportData = filteredOrders.map(o => ({
      'Order ID': o.id,
      Supplier: suppliers.find(s => s.id === o.supplierId)?.name || 'Unknown',
      Status: o.status,
      Items: o.items.map(i => `${productMap[i.productId]?.name || 'Unknown'} x ${i.quantity}`).join('; ')
    }));
    exportToCSV(exportData, 'purchase_orders');
  };

  const showModal = () => {
    form.resetFields();
    setSelectedSupplierId(null);
    setIsModalVisible(true);
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await actions.updateOrderStatus(
        orderId,
        status,
        user?.id || 'SYSTEM'
      );
      message.success(`Order marked as ${status}`);
      fetchData();
    } catch (err) {
      message.error('Failed to update order status');
    }
  };

  const handleCreateOrder = async (values) => {
    try {
      const payload = {
        supplierId: values.supplierId,
        items: _.map(values.items, item => ({
          ...item,
          unitPrice: productMap[item.productId]?.price || 0
        }))
      };

      await actions.createOrder(payload);
      message.success('Purchase order created successfully');
      setIsModalVisible(false);
      fetchData();
    } catch (err) {
      message.error('Failed to create order');
    }
  };

  const columns = [
    { title: 'Order ID', dataIndex: 'id', key: 'id' },
    {
      title: 'Supplier',
      dataIndex: 'supplierId',
      key: 'supplierId',
      render: id => suppliers.find(s => s.id === id)?.name || 'Unknown'
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: items => (
        items && items.length > 0 ? (
          <List
            size="small"
            dataSource={items}
            renderItem={item => (
              <List.Item>
                {productMap[item.productId]?.name || 'Unknown'} × {item.quantity}
              </List.Item>
            )}
          />
        ) : (
          <span style={{ color: '#999', fontStyle: 'italic' }}>No items</span>
        )
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={status === 'RECEIVED' ? 'green' : status === 'CREATED' ? 'blue' : 'gold'}>
          {status}
        </Tag>
      )
    }
  ];

  if (canManageOrders) {
    columns.push({
      title: 'Action',
      key: 'action',
      render: (_, record) =>
        record.status === 'CREATED' && (
          <Button
            icon={<CheckCircleOutlined />}
            onClick={() => handleStatusUpdate(record.id, 'RECEIVED')}
          >
            Mark as Received
          </Button>
        )
    });
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1>Purchase Orders</h1>
        <Space>
          <Input
            placeholder="Search orders..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Button 
            icon={<DownloadOutlined />} 
            onClick={handleExport}
            disabled={filteredOrders.length === 0}
          >
            Export CSV
          </Button>
          {canManageOrders && (
            <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
              Create Order
            </Button>
          )}
        </Space>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredOrders}
        loading={loading}
      />

      <Modal
        title="Create Purchase Order"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleCreateOrder}
          initialValues={{ items: [{}] }}
        >

          {/* Supplier */}
          <Form.Item
            name="supplierId"
            label="Supplier"
            rules={[{ required: true, message: 'Please select a supplier' }]}
          >
            <Select
              placeholder="Select supplier"
              onChange={(value) => {
                setSelectedSupplierId(value);
                form.setFieldsValue({ items: [{}] });
              }}
            >
              {suppliers.map(s => (
                <Option key={s.id} value={s.id}>{s.name}</Option>
              ))}
            </Select>
          </Form.Item>

          {/* Items */}
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...rest }) => (
                  <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                    <Form.Item
                      {...rest}
                      name={[name, 'productId']}
                      rules={[{ required: true, message: 'Please select a product' }]}
                    >
                      <Select
                        placeholder={selectedSupplierId ? 'Product' : 'Select supplier first'}
                        style={{ width: 220 }}
                        disabled={!selectedSupplierId}
                      >
                        {filteredProducts.map(p => (
                          <Option key={p.id} value={p.id}>{p.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      {...rest}
                      name={[name, 'quantity']}
                      rules={[
                        { required: true, message: 'Please enter quantity' },
                        { type: 'number', min: 1, transform: v => Number(v), message: 'Quantity must be at least 1' }
                      ]}
                    >
                      <Input type="number" placeholder="Qty" />
                    </Form.Item>

                    {fields.length > 1 && (
                      <Button danger onClick={() => remove(name)}>Remove</Button>
                    )}
                  </Space>
                ))}

                <Form.Item>
                  <Button
                    type="dashed"
                    block
                    icon={<PlusOutlined />}
                    onClick={() => add()}
                    disabled={!selectedSupplierId}
                  >
                    Add Item
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Create Order
            </Button>
          </Form.Item>

        </Form>
      </Modal>
    </div>
  );
};

const mapStateToProps = state => ({
  products: state.products.list || []
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(
    {
      getAllProducts,
      getAllSuppliers,
      getAllOrders,
      createOrder,
      updateOrderStatus
    },
    dispatch
  )
});

export default connect(mapStateToProps, mapDispatchToProps)(PurchaseOrderManager);
