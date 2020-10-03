document.addEventListener('DOMContentLoaded', function() {

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
            var post_creator = obj[index].creator;
            var post_body = obj[index].body;
            var post_timestamp = obj[index].timestamp;
            var post_likes = obj[index].likes;

            // Creating a divison for each mail object.
            const post_div = document.createElement('div');
            // Setting a class name for this division for further styling using CSS.
            post_div.className += "post-div";

            // Generating a link to profile.
            profile_link = "profile/" + post_creator_id;

            // Adding the HTML content in the division.
            post_div.innerHTML = `

                <div class="post-creator"><a href="${profile_link}">${post_creator}</a></div>
                <div class="post-time">${post_timestamp}</div>

                <hr class="div-divider-1">

                <div class="post-content">${post_body}</div>

                <hr class="div-divider-2">

                <div class="post-like-button">button</div>
                <div class="post-likes">${post_likes}</div>
            `;

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

    })

    // Scroll to the top for accessiblity.
    // window.scrollTo(0, 0);
    window.scrollTo({top: 0, behavior: 'smooth'});
}