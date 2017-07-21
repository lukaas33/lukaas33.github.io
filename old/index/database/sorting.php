<?php
// TODO sort using AJAX requests

// Global variables
$options = ["Newest", "Oldest", "Name", "Type"];
$next = null;

// Found out a solution to some parts of my problem at https://stackoverflow.com/questions/3489783/how-to-sort-rows-of-html-table-that-are-called-from-mysql
$_GET['sort'] = test_input($_GET['sort']); // Test input

if ($_GET['sort'] == null || array_search($_GET['sort'], $options) == false)
{
    $_GET['sort'] = $options[0]; // Default if invalid
}

function sortStr($string)
{
    // Return the row string to sort by
    if ($string == "Newest")
    {
        return "date_start DESC"; # Descending
    }
    else if ($string == "Oldest")
    {
        return "date_start ASC"; # Ascending
    }
    else if ($string == "Name")
    {
        return "title";
    }
    else if ($string == "Type")
    {
        return "type";
    }
}

function sorted()
{
    // Sets the new row to be switched to
     // Gobal variables
    global $options;
    global $next;

    $index = array_search($_GET['sort'], $options); // Index of the current
    if ($index < (count($options) - 1))
    {
        $index += 1;
    }
    else
    {
        $index = 0;
    }

    $next = $options[$index];
}
?>
