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
  var c0 = new Photo(0, "paintings/0.png", "Breakthrough 1 and 2", "each 18x14", "acrylic on canvas");
  var c1 = new Photo(1, "paintings/1.png", "Under the Sun", "44x30", "acrylic on canvas/rice paper");
  var c2 = new Photo(2, "paintings/3.png", "Deep Within", "48x18", "acrylic/rice paper on canvas");
  var c3 = new Photo(3, "paintings/4.png", "Dividing Line", "52x18", "acrylic/rice paper on canvas");
  var c4 = new Photo(4, "paintings/5.png", "Line #1, #2, #3, #4", "30x22 each", "acrylic on canvas/rice paper");
  var c5 = new Photo(5, "paintings/6.png", "Night Waters", "54x32", "acrylic on canvas");
  var c6 = new Photo(6, "paintings/7.png", "Chartreuse Wall", "54x32", "acrylic/rice paper on canvas");
  var c7 = new Photo(7, "paintings/8.png", "Beyond the Grass", "60x50", "acrylic/mixed media");
  var c8 = new Photo(8, "paintings/9.png", "Night Sails", "60x46", "acrylic/mixed media");
  var c9 = new Photo(9, "paintings/10.png", "Winter Garden", "42x76", "acrylic/mixed media");
  var c10 = new Photo(10, "paintings/11.png", "Unsuspecting", "50x40", "acrylic/mixed media");
  var c11 = new Photo(11, "paintings/12.png", "Variation of a Vase", "60x50", "acrylic/mixed media");
  var c12 = new Photo(12, "paintings/13.png", "City Forest", "50x20", "acrylic on canvas");
  var c13 = new Photo(13, "paintings/14.png", "Towards the Garden", "54x18", "acrylic/mixed media");
  var c14 = new Photo(14, "paintings/15.png", "Deep Water", "48x28", "acrylic/mixed media on canvas");
  var c15 = new Photo(15, "paintings/16.png", "Past, Present, Future", "44x54", "oil on canvas");
  var c16 = new Photo(16, "paintings/17.png", "Veiled Women Series #4", "18x78", "acrylic on canvas");
  var c17 = new Photo(17, "paintings/18.png", "Golden Summers", "70x52", "oil on canvas");
  var c18 = new Photo(18, "paintings/19.png", "Early Light", "58x42", "oil on canvas");
  var c19 = new Photo(19, "paintings/20.png", "Small #1, #2, #3", "each 6x8", "acrylic on canvas");

  cars = [c0, c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13, c14, c15, c16, c17, c18, c19];
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
