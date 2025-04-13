--
-- ���� ������������ � ������� SQLiteStudio v3.4.15 � �� ��� 17 22:05:58 2025
--
-- �������������� ��������� ������: System
--
PRAGMA foreign_keys = off;
BEGIN TRANSACTION;

-- �������: Bookings
CREATE TABLE IF NOT EXISTS Bookings (id INTEGER PRIMARY KEY UNIQUE, reader_id INTEGER UNIQUE REFERENCES Readers (id), book_id TEXT NOT NULL REFERENCES Books (id), booking_date TEXT NOT NULL, booking_duration INTEGER NOT NULL);

-- �������: Books
CREATE TABLE IF NOT EXISTS Books (id INTEGER PRIMARY KEY UNIQUE, title TEXT, author TEXT, genre TEXT, format TEXT, available INTEGER, description TEXT, image_url TEXT);

-- �������: Readers
CREATE TABLE IF NOT EXISTS Readers (id INTEGER PRIMARY KEY UNIQUE, full_name TEXT NOT NULL, email TEXT NOT NULL, phone_number TEXT NOT NULL, ticket_number INTEGER UNIQUE NOT NULL);

COMMIT TRANSACTION;
PRAGMA foreign_keys = on;
