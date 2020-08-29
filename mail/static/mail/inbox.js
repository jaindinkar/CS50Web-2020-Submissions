document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);

    // By default, load the inbox
    load_mailbox('inbox');
});

function compose_email() {

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    // Clear out composition fields
    // I personally don't think that it is necessary. I tried commenting and running the code
    // the fields clear themselves automatically.
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';

    // Add your send mail code here

    // Get the form data and send it using API when user submits the form.
    document.querySelector('form').onsubmit = function() {

        //Get email parameters.
        const recipients_email_list = document.querySelector('#compose-recipients').value;
        const subject_text = document.querySelector('#compose-subject').value;
        const mail_body = document.querySelector('#compose-body').value;

        // Send the data using the given API
        fetch('/emails', {
            method: 'POST',
            body: JSON.stringify({
                recipients: recipients_email_list,
                subject: subject_text,
                body: mail_body
            })
        })
        // Converting the response to JSON
        .then(response => response.json())
        // Printing the JSON response 
        .then(result => {
            // Print result
            console.log(result);
            // Approach-4 Checking if the mail is properly sent (Working)
            if(result['message'] == "Email sent successfully."){
                // Load the sent page if message is delivered successfully.
                load_mailbox('sent');
            }
        })
        // Logging the Errors if any. 
        .catch(error => {
            console.log('Error', error);
        });

        // // Approach-1 Checking if the mail is properly sent (Not Working)
        // if(result.message){
        //     // Load the sent page if message is delivered successfully.
        //     load_mailbox('sent');
        // }

        // // Approach-2 Checking if the mail is properly sent (Not Working)
        // var obj = JSON.parse(result, function(key, value) {
        //     if (key == "message") {
        //         return load_mailbox('sent');
        //     }
        // })

        // // Approach-3 Checking if the mail is properly sent (Not Working)
        // if(result['message'] !== undefined){
        //     // Load the sent page if message is delivered successfully.
        //     load_mailbox('sent');
        // }

        // Above approaches do not work as the result variable is not in the domain.

        //Prevent default submission (Important!! Otherwise the message won't log on your chrome.)
        return false;

    }

}

function load_mailbox(mailbox) {
  
    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;


    // Add your mailbox viewing code here:

    // Making API call to gather the emails by sending a GET Query '/emails/inbox'
    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
        //Print emails
        console.log(emails);

        // Display gathered mails in the given manner.
    });
}