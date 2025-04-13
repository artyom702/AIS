// function submitRegistrationForm(event) {
//   event.preventDefault();

//   const fullName = document.querySelector(".register__item-input[name='full_name']");
//   const email = document.querySelector(".register__item-input[name='email']");
//   const number = document.querySelector(".register__item-input[name='number']");
//   const password = document.querySelector(".register__item-input[name='password']");

//   const data = {
//     full_name: fullName.value,
//     email: email.value,
//     phone_number: number.value,
//     password: password.value,
//   }
//   fetch("/register", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//   })
//     .then((response) => {
//       if(!response.ok) {
//         throw new Error('Ошибка на сервере: ' + response.statusText());
//       }
//       return response.json();
//     })
//     .then((data) => {
//       console.log(data)
//       if(data.message) {
//         alert(`Регистрация успешна! Ваш номер читательского билета: ${data.ticket_number}`);
//         fullName.value = "";
//         email.value = "";
//         number.value = "";
//         password.value = "";
//         //перенаправляем на страницу входа
//         window.location.href = "./auth.html";
//       }
//       else {
//         alert("Произошла ошибка при регистрации");
//       }
//     })
//     .catch((error) => {
//       console.error("Ошибка при отправке данных на сервер:", error);
//       alert("Ошибка при регистрации.");
//     });
// }

// async function submitAuthForm(event) {
//   event.preventDefault();

//   localStorage.setItem("isAuthenticated", "true");

//   const ticket_number = document.querySelector(".sign__item-input[name='ticketNumber']").value;
//   const password = document.querySelector(".sign__item-input[name='password']").value;

//   try {
//     const response = await fetch("/login", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ ticket_number, password }),
//     });

//     const result = await response.json();

//     if (response.ok) {
//       localStorage.setItem("ticketNumber", ticket_number);
//       localStorage.setItem("isAuthenticated", "true");
//       alert("Успешный вход!");
//       window.location.href = "./main.html";
//     } else {
//       alert(result.error || "Ошибка входа");
//     }
//   }
//   catch (err) {
//     console.error("Ошибка входа:", err);
//     alert("Что-то пошло не так.");
//   }
// }

// //смотрим зашел ли пользователь в аккаунт или нет
// document.addEventListener("DOMContentLoaded", () => {
//   const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

//   const userLink = document.querySelector('.header__icons-cont a[href="profile.html"]');
//   const logoutLink = document.getElementById("logoutBtn");

//   if (!isAuthenticated) {
//     // Удаляем ссылку на logout
//     if (logoutLink) {
//       logoutLink.remove();
//     }

//     // Перенаправляем иконку user на auth.html
//     if (userLink) {
//       userLink.setAttribute("href", "/auth.html");
//     }
//   } else {
//     //если авторизован
//     if(logoutBtn) {
//       logoutBtn.addEventListener("click", (e) => {
//         e.preventDefault();
//         localStorage.removeItem("isAuthenticated");
//         window.location.href = "./auth.html"
//       })
//     }
//   }
// });

// function searchBooks() {
//   const author = document.getElementById("author").value;
//   const title = document.getElementById("title").value;
//   const genre = document.getElementById("genre").value;
//   const available = document.getElementById("checkbox").checked;

//   let url = "/search-books?";
//   let selectedBookTitle = "";

//   if (author) url += `author=${encodeURIComponent(author)}&`;
//   if (title) url += `title=${encodeURIComponent(title)}&`;
//   if (genre) url += `genre=${encodeURIComponent(genre)}&`;
//   if (available) url += `available=true&`;

//   url = url.endsWith("&") ? url.slice(0, -1) : url;

//   fetch(url)
//     .then((response) => response.json())
//     .then((data) => {
//       const booksList = document.getElementById("books__list");
//       booksList.innerHTML = "";

//       if (data.length > 0) {
//         data.forEach((book) => {
//           const bookHTML = `
//               <div class="book">
//                 <img class="img__book" src="${book.image_url}" alt="${book.title}">
//                 <div class="book__info">
//                   <div class="book__title">
//                     <h4>${book.author}</h4>
//                     <h4>«${book.title}»</h4>
//                   </div>
//                   <p class="book__description">${book.description}</p>
//                   <button class="book__btn" onClick="selectBook('${book.title}')">Добавить</button>
//                 </div>
//               </div>
//             `;
//           booksList.innerHTML += bookHTML;
//         });
//       } else {
//         booksList.innerHTML = "<p>Книги не найдены</p>";
//       }
//     })
//     .catch((error) => console.error("Ошибка при загрузке данных: ", error));
// }

// function submitBookingForm() {
//   const ticketNumber = document.getElementById("ticketNumberInput").value;
//   const bookingDuration = document.getElementById("bookingDuration").value;
//   const bookingDate = document.getElementById("bookingDate").value;

//   const data = {
//     reader_id: reader_id,
//     book_title: selectedBookTitle,
//     booking_duration: bookingDuration,
//     booking_date: bookingDate
//   };

//   if (!data.ticket_number || !data.book_title || !data.booking_date || !data.booking_duration) {
//     alert("Все поля обязательны для заполнения.");
//     return;
//   }

//   fetch("/book-booking", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//   })
//     .then((response) => {
//       if(!response.ok) {
//         throw new Error('Ошибка при бронировании книги');
//       }
//     return response.json();
//     })
//     .then((data) => {
//       alert('Книга успешно забронирована');
//       ticketNumberInput.value = "";
//       closeBookingForm();
//     })
//     .catch((error) => {
//       console.error("Ошибка при бронировании книги: ", error);
//       alert("Ошибка при бронировании книги.");
//     });
// }

// function clearFilters() {
//   document.getElementById("author").value = "";
//   document.getElementById("title").value = "";
//   document.getElementById("genre").value = "";
//   document.getElementById("checkbox").checked = false;

//   // Очищаем список книг
//   const booksList = document.getElementById("books__list");
//   booksList.innerHTML = '<p>Введите параметры поиска и нажмите "Поиск"</p>';
// }

// function selectBook(title) {
//   selectedBookTitle = title;
//   openBookingForm();
// }

// function openBookingForm() {
//   document.getElementById("bookingForm").classList.add("modal-active");
// }

// function closeBookingForm() {
//   document.getElementById("bookingForm").classList.remove("modal-active");
// }

// // добавляем хедер на все страницы где есть div c id
// fetch("header.html")
//   .then(response => response.text())
//   .then(data => {
//     document.getElementById("header-placeholder").innerHTML = data;
// });
// console.log(window.location.pathname.split("/").pop());

// // подсвечиваем выбранную страницу в хедере
// document.addEventListener("DOMContentLoaded", () => {
//   const currentPath = window.location.pathname.split("/").pop();
//   const links = document.querySelectorAll(".header__list-link");

//   links.forEach(link => {
//     const href = link.getAttribute("href");
//     if (href === currentPath) {
//       link.classList.add("active");
//     }
//   });
// });

// // получаем данные в профиле
// document.addEventListener("DOMContentLoaded", async () => {
//   // Проверяем, что это страница профиля
//   if (!window.location.pathname.includes("profile.html")) return;

//   const ticketNumber = localStorage.getItem("ticket_number");

//   if (!ticketNumber) {
//     window.location.href = "auth.html";
//     return;
//   }

//   try {
//     const response = await fetch(`/profile/${ticketNumber}`);
//     const user = await response.json();

//     if (response.ok) {
//       const inputs = document.querySelectorAll(".profile__form-input");
//       const nameInput = document.querySelector(".profile__form-input-name");

//       inputs[0].value = user.ticket_number;
//       inputs[1].value = user.email;
//       inputs[2].value = user.phone_number;
//       inputs[3].value = user.rank || "Новичок";
//       nameInput.value = user.full_name;
//     } else {
//       alert(user.error || "Ошибка загрузки данных");
//     }
//   } catch (err) {
//     console.error("Ошибка загрузки профиля:", err);
//     alert("Не удалось загрузить данные.");
//   }
// });

// window.addEventListener("click", function (event) {
//   const bookingForm = document.getElementById("bookingForm");
//   if (event.target === bookingForm) {
//     closeBookingForm();
//   }
// });