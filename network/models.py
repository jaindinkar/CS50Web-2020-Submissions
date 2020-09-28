from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    # Extra user properties here.
    followed_by = models.ManyToManyField("User", related_name="my_followers")
    follows = models.ManyToManyField("User", related_name="i_follow")
    

# You will also need to add additional models to this file to represent 
# details about posts, likes, and followers. Remember that each time you 
# change anything in network/models.py, you’ll need to first run python 
# manage.py makemigrations and then python manage.py migrate to migrate 
# those changes to your database.

# Post model will come here:

class Post(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="my_posts")
    content = models.CharField(max_length=1000)
    post_timestamp = models.DateTimeField(auto_now_add=True)
    post_likes = models.IntegerField(default=0)


    def serialize(self):
        return {
            "creator": self.creator,
            "body": self.content,
            "timestamp": self.post_timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likes": self.post_likes
        }

    def __str__(self):
        return(f"Post Creator: {self.creator.username} \n timestamp: {self.post_timestamp} \n likes: {self.post_likes} \n body: {self.content}")
