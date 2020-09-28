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
from django.core.paginator import Paginator

def index(request):

    posts = Post.objects.all()
    # Return posts in reverse chronologial order
    posts = posts.order_by("-post_timestamp").all()
    
    # Pagination Script
    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    if request.method == "POST":
        form = NewPostForm(request.POST)

        if form.is_valid():
            post_content = form.cleaned_data["content"]

            newPost = Post(creator=request.user, content=post_content)
            newPost.save()

            return render(request, "network/index.html", { 'form': NewPostForm(), 'page_obj': page_obj })

        else:
            return render(request, "network/index.html", { 'form': NewPostForm(), 'page_obj': page_obj })

    else:
        return render(request, "network/index.html", { 'form': NewPostForm(), 'page_obj': page_obj })


def profile_view(request, user_id):

    try:
        profile_user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return HttpResponseRedirect(reverse("index"))

    # Filtering the posts by profile user.
    user_posts = Post.objects.filter(creator=profile_user)
    # Rearranging the posts in reverse cronological order.
    user_posts = user_posts.order_by("-post_timestamp").all()
    # Pagination Script
    paginator = Paginator(user_posts, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    # Check if the current user follows the profile user
    follows = False
    if(request.user in profile_user.followed_by.all()):
        follows = True


    # Count users follwed by profile user
    following_count = 0
    for obj in profile_user.follows.all():
        following_count += 1

    # Count users follwing profile user
    followed_by_count = 0
    for obj in profile_user.followed_by.all():
        followed_by_count += 1

    return render(request, "network/profile.html", {
        'follows': follows,
        'following': following_count,
        'followed_by': followed_by_count,
        'page_obj': page_obj,
        'profile_user': profile_user
    })

@login_required
def toggle_follow(request, user_id):
    try:
        profile_user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return HttpResponseRedirect(reverse("index"))

    if(profile_user == request.user):
        return HttpResponseRedirect(reverse("index"))

        
    if(request.user in profile_user.followed_by.all()):
        # If already followed by user then unfolow
        profile_user.followed_by.remove(request.user)
        request.user.follows.remove(profile_user)

        profile_user.save()
        request.user.save()

        return HttpResponseRedirect(reverse("profile",args=[user_id,]))

    else:
        # Add the user to your following list.
        profile_user.followed_by.add(request.user)
        request.user.follows.add(profile_user)

        profile_user.save()
        request.user.save()

        return HttpResponseRedirect(reverse("profile",args=[user_id,]))


@login_required
def following_page(request):
    # Posts by all the users who current user follows.

    users = request.user.follows.all()

    posts = Post.objects.filter(creator__in=users)

    # Rearranging the posts in reverse cronological order.
    posts = posts.order_by("-post_timestamp").all()

    # Pagination Script
    paginator = Paginator(posts, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    return render(request, "network/following_page.html", {
        'page_obj': page_obj
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
