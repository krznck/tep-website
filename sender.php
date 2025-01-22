<?php
// Get the form data
$name = $_POST['name'];
$email = $_POST['email'];
$message = $_POST['message'];

// Set the recipient email address
$to = "@gmail.com";

// Set the email subject
$subject = "New message from $name. Message from website form received.";

// Set the email message
$body = "Name: $name\nEmail: $email\nMessage: $message";

// Send the email
if(mail($to, $subject, $body)) {
  // If the email was sent successfully, redirect to a thank you page
  header("Location: ./thankYou/thank_you.html");
  exit;
} else {
  // If the email could not be sent, display an error message
  echo "There was an error sending the email.";
}
?>
