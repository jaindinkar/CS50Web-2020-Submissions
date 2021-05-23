from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse


from .models import User, Listing, Bid, Comment
from .forms import NewListingForm, BidForm, CommentForm
from django.contrib.auth.decorators import login_required



def index(request):

    active_listings_dictonary = {}
    inactive_listings_dictonary = {}

    active_listings = Listing.objects.filter(listing_is_active = True)
    inactive_listings = Listing.objects.filter(listing_is_active = False)

    for listing in active_listings:
        try:
            # if bid exists for this lisitng
            bid_obj = Bid.objects.get(bid_item=listing)
            current_bid_price = bid_obj.bid_amount
        
        except:
            current_bid_price = listing.listing_start_bid

        active_listings_dictonary[listing] = current_bid_price


    for listing in inactive_listings:
        try:
            # if bid exists for this lisitng
            bid_obj = Bid.objects.get(bid_item=listing)
            current_bid_price = bid_obj.bid_amount
        
        except:
            current_bid_price = listing.listing_start_bid

        inactive_listings_dictonary[listing] = current_bid_price



    return render(request, "auctions/index.html", { 
        "activeListingsDictonary": active_listings_dictonary,
        "inactiveListingsDictonary": inactive_listings_dictonary
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
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")


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
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")



# Ref: https://docs.djangoproject.com/en/3.0/topics/auth/default/#the-login-required-decorator
@login_required
def create_listing(request):
    if request.method == "POST":
        form = NewListingForm(request.POST)
        if form.is_valid():
            title = form.cleaned_data["title"]
            description = form.cleaned_data["description"]
            image = form.cleaned_data["image"]
            category = form.cleaned_data["category"]
            start_bid = form.cleaned_data["start_bid"]
            # Extract other fields.[DONE]
            # Add data to the model.
            newListing = Listing(
                creator=request.user, 
                listing_title=title, 
                listing_description=description, 
                listing_image=image, 
                listing_start_bid=start_bid, 
                listing_category=category
            )

            newListing.save()

            return render(request, "auctions/create_listing.html", {
                'form': NewListingForm(),
                'message': "Listing Successfully Added"
            })
        else:
            return render(request, "auctions/create_listing.html", {
                'form': form,
                'message': "Invalid Entry, try again"
            })

    else:
        return render(request, "auctions/create_listing.html", {
            # pass a self checking form here. to check the data client side
            'form': NewListingForm()
        })



def listing_page(request, listing_id, message=False, message_tone="neutral"):

    if(message == None or message == "#"):
        message = False

    # Default meggage color
    message_color = False

    if(message):
        if(message_tone == "negative"):
            message_color = "red"
        elif(message_tone == "positive"):
            message_color = "green"
        elif(message_tone == "neutral"):
            message_color = "black"
    
    try:
        # Getting hold of corresponding Listing Object
        listing = Listing.objects.get(pk=listing_id)

        try:
            # if bid exists for this lisitng
            bid_obj = Bid.objects.get(bid_item=listing)
            current_bid_price = bid_obj.bid_amount
            current_winning_bidder = bid_obj.bid_maker.username
        
        except:
            current_bid_price = listing.listing_start_bid
            current_winning_bidder = listing.creator.username

        is_authenticated = False

        is_watching = False

        is_creator = False

        # Wheather user is logged in.
        if(request.user.is_authenticated):
            is_authenticated = True

            # Weather user is watching this listing
            if(request.user in listing.watching.all()):
                is_watching = True 

            # Weather user is the creator of this listing
            if(request.user == listing.creator):
                is_creator = True


        return render(request, "auctions/listing_details.html", {
            'listing': listing,
            'is_authenticated': is_authenticated,
            'is_watching': is_watching,
            'is_creator': is_creator,
            'bidForm': BidForm(),
            'current_bid_price': current_bid_price,
            'current_winning_bidder': current_winning_bidder,
            'comments': listing.comments.all(),
            'commentForm': CommentForm(),
            'message': message,
            'messageColor': message_color
        })
        
    except Listing.DoesNotExist:
        return render(request, "auctions/error_page.html", {
            'message': "The listing you are looking for Does Not Exist."
        })



@login_required
def watchlist(request):
    # Get all the items in the current user's watchlist
    # using the related name from the model(watchlist - manytomanyfield)
    watchlist = request.user.watchlist.all()
    return render(request, "auctions/watchlist.html",{
        'watchlist': watchlist
    })



@login_required
def add_to_watchlist(request, listing_id):
    if request.method =="POST":
        listing = Listing.objects.get(pk=listing_id)
        listing.watching.add(request.user)
        # request.user.watchlist.add(listing)
        return HttpResponseRedirect(reverse("watchlist"))


@login_required
def remove_from_watchlist(request, listing_id):
    if request.method =="POST":
        listing = Listing.objects.get(pk=listing_id)
        listing.watching.remove(request.user)
        # request.user.watchlist.delete(listing)
        return HttpResponseRedirect(reverse("watchlist"))


@login_required
def bid(request, listing_id):

    if request.method =="POST":
        listing = Listing.objects.get(pk=listing_id)
        form = BidForm(request.POST)

        if listing.listing_is_active:
            if form.is_valid():

                # Extracting bid value out of form
                bid_val = form.cleaned_data["bid_amount"]

                # Treating the subsequent bids.
                try:
                    # Extracting bid object corresponding to the listing query.
                    bid_obj = Bid.objects.get(bid_item=listing)

                    # Passed bid amount should be greater than the current bid.
                    if(bid_val > bid_obj.bid_amount):

                        # Method-2 Saving the database field [Works]
                        bid_obj.bid_amount = bid_val
                        bid_obj.bid_maker = request.user
                        bid_obj.save()

                        message = "Bid Successful"
                        message_tone="positive"
                        return HttpResponseRedirect(reverse("listing_page", args=(listing_id, message, message_tone,))) 
                    
                    else:
                        message = "Bid amount should be greater than current bid."
                        message_tone="negative"
                        return HttpResponseRedirect(reverse("listing_page", args=(listing_id, message, message_tone,)))
                

                # Treating First bid.
                except:
                    # Passed bid amount should be greater than listing start bid.
                    if(bid_val > listing.listing_start_bid):
                        # Creating first bid object against the listing.
                        firstBid = Bid(bid_item=listing, bid_amount=bid_val, bid_maker=request.user)
                        firstBid.save()
                        message = "Bid Successful"
                        message_tone="positive"
                        return HttpResponseRedirect(reverse("listing_page", args=(listing_id, message, message_tone,)))

                    else:
                        message = "Bid amount should be greater than current bid."
                        message_tone="negative"
                        return HttpResponseRedirect(reverse("listing_page", args=(listing_id, message, message_tone,)))

            else:
                message = "Invalid Entry, Enter your bid amount in decimal numbers."
                message_tone="negative"
                return HttpResponseRedirect(reverse("listing_page", args=(listing_id, message, message_tone,)))
        else:
            message = "This listing is sold. No further bids allowed."
            message_tone="negative"
            return HttpResponseRedirect(reverse("listing_page", args=(listing_id, message, message_tone,)))



@login_required
def comment(request, listing_id):
    if request.method == "POST":
        listing = Listing.objects.get(pk=listing_id)
        form = CommentForm(request.POST)

        if form.is_valid():
            comment_string = form.cleaned_data["comment_text"]
            comment = Comment(parent_listing=listing, comment_text=comment_string, commentator=request.user)
            comment.save()
            return HttpResponseRedirect(reverse("listing_page", args=(listing_id,))) # "Comment Successful"



@login_required
def close_listing(request, listing_id):
    if request.method == "POST":

        try:
            # Extracting bid object corresponding to the listing query.
            listing = Listing.objects.get(pk=listing_id)
            listing.listing_is_active = False
            listing.save()
            return HttpResponseRedirect(reverse("listing_page", args=(listing_id,))) # "Successfully Closed"

        except:
            return render(request, "auctions/error_page.html", {
            'message': "The listing you are looking for Does Not Exist."
        })



def categories(request, category_text):
    if request.method == "POST":

        for choice in Listing.CATEGORY_CHOICES:
            if choice[1] == category_text:
                category_id = choice[0]
                category_listings = Listing.objects.filter(listing_category = category_id, listing_is_active = True)
        
        return render(request, "auctions/category_listings_page.html", {
            'listings': category_listings,
            'bids': Bid.objects.all(),
            'categoryText': category_text
        })

    else:
        categories = []
        for choice in Listing.CATEGORY_CHOICES:
            if(choice[0] != None):
                categories.append(choice[1])

        return render(request, "auctions/category_page.html", {
            'categories': categories
        })

