<?php
    function cLog($message)
    {
        // Allows for debugging in PHP without ruining page layout
        $string = "\"$message\""; // Needs to be passed with quotes in Javascript
        echo "<script> console.log($string); </script>";
    }

    function test_input($data)
    {
        // Copied from https://www.w3schools.com/php/php_form_validation.asp
        $data = trim($data);
        $data = stripslashes($data);
        $data = htmlspecialchars($data);
        return $data;
    }

    function strArray($string)
    {
        // Converts strings with array format to array
        $string = trim($string, ']'); $string = trim($string, '['); // Remove brackets
        $array = explode(",", $string); // Explodes into array at the commas
        for ($i = 0; $i < count($array); $i++)
        {
            $array[$i] = trim($array[$i], ' '); // Remove whitespace at the ends
        }
        return $array;
    }

    function url($string)
    {
        $string = $string = str_replace(' ', '-', strtolower($string));
        return $string;
    }
?>