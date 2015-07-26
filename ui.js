var underHidden = false;

var toggleUnder = function(){
  if(underHidden) {
    $("#more").html("less &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
    underHidden = false;
    $("#carousel-info, #carousel-info-bottom, #carousel-info-top, #carousel-back, #carousel-black, #carousel-front, #carousel-buttons").removeClass("hidden");
  }
  else {
    $("#more").html("more &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
    underHidden = true;
    $("#carousel-info, #carousel-info-bottom, #carousel-info-top, #carousel-back, #carousel-black, #carousel-front, #carousel-buttons").addClass("hidden");
  }
}

$(document).ready(function() {
  $("#more").click(function() {
    toggleUnder();
  })
})
