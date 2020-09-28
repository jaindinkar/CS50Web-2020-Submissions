
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("profile/<int:user_id>", views.profile_view, name="profile"),
    path("toggle/<int:user_id>", views.toggle_follow, name="toggle_follow"),
    path("following", views.following_page, name="following_page"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register")
]
