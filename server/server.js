// module dependencies
const express = require('express');
const path = require('path');
const { ApolloServer } = require('apollo-server-express');
// local dependencies
const { authMiddleware } = require('./utils/auth');
const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');
// primarily uses environment variable, defaults to 3001 when none set
const PORT = process.env.PORT || 3001;
// instantiate express and feed it urlencoded and json setups
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// apollo server definition
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});
// static asset delivery, I don't think we have any yet but this lets us expand if we want
app.use('/images', express.static(path.join(__dirname, '../client/images')));
// if we're in production, we use this path
if (process.env.NODE_ENV === 'production') { app.use(express.static(path.join(__dirname, '../client/build'))) };
// wildcard directs through index
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, '../client/build/index.html')) });
// apollo server function using graphQL defs
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  server.applyMiddleware({ app });
  // setup to work with db
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    });
  });
};
// start the apollo server
startApolloServer(typeDefs, resolvers);