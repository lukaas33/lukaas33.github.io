<?php
require "functions.php"; // This file is seperate of the others Functions need to be seperately included

// Global variables
$name = $email = $message = null;
$target = "lucasvanosenbruggen@gmail.com";

if ($_SERVER["REQUEST_METHOD"] == "POST")
{
    // Checks if post has been requested and if data is entered
    if (empty($_POST["name"]))
    {
        // TODO error handeling in empty cases
    }
    else
    {

        if (preg_match("/^[a-zA-Z ]*$/", $_POST["name"])) // Source https://www.w3schools.com/php/php_form_url_email.asp
        {
            $name = test_input($_POST["name"]);
        }
        else
        {
        }
    }

    if (empty($_POST["email"]))
    {
    }
    else
    {
        if (filter_var($_POST["email"], FILTER_VALIDATE_EMAIL)) // Source https://www.w3schools.com/php/php_form_url_email.asp
        {
            $email = test_input($_POST["email"]);
        }
        else
        {
        }
    }

    if (empty($_POST["message"]))
    {
    }
    else
    {
        $message = test_input($_POST["message"]);
    }
}

mail(
    // Sends the email
    $target,
    "$name sent you a message",
    "$message",
    "From: $email"
 );

header('Location: ../index.php'); // Redirect to main page
?>
