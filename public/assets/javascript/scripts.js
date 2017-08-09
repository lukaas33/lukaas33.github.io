// Loads scrips async

function loadScript(url, callback) {
  var script = document.createElement("script")

  script.onload = function() {
      callback();
  };

  script.src = url;
  document.getElementsByTagName("head")[0].appendChild(script);
};

loadScript("https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js", function() {
  console.log("// Jquery loaded");
  loadScript("assets/javascript/main.js", function() {
    console.log("// Main script loaded");
  });
});
