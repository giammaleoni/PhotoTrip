document.addEventListener("DOMContentLoaded", function() {
  var dummy = document.createElement("a");
  dummy.setAttribute("href", ".");
  var baseURL = dummy.href;
  var absRE = /^\/(.*)$/;

  var images = document.getElementsByTagName("img");
  for (var i =  0; i < images.length; i++) {
    var img = images[i];
    var groups = absRE.exec(img.getAttribute("src"));
    if (groups == null) {
      continue;
    }

    img.src = baseURL + groups[1];
  }

  var links = document.getElementsByTagName("a");
  for (var i =  0; i < links.length; i++) {
    var link = links[i];
    var groups = absRE.exec(link.getAttribute("href"));
    if (groups == null) {
      continue;
    }

    link.href = baseURL + groups[1];
  }
});
