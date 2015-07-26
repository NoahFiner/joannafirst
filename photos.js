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
    $("#preview"+this.num).css("background-image", "url('"+add+"')")
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
  var c1 = new Photo(1, "photos/1.jpg", "Beach", "9x6", "digital");
  var c2 = new Photo(2, "photos/2.jpg", "Waves", "14x15.5", "digital");
  var c3 = new Photo(3, "photos/3.jpg", "whoah i'm high lol", "14x15.5", "digital");
  var c4 = new Photo(4, "photos/4.jpg", "sunset wow pretty", "2x4", "digital");
  var c5 = new Photo(5, "photos/5.jpg", "something", "2x4", "digital");
  var c6 = new Photo(6, "photos/6.jpg", "something else", "2x4", "digital");
  var c7 = new Photo(7, "photos/7.jpg", "pls work you", "2x4", "digital");
  var c8 = new Photo(8, "photos/8.jpg", "asdf", "2x4", "digital");
  var c9 = new Photo(9, "photos/9.jpg", "idk what else", "2x4", "digital");
  var c10 = new Photo(10, "photos/10.jpg", "oiio", "2x4", "digital");
  var c11 = new Photo(11, "photos/11.jpg", "asdf asdf", "2x4", "digital");
  cars = [c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11];
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
