document.addEventListener("DOMContentLoaded", async () => {
  if (window.location.pathname.includes("auth.html") || window.location.pathname.includes("registration.html") || window.location.pathname.includes("main.html") || window.location.pathname.includes("recomendation.html") || window.location.pathname.includes("aboutus.html")) {
    return; // Если это страница входа или регистрации — ничего не делаем
  }

  loadUserProfile();

  const ticketNumber = localStorage.getItem("ticket_number");
  console.log("Загруженный номер билета:", ticketNumber);
  if (!ticketNumber) {
    alert("Вы не авторизованы.");
    return;
  }

  try {
    const response = await fetch(`/user-bookings/${ticketNumber}`);
    const result = await response.json();

    if (result.success) {
      renderBookedBooks(result.books);
    } else {
      console.error("Ошибка загрузки бронированных книг:", result.error);
    }
  } catch (err) {
    console.error("Ошибка запроса:", err);
  }
});

export async function loadUserProfile() {
  if (!window.location.pathname.includes("profile.html")) return;

  const ticketNumber = localStorage.getItem("ticket_number");
  if (!ticketNumber) {
    window.location.href = "auth.html";
    return;
  }

  try {
    const res = await fetch(`/profile/${ticketNumber}`);
    const user = await res.json();

    if (res.ok) {
      const inputs = document.querySelectorAll(".profile__form-input");
      const nameInput = document.querySelector(".profile__form-input-name");

      inputs[0].value = user.ticket_number;
      inputs[1].value = user.email;
      inputs[2].value = user.phone_number;
      inputs[3].value = user.rank || "Новичок";
      nameInput.value = user.full_name;
    } else {
      alert(user.error || "Ошибка загрузки данных");
    }
  } catch (err) {
    console.error("Ошибка профиля:", err);
    alert("Ошибка загрузки профиля");
  }
}

function sendProfileByEmail() {
  const inputs = document.querySelectorAll(".profile__form-input, .profile__form-input-name");
  const data = {
    ticketNumber: inputs[0].value,
    email: inputs[1].value,
    phone: inputs[2].value,
    rank: inputs[3].value,
    name: inputs[4].value
  };

  fetch("/send-profile-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        alert("Данные отправлены на вашу почту!");
      } else {
        alert("Ошибка при отправке: " + result.error);
      }
    })
    .catch(err => {
      console.error("Ошибка:", err);
      alert("Ошибка при отправке запроса");
    });
}

function renderBookedBooks(books) {
  const container = document.querySelector("#books__profile");

  if (!container) return;

  if (books.length === 0) {
    container.innerHTML = "<p>У вас нет забронированных книг.</p>";
    return;
  }

  container.innerHTML = "";

  books.forEach((book) => {
    console.log(book)
    const { title, author, image_url, description, book__description, booking_date, booking_duration } = book;

    const bookHTML = `
      <div class="book">
        <img class="img__book" src="${book.image_url}" alt="${book.title}">
        <div class="book__info">
          <div class="book__title">
            <h4>${book.author}</h4>
            <h4>«${book.title}»</h4>
          </div>
          <p class="book__description">${book.description}</p>
          <p class="book__booking-start"><strong>Дата бронирования:</strong> ${ booking_date }</p>
          <p class="book__booking-end"><strong>Количество дней:</strong> ${ booking_duration }</p>
        </div>
      </div>
    `;
    container.innerHTML += bookHTML;
  });
}