var underHidden = false;

var annoyingtimeout;
var headerActive;

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
  $("#more").click(function() {
    toggleUnder();
  })
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
})
