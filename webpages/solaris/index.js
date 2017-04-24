$(document).ready(function()
{
    paper.install(window); // No accessing through the paper object
    paper.setup($('#canvas')[0]); // Selects canvas

    // -- Initial variables --
    var canHeight = view.viewSize.height;
    var canWidth = view.viewSize.width;
    var systemCenter =  new Point((canWidth / 2), (canHeight / 2));
    var solarSystem;

    var sidebarState = "closed";
    var $sidebar = $('.sidebarContainer');
    var $close = $('#sidebar .close');

    var $menu = $("#menu");
    var $menuButton = $(".menuButton");
    var $options = $(".options");

    var musicState = "on";
    var $musicButton = $(".option.music");
    var $music = $("#music");

    var $infoButton = $(".option.about");
    var $info = $(".infoContainer");
    var $overlay = $("#overlay");

    var orbitState = "invisible";
    var $orbitButton = $(".option.orbits");

    var tagState = "off";
    var $tagButton = $(".option.tags");

    var selectedObject = null;

    // -- Website controls --
    // Options visible
    $menuButton.mouseenter(function()
    {
        $menuButton.addClass("active");
        $options.show
        (
            "drop", {direction: "up"}, 400
        );
    });

    $menu.mouseleave(function()
    {
        $options.hide
        (
            "drop",
            {
                direction: "up",
                complete: function()
                {
                    $menuButton.removeClass("active");
                }
            },
            400
        );
    });

    // Turns off music
    $musicButton.click(function()
    {
        if (musicState === "on")
        {
            $musicButton.find("i").html("volume_off");
            $musicButton.find(".tooltip").html("Music on");
            $music[0].pause();
            musicState = "off";
        }
        else
        {
            $musicButton.find("i").html("volume_up");
            $musicButton.find(".tooltip").html("Music off");
            $music[0].play();
            musicState = "on";
        }
    });

    // Toggle orbits
    $orbitButton.click(function()
    {
        if (orbitState === "visible")
        {
            $orbitButton.find("i").html("filter_tilt_shift");
            $orbitButton.find(".tooltip").html("Orbit mode");
            orbits(false);
            orbitState = "invisible";
        }
        else if (orbitState === "invisible")
        {
            $orbitButton.find("i").html("adjust");
            $orbitButton.find(".tooltip").html("Normal mode");
            orbits(true);
            orbitState = "visible";
        }
    });

    // Shows button
    $sidebar.mouseenter(function()
    {
        $close .fadeIn();
    });
    $sidebar.mouseleave(function()
    {
        $close .fadeOut();
    });

    // Shows info
    $infoButton.click(function()
    {
        if (sidebarState === "opened")
        {
            sidebarOpen(false);
        }
        $overlay.fadeIn();
        $info.fadeIn();
    });

    $overlay.click(function()
    {
        $overlay.fadeOut();
        $info.fadeOut();
    });

    $tagButton.click(function()
    {
        if (tagState === "on")
        {
            $tagButton.find("i").html("_");
            $tagButton.find(".tooltip").html("Show tags");
            tagState = "off";
        }
        else if (tagState === "off")
        {
            $tagButton.find("i").html("__");
            $tagButton.find(".tooltip").html("Hide tags");
            tagState = "on";
        }
    });

    // Closes sidebar
    $close.click(function()
    {
        if (sidebarState === "opened")
        {
            sidebarOpen(false);
        }
    });

    // Toggles sidebar
    $sidebar.css({right: -$sidebar.width()});
    $sidebar.show();

    function sidebarOpen(open)
    {
        if (open)
        {
            $sidebar.animate
            (
                {right: 0},
                {
                    duration: setData.time,
                    complete: function() {sidebarState = "opened";}
                }
            );
        }
        else
        {
            $sidebar.animate
            (
                {right: -$sidebar.width()},
                {
                    duration: setData.time,
                    complete: function() {sidebarState = "closed";}
                }
            );
        }
    }

    // Set text of sidebar
    function setData(object)
    {
        var time = 400; // Sets the duration of the sidebar animation
        function print()
        {
            $sidebar.find(".header").css({backgroundColor: object.data.color});
            $sidebar.find(".header h2").text(object.data.name);
            $sidebar.find(".info").empty();
            $sidebar.find(".info").append($("<img/>").attr({source: object.data.img, alt: "Picture of " + object.data.name, src: ("media/planetImgs/" + object.data.name + ".png")}));
            $sidebar.find(".info").append("<br/><br/>");
            $sidebar.find(".info").append("<p>The average surface temperature of " + (object.data.name).toLowerCase() + " is around " + (object.data.temperature - 273) + " degrees Celcius.</p>");
            $sidebar.find(".info").append("<br/>");
            $sidebar.find(".info").append("<p>" + object.data.name + " has a mass of " + (object.data.mass).toPrecision(2) + " kilograms.</p>");
            $sidebar.find(".info").append("<p>Its volume is " + (object.data.volume).toPrecision(2) + " square metres.</p>");
            $sidebar.find(".info").append("<p>It has a density of " + Math.round(object.data.density) + " kilogram per square metre.</p>");
            if (object.class === "Planetoid")
            {
                $sidebar.find(".info").append("<br/>");
                $sidebar.find(".info").append("<p>" + object.data.name + " takes " + Math.round(object.data.orbitDuration)  + " days to orbit " + (object.orbits.data.name).toLowerCase() + ".</p>");
                $sidebar.find(".info").append("<p>It travels with an average speed of " + Math.round(object.data.speed)  + " metres per second, relative to " + (object.orbits.data.name).toLowerCase() + ".</p>");
            }
            $sidebar.find(".info").append("<hr/>");
            $sidebar.find(".info").append($("<a>More info</a>").attr({href: ("https://en.wikipedia.org/wiki/" + object.data.name), target: "_blank"}).css({color: object.data.color}));
        }
        if (sidebarState === "closed")
        {
            print();
            sidebarOpen(true);
        }
        else if (sidebarState === "opened")
        {
            sidebarOpen(false);
            setTimeout(print, time); // Changes when out of view
            sidebarOpen(true);
        }
    }

    // -- Constructors --
    // Data constructor
    var Data = function(name, color, img, mass, radius, speed, orbitDuration, temperature)
    {
        this.name = name;
        this.color = color;
        this.img = img;
        this.mass = mass; // kg
        this.radius = radius; // m
        this.volume = ((4 / 3) * Math.PI * Math.pow(this.radius, 3)); // m^3
        this.density = (this.mass / this.volume); // kg/m^3
        this.speed = speed; // m/s
        this.orbitDuration = orbitDuration; // days
        this.orbitLength = (this.speed * (this.orbitDuration * 24 * 60 * 60)); // m
        this.temperature = temperature; // K
    }

    // Space rock constructor
    function SpaceRock(name, orbitRadius, orbits)
    {
        this.orbit = new Path.Circle(systemCenter, orbitRadius);
        this.img = new Raster("media/planetSprites/" + name + ".svg", 0);
        this.orbits = orbits;

        this.img.onFrame = function()
        {
            this.orbiting();
        }.bind(this);
    }

    // Space object constructor
    function SpaceObject()
    {
        this.tagLabel = new Group
        ([
            this.tag = new Path.Rectangle(
            {
                size: [Math.round(canWidth / 20), Math.round(canHeight / 35)],
                fillColor: "#fafafa"
            }),
            this.label = new PointText(
            {
                position: [this.tag.position.x, (this.tag.position.y + 4)],
                content: this.data.name,
                fillColor: "#757575",
                justification: "center",
                fontFamily: "noto sans"
            })
        ]);
        this.tagLabel.visible = false;

        function hover(object, event)
        {
            if (event === "enter")
            {
                $("body").css({cursor: "pointer"});

                /*this.center.style =
                {
                    strokeColor: "#e0e0e0",
                    strokeWidth: 1
                }*/

                if (tagState === "on")
                {
                    object.tagLabel.visible = true;
                }
            }
            else if (event === "leave")
            {
                $("body").css({cursor: "default"});

                /*if (selectedObject !== this)
                {
                    this.center.style.strokeWidth = 0;
                }*/

                if (tagState === "on")
                {
                    object.tagLabel.visible = false;
                }
            }
        };

        function click(object)
        {
            if (selectedObject !== null)
            {
                selectedObject.center.style.strokeWidth = 0;
            }

            /*this.center.style =
            {
                strokeColor: "#82b1ff",
                strokeCap: "square",
                dashArray: [10, 10],
                strokeWidth: 3
            };*/
            selectedObject = object;

            setData(object); // Set info in the card
        };

        this.center.onMouseEnter = function() { hover(this, "enter"); }.bind(this);
        this.img.onMouseEnter = function() { hover(this, "enter"); }.bind(this);

        this.center.onMouseLeave = function() { hover(this, "leave"); }.bind(this);
        this.img.onMouseLeave = function() { hover(this, "leave"); }.bind(this);

        this.center.onClick = function() { click(this); }.bind(this);
        this.img.onClick = function() { click(this); }.bind(this);
    };

    // Planetoid constructor, is a SpaceObject and a SpaceRock
    function Planetoid(name, orbitRadius, orbits, data)
    {
        this.class = "Planetoid";
        SpaceRock.call(this, name, orbitRadius, orbits);
        this.data = data;
        // SpaceObject.call(this);
    }
    Planetoid.prototype = Object.create(SpaceRock.prototype);
    Planetoid.prototype = Object.create(SpaceObject.prototype);

    // Star constructor, is a SpaceObject
    function Star(name, diameter, data)
    {
        this.class = "Star";
        this.img = new Raster(name);
        this.data = data;

        this.diameter = diameter;

        this.center = new Path.Circle(systemCenter, (this.diameter / 2));
        this.img.set(
        {
            size: [this.diameter, this.diameter],
            position: this.center.position
        });

        SpaceObject.call(this); // Has to be called after creation of center

        this.tagLabel.position = [this.center.position.x, (this.center.position.y - (this.diameter / 2) - (canHeight / 40))];
    }
    Star.prototype = Object.create(SpaceObject.prototype);

    // Planet constructor, is a Planetoid
    function Planet(name, diameter, orbitRadius, orbits, data)
    {
        Planetoid.call(this, name, orbitRadius, orbits, data);

        this.orbitSpeed = this.data.speed / 200000;
        this.diameter = diameter;

        this.center = new Path.Circle(this.orbit.bounds.leftCenter, (this.diameter / 2));
        this.img.set(
        {
            size: [this.diameter, this.diameter],
            position: this.center.position
        });

        SpaceObject.call(this); // Has to be called after creation of center
    }
    Planet.prototype = Object.create(Planetoid.prototype);

    Planet.prototype.orbiting = function()
    {
        this.center.rotate(this.orbitSpeed, this.orbits.center.position);
        this.img.position = this.center.position;

        this.tagLabel.position = [this.center.position.x, (this.center.position.y - (this.diameter / 2) - (canHeight / 40))];
    }

    // Moon constructor, is a Planetoid
    function Moon(name, orbitRadius, orbits, data)
    {
        Planetoid.call(this, name, orbitRadius, orbits, data);

        this.orbit.position = this.orbits.center.position;
        this.diameter = Math.round(this.orbits.diameter / (this.orbits.data.radius / this.data.radius));

        this.center = new Path.Circle(this.orbit.bounds.leftCenter, (this.diameter /2));
        this.img.set(
        {
            size: [this.diameter, this.diameter],
            position: this.center.position
        });

        SpaceObject.call(this); // Has to be called after creation of center
    }
    Moon.prototype = Object.create(Planetoid.prototype);

    Moon.prototype.orbiting = function()
    {
        this.center.rotate(this.orbits.orbitSpeed, this.orbits.orbits.center.position);
        this.img.position = this.center.position;

        this.orbit.position = this.orbits.center.position;
        this.center.rotate(this.orbits.orbitSpeed * 11, this.orbit.position);
        this.img.position = this.center.position;

        this.tagLabel.position = [this.center.position.x, (this.center.position.y - (this.diameter / 2) - (canHeight / 40))];
    }

    // TODO add asteroids

    function background()
    {
        Path.Rectangle(
        {
            point: [0, 0],
            size: [canWidth, canHeight],
            fillColor: "#212121"
        });

        var star = [ ];
        for (var i = 0; i < 500; i++)
        {
            star[i] = new Path.Circle((Point.random() * view.viewSize), (Math.floor(Math.random() * 3 + 1))); // Math.floor(Math.random() * 3 + 1)
            star[i].fillColor = new Color(1, (Math.floor(Math.random() *  30 + 65) / 100));
        }

        /*var gasCloud = [[ ], [ ]]
        for (var i = 0; i < 5; i++)
        {
            gasCloud[0][i] = new Raster("cloud-2");
            gasCloud[0][i] .scale(0.2);

            gasCloud[0][i].position = (Point.random() * view.viewSize);
        }*/

        /*var circle = new Path.Circle(systemCenter, 3);
        circle.style =
        {
            fillColor: new Color(1, 0.85)
        }
        var defineStar = new SymbolDefinition(circle);

        for (var i = 0; i < 500; i++)
        {
            var star = defineStar.place();
            star.position = (Point.random() * view.viewSize);
            star.scale(0.25 + (Math.random() * 0.75));
        }*/
    }

    // View invisible paths
    function orbits(enable)
    {
        for (var i = 0; i < solarSystem.length; i++)
        {
            var width;
            var color;
            if (enable)
            {
                width = Math.round(solarSystem[i].diameter / 3);
                color = solarSystem[i].data.color;
            }
            else
            {
                width = 0;
                color = "rgba(0, 0, 0, 0)";
            }

            if (solarSystem[i].orbits !== undefined)
            {
                solarSystem[i].orbit.style =
                {
                    strokeColor: solarSystem[i].data.color,
                    strokeWidth: width
                };
                solarSystem[i].orbit.strokeColor.brightness = 0.65;
            }

            solarSystem[i].center.style =
            {
                fillColor: color,
                strokeColor: color
            };
        }
    }

    // -- Setup functions --
    // Solar system
    function setupSolarsystem()
    {
        // Sun object
        var sun = new Star
        (
            "sun",
            Math.round(canHeight / 4.5),
            new Data
            (
                "The Sun",
                "#FFAE4C",
                "http://i1-win.softpedia-static.com/screenshots/Sun-Space-Screensaver_1.jpg",
                1.98855e30,
                6.957e8,
                0,
                0,
                5.778e3
            )
        );

        // Planet objects
        var mercury = new Planet
        (
            "mercury",
            Math.round(canHeight / 35),
            Math.round(canWidth / 10),
            sun,
            new Data
            (
                "Mercury",
                "#9db4c0",
                "https://upload.wikimedia.org/wikipedia/commons/d/d9/Mercury_in_color_-_Prockter07-edit1.jpg",
                3.3011e23,
                2.4397e6,
                4.7362e4,
                8.7969e1,
                3.40e2
            )
        );
        var venus = new Planet
        (
            "venus",
            Math.round(canHeight / 25),
            Math.round(canWidth / 7.75),
            sun,
            new Data
            (
                "Venus",
                "#dbae6d",
                "https://upload.wikimedia.org/wikipedia/commons/8/85/Venus_globe.jpg",
                4.8675e24,
                6.0518e6,
                3.502e4,
                2.24701e2,
                7.37e2
            )
        );
        var earth = new Planet
        (
            "earth",
            Math.round(canHeight / 25),
            Math.round(canWidth / 6.1),
            sun,
            new Data
            (
                "Earth",
                "#6b93d6",
                "https://upload.wikimedia.org/wikipedia/commons/6/6f/Earth_Eastern_Hemisphere.jpg",
                5.97237e24,
                6.371e6,
                2.978e4,
                3.65256363004e2,
                2.88e2
            )
        );
        var mars = new Planet
        (
            "mars",
            Math.round(canHeight / 27.5),
            Math.round(canWidth / 4.95),
            sun,
            new Data
            (
                "Mars",
                "#c1440e",
                "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/OSIRIS_Mars_true_color.jpg/1200px-OSIRIS_Mars_true_color.jpg",
                6.4171e23,
                3.3895e6,
                2.4077e4,
                6.86971e2,
                2.10e2
            )
        );
        var jupiter = new Planet
        (
            "jupiter",
            Math.round(canHeight / 10.5),
            Math.round(canWidth / 3.5),
            sun,
            new Data
            (
                "Jupiter",
                "#d8ca9d",
                "https://upload.wikimedia.org/wikipedia/commons/5/5a/Jupiter_by_Cassini-Huygens.jpg",
                1.8986e27,
                6.9911e7,
                1.307e4,
                4.33259e3,
                1.65e2
            )
        );
        var saturn = new Planet
        (
            "saturn",
            Math.round(canHeight / 10.5),
            Math.round(canWidth / 2.85),
            sun,
            new Data
            (
                "Saturn",
                "#eec87d",
                "https://saturn.jpl.nasa.gov/system/resources/detail_files/7504_PIA21046_MAIN.jpg",
                5.6836e26,
                5.8232e7,
                9.69e3,
                1.075922e4,
                1.34e2
            )
        );
        var uranus = new Planet
        (
            "uranus",
            Math.round(canHeight / 14.5),
            Math.round(canWidth / 2.465),
            sun,
            new Data
            (
                "Uranus",
                "#6BE6E8",
                "https://upload.wikimedia.org/wikipedia/commons/3/3d/Uranus2.jpg",
                8.6810e25,
                2.5362e7,
                6.80e3,
                3.06885e4,
                76
            )
        );
        var neptune = new Planet
        (
            "neptune",
            Math.round(canHeight / 14.5),
            Math.round(canWidth / 2.2),
            sun,
            new Data
            (
                "Neptune",
                "#3f54ba",
                "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Neptune_Full.jpg/1200px-Neptune_Full.jpg",
                1.0243e26,
                2.4622e7,
                5.43e3,
                6.0182e4,
                72
            )
        );

        // Moon object
        var moon = new Moon
        (
            "moon",
            Math.round(canWidth / 55),
            earth,
            new Data
            (
                "The Moon",
                "#c1c1c1",
                "https://upload.wikimedia.org/wikipedia/commons/e/e1/FullMoon2010.jpg",
                7.342e22,
                1.7371e6,
                1.022e3,
                2.7321661e1,
                2.20e2
            )
        );

        // All objects in the canvas
        solarSystem = [mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, moon, sun];

        console.log("All objects:");
        console.log(solarSystem);
    }

    // -- Actions --
    background(); // Draws stars and sets the background
    setupSolarsystem(); // Sets everything in the solar system

    $("body").animate({opacity: 1}, 1000); // Fade in the screen

    console.log("");
    console.log("-- Welcome to Solaris -- ");
});
