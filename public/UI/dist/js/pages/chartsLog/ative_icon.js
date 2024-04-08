let heart = document.getElementById("heart-1");
let heart2 = document.getElementById("heart-2");
let heart3 = document.getElementById("heart-3");
let heart4 = document.getElementById("heart-4");
let heart5 = document.getElementById("heart-5");
let heart6 = document.getElementById("heart-6");
let heart7 = document.getElementById("heart-7");
let heart8 = document.getElementById("heart-8");

//close//
let close = document.getElementById("chart1");
let close2 = document.getElementById("chart2");
let close3 = document.getElementById("chart3");
let close4 = document.getElementById("chart4");
let close5 = document.getElementById("chart5");
let close6 = document.getElementById("chart6");
let close7 = document.getElementById("chart7");
let close8 = document.getElementById("chart8");



function heart_1() {
  heart.setAttribute("class", "mdi mdi-heart");
  heart.setAttribute("style", "cursor: pointer;font-size: 150%;color:red;");
  heart.setAttribute("onclick", "heart_1_f()");


  var id = {name:"heart-1",status:'1'};
  $.ajax({
    url: '/up',
    type: 'post',
    dataType: 'json',
    data: id,

    success: function (data) {
      console.log(data);
  },
  });
}

function heart_1_f() {
  heart.setAttribute("class", "mdi mdi-heart-outline");
  heart.setAttribute("style", "cursor: pointer; font-size: 150%");
  heart.setAttribute("onclick", "heart_1()");

  var id = {name:"heart-1",status:'0'};
  $.ajax({
    url: '/up',
    type: 'post',
    dataType: 'json',
    data: id,

    success: function (data) {
      console.log(data);
  },
  });
}

function heart_2() {
  heart2.setAttribute("class", "mdi mdi-heart");
  heart2.setAttribute("style", "cursor: pointer;font-size: 150%;color:red;");
  heart2.setAttribute("onclick", "heart_2_f()");

  var id = {name:"heart-2",status:'1'};
  $.ajax({
    url: '/up',
    type: 'post',
    dataType: 'json',
    data: id,

    success: function (data) {
      console.log(data);
  },
  });
}

function heart_2_f() {
  heart2.setAttribute("class", "mdi mdi-heart-outline");
  heart2.setAttribute("style", "cursor: pointer; font-size: 150%");
  heart2.setAttribute("onclick", "heart_2()");

  var id = {name:"heart-2",status:'0'};
  $.ajax({
    url: '/up',
    type: 'post',
    dataType: 'json',
    data: id,

    success: function (data) {
      console.log(data);
  },
  });
}

function heart_3() {
  heart3.setAttribute("class", "mdi mdi-heart");
  heart3.setAttribute("style", "cursor: pointer;font-size: 150%;color:red;");
  heart3.setAttribute("onclick", "heart_3_f()");

  var id = {name:"heart-3",status:'1'};
  $.ajax({
    url: '/up',
    type: 'post',
    dataType: 'json',
    data: id,

    success: function (data) {
      console.log(data);
  },
  });
}

function heart_3_f() {
  heart3.setAttribute("class", "mdi mdi-heart-outline");
  heart3.setAttribute("style", "cursor: pointer; font-size: 150%");
  heart3.setAttribute("onclick", "heart_3()");

  var id = {name:"heart-3",status:'0'};
  $.ajax({
    url: '/up',
    type: 'post',
    dataType: 'json',
    data: id,

    success: function (data) {
      console.log(data);
  },
  });
}

function heart_4() {
  heart4.setAttribute("class", "mdi mdi-heart");
  heart4.setAttribute("style", "cursor: pointer;font-size: 150%;color:red;");
  heart4.setAttribute("onclick", "heart_4_f()");

  var id = {name:"heart-4",status:'1'};
  $.ajax({
    url: '/up',
    type: 'post',
    dataType: 'json',
    data: id,

    success: function (data) {
      console.log(data);
  },
  });
}

function heart_4_f() {
  heart4.setAttribute("class", "mdi mdi-heart-outline");
  heart4.setAttribute("style", "cursor: pointer; font-size: 150%");
  heart4.setAttribute("onclick", "heart_4()");

  var id = {name:"heart-4",status:'0'};
  $.ajax({
    url: '/up',
    type: 'post',
    dataType: 'json',
    data: id,

    success: function (data) {
      console.log(data);
  },
  });
}

function heart_5() {
  heart5.setAttribute("class", "mdi mdi-heart");
  heart5.setAttribute("style", "cursor: pointer;font-size: 150%;color:red;");
  heart5.setAttribute("onclick", "heart_5_f()");

  var id = {name:"heart-5",status:'1'};
  $.ajax({
    url: '/up',
    type: 'post',
    dataType: 'json',
    data: id,

    success: function (data) {
      console.log(data);
  },
  });
}

function heart_5_f() {
  heart5.setAttribute("class", "mdi mdi-heart-outline");
  heart5.setAttribute("style", "cursor: pointer; font-size: 150%");
  heart5.setAttribute("onclick", "heart_5()");

  var id = {name:"heart-5",status:'0'};
  $.ajax({
    url: '/up',
    type: 'post',
    dataType: 'json',
    data: id,

    success: function (data) {
      console.log(data);
  },
  });
}

function heart_6() {
  heart6.setAttribute("class", "mdi mdi-heart");
  heart6.setAttribute("style", "cursor: pointer;font-size: 150%;color:red;");
  heart6.setAttribute("onclick", "heart_6_f()");

  var id = {name:"heart-6",status:'1'};
  $.ajax({
    url: '/up',
    type: 'post',
    dataType: 'json',
    data: id,

    success: function (data) {
      console.log(data);
  },
  });
}

function heart_6_f() {
  heart6.setAttribute("class", "mdi mdi-heart-outline");
  heart6.setAttribute("style", "cursor: pointer; font-size: 150%;color: whitesmoke;");
  heart6.setAttribute("onclick", "heart_6()");

  var id = {name:"heart-6",status:'0'};
  $.ajax({
    url: '/up',
    type: 'post',
    dataType: 'json',
    data: id,

    success: function (data) {
      console.log(data);
  },
  });
}

function heart_7() {
  heart7.setAttribute("class", "mdi mdi-heart");
  heart7.setAttribute("style", "cursor: pointer;font-size: 150%;color:red;");
  heart7.setAttribute("onclick", "heart_7_f()");

  var id = {name:"heart-7",status:'1'};
  $.ajax({
    url: '/up',
    type: 'post',
    dataType: 'json',
    data: id,

    success: function (data) {
      console.log(data);
  },
  });
}

function heart_7_f() {
  heart7.setAttribute("class", "mdi mdi-heart-outline");
  heart7.setAttribute("style", "cursor: pointer; font-size: 150%;color: whitesmoke;");
  heart7.setAttribute("onclick", "heart_7()");

  var id = {name:"heart-7",status:'0'};
  $.ajax({
    url: '/up',
    type: 'post',
    dataType: 'json',
    data: id,

    success: function (data) {
      console.log(data);
  },
  });
}

function heart_8() {
  heart8.setAttribute("class", "mdi mdi-heart");
  heart8.setAttribute("style", "cursor: pointer;font-size: 150%;color:red;");
  heart8.setAttribute("onclick", "heart_8_f()");

  var id = {name:"heart-8",status:'1'};
  $.ajax({
    url: '/up',
    type: 'post',
    dataType: 'json',
    data: id,

    success: function (data) {
      console.log(data);
  },
  });
}

function heart_8_f() {
  heart8.setAttribute("class", "mdi mdi-heart-outline");
  heart8.setAttribute("style", "cursor: pointer; font-size: 150%;");
  heart8.setAttribute("onclick", "heart_8()");

  var id = {name:"heart-8",status:'0'};
  $.ajax({
    url: '/up',
    type: 'post',
    dataType: 'json',
    data: id,

    success: function (data) {
      console.log(data);
  },
  });
}

function close_1() {
  close.setAttribute("style", "display: none");
}
function close_2() {
  close2.setAttribute("style", "display: none");
}
function close_3() {
  close3.setAttribute("style", "display: none");
}
function close_4() {
  close4.setAttribute("style", "display: none");
}
function close_5() {
  close5.setAttribute("style", "display: none");
}
function close_6() {
  close6.setAttribute("style", "display: none");
}
function close_7() {
  close7.setAttribute("style", "display: none");
}
function close_8() {
  close8.setAttribute("style", "display: none");
}

