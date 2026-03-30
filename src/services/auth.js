import useApiMethods from '@/hooks/useApiMethods';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

const getAuthTokenFromCookie = () => {
    const token = Cookies.get('authTkn');
    return token || null;
};

const getRefreshTokenFromCookie = () => {
    const refreshToken = Cookies.get('refreshTkn');
    return refreshToken || null;
};

const setAuthTokenIntoCookie = (token, refreshToken) => {
    Cookies.set('authTkn', token, { expires: 1, secure: true });
    Cookies.set('refreshTkn', refreshToken, { expires: 7, secure: true }); 
};

const removeAuthToken = () => {
    Cookies.remove('authTkn');
    Cookies.remove('refreshTkn');
};

const isTokenExpired = (token) => {
    if (!token || typeof token !== 'string') {
        return true;
    }

    try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000; 
        return decodedToken.exp < currentTime;
    } catch (error) {
        console.log(`Error trying to decode token: ${error}`);
        return true;
    }
};

const refreshAuthToken = async () => {
    const refreshToken = getRefreshTokenFromCookie();
    if (!refreshToken) return null;

    try {
        const response = await fetch('http://localhost:8000/api/token/refresh/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            removeAuthToken();
            return null;
        }

        const data = await response.json();
        const { accessToken, refreshToken: newRefreshToken } = data;
        setAuthTokenIntoCookie(accessToken, newRefreshToken);

        return accessToken;
    } catch (error) {
        console.error('Error refreshing token:', error);
        removeAuthToken();
        return null;
    }
};


const isAuthenticated = async (verifyExpiration = true) => {
    let token = getAuthTokenFromCookie();
    
    if (!token) {
        return false;
    }

    if (verifyExpiration) {
        if (isTokenExpired(token)) {
            token = await refreshAuthToken();
        }
    }
    
    return token || false;
};


export { 
    isAuthenticated, 
    setAuthTokenIntoCookie, 
    getAuthTokenFromCookie, 
    removeAuthToken, 
    refreshAuthToken, 
    isTokenExpired 
};