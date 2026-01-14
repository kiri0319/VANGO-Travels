import * as actions from '../action/auth-action';

let initialState = {
    authenticated: false
}

const reducer = (state = initialState, action) =>{
    console.log('Action recieved at reducer***  ', action);
    switch(action.type){
        case actions.USER_LOGIN:
            return {
                authenticated: action.payload
            }       
        default : return state
    }
}

export default reducer;