// Declaring Global variables:

var curr_user_id;
var profile_user_id;


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


    // If from is loaded by django template in case if user is authenticated.
    if (document.querySelector('.create-post-form')) {

        // Set the following attributes to the form.
        document.querySelector('.create-post-form').onsubmit = function() {

            //Get the post parameters:
            const post_content = document.querySelector('.post-textarea').value;

            //Get the csrf token for the request
            const csrftoken = getCookie('csrftoken');

            // Creating HTTP header.
            const request = new Request(
                '/create_post',
                {headers: {'X-CSRFToken': csrftoken}}
            );

            // Send the data using API with HTTP header.
            fetch(request, {
                method: 'POST',
                body: JSON.stringify({
                    content: post_content
                    // 'csrfmiddlewaretoken': csrftoken,
                })
            })
            // Converting the response from server to JSON
            .then(response => response.json())
            // Printing the respose
            .then(result => {
                //Print Result on console
                console.log(result);

                if(result['message'] == "Post successful."){
                    // Clear the textarea after successful submission.
                    document.querySelector('.post-textarea').value = "";
                    // Reload all posts after successful form submission.
                    loadPosts();
                }
            })
            .catch(error => {
                console.log('Error', error);
            })

            // Prevent form to submit / reload or redirect to void URL's
            return false;
        }
    }

    // Load all posts after displaying the post form.
    loadPosts();


    // Conformity check!
    // Running this test will tell you about the scope of the document HTML elements handled by the
    // father function.
    // var all_doc_HTML = document.documentElement.innerHTML;
    // console.log(`Doc HTML : ${all_doc_HTML}`);

})



function loadPosts(page_no) {

    // Value accessiblity check.
    console.log(`Current User ID from load posts function = ${curr_user_id}`);

    var request = "initialized."

    if(page_no == undefined){
        // Creating Request Object for fetch call. Initial
        request = new Request('/get_all_posts');
    }

    else {
        // Creating Request Object for fetch call. Subsequent.
        request = new Request(`/get_all_posts?page=${page_no}`);
    }

    // Making API call to get all posts by sending a GET Query '/get_all_posts' // Pagination is also added.
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
            var post_likes = obj[index].likes;

            // Creating a divison for each mail object.
            const post_div = document.createElement('div');
            // Setting a class name for this division for further styling using CSS.
            post_div.className += "post-div";

            // Forming profile link.
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

                <div class="post-like-button">button</div>
                <div class="post-likes">${post_likes}</div>
            `;

            // Context for Edit post feature. (Button is only displayed if post belongs to current user.)
            if( post_creator_id == curr_user_id ){
                post_div.innerHTML += `<div class="edit-button">Edit</div>`;
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
            document.querySelector('.pagination-display-list').innerHTML += `<li class="page-item"><span class="page-link" onclick = "loadPosts(${prev_page_num})">Prev</span></li>`;
        }
        else {
            document.querySelector('.pagination-display-list').innerHTML += `<li class="page-item disabled"><span class="page-link" tabindex="-1" aria-disabled="true">Prev</span></li>`;
        }

        // Logic for links to individual pages.
        for (var i = 1; i <= total_pages; i++) {
            document.querySelector('.pagination-display-list').innerHTML += `<li class="page-item"><span class="page-link" onclick = "loadPosts(${i})">${i}</span></li>`
        }

        // Logic for Next button for pagination.
        if(has_next) {
            document.querySelector('.pagination-display-list').innerHTML += `<li class="page-item"><span class="page-link" onclick = "loadPosts(${next_page_num})">Next</span></li>`;
        }
        else {
            document.querySelector('.pagination-display-list').innerHTML += `<li class="page-item disabled"><span class="page-link" tabindex="-1" aria-disabled="true">Next</span></li>`;
        }


        // Edit button event listener (Should be executed sequentially after loading all posts).

        // Place this code where you update your document with new divisions. Any where else the document 
        // model is not updated, attachment won't happen. Check it by sanity check below. And to conform
        // use Conformity check on the calling function.

        // Best resources on event handlers:
        ////// ----> (Best.) Link: https://www.freecodecamp.org/news/event-handling-in-javascript-with-examples-f6bc1e2fff57/
        ////// ----> (Resourceful.) Link: https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events
        ////// ----> (Informative.) Link: https://idratherbewriting.com/events-and-listeners-javascript/
        ////// ----> (Informative.) Link: https://www.w3schools.com/jsref/dom_obj_all.asp

        let editButton = document.querySelectorAll('.edit-button');

        // Sanity check!
        // console.log(`button object : ${editButton[0]}`);

        // Adding an event listener to each of the rendered edit-button.
        editButton.forEach(button => {
            button.addEventListener('click', initEdit);
        })

    })

    // Scroll to the top for accessiblity.
    window.scrollTo({top: 0, behavior: 'smooth'});

}



function initEdit(event){

    // Surety check!
    // console.log('Executed: edit button clicked.');

    // 1. Getting hold of various HTML divisions.
    ////// 1. Getting hold of the parent post division of the edit button.
    var post_divison = event.target.parentNode;
    ////// 2. Post-content division.
    var post_content_divison = post_divison.querySelector(".post-content");

    // 2. Extracting current post content from the post content division.
    var curr_post_content = post_content_divison.innerHTML;


    // 3. Variable value check
    ////// 1. Sanity check!
    // console.log(`Executed: edit button clicked for post_id : ${post_id}`);

    ////// 2. Value Check!
    // console.log(`post_divison object : ${post_divison}`);
    // console.log(`post_id : ${post_id}`);
    // console.log(`new_post_content : ${new_post_content}`);
    // console.log(`post_creator_id : ${post_creator_id}`);
    // console.log(`curr_user_id : ${curr_user_id}`);


    // 4. Creating a destroyable HTML textarea element for editing posts.
    ////// 1. Creatign a textarea element.
    var post_edit_area = document.createElement("TEXTAREA");
    ////// 2. Setting a class name for this element (styling code is written in CSS.) 
    post_edit_area.className += "edit-content";
    ////// 3. Prefilling the textarea with post content.
    post_edit_area.value = `${curr_post_content}`;


    // 5. Hiding post content division by changing it's display property.
    post_content_divison.style.display = 'none';

    // 6. Apending the textarea after the hidden post-content division.
    ////// ---> Info. Link : https://stackoverflow.com/questions/4793604/how-to-insert-an-element-after-another-element-in-javascript-without-using-a-lib
    post_content_divison.parentNode.insertBefore(post_edit_area, post_content_divison.nextSibling);

    // 7. Changing the Edit-button text to Save.
    event.target.innerHTML = 'Save';

    // 8. Interchanging the event listeners.
    event.target.removeEventListener("click", initEdit);
    event.target.addEventListener("click", saveEdit);

}


function saveEdit(event){

    // Surety check!
    // console.log('Executed: edit button clicked.');

    // 1. Getting hold of various HTML divisions.
    ////// 1. Getting hold of the parent post division of the edit button.
    var post_divison = event.target.parentNode;
    ////// 2. Post-content division.
    var post_content_divison = post_divison.querySelector(".post-content");
    ////// 3. new content holding textarea element.
    var textarea_element = post_divison.querySelector(".edit-content");
    ////// 4. Hidden division containing post_id.
    var hid_pid_divison = post_divison.querySelector(".post-id-var-holder");
    ////// 5. Hidden division containing post_creator_id.
    var hid_pcid_divison = post_divison.querySelector(".post-creator-id-var-holder");


    // 2. Extracting the new and old post content.
    ////// 1. Extracting old content from the content division.
    var old_post_content = post_content_divison.innerHTML;
    ////// 2. Extracting new content from the textarea. (Dynamic object: Destroyed after process ends.)
    var new_post_content = textarea_element.value;


    // 3. Extracting IDs for verification.
    ////// 1. Extracting post_id.
    var post_id = hid_pid_divison.getAttribute("id");
    ////// 2. Extracting post_creator_id.
    var post_creator_id = hid_pcid_divison.getAttribute("id");
    ////// 3. Current user id (Global variable.)


    // 4. Variable value check
    ////// 1. Sanity check!
    // console.log(`Executed: edit button clicked for post_id : ${post_id}`);

    ////// 2. Value Check!
    // console.log(`post_divison object : ${post_divison}`);
    // console.log(`post_id : ${post_id}`);
    // console.log(`new_post_content : ${new_post_content}`);
    // console.log(`post_creator_id : ${post_creator_id}`);
    // console.log(`curr_user_id : ${curr_user_id}`);

    // 5. Content and ID verification on client side.
    ////// 1. User ID verification on client side.
    if( post_creator_id != curr_user_id) {

        // Don't update the post on server.
        ////// 1. Destroy the textarea.
        textarea_element.remove();

        ////// 2. display original post content. (no update done.) Displaying it again by changing it's display property to initial(default).
        post_content_divison.style.display = 'initial';

        ////// 3. Changing the Edit-button text to Edit again.
        event.target.innerHTML = 'Edit';

        ////// 4. Interchanging the event listeners.
        event.target.removeEventListener("click", saveEdit);
        event.target.addEventListener("click", initEdit);

        ////// 5. Log the error on console.
        console.log('This user is not authorised for this task.');
    }

    ////// 2. Edit verification. (No update if post is not edited.)
    else if(new_post_content ==  old_post_content) {

        // Don't update the post on server.
        ////// 1. Destroy the textarea.
        textarea_element.remove();

        ////// 2. display original post content. (no update done.) Displaying it again by changing it's display property to initial(default).
        post_content_divison.style.display = 'initial';

        ////// 3. Changing the Edit-button text to Edit again.
        event.target.innerHTML = 'Edit';

        ////// 4. Interchanging the event listeners.
        event.target.removeEventListener("click", saveEdit);
        event.target.addEventListener("click", initEdit);

        ////// 5. Log the error on console.
        console.log('No edits were made.');

    }

    ////// 3. Blank edit verification. (No update if edited post is blank.)(Can use regex here to identify whitespaces and carriage return.)
    else if(new_post_content ==  "") {

        // Don't update the post on server.
        ////// 1. Destroy the textarea.
        textarea_element.remove();

        ////// 2. Display original post content. (no update done.) Displaying it again by changing it's display property to initial(default).
        post_content_divison.style.display = 'initial';

        ////// 3. Changing the Edit-button text to Edit again.
        event.target.innerHTML = 'Edit';

        ////// 4. Interchanging the event listeners.
        event.target.removeEventListener("click", saveEdit);
        event.target.addEventListener("click", initEdit);

        ////// 5. Log the error on console.
        console.log('Content cannot be blank!!');

    }

    ////// 4. If all checks passed update the post on server.
    else {

        // Steps for updating the content on server.
        
        // 1. Get the csrf token for the request
        const csrftoken = getCookie('csrftoken');

        // 2. Preparing HTTP header object and apending important HTTP header info with it.
        ////// ---> Info. Link : https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
        const requestHeaders = new Headers();
        requestHeaders.append('X-CSRFToken', csrftoken);

        // 3. Creating Request Object for fetch call. Headers go in there.
        const request = new Request('/post_update', {
            method: 'PUT',
            headers: requestHeaders,
            body: JSON.stringify({
                post_id: post_id,
                content: new_post_content
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

                ////// 1. Destroy the textarea
                textarea_element.remove();

                ////// 2. Update post_content_division with new content.
                post_content_divison.innerHTML = new_post_content;

                ////// 3. Display the division again by changing it's display property to initial(default). Previously: hidden.
                post_content_divison.style.display = 'initial';

                ////// 4. Changing the Edit-button text to Edit again.
                event.target.innerHTML = 'Edit';

                ////// 5. Interchanging the event listeners. 
                event.target.removeEventListener("click", saveEdit);
                event.target.addEventListener("click", initEdit);

                ////// 6. Log the status on console.
                console.log('Post successfully updated on server.');

            }
        })
        // 7. Acting on any errors generated while making/receiving the HTTP request.
        .catch(error => {

            // If error is returned.
            ////// 1. Log the error on console.
            console.log('Error', error);

            ////// 2. Destroy the textarea.
            textarea_element.remove();

            ////// 3. Display original post content. (no update done.) Displaying it again by changing it's display property to initial(default).
            post_content_divison.style.display = 'initial';

            ////// 4. Changing the Edit-button text to Edit again.
            event.target.innerHTML = 'Edit';

            ////// 5. Interchanging the event listeners.
            event.target.removeEventListener("click", saveEdit);
            event.target.addEventListener("click", initEdit);

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


// Test scripts

// Pagination link rendering methods tried.

    // M1
    // `${has_previous ? '<li class="page-item"><a class="page-link" href="?page={{ page_obj.previous_page_number }}">Prev</a></li>' : 'color 5 does not exist!'}`

    // M2
    // IIFE (immediately invoked function expression)
    // https://stackoverflow.com/questions/44488434/inserting-if-statement-inside-es6-template-literal
    // document.querySelector('.pagination-display-list').innerHTML = `
    //     ${(() => {

    //         if(has_previous) {
    //             return `<li class="page-item"><a class="page-link" href="?page=${previous_page_number}">Prev</a></li>`
    //         }
    //         else {
    //             return `<li class="page-item disabled"><a class="page-link" href="#" tabindex="-1" aria-disabled="true">Prev</a></li>`
    //         }

    //     })}


    //     ${(() => {

    //         }

    //     })}


    //     ${(() => {

    //         if(has_next) {
    //             return `<li class="page-item"><a class="page-link" href="?page=${next_page_number}">Next</a></li>`
    //         }
    //         else {
    //             return `<li class="page-item disabled"><a class="page-link" href="#" tabindex="-1" aria-disabled="true">Next</a></li>`
    //         }


    //     })}

    // `;


// Window scroll method tried
    //M1
    // const scrollToTop = () => {
    //     const c = document.documentElement.scrollTop || document.body.scrollTop;
    //     if (c > 0) {
    //         window.requestAnimationFrame(scrollToTop);
    //         window.scrollTo(0, c - c / 8);
    //     }
    // };
    // scrollToTop();

    //M2
    // window.scrollTo(0, 0);