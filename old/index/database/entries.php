<?php
// Tables to be entered
$table["skills"] = <<< EOD
CREATE TABLE skills(
    id INT(6) UNSIGNED PRIMARY KEY UNIQUE,
    title VARCHAR(30) NOT NULL, -- String to be placed in a header
    description VARCHAR(500) NOT NULL, -- Text to be placed in a paragraph
    skills VARCHAR(100) NOT NULL, -- Array of strings to be placed in one-line paragraphs
    percentages VARCHAR(100) NOT NULL -- Array of numbers to be used as width
);
EOD;

$table["experience"] = <<< EOD
CREATE TABLE experience(
    id INT(6) UNSIGNED PRIMARY KEY UNIQUE,
    title VARCHAR(30) NOT NULL, -- String to be placed in a header
    place VARCHAR(30) NOT NULL, -- String to be placed in a one-line paragraph
    date_start DATE NOT NULL, -- Date of the start
    date_end DATE DEFAULT NULL, -- Date of the End If not inserted it will be null
    description VARCHAR(500) NOT NULL, -- Text to be placed in a paragraph
    data_type VARCHAR(30) NOT NULL, -- Array of strings that tell how to display additional data
    data_text VARCHAR(100) NOT NULL -- Array to be used as the data
);
EOD;

$table["projects"] = <<< EOD
CREATE TABLE projects(
    id INT(6) UNSIGNED PRIMARY KEY UNIQUE,
    title VARCHAR(30) NOT NULL, -- String to be placed in a header
    tags VARCHAR(500) NOT NULL, -- Array of strings
    type VARCHAR(30) NOT NULL,  -- String that tells how to display other data
    date_start DATE NOT NULL, -- Date of the start
    date_end DATE NOT NULL, -- Date of the End
    thumbnail VARCHAR(30) NOT NULL,  -- String containing the name of the image
    images_paths VARCHAR(500) NOT NULL, -- Array of image names to be displayed as banner
    images_data VARCHAR(500) NOT NULL, -- Array of descriptions for the images
    media VARCHAR(30) NOT NULL, -- String data of other data for project types like website
    description VARCHAR(5000) NOT NULL, -- Array of text to be placed in paragraphs and strings that tell to place an image
    description_images_paths VARCHAR(30) NOT NULL, -- String that tells how to display additional data
    description_images_data VARCHAR(100) NOT NULL -- String that will be placed on one line under the description
);
EOD;

// All entries
// Skills
$entries["skills"][0] = <<< EOD
    REPLACE INTO skills (id, title, description, skills, percentages)
    VALUES  (
        1,
        "English",
        "Like most people I learned a lot of my English from the internet. <br/>
        <br/>
        I always liked the idea of an universal language and English comes pretty close.
        Because information is more widely available in English I always do my research in English.
        Most of my products are in English because it will have the potential to reach more people.",
        "[Vocabulary, Grammar, Speaking]",
        "[85, 75, 55]"
    );
EOD;

$entries["skills"][1] = <<< EOD
    REPLACE INTO skills (id, title, description, skills, percentages)
    VALUES  (
        2,
        "Dutch",
        "My native language. <br/>
        <br/>
        Ive been able to speak Dutch since I was four.
        Growing up in the Netherlands I learned it at school and by talking to people.
        Reading has helped me too. I've always liked reading books.",
        "[Vocabulary, Grammar, Writing]",
        "[85, 65, 75]"
    );
EOD;

$entries["skills"][2] = <<< EOD
    REPLACE INTO skills (id, title, description, skills, percentages)
    VALUES  (
        3,
        "Project management",
        "This is something I learned by trying. <br/>
        By doing lots of projects I've found out how to tackle a project.
        The version control and collaboration options of Git have been particularly useful. <br/>
        The importance of writing down your plans and tracking your time has been taught to me at school.",
        "[Documentation, Planning, Version control]",
        "[75, 60, 55]"
    );
EOD;

$entries["skills"][3] = <<< EOD
    REPLACE INTO skills (id, title, description, skills, percentages)
    VALUES  (
        4,
        "Web development",
        "I made my first website as an assignment in the beginning of the schoolyear in 2016.
        Working on a project has always been interesting to me because I get a lot of freedom in it.
        I can pour as much time in it as I want and be creative. <br/>
        So, much I've learned was to achieve a goal in a project.
        But I also learned things that didn't really have a use for me at that moment.",
        "[Css, Javascript, PHP]",
        "[80, 70, 45]"
    );
EOD;

$entries["skills"][4] = <<< EOD
    REPLACE INTO skills (id, title, description, skills, percentages)
    VALUES  (
        5,
        "Databases",
        "I first used an actual database in this project.
        My portfolio needed to be updateable so I stored all entries in a database. <br/>
        I like JSON because it's the easiest to use with Javascript.",
        "[SQL, JSON, XML]",
        "[55, 65, 25]"
    );
EOD;

$entries["skills"][5] = <<< EOD
    REPLACE INTO skills (id, title, description, skills, percentages)
    VALUES  (
        6,
        "Design",
        "I learned much about design making illustrations.
        I like using html and css better, because you have to be exact in your placement. <br/>
        I first combined my illustrations and web in the picturer project.",
        "[Color, Typography, Layout]",
        "[65, 45, 80]"
    );
EOD;

// Experience
$entries["experience"][0] = <<< EOD
    REPLACE INTO experience (id, title, place, date_start, date_end, description, data_type, data_text)
    VALUES  (
        1,
        "Elementary school",
        "Wentelwiek",
        "2003-09-05",
        "2011-07-30",
        "I learned some basic things that allow me to function today. <br/>
        Looking back it seems I didn't really pay much attention. I did get diagnosed with ADHD. <br/>
        I'm still bad at telling time on a analogue clock and don't fully know the months.
        Since then I've become better at paying attention and learning.",
        "[link]",
        "[http://www.dewentelwiek.nl/]"
    );
EOD;

$entries["experience"][1] = <<< EOD
    REPLACE INTO experience (id, title, place, date_start, date_end, description, data_type, data_text)
    VALUES  (
        2,
        "VMBO",
        "Plein College Nuenen",
        "2011-08-19",
        "2012-07-29",
        "I went here because I didn't do wel on my final test in elementary school.
        The reason was that I was mentally too young to go to high school.
        I didn't really fit in at this school.
        After a year it was clear this level of education was too low.",
        "[link]",
        "[http://www.pleincollegenuenen.nl/]"
    );
EOD;

$entries["experience"][2] = <<< EOD
    REPLACE INTO experience (id, title, place, date_start, date_end, description, data_type, data_text)
    VALUES  (
        3,
        "HAVO",
        "Pleinschool Helder",
        "2012-08-18",
        "2016-07-23",
        "The reason I went to this school because it offered help for children with ADHD.
        I don't think I needed the extra help for studying. But I got more confident being at this school.
        It is also the school where I started learning.",
        "[link]",
        "[http://pcsintjoris.mwp.nl/pleinschoolhelder/home/tabid/217/default.aspx]"
    );
EOD;

$entries["experience"][3] = <<< EOD
    REPLACE INTO experience (id, title, place, date_start, description, data_type, data_text)
    VALUES  (
        4,
        "HAVO",
        "Lorentz Casimir Lyceum",
        "2016-09-04",
        "I was given the advice of going to a 'normal' school and went looking at schools.
        When I visited this school it made a good impression on me.
        I also heard about the informatica lessons, a class that wasn't offered in my previous school.",
        "[link, number]",
        "[http://www.lcl.nl/, 040 2909420]"
    );
EOD;

$entries["experience"][4] = <<< EOD
    REPLACE INTO experience (id, title, place, date_start, date_end, description, data_type, data_text)
    VALUES  (
        5,
        "Filling stocks",
        "Albert Heijn",
        "2015-12-30",
        "2016-08-30",
        "I worked here for some time because I had plenty of free time back then.
        Since I didn't really needed the money and school got busier I decided to quit.",
        "[link, number]",
        "[https://www.ah.nl/winkel/1380, 040 2840999]"
    );
EOD;

// Projects TODO edit entries to use markdown syntax
$entries["projects"][0] = <<< EOD
    REPLACE INTO projects (id, title, tags, type, date_start, date_end, thumbnail, images_paths, images_data, media, description, description_images_paths, description_images_data)
    VALUES  (
        1,
        "Solaris",
        "[space, solar system, website, canvas, animation, object oriented, planets, css, html, paper.js, jquery]",
        "website",
        "2017-03-20",
        "2017-04-24",
        "solaris.jpg",
        "[solaris.jpg]",
        "[A screenshot of the website.]",
        "https://lukaas33.com/webpages/solaris/", -- TODO host the site on the same website
        "[
            This is a project I have been wanting to do for a while.
            I made an illustration of the solar system some time before and wanted to make something more interactive. ,
            I learned a lot about using the html canvas and making animations via paper.js.
        ]",
        "[]", -- No inline images
        "[]" -- No inline images
    );
EOD;

$entries["projects"][1] = <<< EOD
    REPLACE INTO projects (id, title, tags, type, date_start, date_end, thumbnail, images_paths, images_data, media, description, description_images_paths, description_images_data)
    VALUES  (
        2,
        "Profile picture",
        "[profile picture, profile, lucas, illustration, flat, shadow]",
        "image",
        "2016-08-28",
        "2016-09-04",
        "profile-picture.jpg",
        "[profile-picture.jpg]",
        "[The cropped endresult.]",
        "NULL",
        "[
            I saw a lot of profile pictures in this style on the internet and wanted my own. ,
            0, -- Index of image to be placed
            I started with a picture of myself taken by my phone.
            I first drew the outlines of my face.
            Then I filled up the shapes using darker shades for depth.
            I also added some shadows across my face. ,
            1, -- Index of image to be placed
            This is the result. I changed some colors to make it stand out more.
        ]",
        "[photo-full.jpg, profile-picture-full.png]",
        "[The original photo, The end result]"
    );
EOD;

$entries["projects"][2] = <<< EOD
    REPLACE INTO projects (id, title, tags, type, date_start, date_end, thumbnail, images_paths, images_data, media, description, description_images_paths, description_images_data)
    VALUES  (
        3,
        "Picturer",
        "[profile picture, create, canvas, website, flat, shadow, illustrations, combinations]",
        "website",
        "2017-03-01",
        "2017-03-07",
        "picturer-p.jpg",
        "[picturer.png]",
        "[A screenshot of the website.]",
        "https://lukaas33.com/webpages/picturer/", -- TODO host the site on the same website
        "[
            I wanted to learn to work with canvas and thought it would be fun to make a profile picture creator.
        ]",
        "[]", -- No inline images
        "[]" -- No inline images
    );
EOD;

$entries["projects"][3] = <<< EOD
    REPLACE INTO projects (id, title, tags, type, date_start, date_end, thumbnail, images_paths, images_data, media, description, description_images_paths, description_images_data)
    VALUES  (
        4,
        "Photography lesson",
        "[photos, camera, assignment, stucture, nature, abstract, pictures]",
        "collection",
        "2017-04-05",
        "2017-04-19",
        "plants.jpg",
        "[plants.jpg, river.jpg, treebase.jpg, roof.jpg, bridge.jpg]",
        "[The forest floor, A river seen from a bridge, The base of a tree, The roof of the bikerack, A bridge]",
		"NULL",
        "[
			We had some lessons in making pictures.
			We learned about composition and exposure in cameras and applies it to this.
        ]",
        "[]", -- No inline images
        "[]" -- No inline images
    );
EOD;

$entries["projects"][4] = <<< EOD
    REPLACE INTO projects (id, title, tags, type, date_start, date_end, thumbnail, images_paths, images_data, media, description, description_images_paths, description_images_data)
    VALUES  (
        5,
        "Gene editing",
        "[presentation, genes, Dutch, biology, illustrations, text, pictures, discussion, arguments]",
        "presentation",
        "2017-01-23",
        "2017-03-10",
        "presentation-genes.png",
        "[]",
        "[]",
		"NULL",
        "[

        ]",
        "[]", -- No inline images
        "[]" -- No inline images
    );
EOD;

$entries["projects"][5] = <<< EOD
    REPLACE INTO projects (id, title, tags, type, date_start, date_end, thumbnail, images_paths, images_data, media, description, description_images_paths, description_images_data)
    VALUES  (
        6,
        "Vacation photography",
        "[photos, phone, stucture, nature, vacation, pictures]",
        "collection",
        "2016-07-30",
        "2017-05-20",
        "plant-row.jpg",
        "[plant-row.jpg, forest-road.jpg, sunset.jpg, forest-pano.jpg, river-view.jpg]",
        "[A row of plants in france, A road in the French forest, The sunset in the Netherlands, A Dutch forest panorama, A river seen from a scaffolding]",
		"NULL",
        "[
            I always like taking pictures of nature when on vacation.
            These are my favorites.
        ]",
        "[]", -- No inline images
        "[]" -- No inline images
    );
EOD;

$entries["projects"][6] = <<< EOD
    REPLACE INTO projects (id, title, tags, type, date_start, date_end, thumbnail, images_paths, images_data, media, description, description_images_paths, description_images_data)
    VALUES  (
        7,
        "Bo Burnham shirt",
        "[photo, illustration, shirt, Bo Burnham, deep, comedian, design, black and white]",
        "image",
        "2016-09-01",
        "2016-09-07",
        "shirt.jpg",
        "[shirt.jpg]",
        "[The preview of the T-shirt I made online]",
		"NULL",
        "[
			I made a T-shirt for a song by Bo Burnham.
            I really like the song and wanted to make a design for it. ,
            0, -- Index of image to be placed
            This is the illustration I made for the T-shirt.
            I printed it out and attached it to the shirt by ironing it.
            1, -- Index of image to be placed
            This is the end result.
            The quality isn't that great but it looks like I wanted.
        ]",
        "[shirt-illustration.jpg, shirt-image.jpg]",
        "[The illustration I made, The end result]"
    );
EOD;

$entries["projects"][7] = <<< EOD
    REPLACE INTO projects (id, title, tags, type, date_start, date_end, thumbnail, images_paths, images_data, media, description, description_images_paths, description_images_data)
    VALUES  (
        8,
        "See-through",
        "[illustration, photoshop, invisible, assignment]",
        "image",
        "2017-01-07",
        "2017-01-23",
        "invisible.png",
        "[invisible.jpg]",
        "[The endresult]",
		"NULL",
        "[

        ]",
        "[]", -- No inline images
        "[]" -- No inline images
    );
EOD;

$entries["projects"][8] = <<< EOD
    REPLACE INTO projects (id, title, tags, type, date_start, date_end, thumbnail, images_paths, images_data, media, description, description_images_paths, description_images_data)
    VALUES  (
        9,
        "Portfolio",
        "[website, this project, assignment, php, css, html, javascript, coffeescript, jquery, sass, portfolio, resume, material design]",
        "website",
        "2017-05-15",
        "2017-06-23",
        "portfolio-thumbnail.jpg",
        "[]",
        "[A screenshot of the website]",
		"https://www.lukaas33.com",
        "[

        ]",
        "[]", -- No inline images
        "[]" -- No inline images
    );
EOD;

$entries["projects"][9] = <<< EOD
    REPLACE INTO projects (id, title, tags, type, date_start, date_end, thumbnail, images_paths, images_data, media, description, description_images_paths, description_images_data)
    VALUES  (
        10,
        "Boarding screen",
        "[concept, website, Android, challenge, html, jquery, javascript, css]",
        "website",
        "2017-02-13",
        "2017-03-09",
        "boarding.png",
        "[]",
        "[A screenshot of the website]",
		"https://lukaas33.com/webpages/boarding/", -- TODO host the site on the same website
        "[

        ]",
        "[]", -- No inline images
        "[]" -- No inline images
    );
EOD;
?>
