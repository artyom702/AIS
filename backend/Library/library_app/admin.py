from django.contrib import admin
from .models import Book, Reader, Author, Genre, Bookings

admin.site.register(Book)
admin.site.register(Reader)
admin.site.register(Author)
admin.site.register(Genre)
admin.site.register(Bookings)
