import React, { useState, useEffect } from 'react';
import { Jumbotron, Container, CardColumns, Card, Button } from 'react-bootstrap';
import Auth from '../utils/auth';
import { removebookId } from '../utils/localStorage';
import { GET_ME } from '../utils/queries';
import { REMOVE_BOOK } from '../utils/mutations';
import { useQuery, useMutation } from '@apollo/client';

const SavedBooks = () => {
  // query for GET_ME
  const { loading, error, data: user } = useQuery(GET_ME);
  // removeBook mutation
  const [removeBook] = useMutation(REMOVE_BOOK);
  const [userData, setUserData] = useState({});

  // use this to determine if `useEffect()` hook needs to run again
  const userDataLength = Object.keys(userData).length;

  useEffect(() => {
    const getUserData = async () => {
      try {
        // ensure user is logged in
        const token = Auth.loggedIn() ? Auth.getToken() : null;
        if (!token) { return false };
        // if there was an error in query, throw an error
        if (error) throw new Error('something went wrong!');
        // set state with queried data
        setUserData(user.me);
      } catch (err) { console.error(err) };
    };

    if (!loading) getUserData();
  }, [userDataLength, loading, error, user]);

  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  const handleDeleteBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;
    if (!token) { return false };
    try {
      // remove book on bookId
      const response = await removeBook({ variables: { bookId: bookId } });
      // if no response/falsy response, throw error
      if (!response) throw new Error('something went wrong!');
      // otherwise we set the state with the data
      setUserData(response.data.removeBook);
      // upon success, remove book's id from localStorage
      removebookId(bookId);
    } catch (err) { console.error(err) };
  };

  // if data isn't here yet, say so
  if (!userDataLength) return <h2>LOADING...</h2>;
  else return (
    <>
      <Jumbotron fluid className='text-light bg-dark'>
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </Jumbotron>
      <Container>
        <h2>
          {userData.savedBooks
            ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>
        <CardColumns>
          {userData.savedBooks.map((book) => {
            return (
              <Card key={book.bookId} border='dark'>
                {book.image ? <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' /> : null}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className='small'>Authors: {book.authors}</p>
                  <Card.Text>{book.description}</Card.Text>
                  <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            );
          })}
        </CardColumns>
      </Container>
    </>
  );
};

export default SavedBooks;
