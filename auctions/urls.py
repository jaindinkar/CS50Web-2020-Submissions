from django.urls import path

from . import views

urlpatterns = [
	# URL for index page
    path("", views.index, name="index"),
    # URL for Login
    path("login", views.login_view, name="login"),
    # URL for Logout
    path("logout", views.logout_view, name="logout"),
    # URL for Register
    path("register", views.register, name="register"),
    # URL for Creating a Listing
    path("create_listing", views.create_listing, name="create_listing"),
    # URL for Product page with message input and message_tone
    path("<int:listing_id>/<str:message>/<str:message_tone>", views.listing_page, name="listing_page"),
    # URL for Product page with message input
    path("<int:listing_id>/<str:message>", views.listing_page, name="listing_page"),
    # URL for Product page without message input
    path("<int:listing_id>", views.listing_page, name="listing_page"),
    # URL for Watchlist page
    path("watchlist", views.watchlist, name="watchlist"),
    # URL for add to Watchlist page
    path("watchlist/add/<int:listing_id>", views.add_to_watchlist, name="add_to_watchlist"),
    # URL for remove from Watchlist page
    path("watchlist/remove/<int:listing_id>", views.remove_from_watchlist, name="remove_from_watchlist"),
    # URL to bid on a Listing
    path("bid/<int:listing_id>", views.bid, name="bid"),
    # URL to comment on a Listing
    path("comment/<int:listing_id>", views.comment, name="comment"),
    # URL to close a Listing
    path("close/<int:listing_id>", views.close_listing, name="close"),
    # URL for category page
    path("categories/<str:category_text>", views.categories, name="categories"),
]