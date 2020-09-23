from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass


# You will also need to add additional models to this file to represent 
# details about posts, likes, and followers. Remember that each time you 
# change anything in network/models.py, you’ll need to first run python 
# manage.py makemigrations and then python manage.py migrate to migrate 
# those changes to your database.

