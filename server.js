const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const app = express();
const port = 3000;
const saltRounds = 10;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./books.db", (err) => {
  if (err) {
    console.error("Ошибка при подключении к базе данных: ", err.message);
    process.exit(1);
  } else {
    console.log("Подключено к базе данных");
  }
});

app.use("/images", express.static(path.join(__dirname, "images")));
app.use(express.static(path.join(__dirname, "styles")));
app.use(express.static(path.join(__dirname, "pages")));
app.use(express.static(path.join(__dirname, "js")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages", "main.html"));
});

app.post("/register", async (req, res) => {
  const { full_name, email, phone_number, password } = req.body;

  if (!full_name || !email || !phone_number || !password) {
    return res.status(400).json({ error: "Все поля обязательны для заполнения" });
  }

  const checkQuery = `SELECT * FROM readers WHERE email = ? OR phone_number = ?`;

  db.get(checkQuery, [email, phone_number], async (err, row) => {
    if (err) {
      console.error("Ошибка при проверке существующих данных:", err.message);
      return res.status(500).json({ error: "Ошибка сервера" });
    }

    if (row) {
      return res.status(409).json({
        error: "Пользователь с таким email или номером уже зарегистрирован",
      });
    }

    // Если пользователя нет, продолжаем регистрацию
    try {
      const hashedPasswords = await bcrypt.hash(password, 10);
      const ticketNumber = generateTicketNumber();

      const query = `INSERT INTO readers (full_name, email, phone_number, ticket_number, password) VALUES (?, ?, ?, ?, ?)`;
      const params = [full_name, email, phone_number, ticketNumber, hashedPasswords];

      db.run(query, params, function (err) {
        if (err) {
          console.error("Ошибка регистрации: ", err.message);
          return res.status(500).json({ error: "Ошибка при регистрации" });
        }
        return res.status(201).json({
          message: "Регистрация прошла успешно",
          ticket_number: ticketNumber,
        });
      });
    } catch (error) {
      console.error("Ошибка при обработке запроса:", error);
      return res.status(500).json({ error: "Ошибка сервера" });
    }
  });
});

app.post("/login", (req, res) => {
  const { ticket_number, password } = req.body;

  if(!ticket_number || !password) {
    return res.status(400).json({ error: "Все поля обязательны" });
  }

  const query = "SELECT * FROM readers WHERE ticket_number = ?";

  db.get(query, [ticket_number], async (err, user) => {
    if (err) {
      console.error("Ошибка при поиске пользователя:", err.message);
      return res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }

    if (!user) {
      console.log("Пользователь не найден")
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log("Неверный пароль")
      return res.status(401).json({ error: "Неверный пароль" });
    }

    res.status(200).json({ message: "Вход выполнен успешно" });
  });
})

app.get("/profile/:ticket_number", (req, res) => {
  const { ticket_number } = req.params;

  const query = `SELECT full_name, email, phone_number, ticket_number FROM readers WHERE ticket_number = ?`;

  db.get(query, [ticket_number], (err, user) => {
    if (err) {
      console.error("Ошибка при получении профиля:", err.message);
      return res.status(500).json({ error: "Ошибка сервера" });
    }

    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    // Ранги по кол-ву прочитанных книг
    let rank = "Новичок";
    const count = user.books_read || 0;

    if (count >= 10 && count < 20) rank = "Читатель на минималках";
    else if (count >= 20 && count < 40) rank = "Библиофил";
    else if (count >= 40) rank = "Архимаг абзаца";

    res.status(200).json({ ...user, rank });
  });
})

app.get("/check-ticket", (req, res) => {
  const { ticket_number } = req.query;

  const query = "SELECT COUNT(*) AS count FROM readers WHERE ticket_number = ?";
  db.get(query, [ticket_number], (err, row) => {
    if (err) {
      console.error("Ошибка выполнения запроса: ", err.message);
      res.status(500).json({ error: "Ошибка выполнения запроса" });
      return;
    }
    res.json({ valid: row.count > 0 });
  });
});

app.post("/book-booking", (req, res) => {
  const { ticket_number, book_title, booking_date, booking_duration } =
    req.body;

  if (!ticket_number || !book_title || !booking_date || !booking_duration) {
    return res
      .status(400)
      .json({ error: "Все поля обязательны для заполнения" });
  }

  const query = `
    INSERT INTO bookings (ticket_number, book_title, booking_date, booking_duration)
    VALUES (?, ?, ?, ?)
  `;
  const params = [ticket_number, book_title, booking_date, booking_duration];

  db.run(query, params, function (err) {
    if (err) {
      console.error("Ошибка при бронировании книги: ", err.message);
      return res.status(500).json({ error: "Ошибка при бронировании книги" });
    }

    // увеличиваем количество книг читателя
    const queryUpdateReader = `
      UPDATE readers
      SET books_count = books_count + 1
      WHERE ticket_number = ?
    `;
    const paramsUpdateReader = [ticket_number];

    db.run(queryUpdateReader, paramsUpdateReader, function (err) {
      if (err) {
        console.error("Ошибка при обновлении счётчика бронированных книг:", err.message);
        return res.status(500).json({ error: "Ошибка при обновлении счётчика бронированных книг" });
      }

      res.status(201).json({ message: "Книга успешно забронирована" });
    });
  });
});

/** для получения дат когда книги забронированы */
app.get("/booked-dates/:book_title", (req, res) => {
  const bookTitle = req.params.book_title;

  const query = `
    SELECT booking_date, booking_duration
    FROM bookings
    WHERE book_title = ?
  `;

  db.all(query, [bookTitle], (err, rows) => {
    if (err) {
      console.error("Ошибка при получении забронированных дат:", err.message);
      return res.status(500).json({ error: "Ошибка сервера" });
    }

    const bookedDates = rows.map(row => {
      const startDate = new Date(row.booking_date);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + row.booking_duration);
      return { startDate: startDate.toISOString().split('T')[0], endDate: endDate.toISOString().split('T')[0] };
    });

    res.json({ bookedDates });
  });
});

app.get("/user-bookings/:ticketNumber", (req, res) => {
  const { ticketNumber } = req.params;

  if (!ticketNumber) {
    return res.status(400).json({ success: false, error: "Не указан номер билета" });
  }

  const query = `
    SELECT books.title, books.author, books.image_url, books.description,
      bookings.booking_date, bookings.booking_duration
    FROM bookings
    JOIN books ON bookings.book_title = books.title
    WHERE bookings.ticket_number = ?;
  `;

  db.all(query, [ticketNumber], (err, rows) => {
    if (err) {
      console.error("Ошибка при получении забронированных книг:", err);
      return res.status(500).json({ success: false, error: "Ошибка сервера" });
    }

    res.json({ success: true, books: rows });
  });
});

app.get("/search-books", (req, res) => {
  const { author, title, genre, available } = req.query;

  let query = "SELECT * FROM books WHERE 1=1";
  const params = [];

  if (author) {
    query += " AND author LIKE ?";
    params.push(`%${author}%`);
  }
  if (title) {
    query += " AND title LIKE ?";
    params.push(`%${title}%`);
  }
  if (genre) {
    query += " AND LOWER(genre) = LOWER(?)";
    params.push(genre);
  }
  // if (available !== undefined) {
  //   query += " AND available = ?";
  //   params.push(available === "true" ? 1 : 0);
  // }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error("Ошибка выполнения запроса: ", err.message);
      res.status(500).json({ error: "Ошибка выполнения запроса" });
    } else {
      if (rows.length === 0) {
        res.json([]);
      } else {
        res.json(rows);
      }
    }
  });
});

function generateTicketNumber() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

app.get("/recommendations/:ticket_number", (req, res) => {
  const { ticket_number } = req.params;

  // 1. Получаем жанры последних бронированных книг
  const genreQuery = `
    SELECT DISTINCT b.genre
    FROM bookings bk
    JOIN books b ON bk.book_title = b.title
    WHERE bk.ticket_number = ?
    ORDER BY bk.booking_date DESC
    LIMIT 3
  `;

  db.all(genreQuery, [ticket_number], (err, genres) => {
    if (err) {
      console.error("Ошибка при получении жанров:", err.message);
      return res.status(500).json({ error: "Ошибка сервера" });
    }

    const genreList = genres.map(g => g.genre);

    // 2. Рекомендуем книги по этим жанрам
    const placeholders = genreList.map(() => '?').join(',');
    const recommendQuery = `
      SELECT * FROM books
      WHERE genre IN (${placeholders})
      LIMIT 5
    `;
    db.all(recommendQuery, genreList, (err, recommended) => {
      if (err) {
        console.error("Ошибка при получении рекомендаций:", err.message);
        return res.status(500).json({ error: "Ошибка сервера" });
      }

      // 3. Получаем популярные книги
      const popularQuery = `
        SELECT b.*, COUNT(bk.book_title) as count
        FROM bookings bk
        JOIN books b ON bk.book_title = b.title
        GROUP BY bk.book_title
        ORDER BY count DESC
        LIMIT 5
      `;

      db.all(popularQuery, [], (err, popularBooks) => {
        if (err) {
          console.error("Ошибка при получении популярных книг:", err.message);
          return res.status(500).json({ error: "Ошибка сервера" });
        }

        res.status(200).json({
          recommended,
          popular: popularBooks,
        });
      });
    });
  });
});

app.post("/send-feedback", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, error: "Заполните все поля." });
  }

  console.log("Получены данные:", { name, email, subject, message });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "dima16421812@gmail.com", // замени на свою почту
      pass: "djww jius axjs vyba",    // замени на пароль приложения
    },
  });

  const mailOptions = {
    from: email,
    to: `${email}`, // замени на свою же почту или куда хочешь получать
    subject: `Обращение с сайта: ${subject}`,
    text: `Имя: ${name}\nEmail: ${email}\n\nСообщение:\n${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "Письмо отправлено" });
  } catch (error) {
    console.error("Ошибка при отправке письма:", error);
    res.status(500).json({ success: false, error: "Ошибка сервера" });
  }
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});