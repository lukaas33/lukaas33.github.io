// Loads asynchronously, fixed by moving to different file
var colors;
$.getJSON("index/javascript/colors.json", function(json)
{
	colors = json;
});

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
