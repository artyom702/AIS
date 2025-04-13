document.querySelector("#feedbackForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const ticketNumber = localStorage.getItem("ticket_number");
  if (!ticketNumber) {
    alert("Вы не авторизованы! Пожалуйста, войдите в аккаунт, чтобы отправить сообщение.");
    return;
  }

  const form = e.target;

  const message = form.message.value.trim();
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const subject = form.subject.value.trim();

  try {
    const response = await fetch("/send-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, subject, message })
    });

    const result = await response.json();

    if (result.success) {
      alert("Сообщение успешно отправлено!");
      form.reset();
    } else {
      alert("Ошибка: " + result.error);
    }
  } catch (err) {
    console.error(err);
    alert("Не удалось отправить сообщение.");
  }
});