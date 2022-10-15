// import dependencies
const { AuthenticationError, UserInputError } = require('apollo-server-express');
const { User } = require('../models/index')
const { signToken } = require('../utils/auth');
// general error for email/password being wrong, written as function so we have no chance of giving different messages for different error states
const authError = function () {
    throw new AuthenticationError('The provided email and/or password is incorrect.');
};

const resolvers = {
    Query: {
        // get User info from contextual user, populated with savedBooks
        me: async (parent, args, context) => {
            if (context.user) {
                return await User
                    .findById(context.user._id)
                    .populate({ path: 'savedBooks'});
            } else throw new AuthenticationError('Not logged in.');
        },
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
        // add a book in the form of an object to User's savedBooks
        saveBook: async (parents, { BookParams: { authors, description, title, bookId, image, link }}, context) => {
            // set up our book object
            const book = {
                authors: authors,
                description: description,
                bookId: bookId,
                title: title,
                image: image,
                link: link
            };
            // try-catch to update a User with the book object added to their savedBooks array
            try {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: book } },
                    { new: true, runValidators: true }
                );
                return updatedUser;
            } catch (err) {
                console.log(err);
                throw new UserInputError('Error saving book.');
            };
        },
        // delete a book by the bookId from a User's savedBooks
        removeBook: async (parents, { bookId }, context) => {
            // try-catch to update a User by pulling the book object with the bookId matching the given one from their savedBooks array
            try {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId: bookId } } },
                    { new: true }
                );
                return updatedUser;
            } catch (err) {
                console.log(err);
                throw new UserInputError('Error removing book.');
            };
        }
    },
};

module.exports = resolvers;