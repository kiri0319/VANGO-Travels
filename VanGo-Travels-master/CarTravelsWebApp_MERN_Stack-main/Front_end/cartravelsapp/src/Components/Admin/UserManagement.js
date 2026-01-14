import React, { Component } from 'react'
import { Container, Button, Table, Form, Row, Col, Modal, Badge, Card, Alert, Spinner } from 'react-bootstrap'
import authHeader from '../services/auth-header';

export default class UserManagement extends Component {
    constructor(){
        super();
        this.state = {
            customers: [],
            drivers: [],
            allUsers: [],
            filteredUsers: [],
            message: '',
            searchTerm: '',
            filterType: 'all', // 'all', 'customers', 'drivers'
            sortBy: 'createdAt',
            sortOrder: 'desc',
            showUserModal: false,
            selectedUser: null,
            loading: true,
            stats: {
                totalUsers: 0,
                totalCustomers: 0,
                totalDrivers: 0,
                activeDrivers: 0,
                inactiveDrivers: 0
            }
        };
    }

    componentDidMount(){
        this.fetchAllUsers();
    }

    fetchAllUsers = async () => {
        try {
            this.setState({ loading: true });
            
            // Fetch customers
            const customersResponse = await fetch('http://localhost:8010/api/v1/signedupuserdetails', {
                headers: authHeader()
            });
            const customersData = await customersResponse.json();
            
            // Fetch drivers
            const driversResponse = await fetch('http://localhost:8010/api/v1/drivers', {
                headers: authHeader()
            });
            const driversData = await driversResponse.json();
            
            const customers = customersData.map(user => ({
                ...user,
                userType: 'customer',
                role: user.role || 'user'
            }));
            
            const drivers = driversData.data ? driversData.data.map(driver => ({
                ...driver,
                userType: 'driver',
                role: 'driver'
            })) : [];
            
            const allUsers = [...customers, ...drivers];
            
            // Calculate statistics
            const stats = {
                totalUsers: allUsers.length,
                totalCustomers: customers.length,
                totalDrivers: drivers.length,
                activeDrivers: drivers.filter(d => d.status === 'active').length,
                inactiveDrivers: drivers.filter(d => d.status === 'inactive').length
            };
            
            this.setState({
                customers,
                drivers,
                allUsers,
                filteredUsers: allUsers,
                stats,
                loading: false
            });
            
        } catch (error) {
            console.error('Error fetching users:', error);
            this.setState({ 
                message: 'Failed to load users. Please try again.',
                loading: false 
            });
        }
    }

    handleSearch = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        this.setState({ searchTerm }, () => {
            this.applyFilters();
        });
    }

    handleFilterChange = (e) => {
        const filterType = e.target.value;
        this.setState({ filterType }, () => {
            this.applyFilters();
        });
    }

    handleSortChange = (e) => {
        const sortBy = e.target.value;
        this.setState({ sortBy }, () => {
            this.applyFilters();
        });
    }

    applyFilters = () => {
        const { allUsers, searchTerm, filterType, sortBy, sortOrder } = this.state;
        
        let filtered = [...allUsers];
        
        // Filter by user type
        if (filterType === 'customers') {
            filtered = filtered.filter(user => user.userType === 'customer');
        } else if (filterType === 'drivers') {
            filtered = filtered.filter(user => user.userType === 'driver');
        }
        
        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(user => {
                const searchFields = [
                    user.username || user.name,
                    user.emailid || user.email,
                    user.phonenumber || user.phone,
                    user.role,
                    user.userType
                ].filter(Boolean);
                
                return searchFields.some(field => 
                    field.toString().toLowerCase().includes(searchTerm)
                );
            });
        }
        
        // Sort users
        filtered.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];
            
            // Handle date sorting
            if (sortBy === 'createdAt' || sortBy === 'signeddate') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }
            
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
        
        this.setState({ filteredUsers: filtered });
    }

    openUserModal = (user) => {
        this.setState({
            showUserModal: true,
            selectedUser: user
        });
    }

    closeUserModal = () => {
        this.setState({
            showUserModal: false,
            selectedUser: null
        });
    }

    async deleteUser(user) {
        if (!window.confirm(`Are you sure you want to delete this ${user.userType}? This action cannot be undone.`)) {
            return;
        }

        try {
            let endpoint = '';
            if (user.userType === 'customer') {
                endpoint = `http://localhost:8010/api/v1/signedupuserdetails/${user.emailid}`;
            } else {
                endpoint = `http://localhost:8010/api/v1/drivers/${user._id}`;
            }

            const res = await fetch(endpoint, {
                method: 'DELETE',
                headers: authHeader()
            });

            if (res.ok) {
                this.setState({ message: `${user.userType} deleted successfully!` });
                this.fetchAllUsers(); // Refresh the list
                setTimeout(() => this.setState({ message: '' }), 3000);
            } else {
                this.setState({ message: 'Failed to delete user. Please try again.' });
            }
        } catch (error) {
            console.error('Delete error:', error);
            this.setState({ message: 'Failed to delete user. Please try again.' });
        }
    }

    closeMessage = () => {
        this.setState({ message: '' });
    }

    renderUserDetails = (user) => {
        if (user.userType === 'customer') {
            return (
                <div>
                    <Row>
                        <Col md={6}>
                            <strong>Username:</strong> {user.username}
                        </Col>
                        <Col md={6}>
                            <strong>Email:</strong> {user.emailid}
                        </Col>
                    </Row>
                    <Row className="mt-2">
                        <Col md={6}>
                            <strong>Phone:</strong> {user.phonenumber}
                        </Col>
                        <Col md={6}>
                            <strong>Role:</strong> <Badge variant={user.role === 'admin' ? 'danger' : 'primary'}>{user.role}</Badge>
                        </Col>
                    </Row>
                    <Row className="mt-2">
                        <Col md={12}>
                            <strong>Signed Date:</strong> {user.signeddate}
                        </Col>
                    </Row>
                </div>
            );
        } else {
            return (
                <div>
                    <Row>
                        <Col md={6}>
                            <strong>Name:</strong> {user.name}
                        </Col>
                        <Col md={6}>
                            <strong>Email:</strong> {user.email}
                        </Col>
                    </Row>
                    <Row className="mt-2">
                        <Col md={6}>
                            <strong>Phone:</strong> {user.phone}
                        </Col>
                        <Col md={6}>
                            <strong>Status:</strong> <Badge variant={user.status === 'active' ? 'success' : 'secondary'}>{user.status}</Badge>
                        </Col>
                    </Row>
                    <Row className="mt-2">
                        <Col md={6}>
                            <strong>License Number:</strong> {user.licenseNumber}
                        </Col>
                        <Col md={6}>
                            <strong>Experience:</strong> {user.experienceYears} years
                        </Col>
                    </Row>
                    <Row className="mt-2">
                        <Col md={12}>
                            <strong>Address:</strong> {user.address}
                        </Col>
                    </Row>
                    <Row className="mt-2">
                        <Col md={12}>
                            <strong>Created:</strong> {new Date(user.createdAt).toLocaleDateString()}
                        </Col>
                    </Row>
                </div>
            );
        }
    }

    render() {
        const { 
            filteredUsers, 
            message, 
            searchTerm, 
            filterType, 
            sortBy, 
            loading, 
            stats 
        } = this.state;

        if (loading) {
            return (
                <div className="MainDiv">
                    <Container className="mt-3 p-3 text-center">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                        <p className="mt-2">Loading users...</p>
                    </Container>
                </div>
            );
        }

        return (
            <div className="MainDiv">
                <Container className="mt-3 p-3">
                    {message && (
                        <Alert variant={message.includes('successfully') ? 'success' : 'danger'} dismissible onClose={this.closeMessage}>
                            {message}
                        </Alert>
                    )}

                    <h4 className="mb-3">User Management - All Users</h4>

                    {/* Statistics Cards */}
                    <Row className="mb-4">
                        <Col md={2}>
                            <Card className="text-center">
                                <Card.Body>
                                    <Card.Title className="text-primary">{stats.totalUsers}</Card.Title>
                                    <Card.Text>Total Users</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={2}>
                            <Card className="text-center">
                                <Card.Body>
                                    <Card.Title className="text-info">{stats.totalCustomers}</Card.Title>
                                    <Card.Text>Customers</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={2}>
                            <Card className="text-center">
                                <Card.Body>
                                    <Card.Title className="text-warning">{stats.totalDrivers}</Card.Title>
                                    <Card.Text>Drivers</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={2}>
                            <Card className="text-center">
                                <Card.Body>
                                    <Card.Title className="text-success">{stats.activeDrivers}</Card.Title>
                                    <Card.Text>Active Drivers</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={2}>
                            <Card className="text-center">
                                <Card.Body>
                                    <Card.Title className="text-secondary">{stats.inactiveDrivers}</Card.Title>
                                    <Card.Text>Inactive Drivers</Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Filters and Search */}
                    <Row className="mb-3">
                        <Col md={4}>
                            <Form.Control
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={this.handleSearch}
                            />
                        </Col>
                        <Col md={3}>
                            <Form.Control as="select" value={filterType} onChange={this.handleFilterChange}>
                                <option value="all">All Users</option>
                                <option value="customers">Customers Only</option>
                                <option value="drivers">Drivers Only</option>
                            </Form.Control>
                        </Col>
                        <Col md={3}>
                            <Form.Control as="select" value={sortBy} onChange={this.handleSortChange}>
                                <option value="createdAt">Sort by Date</option>
                                <option value="username">Sort by Name</option>
                                <option value="emailid">Sort by Email</option>
                                <option value="role">Sort by Role</option>
                            </Form.Control>
                        </Col>
                        <Col md={2}>
                            <Button variant="outline-primary" onClick={this.fetchAllUsers}>
                                Refresh
                            </Button>
                        </Col>
                    </Row>

                    {/* Users Table */}
                    <Table striped bordered hover responsive>
                        <thead className="table-dark">
                            <tr>
                                <th>#</th>
                                <th>Type</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Role/Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center">No users found</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user, index) => (
                                    <tr key={user._id || user.emailid}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <Badge variant={user.userType === 'customer' ? 'info' : 'warning'}>
                                                {user.userType}
                                            </Badge>
                                        </td>
                                        <td>{user.username || user.name}</td>
                                        <td>{user.emailid || user.email}</td>
                                        <td>{user.phonenumber || user.phone}</td>
                                        <td>
                                            {user.userType === 'customer' ? (
                                                <Badge variant={user.role === 'admin' ? 'danger' : 'primary'}>
                                                    {user.role}
                                                </Badge>
                                            ) : (
                                                <Badge variant={user.status === 'active' ? 'success' : 'secondary'}>
                                                    {user.status}
                                                </Badge>
                                            )}
                                        </td>
                                        <td>
                                            {user.signeddate || new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <Button 
                                                variant="info" 
                                                size="sm" 
                                                className="me-2"
                                                onClick={() => this.openUserModal(user)}
                                            >
                                                View
                                            </Button>
                                            <Button 
                                                variant="danger" 
                                                size="sm"
                                                onClick={() => this.deleteUser(user)}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>

                    {/* User Details Modal */}
                    <Modal show={this.state.showUserModal} onHide={this.closeUserModal} size="lg">
                        <Modal.Header closeButton>
                            <Modal.Title>
                                {this.state.selectedUser?.userType === 'customer' ? 'Customer' : 'Driver'} Details
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            {this.state.selectedUser && this.renderUserDetails(this.state.selectedUser)}
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={this.closeUserModal}>
                                Close
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </Container>
            </div>
        );
    }
}
