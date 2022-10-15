// import dependencies
const { AuthenticationError, UserInputError } = require('apollo-server-express');
const { Book, User } = require('../models/index')
const { signToken } = require('../utils/auth');
// general error for email/password being wrong, written as function so we have no chance of giving different messages for different error states
const authError = () => {
    throw new AuthenticationError('The provided email and/or password is incorrect.');
};

const resolvers = {
    Query: {
        me: async (parent, args) => {
            // code this
        }
    },
    Mutation: {
        // adds a user and signs them, returns token/user
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user };
        },
        // user logs in via email/password
        login: async (parent, { email, password }) => {
            // find a user via given email, if none found throw error
            const user = await User.findOne({ email });
            if (!user) { authError() };
            // check if password is correct for found user, if not throw error
            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) { authError() };
            // since we got to this point, sign in and return token/user
            const token = signToken(user);
            return { token, user };
        },
    },
};

module.exports = resolvers;