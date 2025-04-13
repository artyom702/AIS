export function loadHeader() {
  const headerPlaceholder = document.getElementById("header-placeholder");

  if (!headerPlaceholder) {
    // Если на странице нет места для хедера, просто выходим
    return;
  }
  fetch("header.html")
    .then(res => res.text())
    .then(data => {
      headerPlaceholder.innerHTML = data;
      highlightCurrentLink();
      setupAuthLinks();
    });
}

document.addEventListener("DOMContentLoaded", () => {
  loadHeader();
  highlightCurrentLink();
});

function highlightCurrentLink() {
  const currentPath = window.location.pathname.split("/").pop();
  document.querySelectorAll(".header__list-link").forEach(link => {
    // Проверяем, соответствует ли путь текущей страницы
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("active");
    }
  });
}

document.addEventListener("click", (e) => {
  const profileLink = e.target.closest('.header__icons-cont a[href="profile.html"]');
  if (profileLink) {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    const ticketNumber = localStorage.getItem("ticket_number");

    if (!isAuthenticated || !ticketNumber) {
      e.preventDefault();
      alert("Пожалуйста, авторизуйтесь, чтобы перейти в профиль.");
      window.location.href = "auth.html";
    }
  }
});

function setupAuthLinks() {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const ticketNumber = localStorage.getItem("ticket_number");

  const userLink = document.querySelector('.header__icons-cont a[href="profile.html"]');
  const logoutLink = document.getElementById("logoutBtn");

  if (!isAuthenticated || !ticketNumber) {
    if (logoutLink) logoutLink.remove();
    if (userLink) {
      userLink.setAttribute("href", "#");
      userLink.addEventListener("click", (e) => {
        e.preventDefault();
        alert("Пожалуйста, авторизуйтесь, чтобы перейти в профиль.");
        window.location.href = "auth.html";
      });
    }
  } else {
    if (logoutLink) {
      logoutLink.addEventListener("click", e => {
        e.preventDefault();
        localStorage.clear();
        window.location.href = "auth.html";
      });
    }
  }
}