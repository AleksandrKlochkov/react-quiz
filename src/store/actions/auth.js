
import {config} from '../../config/config'
import axios from 'axios'
import { AUTH_SUCCESS, AUTH_LOGOUT} from '../actions/actionTypes'

export function auth(email, password, isLogin) {
    return async dispatch => {

        const authData = {
            email: email,
            password: password,
            returnSecureToken: isLogin
        }

        let url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${config.firebaseAPI_KEY}`

        if(isLogin){
            url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${config.firebaseAPI_KEY}`
        }

        const response = await axios.post(url, authData)
        const data = response.data

        const experationDate = new Date(new Date().getTime() + data.expiresIn * 1000)

        localStorage.setItem('token', data.idToken)
        localStorage.setItem('userId', data.localId)
        localStorage.setItem('experationDate', experationDate)

        dispatch(authSuccess(data.idToken))
        dispatch(authLogout(data.expiresIn))
        
    }
}

export function authSuccess (token) {
    return {
        type: AUTH_SUCCESS,
        token
    }
}

export function authLogout(time) {
    return dispatch => {
        setTimeout(()=> {
            dispatch(logout())   
        }, time*1000)
    }
}

export function logout(){
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('experationDate')
    return {
        type: AUTH_LOGOUT
    }
}

export function autoLogin() {
    return dispatch => {
        const token = localStorage.getItem('token')
        if(!token) {
            dispatch(logout())
        }else{
            const experationDate = new Date(localStorage.getItem('expirationDate'))
            if(experationDate<=new Date()){
                dispatch(logout())
            }else{
                dispatch(authSuccess(token))
                dispatch(authLogout((experationDate.getTime() - new Date().getTime()) / 1000))
            }
        }
    }
}