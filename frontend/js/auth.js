export function submitRegistrationForm(event) {
  event.preventDefault();

  const fullName = document.querySelector(".register__item-input[name='full_name']");
  const email = document.querySelector(".register__item-input[name='email']");
  const number = document.querySelector(".register__item-input[name='number']");
  const password = document.querySelector(".register__item-input[name='password']");

  const data = {
    full_name: fullName.value,
    email: email.value,
    phone_number: number.value,
    password: password.value,
  }
  fetch("/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then(async (response) => {
      const responseData = await response.json(); // Декодируем JSON один раз

      if (!response.ok) {
        throw new Error(responseData.error || "Ошибка на сервере");
      }
      return responseData;
    })
    .then((data) => {
      console.log(data)
      if(data.message) {
        alert(`Регистрация успешна! Ваш номер читательского билета: ${data.ticket_number}`);
        fullName.value = "";
        email.value = "";
        number.value = "";
        password.value = "";
        //перенаправляем на страницу входа
        window.location.href = "./auth.html";
      }
      else {
        alert("Произошла ошибка при регистрации");
      }
    })
    .catch((error) => {
      console.error("Ошибка при отправке данных на сервер:", error);
      alert(error.message);
    });
}

export async function submitAuthForm(event) {
  event.preventDefault();

  const ticketNumber = document.getElementById("ticketNumberInput").value;
  const password = document.getElementById("passwordInput").value;

  if(!ticketNumber || !password) {
    alert("Заполните все поля");
    return;
  }

  const data = {
    ticket_number: ticketNumber,
    password: password,
  }
  console.log(data)
  fetch("/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Неверный номер билета или пароль");
      }
      return response.json();
    })
    .then((data) => {
      // сохраняем авторизованные данные
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("ticket_number", ticketNumber);
      localStorage.setItem("user", JSON.stringify(data));
      window.location.href = "main.html";
    })
    .catch((error) => {
      console.error("Ошибка авторизации:", error);
      alert("Ошибка авторизации. Проверьте введённые данные.");
    });
}