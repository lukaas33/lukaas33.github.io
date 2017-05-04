// Color hex codes
var colors;
$.getJSON("index/javascript/colors.json", function(json)
{
	colors = json;
});

// Html data from different files
function setHtml(name)
{
	var id = "cards-" + name;
	$.get(
		"index/html/" + name + ".html",
		function(data)
		{
			w3DisplayData(id, {"code": data})
		});
};

setHtml("aboutMe");
setHtml("experience");
setHtml("skills");
setHtml("portfolio");

// Loads pages javascript
$.getScript("index/javascript/index.js");
