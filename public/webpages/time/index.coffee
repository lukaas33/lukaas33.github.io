$ ->
    ###Variables###
    $more = $(".more")
    $main = $(".main")
    $date = $(".date")
    birthday = "1967-05-18"
    units =
        ms: 1
        s: 1000
        m: 60000
        h: 3600000
        d: 86400000
        w: 604800000
        y: 31557600000

    ###Functions###
    getAge = (format) ->
        # Returns age in different formats
        birthdate = new Date(birthday)
        age = Date.now() - birthdate.getTime()
        return Math.round(age / units[format])

    class Clock
        constructor: (@element) ->
        update:  ->
            # Clock gets updated
            unitString = $(@element).attr("unit")
            string = String(getAge(unitString))
            string = string.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
            if unitString is 'ms'
                string = string.split(" ")
                for part, index in string
                    string[index] = "<span> #{part} </span>"
                string.join(" ")
            $(@element).find(".number").html(string)

    set = () ->
        #Sets different values
        setClock = () ->
            $clocks = $(".timer")
            console.log $clocks
            for clock, index in $clocks
                do (clock) ->
                    timer = new Clock(clock)
                    setInterval () ->
                        timer.update()
                    , 1

        setAccordion = () ->
            $more.accordion(
                collapsible: true
                active: false
                icons:
                    "header": "ui-icon-triangle-1-s"
                    "activeHeader": "ui-icon-triangle-1-n"
            )
            $more.find("h3").css(
                margin: 0
                borderRadius: 0
                height: "5vh"
                border: "0px solid transparent"
                background: "transparent"
                textAlign: "center"
            )
            $more.find("h3").find(".ui-icon").css(
                fontSize: "1rem"
                backgroundImage: "url(https://download.jqueryui.com/themeroller/images/ui-icons_f06292_256x240.png)"
            )
            $more.find(".units").css(
                height: "65vh"
            )

        setClock()
        setAccordion()

    ###Events###
    $date.click ->
        input = prompt("Voer je geboortedatum in: \n (jjjjj-mm-dd)")
        birthday = input if input?

    ###Actions###
    set()
    $("body").fadeIn("slow")
