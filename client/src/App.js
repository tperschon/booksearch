import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SearchBooks from './pages/SearchBooks';
import SavedBooks from './pages/SavedBooks';
import Navbar from './components/Navbar';
// apollo client/cache/provider/context imports
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink, } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
// graphql http link
const http = createHttpLink({ uri: '/graphql', });
// graphql auth context
const auth = setContext((_, { headers }) => {
  const token = localStorage.getItem('id_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});
// apollo client setup with link, context and caching
const client = new ApolloClient({
  link: auth.concat(http),
  cache: new InMemoryCache(),
});
// app now has provider using our client
function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <>
          <Navbar />
          <Routes>
            <Route
              path='/'
              element={<SearchBooks />}
            />
            <Route
              path='/saved'
              element={<SavedBooks />}
            />
            <Route
              path='*'
              element={<h1 className='display-2'>Wrong page!</h1>}
            />
          </Routes>
        </>
      </Router>
    </ApolloProvider>
  );
}

export default App;
