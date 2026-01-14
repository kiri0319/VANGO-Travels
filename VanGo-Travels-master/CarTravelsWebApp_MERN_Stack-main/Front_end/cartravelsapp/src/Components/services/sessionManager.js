import AuthService from './auth';
import * as actions from '../action/auth-action';
import jwt_decode from 'jwt-decode';

class SessionManager {
    constructor() {
        this.isInitialized = false;
    }

    // Initialize authentication state from localStorage
    initializeAuthState(dispatch) {
        if (this.isInitialized) return;
        
        console.log('🔄 Initializing authentication state...');
        
        const token = localStorage.getItem('token');
        if (token && AuthService.isAuthenticated()) {
            console.log('✅ Valid token found, setting authenticated state');
            dispatch(actions.login(true));
        } else {
            console.log('❌ No valid token found, setting unauthenticated state');
            dispatch(actions.login(false));
        }
        
        this.isInitialized = true;
    }

    // Clear all session data
    clearAllSessions() {
        console.log('🧹 Clearing all session data...');
        
        // Clear localStorage
        localStorage.removeItem('token');
        
        // Clear sessionStorage
        sessionStorage.clear();
        
        // Clear any other stored data
        this.clearBookingSession();
        
        console.log('✅ All session data cleared');
    }

    // Clear booking session data
    clearBookingSession() {
        const bookingKeys = [
            'userName',
            'phoneNumber', 
            'pickupLocation',
            'dropLocation',
            'tourBookingData',
            'selectedPackage'
        ];
        
        bookingKeys.forEach(key => {
            sessionStorage.removeItem(key);
        });
        
        console.log('✅ Booking session data cleared');
    }

    // Check if user has active booking session
    hasActiveBookingSession() {
        const userName = sessionStorage.getItem('userName');
        const phoneNumber = sessionStorage.getItem('phoneNumber');
        const pickupLocation = sessionStorage.getItem('pickupLocation');
        const dropLocation = sessionStorage.getItem('dropLocation');
        
        return !!(userName && phoneNumber && pickupLocation && dropLocation);
    }

    // Get booking session data
    getBookingSessionData() {
        return {
            userName: sessionStorage.getItem('userName'),
            phoneNumber: sessionStorage.getItem('phoneNumber'),
            pickupLocation: sessionStorage.getItem('pickupLocation'),
            dropLocation: sessionStorage.getItem('dropLocation')
        };
    }

    // Set booking session data
    setBookingSessionData(data) {
        if (data.userName) sessionStorage.setItem('userName', data.userName);
        if (data.phoneNumber) sessionStorage.setItem('phoneNumber', data.phoneNumber);
        if (data.pickupLocation) sessionStorage.setItem('pickupLocation', data.pickupLocation);
        if (data.dropLocation) sessionStorage.setItem('dropLocation', data.dropLocation);
        
        console.log('✅ Booking session data saved:', data);
    }

    // Validate session integrity
    validateSession() {
        const token = localStorage.getItem('token');
        
        if (!token) {
            console.log('❌ No token found');
            return false;
        }
        
        try {
            const isAuth = AuthService.isAuthenticated();
            if (!isAuth) {
                console.log('❌ Token validation failed');
                this.clearAllSessions();
                return false;
            }
            
            console.log('✅ Session validation passed');
            return true;
        } catch (error) {
            console.error('❌ Session validation error:', error);
            this.clearAllSessions();
            return false;
        }
    }

    // Auto-logout on token expiration
    setupTokenExpirationCheck(dispatch) {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        try {
            const decodedToken = jwt_decode(token);
            
            if (decodedToken.exp) {
                const expirationTime = decodedToken.exp * 1000; // Convert to milliseconds
                const currentTime = Date.now();
                const timeUntilExpiry = expirationTime - currentTime;
                
                if (timeUntilExpiry > 0) {
                    console.log(`⏰ Token expires in ${Math.round(timeUntilExpiry / 1000 / 60)} minutes`);
                    
                    // Set timeout to logout when token expires
                    setTimeout(() => {
                        console.log('⏰ Token expired, logging out...');
                        dispatch(actions.login(false));
                        this.clearAllSessions();
                        alert('Your session has expired. Please login again.');
                        window.location.href = '/login';
                    }, timeUntilExpiry);
                } else {
                    // Token already expired
                    console.log('⏰ Token already expired');
                    dispatch(actions.login(false));
                    this.clearAllSessions();
                }
            }
        } catch (error) {
            console.error('❌ Error setting up token expiration check:', error);
        }
    }
}

// Export singleton instance
export default new SessionManager();