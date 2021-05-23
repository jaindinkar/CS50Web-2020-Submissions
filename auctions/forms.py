# from django.utils.translation import gettext_lazy as _
# from django.forms import ModelForm, Textarea

from .models import Listing

from django import forms
from django.forms import Textarea


class NewListingForm(forms.Form):
	title = forms.CharField(label=False, max_length=128, required=True, widget=forms.TextInput(
		attrs={
			'class': 'container new-listing-form',
			'placeholder': 'Listing Title'
		}
	))


	description = forms.CharField(label=False, max_length=512, widget=forms.Textarea(
		attrs={
			'class': 'container new-listing-form',
			'placeholder': 'Description'
		}
	))


	image = forms.URLField(label=False, widget=forms.URLInput(
		attrs={
			'class': 'container new-listing-form',
			'placeholder': 'Image URL'
		}
	))


	category = forms.ChoiceField(label=False, choices=Listing.CATEGORY_CHOICES, required=True, widget=forms.Select(
		attrs={
			'class': 'container new-listing-form',
			'placeholder': 'Category' # Dosen't work on ChoiceField
		}
	))


	start_bid = forms.FloatField(label=False, required=True, widget=forms.NumberInput(
		attrs={
			'class': 'container new-listing-form',
			'placeholder': 'Start Bid'
		}
	))



class BidForm(forms.Form):
	bid_amount = forms.FloatField(label='Your Bid:' ,required=True)



class CommentForm(forms.Form):
	comment_text = forms.CharField(label=False, max_length=512, required=True, widget=forms.Textarea(
		attrs={
			'class': 'container',
			'placeholder': 'Write a comment..'
		}
	))




# Tried model form. Failed.
# class NewListingForm(ModelForm):
#     class Meta:
#         model = Listing
#         fields = ['listing_title', 'listing_description', 'listing_image', 'listing_category', 'listing_start_bid']
#         widgets = {
#         	'listing_description': Textarea(attrs={'cols': 80, 'rows': 20}),
#         }
#         labels = {
#         	'listing_title': _('Title'),
#         	'listing_description': _('Describe your Product'),
#         	'listing_image': _('Add Image URL'),
#         	'listing_category': _('Choose Item Category'),
#         	'listing_start_bid': _('Enter Bid Price'),
#         }
