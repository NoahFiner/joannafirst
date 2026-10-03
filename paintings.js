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
  cars = [];

  cars[0]= new Photo(0, "paintings/0.png", "Breakthrough 1 and 2", "each 18x14", "acrylic on canvas");
  cars[1]= new Photo(1, "paintings/1.png", "Under the Sun", "44x30", "acrylic on canvas/rice paper");
  cars[2]= new Photo(2, "paintings/3.png", "Deep Within", "48x18", "acrylic/rice paper on canvas");
  cars[3]= new Photo(3, "paintings/4.png", "Dividing Line", "52x18", "acrylic/rice paper on canvas");
  cars[4]= new Photo(4, "paintings/5.png", "Line #1, #2, #3, #4", "30x22 each", "acrylic on canvas/rice paper");
  cars[5]= new Photo(5, "paintings/6.png", "Night Waters", "54x32", "acrylic on canvas");
  cars[6]= new Photo(6, "paintings/7.png", "Chartreuse Wall", "54x32", "acrylic/rice paper on canvas");
  cars[7]= new Photo(7, "paintings/8.png", "Beyond the Grass", "60x50", "acrylic/mixed media");
  cars[8]= new Photo(8, "paintings/9.png", "Night Sails", "60x46", "acrylic/mixed media");
  cars[9]= new Photo(9, "paintings/10.png", "Winter Garden", "42x76", "acrylic/mixed media");
  cars[10] = new Photo(10, "paintings/11.png", "Unsuspecting", "50x40", "acrylic/mixed media");
  cars[11] = new Photo(11, "paintings/12.png", "Variation of a Vase", "60x50", "acrylic/mixed media");
  cars[12] = new Photo(12, "paintings/13.png", "City Forest", "50x20", "acrylic on canvas");
  cars[13] = new Photo(13, "paintings/14.png", "Towards the Garden", "54x18", "acrylic/mixed media");
  cars[14] = new Photo(14, "paintings/15.png", "Deep Water", "48x28", "acrylic/mixed media on canvas");
  cars[15] = new Photo(15, "paintings/16.png", "Past, Present, Future", "44x54", "oil on canvas");
  cars[16] = new Photo(16, "paintings/17.png", "Veiled Women Series #4", "18x78", "acrylic on canvas");
  cars[17] = new Photo(17, "paintings/18.png", "Golden Summers", "70x52", "oil on canvas");
  cars[18] = new Photo(18, "paintings/19.png", "Early Light", "58x42", "oil on canvas");
  cars[19] = new Photo(19, "paintings/20.png", "Small #1, #2, #3", "each 6x8", "acrylic on canvas");
  cars[20] = new Photo(20, "paintings/21.png", "A Patch of Blue", "50x60", "acrylic/mixed media");
  // cars[21] = new Photo(21, "paintings/22.png", "Streams", "52x32", "acrylic on canvas");
  cars[21] = new Photo(21, "paintings/22.png", "The Stone Fountain", "52x32", "acrylic on canvas");
  cars[22] = new Photo(22, "paintings/23.png", "Moving On", "54x32", "acrylic on canvas");
  cars[23] = new Photo(23, "paintings/comingclosertransparent.png", "Coming Close 1-4", "30x22", "acrylic on canvas");
  cars[24] = new Photo(24, "paintings/25.png", "Passage", "24x18", "acrylic on canvas");
  cars[25] = new Photo(25, "paintings/26.png", "Pure Pleasure", "56x30", "acrylic on canvas");
  cars[26] = new Photo(26, "paintings/ComingApart.jpg", "Coming Apart", "37x25", "acrylic and rice paper on paper");
  cars[27] = new Photo(27, "paintings/outoftheblue.jpg", "Out of the Blue", "37x25", "acrylic and rice paper on paper");
  cars[28] = new Photo(28, "paintings/pickingupthesepieces.jpg", "Picking up the Pieces", "54x32", "acrylic and rice paper on paper");
  cars[29] = new Photo(29, "paintings/unhinged.png", "Unhinged", "41x22 ", "acrylic/dital photo on rice paper");
  cars[30] = new Photo(30, "paintings/themosthappyplace.jpg", "The Most Happy Place", "40x30 ", "acrylic with mixed media");
  // cars[26] = new Photo(26, "paintings/27.png", "Pure Pleasure", "56x30", "acrylic on canvas");
  // cars[27] = new Photo(27, "paintings/28.png", "Pure Pleasure", "56x30", "acrylic on canvas");
  // cars[28] = new Photo(28, "paintings/29.png", "Pure Pleasure", "56x30", "acrylic on canvas");
  // cars[29] = new Photo(29, "paintings/30.png", "My Happy Place", "22x30", "acrylic on paper");
  // cars[30] = new Photo(30, "paintings/31.png", "Pure Pleasure", "56x30", "acrylic on canvas");
  // cars[31] = new Photo(31, "paintings/32.png", "Pure Pleasure", "56x30", "acrylic on canvas");
  // cars[32] = new Photo(32, "paintings/33.png", "Pearl Lake", "40x28.5", "acrylic on paper");

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
