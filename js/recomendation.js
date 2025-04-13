import { selectBook, setupModalClose } from "./booking.js";

document.addEventListener("DOMContentLoaded", () => {
  const ticketNumber = localStorage.getItem("ticket_number");

  if(!ticketNumber) {
    alert("Пожалуйста, авторизуйтесь, чтобы получить рекомендации.");
    return;
  }

  fetch(`/recommendations/${ticketNumber}`)
    .then((res) => res.json())
    .then(data => {
      renderBooks(data.recommended, "#recommended-list");
      renderBooks(data.popular, "#popular-list");
    })
    .catch(err => {
      console.error("Ошибка загрузки рекомендаций:", err);
      alert("Не удалось загрузить рекомендации.");
  });

  setupModalClose();
});

function renderBooks(books, containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  if (books.length === 0) {
    container.innerHTML += "<p>Книги не найдены</p>";
    return;
  }

  container.innerHTML = "";

  books.forEach((book) => {
    const bookHTML = `
      <div class="book">
        <img class="img__book" src="${book.image_url}" alt="${book.title}">
        <div class="book__info">
          <div class="book__title">
            <h4>${book.author}</h4>
            <h4>«${book.title}»</h4>
          </div>
          <p class="book__description">${book.description}</p>
          <button class="book__btn" data-title="${book.title}">Добавить</button>
        </div>
      </div>
    `;
    container.innerHTML += bookHTML;
  });

  // Привязка обработчика событий для кнопок "Добавить"
  const buttons = container.querySelectorAll(".book__btn");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const title = button.getAttribute("data-title");
      selectBook(title);  // Вызов функции selectBook с переданным названием книги
    });
  });
}