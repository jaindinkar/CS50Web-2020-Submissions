import json
from django.http import JsonResponse

from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from .models import User, Post
from .forms import NewPostForm
from django.contrib.auth.decorators import login_required


def index(request):

    posts = Post.objects.all()
    # Return posts in reverse chronologial order
    posts = posts.order_by("-post_timestamp").all()
    
    if request.method == "POST":
        form = NewPostForm(request.POST)

        if form.is_valid():
            post_content = form.cleaned_data["content"]

            newPost = Post(creator=request.user, content=post_content)
            newPost.save()

            return render(request, "network/index.html", { 'form': NewPostForm(), 'all_posts': posts })

        else:
            return render(request, "network/index.html", { 'form': NewPostForm(), 'all_posts': posts })

    else:
        return render(request, "network/index.html", { 'form': NewPostForm(), 'all_posts': posts })


def profile_view(request, user_id):

    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return HttpResponseRedirect(reverse("index"))

    # Separating the posts by requested user.
    user_posts = Post.objects.filter(creator=user)
    # Rearranging the posts by requested user in reverse cronological order.
    user_posts = user_posts.order_by("-post_timestamp").all()

    # Count users follwed by current user
    following = 0
    for obj in user.follows.all():
        following += 1

    # Count users follwing current user
    followed_by = 0
    for obj in user.followed_by.all():
        followed_by += 1

    return render(request, "network/profile.html", {
        'following': following,
        'followed_by': followed_by,
        'user_posts': user_posts,
        'profile_user': user
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


@login_required
def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))



def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
