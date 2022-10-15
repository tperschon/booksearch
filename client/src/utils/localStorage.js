export const getSavedbookIds = () => {
  const savedbookIds = localStorage.getItem('saved_books')
    ? JSON.parse(localStorage.getItem('saved_books'))
    : [];

  return savedbookIds;
};

export const savebookIds = (bookIdArr) => {
  if (bookIdArr.length) {
    localStorage.setItem('saved_books', JSON.stringify(bookIdArr));
  } else {
    localStorage.removeItem('saved_books');
  }
};

export const removebookId = (bookId) => {
  const savedbookIds = localStorage.getItem('saved_books')
    ? JSON.parse(localStorage.getItem('saved_books'))
    : null;

  if (!savedbookIds) {
    return false;
  }

  const updatedSavedbookIds = savedbookIds?.filter((savedbookId) => savedbookId !== bookId);
  localStorage.setItem('saved_books', JSON.stringify(updatedSavedbookIds));

  return true;
};
