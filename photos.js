var amtOfCars = 10;
var currCar = 0;

var cars = [];

var Photo = function(num, add, title, dims, medium) {
  this.num = num;
  this.add = add;
  this.titley = title;
  this.dims = dims;
  this.medium = medium;
  this.init = function() {
    $("#carousel-info-bottom").append("<div id='preview"+this.num+"' class='carousel-preview'><div class='preview-overlay'><p>"+this.titley+"</p></div></div>");
    $("#preview"+this.num).css("background-image", "url('thumbnails/"+add+"')")
  }
  this.init();
}

var setPhotoCar = function(num) {
  currCar = parseInt(num);
  $(".carousel-preview").removeClass("selected");
  $("#preview"+num).addClass("selected");
  setCar(cars[num].titley, cars[num].dims, cars[num].medium, cars[num].add);
}

var next = function() {
  currCar += 1;
  if(currCar >= amtOfCars) {
    currCar = 0;
  }
  setPhotoCar(currCar);
}

var back = function() {
  currCar -= 1;
  if(currCar <= -1) {
    currCar = amtOfCars;
  }
  setPhotoCar(currCar);
}

function isNumeric(n) { // thanks, stackoverflow!
  return !isNaN(parseFloat(n)) && isFinite(n);
}

$(document).ready(function() {
  var c0 = new Photo(0, "photos/0.jpg", "Tomato Ribbons", "16x12", "digital");
  var c1 = new Photo(1, "photos/1.jpg", " Amsterdam Night", "9x6", "digital");
  var c2 = new Photo(2, "photos/2.jpg", "Sandy's Arrival", "14x15.5", "digital");
  var c3 = new Photo(3, "photos/3.jpg", "Waiting for Bee", "11.5x15.5", "digital");
  var c4 = new Photo(4, "photos/4.jpg", "Ominous", "14x16", "digital");
  var c5 = new Photo(5, "photos/5.jpg", "Pushing Through", "16x14", "digital");
  var c6 = new Photo(6, "photos/6.jpg", "Watching His World", "14x14", "digital");
  var c7 = new Photo(7, "photos/7.jpg", "Untitled", "16x14", "digital");
  var c8 = new Photo(8, "photos/8.jpg", "All Ears", "14x16", "digital");
  var c9 = new Photo(9, "photos/9.jpg", "Hide and Seek", "14x16", "digital");
  var c10 = new Photo(10, "photos/10.jpg", "Two Toned", "14x16", "digital");
  var c11 = new Photo(11, "photos/11.jpg", "River View", "10.5x18", "digital");
  var c12 = new Photo(12, "photos/12.jpg", "Blue Ice", "14x16", "digital");
  var c13 = new Photo(13, "photos/13.jpg", "Beyond", "14x16", "digital");
  var c14 = new Photo(14, "photos/14.jpg", "Star Catcher", "14x16", "digital");
  var c15 = new Photo(15, "photos/15.jpg", "Autunm", "14x16", "digital");
  var c16 = new Photo(16, "photos/16.jpg", "Blue Pool", "14x16", "digital");
  var c17 = new Photo(17, "photos/17.jpg", "The Seashelf", "14x16", "digital");
  var c18 = new Photo(18, "photos/18.jpg", "Feathers", "14x16", "digital");
  var c19 = new Photo(19, "photos/19.jpg", "Temple in the Rain", "14x16", "digital");
  var c20 = new Photo(20, "photos/20.jpg", "Window to What", "16x14", "digital");
  var c21 = new Photo(21, "photos/21.jpg", "Pot Of Gold", "16x14", "digital");
  var c22 = new Photo(22, "photos/22.jpg", "Magic Morning", "12x16", "digital");
  var c23 = new Photo(23, "photos/23.jpg", "Spring Awakening", "12x16", "digital");
  var c24 = new Photo(24, "photos/24.jpg", "Noah's Wall", "16x16", "digital");

  cars = [c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13, c14, c15, c16, c17, c18, c19, c20, c21, c22, c23, c24];
  amtOfCars = cars.length;
  currCar = 0;
  setPhotoCar(0);
  $('.carousel-preview').click(function() {
    $('.carousel-preview').removeClass("selected");
    $(this).addClass("selected");
    var id = $(this).attr("id").toString();
    if(id.length <= 8) {
      setPhotoCar(id[7]);
    }
    else {
      setPhotoCar(parseInt(id[7]*10) + parseInt(id[8]));
    }
  });
  $("#left-arr").click(function() {
    back();
  });
  $("#right-arr").click(function() {
    next();
  })
});
