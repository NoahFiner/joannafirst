var headerShown = false;

var setNewHeader = function(num) {
  $("#intro-header-outer").css("background-image", "url('pics/header/"+num+".jpg')");
}

var slideshow

$(document).ready(function() {
  slideshow = setInterval(function() {
    setNewHeader(Math.floor(Math.random()*10));
  }, 3000);
  setNewHeader(0);
  $(window).scroll(function() {
    var scrolly = $(window).scrollTop();
    if(scrolly >= 500 && headerShown === false) {
      headerShown = true;
      clearInterval(slideshow);
      $("#header-outer, #header-outer-instructs").addClass("shown");
    }
    if(scrolly < 500 && headerShown) {
      slideshow = setInterval(function() {
        setNewHeader(Math.floor(Math.random()*8));
      }, 3000);
      headerShown = false;
      $("#header-outer, #header-outer-instructs").removeClass("shown");
    }
  })
})
