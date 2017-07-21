<?php
    $servername = "mysql.hostinger.nl";
    $username = "u945519163_lucas";
    $dbname = "u945519163_db";
    $password = "password";


    $conn = new mysqli($servername, $username, $password, $dbname); // Create connection with database

    if ($conn->connect_error) // Check connection
    {
        die("Connection failed: " . $conn->connect_error);
    }
    else
    {
        cLog("Connection succesful");
    }
?>
