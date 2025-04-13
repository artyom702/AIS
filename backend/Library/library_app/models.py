from django.db import models

class Genre(models.Model):
    genre = models.CharField(max_length=100, verbose_name="Жанр")

    objects = models.Manager()

    def __str__(self):
        return self.genre

class Author(models.Model):
    author = models.CharField(max_length=255, verbose_name="Автор")

    objects = models.Manager()

    def __str__(self):
        return self.author

class Book(models.Model):
    title = models.CharField(max_length=255, verbose_name="Название книги")
    description = models.CharField(max_length=255, verbose_name="Описание")
    available_copies = models.IntegerField(default=1, verbose_name="Доступные экземпляры")
    author = models.ForeignKey(Author, on_delete=models.CASCADE, verbose_name="Автор")  # Связь с таблицей Author
    genre = models.ForeignKey(Genre, on_delete=models.CASCADE, verbose_name="Жанр")

    objects = models.Manager()

    def __str__(self):
        return f"{self.title} - {self.author}"




class Reader(models.Model):
    name = models.CharField(max_length=255, verbose_name="Имя читателя")
    email = models.EmailField(unique=True, verbose_name="Email")
    phone = models.CharField(max_length=20, verbose_name="Телефон", blank=True, null=True)
    ticket_number = models.IntegerField(verbose_name="Номер читательского билета")
    password = models.CharField(max_length=15, verbose_name="Пароль")

    objects = models.Manager()

    def __str__(self):
        return self.name




class Bookings(models.Model):
    reader_id = models.ForeignKey(Reader, on_delete=models.CASCADE, verbose_name="Читатель")
    book_id = models.ForeignKey(Book, on_delete=models.CASCADE, verbose_name="Книга")
    booking_date = models.DateTimeField(auto_now_add=True, verbose_name="Дата бронирования")
    booking_duration = models.DateField(verbose_name="Дата возврата")

    objects = models.Manager()

    def __str__(self):
        return f"{self.reader.name} забронировал {self.book.title}"
