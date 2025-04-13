from locust import HttpUser, task, between
import random
import datetime

class LibraryUser(HttpUser):
    wait_time = between(1, 3)

    @task(1)
    def get_books(self):
        """ Получить список всех книг """
        self.client.get("/api/books/")

    @task(1)
    def get_readers(self):
        """ Получить список всех читателей """
        self.client.get("/api/readers/")

    @task(2)
    def book_a_book(self):
        """ Забронировать случайную книгу случайному читателю """
        reader_id = random.randint(1, 5)  # изменяй по количеству данных в БД
        book_id = random.randint(1, 10)

        future_date = (datetime.datetime.now() + datetime.timedelta(days=14)).date()

        payload = {
            "reader_id": reader_id,
            "book_id": book_id,
            "booking_duration": str(future_date)
        }

        self.client.post("/api/bookings/", json=payload)

    @task(1)
    def get_bookings(self):
        """ Получить список всех бронирований """
        self.client.get("/api/bookings/")
