import { useState } from 'react';
import { Table, Card, Tag, Input } from "antd";
import { SearchOutlined } from '@ant-design/icons';
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";
import '../../styles/UserManagement.css'

const ViewUser = (props) => {
  const { users } = props
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');

  const filteredUsers = users.filter((user) => {
    if (!searchText) return true;
    const lowerText = searchText.toLowerCase();
    return (
      (user.userName && user.userName.toLowerCase().includes(lowerText)) ||
      (user.firstName && user.firstName.toLowerCase().includes(lowerText)) ||
      (user.lastName && user.lastName.toLowerCase().includes(lowerText)) ||
      (user.email && user.email.toLowerCase().includes(lowerText)) ||
      (user.role && user.role.toLowerCase().includes(lowerText))
    );
  });

  const handleUserClick = (record) => {
    navigate(`/users/edit/${record.id}`);
  };

  const columns = [
    {
      title: "Username",
      dataIndex: "userName",
      key: "userName",
      render: (text, record) => (
        <a onClick={() => handleUserClick(record)} className="user-name-link">
          {text}
        </a>
      ),
    },
    {
      title: "First Name",
      dataIndex: "firstName",
      key: "firstName",
    },
    {
      title: "Last Name",
      dataIndex: "lastName",
      key: "lastName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        let color = "geekblue";
        if (role === "Admin") color = "volcano";
        if (role === "Manager") color = "green";
        return (
          <Tag color={color} key={role} className="user-status-tag">
            {role ? role.toUpperCase() : "N/A"}
          </Tag>
        );
      },
    },
  ];

  return (
    <>
      <Card 
        title="User List" 
        variant={"borderless"}
        extra={
          <Input
            placeholder="Search users..."
            prefix={<SearchOutlined />}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
        }
      >
        <Table
            columns={columns}
            dataSource={filteredUsers}
            pagination={{ pageSize: 10 }}
        />
      </Card>
    </>
  );
};



const mapStateToProps = (state) => {
  return {
    users: state.users.list
  }
}

export default connect(mapStateToProps, null)(ViewUser);
