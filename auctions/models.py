from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass
    
    
# Model for listing
class Listing(models.Model):

    # The first element in each tuple is the actual value to be set on the model, 
    # and the second element is the human-readable name.

    FASHION = 'FN'
    TOYS = 'TY'
    ANTIQUES = 'AT'
    COMPUTERS = 'CS'
    ACCESSORIES = 'AC'
    PERSONAL_CARE = 'PC'
    HOME_DECOR = 'HD'
    SPORTS = 'SP'

    CATEGORY_CHOICES = [
        (None, "---------"),
        (FASHION, "Fashion"), 
        (TOYS, "Toys"), 
        (ANTIQUES, "Antique"),
        (COMPUTERS, "Computers"),
        (ACCESSORIES,"Accessories"),
        (PERSONAL_CARE, "Personal Care"),
        (HOME_DECOR, "Home Decor"),
        (SPORTS, "Sports"),
    ]

    
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="my_listings")
    creation_date = models.DateField(auto_now=True) # Automatically adds date on creation of object.
    creation_time = models.TimeField(auto_now=True) # Automatically add the time of creation of object.
    listing_title = models.CharField(max_length=128)
    listing_description = models.TextField(max_length=1000)
    listing_image = models.URLField()
    listing_start_bid = models.FloatField()
    listing_is_active = models.BooleanField(default=True)
    listing_category = models.CharField(
        max_length = 2,
        choices = CATEGORY_CHOICES,
        default = COMPUTERS,
        blank = True,
    )

    watching = models.ManyToManyField(User, blank=True, related_name="watchlist")


    def __str__(self):
        return(f"Title: {self.listing_title} \nDate Created: {self.creation_date} \nCategory: {self.listing_category} \nDescription: {self.listing_description}")



# Model for comments made on listing
class Comment(models.Model):
    parent_listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="comments")
    commentator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="my_comments")
    comment_text = models.TextField(max_length=512)
    comment_time = models.TimeField(auto_now=True)
    comment_date = models.DateField(auto_now=True)

    def __str__(self):
        return(f"Parent Listing: {self.parent_listing.listing_title} \nCommentator: {self.commentator.username} \nComment: {self.comment_text}")
    

# Model for keeping track of the highest bid made on a listing
class Bid(models.Model):
    bid_item = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="last_bid")
    bid_amount = models.FloatField()
    bid_maker = models.ForeignKey(User, on_delete=models.CASCADE)
    bid_time = models.TimeField(auto_now=True)
    bid_date = models.DateField(auto_now=True)

    def __str__(self):
        return(f"Bid Item: {self.bid_item.listing_title} \nBid Maker: {self.bid_maker.username} \nBid Amount: {self.bid_amount}")

