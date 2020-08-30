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

        // Write code for displaying your mails in mailbox.

        // Each divison shoud display: sender's name, subject line and timestamp.
        // Unread = white background , Read = gray background.
        
        // JSON Data would be indexed like this. 
        // 0: {
        // "id": 95,
        // "sender": "baz@example.com",
        // "recipients": ["bar@example.com"],
        // "subject": "Meeting Tomorrow",
        // "body": "What time are we meeting?",
        // "timestamp": "Jan 1 2020, 12:00 AM",
        // "read": true,
        // "archived": false
        // }

        // Iterating through each mail object using mail index.
        // https://stackoverflow.com/questions/19323699/iterating-through-json-object-javascript
        for(var mail_index in emails) {

            // Extracting the required properties from each mail object
            if(emails.hasOwnProperty(mail_index)) {
                var email_sender = emails[mail_index].sender;
                var email_subject = emails[mail_index].subject;
                var email_timestamp = emails[mail_index].timestamp;
                var email_isRead = emails[mail_index].read;

                // Creating a divison for each mail object.
                const mail_sub_div = document.createElement('div');

                // Adding the HTML content in the division.
                mail_sub_div.innerHTML = `

                    <h2>From: ${email_sender}</h2> 
                    <h4>Subject: ${email_subject}</h4>
                    <p>Time: ${email_timestamp}</p>

                `;

                // Setting the background color of the division using the read property of mail object.
                if(email_isRead){
                    // https://www.w3schools.com/JSREF/prop_style_backgroundcolor.asp
                    // mail_sub_div.style.background = "color image repeat attachment position size origin clip|initial|inherit";
                    mail_sub_div.style.background = "#ededed";
                }
                else {
                    mail_sub_div.style.background = "#ffffff";
                }

                // Setting a class name for this division for further styling using CSS.
                mail_sub_div.className = "mail-sub-div-style";

                // Appending the divison in the element with ID emails-view.
                document.querySelector('#emails-view').append(mail_sub_div);
            }
        }
    });
}