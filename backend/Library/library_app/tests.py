from django.test import TestCase
from .models import Book, Author, Genre

class BookTestCase(TestCase):
    def setUp(self):
        """Создаем тестовую книгу перед запуском тестов"""
        author = Author.objects.create(author='Дж. К. Роулинг')
        genre = Genre.objects.create(genre='Фэнтези')
        self.book = Book.objects.create(title="Гарри Поттер", author=author, genre=genre)

    def test_create_book(self):
        """Проверяем, что книга добавляется"""
        book_count = Book.objects.count()
        self.assertEqual(book_count, 1)

    def test_read_book(self):
        """Проверяем, что книга читается"""
        book = Book.objects.get(title="Гарри Поттер")
        self.assertEqual(book.author.author, "Дж. К. Роулинг")

    def test_update_book(self):
        """Проверяем обновление данных"""
        book = Book.objects.get(title="Гарри Поттер")
        book.title = "Гарри Поттер и Тайная комната"
        book.save()
        self.assertEqual(Book.objects.get(id=self.book.id).title, "Гарри Поттер и Тайная комната")

    def test_delete_book(self):
        """Проверяем удаление книги"""
        book = Book.objects.get(title="Гарри Поттер")
        book.delete()
        book_count = Book.objects.count()
        self.assertEqual(book_count, 0)
