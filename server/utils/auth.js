// import jwt-decode dependency
import decode from 'jwt-decode';

class AuthService {
  // runs decode on the results from getToken
  getProfile() { return decode(this.getToken()) };
  // loggedIn status verifier, returns a boolean, checks if there even is a token, then ensure it's not expired
  loggedIn() {
    // we store getToken here so we can feed into isTokenExpired and make fewer calls
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  };
  // checks if the given token is expired
  isTokenExpired(token) {
    try {
      const decoded = decode(token);
      if (decoded.exp < Date.now() / 1000) {
        return true;
      } else return false;
      // we catch an error and return false so if anything is wrong with decode we don't erroneously authenticate a token
    } catch (err) { return false };
  };
  // retrieve the token from user's localStorage
  getToken() { return localStorage.getItem('id_token') };
  // we call this when logging somebody in, with given token, store it on user's localStorage and relocate them to home page
  login(idToken) {
    localStorage.setItem('id_token', idToken);
    window.location.assign('/');
  };
  // same as login but clears the token from localStorage
  logout() {
    localStorage.removeItem('id_token');
    window.location.assign('/');
  };
};

export default new AuthService();