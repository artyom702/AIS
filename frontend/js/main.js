import { loadHeader } from './header.js';
import { loadUserProfile } from './profile.js';
import { submitAuthForm, submitRegistrationForm } from './auth.js';
import { selectBook, setupModalClose } from './booking.js';

// Подключаем хедер на всех страницах
document.addEventListener("DOMContentLoaded", () => {
  loadHeader();
  loadUserProfile();
  setupModalClose();

  // Если это страница входа или регистрации, навешиваем события
  if (document.querySelector("#authForm")) {
    document.querySelector("#authForm").addEventListener("submit", submitAuthForm);
  }

  if (document.querySelector("#registerForm")) {
    document.querySelector("#registerForm").addEventListener("submit", submitRegistrationForm);
  }
});

function searchBooks() {
  const author = document.getElementById("author").value;
  const title = document.getElementById("title").value;
  const genre = document.getElementById("genre").value;
  //const available = document.getElementById("checkbox").checked;

  let url = "/search-books?";
  let selectedBookTitle = "";

  if (author) url += `author=${encodeURIComponent(author)}&`;
  if (title) url += `title=${encodeURIComponent(title)}&`;
  if (genre) url += `genre=${encodeURIComponent(genre)}&`;
  //if (available) url += `available=true&`;

  url = url.endsWith("&") ? url.slice(0, -1) : url;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const booksList = document.getElementById("books__list");
      booksList.innerHTML = "";

      if (data.length > 0) {
        data.forEach((book) => {
          const bookHTML = `
              <div class="book">
                <img class="img__book" src="${book.image_url}" alt="${book.title}">
                <div class="book__info">
                  <div class="book__title">
                    <h4>${book.author}</h4>
                    <h4>«${book.title}»</h4>
                  </div>
                  <p class="book__description">${book.description}</p>
                  <button class="book__btn" onClick="selectBook('${book.title}')">Добавить</button>
                </div>
              </div>
            `;
          booksList.innerHTML += bookHTML;
        });
      } else {
        booksList.innerHTML = "<p>Книги не найдены</p>";
      }
    })
    .catch((error) => console.error("Ошибка при загрузке данных: ", error));
  }

function clearFilters() {
  document.getElementById("author").value = "";
  document.getElementById("title").value = "";
  document.getElementById("genre").value = "";
  //document.getElementById("checkbox").checked = false;

  // Очищаем список книг
  const booksList = document.getElementById("books__list");
  booksList.innerHTML = '<p>Введите параметры поиска и нажмите "Поиск"</p>';
}

window.searchBooks = searchBooks;
window.clearFilters = clearFilters;
window.selectBook = selectBook;