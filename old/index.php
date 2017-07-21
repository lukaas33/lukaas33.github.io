<!-- TODO Convert to Node.js -->
<!DOCTYPE html>
<html lang="en"> <!-- TODO Add support for Dutch -->
    <head>
        <!-- Site data -->
        <title>Lucas's resume</title>
        <meta name="description" content="The personal resume and portfolio of Lucas van Osenbruggen.">
        <meta charset="UTF-8">
        <!-- Favicon made at http://realfavicongenerator.net/ -->
        <link rel="apple-touch-icon" sizes="180x180" href="index/assets/images/favicon/apple-touch-icon.png">
        <link rel="icon" type="image/png" sizes="32x32" href="index/assets/images/favicon/favicon-32x32.png">
        <link rel="icon" type="image/png" sizes="192x192" href="index/assets/images/favicon/android-chrome-192x192.png">
        <link rel="icon" type="image/png" sizes="16x16" href="index/assets/images/favicon/favicon-16x16.png">
        <link rel="manifest" href="index/assets/images/favicon/manifest.json">
        <link rel="mask-icon" href="index/assets/images/favicon/safari-pinned-tab.svg" color="#00bcd4">
        <link rel="shortcut icon" href="index/assets/images/favicon/favicon.ico">
        <meta name="msapplication-TileColor" content="#00bcd4">
        <meta name="msapplication-TileImage" content="index/assets/images/favicon/mstile-144x144.png">
        <meta name="msapplication-config" content="index/assets/images/favicon/browserconfig.xml">
        <meta name="theme-color" content="#eeeeee">
        <!-- Css -->
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css?family=Noto+Sans" rel="stylesheet">
        <link href="index/assets/css/main.css" rel="stylesheet">
        <!-- Javascript -->
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
        <script src="index/assets/javascript/main.js"></script>

        <!-- Database -->
        <?php
            /* Functions */
            require "index/database/functions.php"; // General functions

            require "index/database/sorting.php"; // Change sorting of portfolio

            require "index/database/interact.php"; // Sets and gets data in database

            require "index/database/pages.php"; // Creates pages for portfolio TODO create pages for all projects here

            /* Actions */
            require "index/database/connect.php"; // PHP that connects to the database

            enterData(); // Adds and updates data
            sorted(); // Sets the sorting
        ?>
    </head>
    <body>
        <div class="top">
            <?php include "index/elements/top.html" // The nav and header ?>
        </div>

        <div class="main">
            <section class="part" id="about">
                <div class="content">
                    <div class="card">
                        <div class="container">
                            <img src="index/assets/images/other/photo.png" alt="A picture of me"/>
                        </div>
                        <div class="text">
                            <h2>Lucas van Osenbruggen</h2>
                            <p class="tagline">Not a fan of taglines</p>
                            <hr/>
                            <p>
                                Hello world. My name is Lucas van Osenbruggen. <br/>
                                I'm <span class="since" date="2000-08-22"></span> old and live in the Netherlands. <br/>
                                <br/>
                                I'm currently unemployed and a student in high school. For details, checkout the cards in the experience section. <br/>
                                <br/>
                                To see all the things that I think I'm good at, go to the skills section. <br/>
                                <br/>
                                This portfolio you're looking at right now was build from scratch by me. <br/>
                                I started working on it <span class="since" date="2017-05-15"></span> ago.
                                You can find more details about it in the portfolio section below. <br/>
                                <br/>
                                You can contact me anytime via the contact section. <br/>
                            </p>
                            <!-- TODO Add social media icons here -->
                        </div>
                    </div>
                </div>
            </section>

            <section class="part" id="experience">
                <!-- TODO Add a way for the user to see this card can be clicked-->
                <h2 class="title">Experience</h2>
                <div class="content">
                    <?php
                        // Get from database table
                        $data = getData('experience', 'date_start', '*');
                        // Loop through the rows in the returned array
                        foreach ($data as $row)
                        {
                            // Creates elements with new variables for each row
                            include "index/elements/templates/experience.php";
                        }
                    ?>
                </div>
            </section>

            <section class="part" id="skills">
                <!-- TODO Add a way for the user to see this card can be clicked-->
                <h2 class="title">Skills</h2>
                <div class="content">
                    <?php
                        // Get from database table
                        $data = getData('skills');
                        // Loop through the rows in the returned array
                        foreach ($data as $row)
                        {
                            // Creates elements with new variables for each row
                            include "index/elements/templates/skills.php";
                        }
                    ?>
                </div>
            </section>

            <section class="part" id="portfolio">
                <h2 class="title">Portfolio</h2>
                <br/>
                <!-- TODO Add search here -->
                <div class="sort">
                    <a rel="tag" href="<?= "?sort=" . $next; // Adds href to sort link on page load ?>">
                        <i class="material-icons md-dark">sort</i>
                        <span><?= $_GET['sort']; ?></span>
                        <div class="tooltip"><?= "Sort by " . $next; ?></div>
                    </a>
                </div>
                <div class="content">
                    <?php
                        // Get from database table
                        $data = getData('projects',  sortStr($_GET['sort']), 'title, type, thumbnail');
                        // Loop through the rows in the returned array
                        foreach ($data as $row)
                        {
                            // Creates elements with new variables for each row
                            include "index/elements/templates/projects.php";
                        }
                    ?>
                </div>
                <div class="select">
                    <button class="backward">
                        <i class="material-icons md-dark">arrow_left</i>
                    </button>
                    <p>Page  <span></span></p>
                    <button class="forward">
                        <i class="material-icons md-dark">arrow_right</i>
                    </button>
                </div>
            </section>

            <section class="part" id="contact">
                <h2 class="title">Contact</h2>
                <div class="content">
                    <div class="card">
                        <div class="container">
                            <div class="map">
                                <!-- From Google Maps by clicking on embed-->
                                <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d4971.087259576843!2d5.560218699999992!3d51.46653500000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1snl!2snl!4v1496331155999" frameborder="0" style="border:0" allowfullscreen></iframe>
                            </div>
                            <div class="text">
                                <ul>
                                    <li>
                                        <div class="box">
                                            <div class="icon"><i class="material-icons md-light md-inactive">phone</i></div>
                                            <div><p>+31 6 48692328</p></div>
                                        </div>
                                    </li>
                                    <li>
                                        <div class="box">
                                            <div class="icon"><i class="material-icons md-light md-inactive">email</i></div>
                                            <div><p>lukaas9000@gmail.com</p></div>
                                        </div>
                                    </li>
                                    <li>
                                        <div class="box">
                                            <div class="icon"><i class="material-icons md-light md-inactive">map</i></div>
                                            <div><p>Wastronahof 2</p></div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <button class="show">Show map</button>
                    </div>
                    <div class="card">
                        <div class="text">
                            <form method="post" action="database/mail.php">
                                <input type="text" name="name" placeholder="Name"></input>
                                <input type="text" name="email" placeholder="Email"></input>
                                <textarea type="text" name="message" placeholder="Message"></textarea>
                                <div><input type="submit" value="Send message"></input></div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <?php
            $conn->close(); // Ends connection with database
            cLog("Connection closed");
        ?>
    </body>
</html>