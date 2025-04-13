export let selectedBookTitle = "";

document.addEventListener("DOMContentLoaded", () => {
  // Устанавливаем ограничения для полей
  const today = new Date().toISOString().split('T')[0];  // Получаем текущую дату в формате YYYY-MM-DD
  document.getElementById("bookingDate").setAttribute("min", today);  // Устанавливаем минимальную дату
  document.getElementById("bookingDuration").setAttribute("min", 1);  // Устанавливаем минимальное значение для длительности бронирования

  const bookingDurationField = document.getElementById("bookingDuration");

  // Слушаем изменения в поле длительности бронирования
  bookingDurationField.addEventListener("input", () => {
    // Если введенное значение меньше 1, то устанавливаем значение 1
    if (bookingDurationField.value < 1) {
      bookingDurationField.value = 1;
    }
  });

  // Слушаем потерю фокуса на поле длительности бронирования
  bookingDurationField.addEventListener("blur", () => {
    if (bookingDurationField.value < 1) {
      bookingDurationField.value = 1;
    }
  });
});

export function selectBook(title) {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  if(!isAuthenticated) {
    alert("Вы должны авторизоваться, чтобы забронировать книгу.");
    return;
  }

  selectedBookTitle = title;
  document.getElementById("bookTitleDisplay").value = title;
  openBookingForm(title);
}

export function submitBookingForm() {
  const ticketNumber = localStorage.getItem("ticket_number");
  const bookingDuration = document.getElementById("bookingDuration").value;
  const bookingDate = document.getElementById("bookingDate").value;

  if(!selectedBookTitle || !bookingDate || !bookingDuration) {
    alert("Все поля обязательны для заполнения.");
    return;
  }

  const data = {
    ticket_number: ticketNumber,
    book_title: selectedBookTitle,
    booking_duration: bookingDuration,
    booking_date: bookingDate
  };

  fetch("/book-booking", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if(!response.ok) {
        throw new Error('Ошибка при бронировании книги');
      }
    return response.json();
    })
    .then((data) => {
      alert('Книга успешно забронирована');
      closeBookingForm();
    })
    .catch((error) => {
      console.error("Ошибка при бронировании книги: ", error);
      alert("Ошибка при бронировании книги.");
    });
}

export async function openBookingForm(bookTitle) {
  selectedBookTitle = bookTitle;
  document.getElementById("bookTitleDisplay").value = bookTitle;

  try {
    const response = await fetch(`/booked-dates/${bookTitle}`);
    const result = await response.json();

    if (result.bookedDates) {
      disableBookedDates(result.bookedDates);
    }
  } catch (err) {
    console.error("Ошибка загрузки забронированных дат:", err);
  }

  document.getElementById("bookingFon").classList.add("modal-overlay-active");
  document.getElementById("bookingForm").classList.add("modal-active");
}

function disableBookedDates(bookedDates) {
  const bookingDateInput = document.getElementById("bookingDate");
  const today = new Date().toISOString().split("T")[0];

  // Устанавливаем минимальную дату - сегодня
  bookingDateInput.min = today;

  // Создаем массив недоступных дат
  const disabledDates = new Set();
  bookedDates.forEach(({ startDate, endDate }) => {
    let currentDate = new Date(startDate);
    while (currentDate <= new Date(endDate)) {
      disabledDates.add(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  // Отключаем эти даты в инпуте
  bookingDateInput.addEventListener("input", (e) => {
    if (disabledDates.has(e.target.value)) {
      alert("Эта дата уже занята! Выберите другую.");
      e.target.value = "";
    }
  });
}

export function closeBookingForm() {
  selectedBookTitle = "";
  document.getElementById("bookingDuration").value = "";
  document.getElementById("bookingDate").value = "";

  document.getElementById("bookingFon").classList.remove("modal-overlay-active")
  document.getElementById("bookingForm").classList.remove("modal-active");
}

export function setupModalClose() {
  window.addEventListener("click", function (event){
    const bookingForm = document.getElementById("bookingForm");
    if (event.target === bookingForm) {
      closeBookingForm();
    }
  })
};

window.submitBookingForm = submitBookingForm;
window.selectBook = selectBook;
window.openBookingForm = openBookingForm;
window.closeBookingForm = closeBookingForm;
