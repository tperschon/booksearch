// import jwt and dotenv
const jwt = require('jsonwebtoken');
require('dotenv').config();
// secret stored in environment variable
const secret = process.env.SEC;
// this is a book lookup tool so a long expiration is fine, we'd change this if it involved more intimiate details
const expiration = '24h';

module.exports = {
  authMiddleware: function ({ req }) {
    // find our token from any place in request
    let token = req.body.token || req.query.token || req.headers.authorization;
    // return request if there isn't a token
    if (!token) return req;
    // split the token off from the Bearer
    if (req.headers.authorization) { token = token.split(' ').pop().trim() };
    // try to verify the token against the secret, ensure it's not expired
    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch {
      req.error = 'Verification error.'
      console.log('Error verifying token.');
    }
    // return the request, if token was verified req will have user, if not will have error
    return req;
  },
  // function to actually sign token
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
