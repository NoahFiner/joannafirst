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
    $("#carousel-info-bottom").append("<div id='preview"+this.num+"' class='carousel-preview'><div class='preview-overlay '><p>"+this.titley+"</p></div></div>");
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
  var c0 = new Photo(0, "pastels/0.png", "The Market", "32x45 framed", "pastel on paper");
  var c1 = new Photo(1, "pastels/1.png", "Jerusalem Night", "45x30 framed", "pastel on paper");
  var c2 = new Photo(2, "pastels/2.png", "Coming Together", "32x45 framed", "pastel on paper");
  var c3 = new Photo(3, "pastels/3.png", "Archways", "28x18 framed", "pastel on paper");
  var c4 = new Photo(4, "pastels/4.png", "Untitled", "18x14 framed", "pastel on paper");
  var c5 = new Photo(5, "pastels/5.png", "Blue Morning", "18x14 framed", "pastel on paper");
  var c6 = new Photo(6, "pastels/6.png", "Untitled", "18x14 framed", "pastel on paper");
  var c7 = new Photo(7, "pastels/7.png", "Red Walls", "18x14 framed", "pastel on paper");
  var c8 = new Photo(8, "pastels/8.png", "April's Approach", "18x14 framed", "pastel on paper");

  cars = [c0, c1, c2, c3, c4, c5, c6, c7, c8];
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
