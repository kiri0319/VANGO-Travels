import jwt from 'jwt-decode'

const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    if(token){
        try {
            // Check if token is expired
            const decodedToken = jwt(token);
            const currentTime = Date.now() / 1000;
            if (decodedToken.exp && decodedToken.exp < currentTime) {
                // Token is expired, remove it
                localStorage.removeItem('token');
                return false;
            }
            return true;
        } catch (error) {
            // Invalid token, remove it
            console.error('Invalid token:', error);
            localStorage.removeItem('token');
            return false;
        }
    }
    return false;
}

const findrole = () => {
    const token = localStorage.getItem('token');
    if(token){
        try {
            let decodedToken = jwt(token);
            return decodedToken.role;
        } catch (error) {
            console.error('Error decoding token for role:', error);
            return false;
        }
    }else{
        return false;
    }
}

const finduserid = () => {
    const token = localStorage.getItem('token');
    if(token){
        try {
            let decodedToken = jwt(token);
            return decodedToken.id;
        } catch (error) {
            console.error('Error decoding token for user ID:', error);
            return false;
        }
    }else{
        return false;
    }
}

const findusername = () => {
    const token = localStorage.getItem('token');
    if(token){
        try {
            let decodedToken = jwt(token);
            return decodedToken.username;
        } catch (error) {
            console.error('Error decoding token for username:', error);
            return false;
        }
    }else{
        return false;
    }
}

const logout = () => {
    localStorage.removeItem('token');
    // Clear any session data
    sessionStorage.clear();
    console.log('User logged out successfully');
}

export default {isAuthenticated,findrole,finduserid,findusername,logout};

 // console.log("decodedTokenmailid",decodedToken)