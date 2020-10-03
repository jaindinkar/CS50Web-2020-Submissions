
from django.urls import path

from . import views

urlpatterns = [
	# For rendering All posts view.
    path("", views.index, name="index"),
    # For sending the data for new post.
    path("create_post", views.create_post, name="create_post"),
    # For getting all posts.
    path("get_all_posts", views.get_all_posts, name="get_all_posts"),
    # For rendering profile view.
    path("profile/<int:user_id>", views.profile_view, name="profile_view"),
    # For querying profile details.# For rendering profile view.
    path("profile_details/<int:user_id>", views.profile_details, name="profile_details"),
    # For getting posts specific to query profile.
    path("get_profile_posts/<int:user_id>", views.get_profile_posts, name="get_profile_posts"),
    # For following/unfolowing a user.
    path("toggle/<int:user_id>", views.toggle_follow, name="toggle_follow"),
    # For rendering following page view.
    path("following", views.following_page, name="following_page"),
    # For getting posts of users followed by current user.
    path("get_following_posts", views.get_following_posts, name="get_following_posts"),
    # For updating a post securely.
    path("post_update", views.post_update, name="post_update"),
    # For rendering login view.
    path("login", views.login_view, name="login"),
    # For rendering logout view.
    path("logout", views.logout_view, name="logout"),
    # For rendering register view.
    path("register", views.register, name="register")
]
