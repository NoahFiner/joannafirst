var underHidden = false;

var toggleUnder = function(){
  if(underHidden) {
    setTimeout(function() {$("#direct-arr").addClass("down")}, 500);
    $("#more").html("<span id='direct-arr' class=''>&#8682;</span> less &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
    underHidden = false;
    $("#carousel-info, #carousel-info-bottom, #carousel-info-top, #carousel-back, #carousel-black, #carousel-front, #carousel-buttons").removeClass("hidden");
  }
  else {
    setTimeout(function() {$("#direct-arr").removeClass("down")}, 500);
    $("#more").html("<span id='direct-arr' class='down'>&#8682;</span> more &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
    underHidden = true;
    $("#carousel-info, #carousel-info-bottom, #carousel-info-top, #carousel-back, #carousel-black, #carousel-front, #carousel-buttons").addClass("hidden");
  }
}

$(document).ready(function() {
  $("#more").click(function() {
    toggleUnder();
  })
  $('#header-logo').click(function() {
    if(!($("#header-outer").hasClass("hidden"))) {
      location.href = 'index.html';
    }
    else {
      headerShown = true;
      clearInterval(slideshow);
      $("#header-outer, #header-outer-instructs").addClass("shown");
    }
  })
})
