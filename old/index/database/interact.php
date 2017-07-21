<?php
function enterData()
{
    // Enters and updates data in database
    global $conn;  // Is declared outside the functon

    include "entries.php";  // PHP that contains all data

    foreach ($table as $name => $entry)
    {
        // Loops through tables

        if ($conn->query("SHOW TABLES LIKE '$name'")->num_rows == 0) // Checks if the table doesn't already exist
        {
            $sql = $entry;

            // Checks if creation was succesful
            if ($conn->query($sql) === false)
            {
                cLog("Error creating table: " . $conn->error);
            }
        }
    }


    foreach ($entries as $tablename => $array)
    {
        // Loops through all entries
        $row = 0;
        foreach ($array as $entry)
        {
            /*
            // I already made this
            $row++; // Current row
            $sql = "DELETE FROM $tablename WHERE id=$row";

            if ($conn->query($sql) === false)
            {
            cLog("Error removing entry <br/>" . $conn->error);
            }
            */

            $sql = $entry; // Enter data Removing data is done by the statement itself

            if ($conn->query($sql) === false)  // Checks if the creation was succesful
            {
                cLog("Error: " . $sql . "<br/>" . $conn->error);
            }
        }
    }
}


function getData($table, $sort = 'id', $target = '*')
{
    // Gets data from table and returns it as array
    global $conn;  // Is declared outside the functon
    $result = $conn->query("SELECT $target FROM $table ORDER BY $sort");  // Selects data


    if ($result->num_rows > 0 )  // Checks if it returns something
    {
        // Return data
        $data = array();
        while ($row = $result->fetch_assoc())
        {
            array_push($data, $row);
        }
        return $data;
    }
    else
    {
        cLog("zero results");
    }
}
?>
