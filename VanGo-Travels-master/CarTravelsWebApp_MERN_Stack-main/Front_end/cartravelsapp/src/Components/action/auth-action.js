import AuthService from '../services/auth'
import authHeader from '../services/auth-header';
import SessionManager from '../services/sessionManager';

export const USER_LOGIN = "USER_LOGIN"

export const login = (status) => {
    console.log('In auth action: ', status)
    if(!status){
        console.log('Logging out user ****************** ')
        
        // Log logout to server
        const current_user = AuthService.finduserid();
        if(current_user) {
            fetch('http://localhost:8010/api/v1/AllUsersLog/'+current_user,{ headers: authHeader() })
            .then(data => data.json())
            .then(res=>{
                console.log("response",res);
                const current_user_id = res[res.length - 1]._id
                console.log("userlog",current_user_id)
                return fetch('http://localhost:8010/api/v1/AllUsersLog/'+current_user_id, {
                    method: 'PATCH',
                    headers:authHeader(),
                    body: JSON.stringify({loggedoutAt : new Date().toLocaleString(), status : "OUT"}),
                })
            })
            .then(res=>{
                if(res && res.status === 200){
                    console.log("logout successful")
                }
            })
            .catch(err=>{
                console.error('Logout logging failed:', err);
            })
            .finally(() => {
                // Always clear session data regardless of server response
                SessionManager.clearAllSessions();
            });
        } else {
            // No user ID found, just clear session
            SessionManager.clearAllSessions();
        }
    }
    return {
        type: USER_LOGIN,
        payload: status
    }
}

export const userLogin = (user) => {
    console.log('____USER LOGIN ______ function')

    return dispatch => {
        // Clear any existing session data before login
        SessionManager.clearAllSessions();
        
        return fetch('http://localhost:8010/api/v1/signedupuserdetails/loginuser', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user),
            })
            .then(data => data.json())
            .then(res=>{
                console.log(res);
                if(res.success === true){ 
                    localStorage.setItem('token', res.token);
                    alert("Successfully Logged in ✔")
                    
                    // Log login to server
                    const current_user = AuthService.finduserid()
                    if(current_user) {
                        fetch('http://localhost:8010/api/v1/AllUsersLog',{
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({user : current_user, loggedinAt : new Date().toLocaleString(), status : "IN"}),
                        })
                        .then(data => data.json())
                        .then(response=>{
                            console.log(response);
                        })
                        .catch(err => {
                            console.error('Login logging failed:', err);
                        });
                    }
                    
                    dispatch(login(res.success));
                    return {success: true}
                }else{
                    // Try driver login as fallback
                    return fetch('http://localhost:8010/api/v1/drivers/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: user.emailid, password: user.password })
                    }).then(r=>r.json())
                    .then(driverRes=>{
                        if(driverRes && driverRes.success){
                            localStorage.setItem('token', driverRes.token);
                            dispatch(login(true));
                            return {success: true}
                        }else{
                            alert("Username/Password incorrect ❌\nor\nAfter Signup Please Login ☺")
                            return {success: false}
                        }
                    })
                }
            })
            .catch(err=>{
                console.error('Login request failed:', err);
                alert('Network error. Please check your connection or try again.');
                return {success: false}
            })
    }
}
