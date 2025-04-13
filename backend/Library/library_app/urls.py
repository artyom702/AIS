from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GenreViewSet, AuthorViewSet, BookViewSet, ReaderViewSet, BookingsViewSet

router = DefaultRouter()
router.register(r'genres', GenreViewSet)
router.register(r'authors', AuthorViewSet)
router.register(r'books', BookViewSet)
router.register(r'readers', ReaderViewSet)
router.register(r'bookings', BookingsViewSet)

urlpatterns = [
    path('', include(router.urls)),
]