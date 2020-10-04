// Declaring Global variables:
var curr_user_id;

document.addEventListener('DOMContentLoaded', function() {

    // Retreiving variables from HTML code.
    // capturing the HTML element.
    let curr_user_id_div = document.querySelector('.var_user_id')

    // capturing data written in HTML element.
    // let curr_user_id = curr_user_id_div.innerHTML;
    // Setting a global variable.
    curr_user_id = curr_user_id_div.innerHTML;

    if (curr_user_id == ""){
        curr_user_id = null;
    }

    // Value check.
    console.log(`Current User ID = ${curr_user_id}`);

    // Fetch posts by profile user + Render them by creating HTML elements.
    loadFollowingPosts();

})


function loadFollowingPosts(page_no) {

    var request = "initialized."

    if(page_no == undefined){
        // Creating Request Object for fetch call. Initial
        request = new Request('/get_following_posts');
    }

    else {
        // Creating Request Object for fetch call. Subsequent.
        request = new Request(`/get_following_posts?page=${page_no}`);
    }


    // Making API call to get all posts by sending a GET Query '/get_all_posts'
    fetch(request)
    .then(response => response.json())
    .then(page_data => {

        // Value check.
        console.log(page_data);

        // Posts for the page are stacked at 1st index in page_data JSON object.
        posts = page_data[1];

        // Value check.
        console.log(posts);

        // Write code for displaying posts in posts division.

        // Clearing the main division to remove stale content.
        document.querySelector('.post-display-div').innerHTML = "";

        // Iterating over each post.
        posts.forEach(function(item, index, obj) {

            // Extracting the required properties from each mail object

            var post_id = obj[index].post_id;
            var post_creator_id = obj[index].creator_id;
            var post_creator_name = obj[index].creator;
            var post_body = obj[index].body;
            var post_timestamp = obj[index].timestamp;
            var post_like_count = obj[index].like_count;
            var post_is_liked = obj[index].is_liked;

            // Creating a divison for each mail object.
            const post_div = document.createElement('div');
            // Setting a class name for this division for further styling using CSS.
            post_div.className += "post-div";

            // Generating a link to profile.
            profile_link = "profile/" + post_creator_id;

            // Adding the HTML content in the division.
            post_div.innerHTML = `

                <div class="post-id-var-holder" id="${post_id}" style="display: none;">This division holds the value of post_id. Display = none.</div>
                <div class="post-creator-id-var-holder" id="${post_creator_id}" style="display: none;">This division holds the value of post_creator_id. Display = none.</div>

                <div class="post-creator"><a href="${profile_link}">${post_creator_name}</a></div>
                <div class="post-time">${post_timestamp}</div>

                <hr class="div-divider-1">

                <div class="post-content">${post_body}</div>

                <hr class="div-divider-2">

                <div class="post-like-div">

                    <svg width="30" height="20" viewBox="0 0 24 24" class="like-heart">

                        <path d="M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.58 4.646 2.73.814-1.148 2.354-2.73 4.645-2.73 2.88 0 5.404 2.69 5.404 5.755 0 6.376-7.454 13.11-10.037 13.157H12z"></path>

                    </svg>

                </div>

                <div class="post-like-count">${post_like_count}</div>
            `;

            // Preprocess the like button. Fill with red if already liked.
            if(post_is_liked) {
                post_div.querySelector('.like-heart').style.fill='red';
            }

            // Appending the divison in the element with ID emails-view.
            document.querySelector('.post-display-div').append(post_div);

        })


        // pagiantion_data for the page are stacked at 0th index in page_data JSON object.
        pagination_data = page_data[0];


        var has_prev = pagination_data.has_prev;
        var prev_page_num = pagination_data.prev_page_num;
        var has_next = pagination_data.has_next;
        var next_page_num = pagination_data.next_page_num;
        var total_pages = pagination_data.total_pages;

        
        // Rendering Pagination elements
        // Clearing the pagination-display-list to remove stale content.
        document.querySelector('.pagination-display-list').innerHTML = "";

        // Logic for Previous button for pagination.
        if(has_prev) {
            document.querySelector('.pagination-display-list').innerHTML += `<li class="page-item"><span class="page-link" onclick = "loadFollowingPosts(${prev_page_num})">Prev</span></li>`;
        }
        else {
            document.querySelector('.pagination-display-list').innerHTML += `<li class="page-item disabled"><span class="page-link" tabindex="-1" aria-disabled="true">Prev</span></li>`;
        }

        // Logic for links to individual pages.
        for (var i = 1; i <= total_pages; i++) {
            document.querySelector('.pagination-display-list').innerHTML += `<li class="page-item"><span class="page-link" onclick = "loadFollowingPosts(${i})">${i}</span></li>`
        }

        // Logic for Next button for pagination.
        if(has_next) {
            document.querySelector('.pagination-display-list').innerHTML += `<li class="page-item"><span class="page-link" onclick = "loadFollowingPosts(${next_page_num})">Next</span></li>`;
        }
        else {
            document.querySelector('.pagination-display-list').innerHTML += `<li class="page-item disabled"><span class="page-link" tabindex="-1" aria-disabled="true">Next</span></li>`;
        }


        // Like button event listener.
        ////// 1. Capturing all the like buttons on page.
        let likeButton = document.querySelectorAll('.like-heart');

        // Sanity check!
        console.log(`button object : ${likeButton[0]}`);

        ////// 2. Attaching an event listener to each button.
        likeButton.forEach(button => {
            button.addEventListener('click', toggleLike);
        })

    })

    // Scroll to the top for accessiblity.
    // window.scrollTo(0, 0);
    window.scrollTo({top: 0, behavior: 'smooth'});
}



function toggleLike(event) {
    
    // Surety check!
    // console.log('Executed: Like button clicked.');
    // console.log(event.target);

    // 1. Getting hold of various HTML divisions.
    ////// 1. Getting the like button element.
    var like_btn_element = event.target.parentNode;
    ////// 2. Getting hold of the parent post division of the like button.
    var post_divison = event.target.parentNode.parentNode.parentNode;
    /////////// Sanity Check--> post_divison.style.display = 'none';
    ////// 3. Division containing post_like_count.
    var post_lc_divison = post_divison.querySelector(".post-like-count");
    ////// 4. Hidden division containing post_id.
    var hid_pid_divison = post_divison.querySelector(".post-id-var-holder");
    ////// 5. Hidden division containing post_creator_id.
    var hid_pcid_divison = post_divison.querySelector(".post-creator-id-var-holder");
    



    // 2. Extracting IDs for verification.
    ////// 1. Extracting post_id.
    var post_id = hid_pid_divison.getAttribute("id");
    ////// 2. Extracting post_creator_id.
    var post_creator_id = hid_pcid_divison.getAttribute("id");
    ////// 3. Current user id (Global variable.)


    // 3. Variable value check
    ////// 1. Sanity check!
    // console.log(`Executed: edit button clicked for post_id : ${post_id}`);
    ////// 2. Value Check!
    // console.log(`post_divison object : ${post_divison}`);
    // console.log(`post_id : ${post_id}`);
    // console.log(`new_post_content : ${new_post_content}`);
    // console.log(`post_creator_id : ${post_creator_id}`);
    // console.log(`curr_user_id : ${curr_user_id}`);


    // 4. Content and ID verification on client side.
    ////// 1. User ID verification on client side. (Unauthenticated users can't like a post.)
    if(curr_user_id == null) {

        // Don't update the post on server.
        ////// 1. Log the error on console.
        console.log('This user is not authorised for this task. Login to like a post.');
        ////// 2. Do something if user is not logged in. (Redirect them to login page maybe.)
        // --
        // --
    }

    ////// 2. If all checks passed, update the post on server.
    else {

        // Steps for updating the content on server.
        
        // 1. Get the csrf token for the request
        const csrftoken = getCookie('csrftoken');

        // 2. Preparing HTTP header object and apending important HTTP header info with it.
        ////// ---> Info. Link : https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
        const requestHeaders = new Headers();
        requestHeaders.append('X-CSRFToken', csrftoken);

        // 3. Creating Request Object for fetch call. Headers go in there.
        const request = new Request('/toggle_like', {
            method: 'PUT',
            headers: requestHeaders,
            body: JSON.stringify({
                post_id: post_id
            })
        });

        // 4. Make a request using Fetch API with request object.
        fetch(request)
        // 5. Converting the response from server to a JSON object.
        .then(response => response.json())
        // 6. Acting on the result (JSON object). Product of above conversion.
        .then(result => {

            // Value check! --> Printing the result on console.
            console.log(result);

            // Desired response from server for successfull submission.
            if(result['message'] == "Update successful."){
                
                // If successfull submission.

                ////// 1. Change the fill property of like button.
                // if(like_btn_element.style.fill == 'none') {
                //     like_btn_element.style.fill = 'red';
                // }
                // else if(like_btn_element.style.fill == 'red') {
                //     like_btn_element.style.fill = 'none';
                // }
                if(result['is_liked'] == true) {
                    like_btn_element.style.fill = 'red';
                }
                else if(result['is_liked'] == false){
                    like_btn_element.style.fill = 'white';
                }
                ////// 3. Clearing post_like_count_division, removing stale data.
                post_lc_divison.innerHTML = "";
                ////// 4. Update post_like_count_division with new like count.
                post_lc_divison.innerHTML = result['like_count'];
                ////// 5. Log the status on console.
                console.log('Post successfully updated on server.');

            }
        })
        // 7. Acting on any errors generated while making/receiving the HTTP request.
        .catch(error => {

            // If error is returned.
            ////// 1. Log the error on console.
            console.log('Error', error);
            ////// 2. Log the status on console.
            console.log('Request not completed: Couldn\'t update post on server.');

        })

    }

}

// Function to retrieve selected cookie.
////// ---> Info Link : https://docs.djangoproject.com/en/3.1/ref/csrf/#ajax
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

