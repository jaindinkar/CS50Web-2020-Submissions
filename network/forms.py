from .models import Post

from django import forms
from django.forms import Textarea

class NewPostForm(forms.Form):
	content = forms.CharField(label=False, max_length=1000, required=True, widget=forms.Textarea(

		attrs={
			'class': 'post-textarea',
			'placeholder': 'What\'s on your mind??'
		}

	))