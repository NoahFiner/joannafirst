var setImg = function(wat) {
  $("#carousel-back").css("background-image", "url('thumbnails/"+wat+"')");
  $("#carousel-front").css("background-image", "url('"+wat+"')");
}

var setCar = function(title, dims, medium, add) {
  setImg(add);
  $("#car-title").html(title);
  $("#car-dimensions").html(dims);
  $("#car-medium").html("<i><nobr>"+medium+"</nobr></i>");
}

$(document).ready(function() {
})
