var headerShown = false;

var headerActive = false;

var slideshow

var annoyingtimeout

var setNewHeader = function(num) {
  $("#intro-header-outer").css("background-image", "url('pics/header/"+num+".jpg')");
}

var toggleHeaderActive = function() {
  if(headerActive) {
    clearTimeout(annoyingtimeout);
    headerActive = false;
    $("#header-logo").removeClass('active');
  }
  else {
    annoyingtimeout = setTimeout(function() {
      headerActive = true;
    }, 500)
    $("#header-logo").addClass('active');
  }
}

$(document).ready(function() {
  slideshow = setInterval(function() {
    setNewHeader(Math.floor(Math.random()*10));
  }, 3000);
  setNewHeader(0);
  $("#header-outer").hover(function() {
    toggleHeaderActive()
  }, function() {
    toggleHeaderActive();
  })
  $('#header-logo').click(function() {
    if(headerActive) {
      location.href = 'index.html';
    }
  })
  $(window).scroll(function() {
    var scrolly = $(window).scrollTop();
    if(scrolly >= 500 && headerShown === false) {
      clearInterval(slideshow);
      headerShown = true;
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
