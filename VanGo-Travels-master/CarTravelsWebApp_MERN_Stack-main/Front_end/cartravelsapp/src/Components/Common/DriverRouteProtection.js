import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import AuthService from '../services/auth';
import { Container, Spinner, Alert } from 'react-bootstrap';

class DriverRouteProtection extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isChecking: true,
            isAuthorized: false,
            error: null
        };
    }

    componentDidMount() {
        this.checkAuthorization();
    }

    checkAuthorization = () => {
        try {
            const isAuthenticated = AuthService.isAuthenticated();
            const userRole = AuthService.findrole();
            const userId = AuthService.finduserid();

            console.log('🔐 Driver Route Protection Check:', { 
                isAuthenticated, 
                userRole, 
                userId 
            });

            if (!isAuthenticated) {
                console.log('❌ User not authenticated');
                this.setState({ 
                    isChecking: false, 
                    isAuthorized: false, 
                    error: 'Authentication required' 
                });
                return;
            }

            if (userRole !== 'driver') {
                console.log('❌ User role is not driver:', userRole);
                this.setState({ 
                    isChecking: false, 
                    isAuthorized: false, 
                    error: 'Driver access required' 
                });
                return;
            }

            if (!userId) {
                console.log('❌ User ID not found in token');
                this.setState({ 
                    isChecking: false, 
                    isAuthorized: false, 
                    error: 'Invalid user session' 
                });
                return;
            }

            console.log('✅ Driver authorization successful');
            this.setState({ 
                isChecking: false, 
                isAuthorized: true 
            });

        } catch (error) {
            console.error('❌ Error checking authorization:', error);
            this.setState({ 
                isChecking: false, 
                isAuthorized: false, 
                error: 'Authorization check failed' 
            });
        }
    }

    render() {
        const { isChecking, isAuthorized, error } = this.state;

        // Show loading spinner while checking
        if (isChecking) {
            return (
                <Container className="mt-5 p-5">
                    <div className="text-center">
                        <Spinner animation="border" variant="primary" />
                        <h4 className="mt-3">Verifying Driver Access...</h4>
                        <p className="text-muted">Please wait while we verify your credentials</p>
                    </div>
                </Container>
            );
        }

        // Show error if authorization failed
        if (!isAuthorized) {
            return (
                <Container className="mt-5 p-5">
                    <Alert variant="danger">
                        <Alert.Heading>Access Denied</Alert.Heading>
                        <p>{error || 'You do not have permission to access this page.'}</p>
                        <hr />
                        <div className="d-flex justify-content-end">
                            <Alert.Link href="/login">
                                Go to Login
                            </Alert.Link>
                        </div>
                    </Alert>
                </Container>
            );
        }

        // Render protected content
        return this.props.children;
    }
}

export default DriverRouteProtection;