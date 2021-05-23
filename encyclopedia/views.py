from django.shortcuts import render

from django.http import HttpResponseRedirect, HttpResponse

from django.urls import reverse

from . import util

import markdown2


# import re

# To generate random numbers for random page jump
from random import randint



def index(request):
    return render(request, "encyclopedia/index.html", {
        "entries": util.list_entries()
    })


def entry_page(request, title):
	entry = util.get_entry(title)
	if(entry):
		return(render(request, "encyclopedia/entry_page.html",{
				"info": markdown2.markdown(entry),
				"title": title
				# This is a comma seperated list, take care
			}))
	else:
		return(render(request, "encyclopedia/error_page.html", {
				"title": title
			}))



def search(request):
	# Only accepting the post request
	if(request.method == "POST"):

		# Getting the search String
		search_string = request.POST["query"]

		# Gettting all the entries
		entries = util.list_entries()

		# If search string directly matches the pre-defined entry redirect page to the entry page
		if(search_string in entries):
			return(HttpResponseRedirect(reverse("encyclopedia:entry_page", args=(search_string,))))
		
		# search string not match any pre-defined string:	
		else:
			# Getting the sub strings:
			matching_entries = [i for i in entries if search_string in i]
			
			# Rendering the search page.
			return render(request, "encyclopedia/search_page.html", {
				"matching_entries": matching_entries
				})

def create(request):
	if(request.method == "POST"):
		# Add new page
		title = request.POST["title"]
		content = request.POST["content"]
		entries = util.list_entries()

		# entry = "Title : " + title + " Content : " + content

		# return HttpResponse(entry)
		# If title already exists: Generate Error
		if(title in entries):
			error = True
			return render(request, "encyclopedia/create_new_page.html", { 
				"old_content": content,
				"error": error,
				"old_title": title
			})

		# If every thing good create a new entry and redirect to new page entry again.
		else:
			success = True
			util.save_entry(title, content)
			return HttpResponseRedirect(reverse("encyclopedia:entry_page", args=(title,)))
			# return render(request, "encyclopedia/create_new_page.html", {
			# 	"success": success,
			# 	"title": title
			# })

	
	# Else request method is GET
	else:
		# Create new page Redirect to that page.
		return render(request, "encyclopedia/create_new_page.html")


def edit(request, title):
	# if request method is POST : After submitting the form with edited content
	if(request.method == "POST"):
		new_content = request.POST["new_content"]
		util.save_entry(title, new_content)
		return HttpResponseRedirect(reverse("encyclopedia:entry_page", args=(title,)))

	# Else request method is GET : Link Redirect form edit Page.
	else:
		content = util.get_entry(title)

		return render(request, "encyclopedia/edit_entry_page.html", {
			"title": title,
			"current_content": content
		})

def random(request):
	entries = util.list_entries()
	title = entries[randint(0, len(entries) - 1)]
	return HttpResponseRedirect(reverse("encyclopedia:entry_page", args=(title,)))
