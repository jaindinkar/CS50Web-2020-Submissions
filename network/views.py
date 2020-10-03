from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

import json
from django.http import JsonResponse

from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required

from .models import User, Post
from django.core.paginator import Paginator



def index(request):
    return render(request, "network/index.html")


@login_required
def create_post(request):

    # Writing new post must be via POST.
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    # Extract the data from the request.
    data = json.loads(request.body)
    content = data.get("content")

    # Check if empty post
    # Use regex to look for empty post :>> if re.match('^[0-9]*$', content):
    if content == "":
        return JsonResponse({"error": "Post content can't be empty."}, status=400)

    newPost = Post(creator=request.user, content=content)
    newPost.save()

    return JsonResponse({"message": "Post successful."}, status=201)


# Gives all posts.
def get_all_posts(request):

    posts = Post.objects.all()
    # Return posts in reverse chronologial order
    posts = posts.order_by("-post_timestamp").all()

    # Pagination Script
    paginator = Paginator(posts, 10)
    # Read the value of page variable in GET request. Request is made through javascript.
    page_number = request.GET.get('page')

    # if page_number in paginator.page_range :
    # Assimilate 10 posts related to that page number.
    page_obj = paginator.get_page(page_number)

    page_details_dict = {
        'has_prev': page_obj.has_previous(), 
        'prev_page_num': page_obj.previous_page_number() if page_obj.has_previous() else None,
        'has_next': page_obj.has_next(), 
        'next_page_num': page_obj.next_page_number() if page_obj.has_next() else None, 
        'total_pages': paginator.num_pages
    }

    return JsonResponse([page_details_dict, [post.serialize() for post in page_obj]], safe=False)

    # return JsonResponse([post.serialize() for post in page_obj], safe=False)
    # For safe = False: https://docs.djangoproject.com/en/3.1/ref/request-response/#serializing-non-dictionary-objects



def profile_view(request, user_id):
    try:
        profile_user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return HttpResponseRedirect(reverse("index"))

    return render(request, "network/profile_page.html", {
        'profile_user_id': user_id
    })



def profile_details(request, user_id):
    try:
        profile_user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return JsonResponse({"error": "User does not exists."}, status=400)

    # Check if the current user follows the profile user
    if(request.user == profile_user):
        # User cannot follow himself.
        follows = None

    elif(request.user in profile_user.followed_by.all()):
        follows = True

    else:
        follows = False

    # Count users follwed by profile user
    following_count = 0
    for obj in profile_user.follows.all():
        following_count += 1

    # Count users follwing profile user
    followed_by_count = 0
    for obj in profile_user.followed_by.all():
        followed_by_count += 1

    # Creating a JSON response
    # First making a python dictonary
    info = {
        'profile_user_name': profile_user.username,
        'follows': follows,
        'following_count': following_count,
        'followed_by_count': followed_by_count
    }

    # Converting the python dictonary object to JSON
    profile_info = json.dumps(info)

    # Sending the JSON response to client javascript.
    return JsonResponse(profile_info, safe=False)



# Gives posts related to a particular profile.
def get_profile_posts(request, user_id):
    
    try:
        profile_user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return JsonResponse({"error": "User does not exist."}, status=400)

    # Filtering the posts by profile user.
    posts = Post.objects.filter(creator=profile_user)
    # Rearranging the posts in reverse cronological order.
    posts = posts.order_by("-post_timestamp").all()

    # Pagination Script
    paginator = Paginator(posts, 10)
    # Read the value of page variable in GET request. Request is made through javascript.
    page_number = request.GET.get('page')

    # if page_number in paginator.page_range :
    # Assimilate 10 posts related to that page number.
    page_obj = paginator.get_page(page_number)

    page_details_dict = {
        'has_prev': page_obj.has_previous(), 
        'prev_page_num': page_obj.previous_page_number() if page_obj.has_previous() else None,
        'has_next': page_obj.has_next(), 
        'next_page_num': page_obj.next_page_number() if page_obj.has_next() else None, 
        'total_pages': paginator.num_pages
    }

    return JsonResponse([page_details_dict, [post.serialize() for post in page_obj]], safe=False)



@login_required
def toggle_follow(request, user_id):

    # Toggle function must be executed by PUT request.
    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required."}, status=400)

    try:
        profile_user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        return JsonResponse({"error": "User does not exists."}, status=400)

    if(profile_user == request.user):
        return JsonResponse({"error": "User cannnot follow themselves. Can't be allowed."}, status=400)
        
    if(request.user in profile_user.followed_by.all()):
        # If already followed by user then unfolow
        profile_user.followed_by.remove(request.user)
        request.user.follows.remove(profile_user)

        profile_user.save()
        request.user.save()

        return JsonResponse({"message": "Request successful."}, status=201)

    else:
        # Add the user to your following list.
        profile_user.followed_by.add(request.user)
        request.user.follows.add(profile_user)

        profile_user.save()
        request.user.save()

        return JsonResponse({"message": "Request successful."}, status=201)


@login_required
def following_page(request):
    # Page to display posts by all the users who current user follows.
    return render(request, "network/following_page.html")


# Gives posts by all the users who current user follows.
@login_required
def get_following_posts(request):

    users = request.user.follows.all()

    posts = Post.objects.filter(creator__in=users)

    # Rearranging the posts in reverse cronological order.
    posts = posts.order_by("-post_timestamp").all()

    # Pagination Script
    paginator = Paginator(posts, 10)
    # Read the value of page variable in GET request. Request is made through javascript.
    page_number = request.GET.get('page')

    # if page_number in paginator.page_range :
    # Assimilate 10 posts related to that page number.
    page_obj = paginator.get_page(page_number)

    page_details_dict = {
        'has_prev': page_obj.has_previous(), 
        'prev_page_num': page_obj.previous_page_number() if page_obj.has_previous() else None,
        'has_next': page_obj.has_next(), 
        'next_page_num': page_obj.next_page_number() if page_obj.has_next() else None, 
        'total_pages': paginator.num_pages
    }

    return JsonResponse([page_details_dict, [post.serialize() for post in page_obj]], safe=False)


@login_required
def post_update(request):
    # post_update must be executed by PUT request.
    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required to make changes."}, status=400)


    # Extract the data from the request.
    data = json.loads(request.body)
    post_id = data.get("post_id")
    content = data.get("content")


    try:
        post = Post.objects.get(pk=post_id)
    except User.DoesNotExist:
        return JsonResponse({"error": "Post does not exist."}, status=400)

    ## Check if the post belongs to the current user.
    if(post.creator_id != request.user.pk):
        return JsonResponse({"error": "This user is not authorized for this task."}, status=400)

    # Check if empty post
    # Use regex to look for empty post :>> if re.match('^[0-9]*$', content):
    elif content == "":
        return JsonResponse({"error": "Post content can't be empty."}, status=400)

    post.content = content
    post.save()
    
    return JsonResponse({"message": "Update successful."}, status=201)





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
