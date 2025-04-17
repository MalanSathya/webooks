const API_URL = 'https://9b19p6vm6l.execute-api.us-east-1.amazonaws.com/prod/books';

// Fetch and display all books
async function fetchBooks() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    
    const books = await res.json();
    const booksArray = Array.isArray(books) ? books : 
                      (books.Items ? books.Items : []);
    
    const container = document.getElementById('books-list');
    
    if (booksArray.length === 0) {
      container.innerHTML = '<p>No books found</p>';
      return;
    }
    
    container.innerHTML = booksArray.map(book => `
      <div class="book-card">
        <h3>${book.Title}</h3>
        <p><strong>Author(s):</strong> ${book.Authors}</p>
        <p><strong>Publisher:</strong> ${book.Publisher || 'N/A'}</p>
        <p><strong>Year:</strong> ${book.Year || 'N/A'}</p>
        <div class="book-actions">
          <button onclick="showEditForm('${encodeURIComponent(book.Title)}', '${encodeURIComponent(book.Authors)}', '${encodeURIComponent(book.Publisher || '')}', '${book.Year || ''}')">Edit</button>
          <button onclick="deleteBook('${encodeURIComponent(book.Title)}')">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error fetching books:', error);
    document.getElementById('books-list').innerHTML = 
      `<p>Error loading books: ${error.message}</p>`;
  }
}

// Add a new book
async function addBook(event) {
  event.preventDefault();
  
  const book = {
    Title: document.getElementById('add-title').value,
    Authors: document.getElementById('add-authors').value,
    Publisher: document.getElementById('add-publisher').value,
    Year: parseInt(document.getElementById('add-year').value)
  };
  
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(book)
    });
    
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    
    document.getElementById('add-form').reset();
    fetchBooks();  // Automatically refresh the list after adding
    alert('Book added successfully!');
  } catch (error) {
    console.error('Error adding book:', error);
    alert(`Error adding book: ${error.message}`);
  }
}

// Update an existing book
async function updateBook(event) {
  event.preventDefault();
  
  const title = document.getElementById('edit-title').value;
  const book = {
    Authors: document.getElementById('edit-authors').value,
    Publisher: document.getElementById('edit-publisher').value,
    Year: parseInt(document.getElementById('edit-year').value)
  };
  
  try {
    const res = await fetch(`${API_URL}/${encodeURIComponent(title)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(book)
    });
    
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    
    hideEditForm();
    fetchBooks();  // Automatically refresh the list after updating
    alert('Book updated successfully!');
  } catch (error) {
    console.error('Error updating book:', error);
    alert(`Error updating book: ${error.message}`);
  }
}

// Delete a book
async function deleteBook(title) {
  if (!confirm(`Are you sure you want to delete "${decodeURIComponent(title)}"?`)) return;
  
  try {
    const res = await fetch(`${API_URL}/${title}`, {
      method: 'DELETE'
    });
    
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    
    fetchBooks();  // Automatically refresh the list after deleting
    alert('Book deleted successfully!');
  } catch (error) {
    console.error('Error deleting book:', error);
    alert(`Error deleting book: ${error.message}`);
  }
}

// Show edit form with book data
function showEditForm(title, authors, publisher, year) {
  document.getElementById('edit-title').value = decodeURIComponent(title);
  document.getElementById('edit-authors').value = decodeURIComponent(authors);
  document.getElementById('edit-publisher').value = decodeURIComponent(publisher);
  document.getElementById('edit-year').value = year;
  
  document.getElementById('edit-overlay').style.display = 'flex';
}

// Hide edit form
function hideEditForm() {
  document.getElementById('edit-overlay').style.display = 'none';
}

// Show add form
function showAddForm() {
  document.getElementById('add-overlay').style.display = 'flex';
}

// Hide add form
function hideAddForm() {
  document.getElementById('add-overlay').style.display = 'none';
}

// Initialize
window.onload = () => {
  fetchBooks();
  document.getElementById('add-form').addEventListener('submit', addBook);
  document.getElementById('edit-form').addEventListener('submit', updateBook);
};


// const COGNITO_REGION = 'us-east-1';
// const USER_POOL_ID = 'us-east-1_k8x8y5BPk'; 
// const APP_CLIENT_ID = '6glarvup8jm0is6ecnmf07puak'; 
// const COGNITO_DOMAIN = 'https://us-east-1_k8x8y5BPk.auth.us-east-1.amazoncognito.com'; 

// const API_URL = 'https://9b19p6vm6l.execute-api.us-east-1.amazonaws.com/prod/books';

// // Amplify configuration
// Amplify.configure({
//   Auth: {
//     region: COGNITO_REGION,
//     userPoolId: USER_POOL_ID,
//     userPoolWebClientId: APP_CLIENT_ID,
//     oauth: {
//       domain: COGNITO_DOMAIN,
//       scope: ['openid', 'email'],
//       redirectSignIn: window.location.origin,
//       redirectSignOut: window.location.origin,
//       responseType: 'token'
//     }
//   }
// });

// async function getToken() {
//   try {
//     const session = await Amplify.Auth.currentSession();
//     return session.getIdToken().getJwtToken();
//   } catch (err) {
//     console.error("User is not authenticated", err);
//     return null;
//   }
// }

// // Fetch and display all books
// async function fetchBooks() {
//   try {
//     const token = await getToken();
//     if (!token) {
//       console.log('User is not authenticated');
//       return;
//     }
    
//     const res = await fetch(API_URL, {
//       headers: {
//         Authorization: `Bearer ${token}`
//       }
//     });

//     if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

//     const books = await res.json();
//     const booksArray = Array.isArray(books) ? books : (books.Items || []);
//     const container = document.getElementById('books-list');

//     if (booksArray.length === 0) {
//       container.innerHTML = '<p>No books found</p>';
//       return;
//     }

//     container.innerHTML = booksArray.map(book => `
//       <div class="book-card">
//         <h3>${book.Title}</h3>
//         <p><strong>Author(s):</strong> ${book.Authors}</p>
//         <p><strong>Publisher:</strong> ${book.Publisher || 'N/A'}</p>
//         <p><strong>Year:</strong> ${book.Year || 'N/A'}</p>
//         <div class="book-actions">
//           <button onclick="showEditForm('${encodeURIComponent(book.Title)}', '${encodeURIComponent(book.Authors)}', '${encodeURIComponent(book.Publisher || '')}', '${book.Year || ''}')">Edit</button>
//           <button onclick="deleteBook('${encodeURIComponent(book.Title)}')">Delete</button>
//         </div>
//       </div>
//     `).join('');
//   } catch (error) {
//     console.error('Error fetching books:', error);
//     document.getElementById('books-list').innerHTML = `<p>Error loading books: ${error.message}</p>`;
//   }
// }

// // Add a new book
// async function addBook(event) {
//   event.preventDefault();
//   const book = {
//     Title: document.getElementById('add-title').value,
//     Authors: document.getElementById('add-authors').value,
//     Publisher: document.getElementById('add-publisher').value,
//     Year: parseInt(document.getElementById('add-year').value)
//   };

//   try {
//     const token = await getToken();
//     const res = await fetch(API_URL, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${token}`
//       },
//       body: JSON.stringify(book)
//     });

//     if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
//     document.getElementById('add-form').reset();
//     fetchBooks();
//     alert('Book added successfully!');
//   } catch (error) {
//     console.error('Error adding book:', error);
//     alert(`Error adding book: ${error.message}`);
//   }
// }

// // Update a book
// async function updateBook(event) {
//   event.preventDefault();
//   const title = document.getElementById('edit-title').value;
//   const book = {
//     Authors: document.getElementById('edit-authors').value,
//     Publisher: document.getElementById('edit-publisher').value,
//     Year: parseInt(document.getElementById('edit-year').value)
//   };

//   try {
//     const token = await getToken();
//     const res = await fetch(`${API_URL}/${encodeURIComponent(title)}`, {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${token}`
//       },
//       body: JSON.stringify(book)
//     });

//     if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
//     hideEditForm();
//     fetchBooks();
//     alert('Book updated successfully!');
//   } catch (error) {
//     console.error('Error updating book:', error);
//     alert(`Error updating book: ${error.message}`);
//   }
// }

// // Delete a book
// async function deleteBook(title) {
//   if (!confirm(`Are you sure you want to delete "${decodeURIComponent(title)}"?`)) return;

//   try {
//     const token = await getToken();
//     const res = await fetch(`${API_URL}/${title}`, {
//       method: 'DELETE',
//       headers: {
//         Authorization: `Bearer ${token}`
//       }
//     });

//     if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
//     fetchBooks();
//     alert('Book deleted successfully!');
//   } catch (error) {
//     console.error('Error deleting book:', error);
//     alert(`Error deleting book: ${error.message}`);
//   }
// }

// function showEditForm(title, authors, publisher, year) {
//   document.getElementById('edit-title').value = decodeURIComponent(title);
//   document.getElementById('edit-authors').value = decodeURIComponent(authors);
//   document.getElementById('edit-publisher').value = decodeURIComponent(publisher);
//   document.getElementById('edit-year').value = year;
//   document.getElementById('edit-overlay').style.display = 'flex';
// }

// function hideEditForm() {
//   document.getElementById('edit-overlay').style.display = 'none';
// }

// function showAddForm() {
//   document.getElementById('add-overlay').style.display = 'flex';
// }

// function hideAddForm() {
//   document.getElementById('add-overlay').style.display = 'none';
// }

// async function checkAuth() {
//   try {
//     const user = await Amplify.Auth.currentAuthenticatedUser();
//     console.log('User:', user);
//     document.getElementById('auth-btn').textContent = 'Logout';
//   } catch {
//     document.getElementById('auth-btn').textContent = 'Login';
//   }
// }

// async function handleAuthClick() {
//   try {
//     if (document.getElementById('auth-btn').textContent === 'Logout') {
//       await Amplify.Auth.signOut();
//       window.location.reload();
//     } else {
//       Amplify.Auth.federatedSignIn(); // Redirect to Cognito Hosted UI
//     }
//   } catch (err) {
//     console.error('Error signing out', err);
//   }
// }

// window.onload = async () => {
//   await checkAuth();
//   fetchBooks();
//   document.getElementById('add-form').addEventListener('submit', addBook);
//   document.getElementById('edit-form').addEventListener('submit', updateBook);
//   document.getElementById('auth-btn').addEventListener('click', handleAuthClick);
// };
