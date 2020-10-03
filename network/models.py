from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    # Extra user properties here.
    followed_by = models.ManyToManyField("User", related_name="my_followers")
    follows = models.ManyToManyField("User", related_name="i_follow")
    # liked_posts = models.ManyToManyField("Post", related_name="my_likes")

class Post(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="my_posts")
    content = models.CharField(max_length=1000)
    post_timestamp = models.DateTimeField(auto_now_add=True)
    post_likes = models.IntegerField(default=0)


    def serialize(self):
        return {
            "post_id": self.id,
            "creator_id": self.creator.pk,
            "creator": self.creator.username,
            "body": self.content,
            "timestamp": self.post_timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likes": self.post_likes
        }

    def __str__(self):
        return(f"Post Creator: {self.creator.username} \n timestamp: {self.post_timestamp} \n likes: {self.post_likes} \n body: {self.content}")