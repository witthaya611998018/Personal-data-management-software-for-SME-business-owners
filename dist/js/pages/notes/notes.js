$(function () {
  $('.cookie-tag').hide();
  function removeNote() {
    $(".remove-note").off('click').on('click', function (event) {
      event.stopPropagation();
      $(this).parents('.single-note-item').remove();
    })
  }

  function favouriteNote() {
    $(".favourite-note").off('click').on('click', function (event) {
      event.stopPropagation();
      $(this).parents('.single-note-item').toggleClass('note-favourite');
    })
  }

  function addLabelGroups() {
    $('.category-selector .badge-group-item').off('click').on('click', function (event) {
      event.preventDefault();
      /* Act on the event */
      var getclass = this.className;
      var getSplitclass = getclass.split(' ')[0];
      if ($(this).hasClass('badge-business')) {
        $(this).parents('.single-note-item').removeClass('note-social');
        $(this).parents('.single-note-item').removeClass('note-important');
        $(this).parents('.single-note-item').toggleClass(getSplitclass);
      } else if ($(this).hasClass('badge-social')) {
        $(this).parents('.single-note-item').removeClass('note-business');
        $(this).parents('.single-note-item').removeClass('note-important');
        $(this).parents('.single-note-item').toggleClass(getSplitclass);
      } else if ($(this).hasClass('badge-important')) {
        $(this).parents('.single-note-item').removeClass('note-social');
        $(this).parents('.single-note-item').removeClass('note-business');
        $(this).parents('.single-note-item').toggleClass(getSplitclass);
      }
    });
  }

  var $btns = $('.note-link').on("click", function () {
    var draft_tag = document.querySelector('#draft');
    var use_tag = document.querySelector('#use_tag');
    var cancel_tag = document.querySelector('#cancel_tag');
    if (use_tag != null) {
      var null_tag = ["ไม่มี"]
      var use_tag = use_tag.querySelectorAll('.all-category');
      for (let i = 0; i < use_tag.length; i++) {
        if (use_tag[i].getAttribute('class').indexOf("tag_show_" + this.id.split(",")[1]) >= 0) {
          null_tag.push(use_tag[i].getAttribute('class'))
          document.querySelector(".topic_use").hidden = false;
        }
      }
      if (null_tag == "ไม่มี") { // กรณีไม่มี tag เลย ให้ปิด ชื่อสถานะ
        document.querySelector(".topic_use").hidden = true;
      }
    }
    if (cancel_tag != null) {
      var cancel_tag = cancel_tag.querySelectorAll('.all-category');
      var null_tag = ["ไม่มี"]
      for (let i = 0; i < cancel_tag.length; i++) {
        if (cancel_tag[i].getAttribute('class').indexOf("tag_show_" + this.id.split(",")[1]) >= 0) {
          null_tag.push(cancel_tag[i].getAttribute('class'))
          document.querySelector(".topic_cancel").hidden = false;
        }
      }
      if (null_tag == "ไม่มี") { // กรณีไม่มี tag เลย ให้ปิด ชื่อสถานะ
        document.querySelector(".topic_cancel").hidden = true;
      }
    }

    if (draft_tag != null) {
      var null_tag = ["ไม่มี"]
      var draft_tag = draft_tag.querySelectorAll('.all-category');
      for (let i = 0; i < draft_tag.length; i++) {
        if (draft_tag[i].getAttribute('class').indexOf("tag_show_" + this.id.split(",")[1]) >= 0) {
          null_tag.push(draft_tag[i].getAttribute('class'))
          document.querySelector(".topic").hidden = false;
        }
      }
      if (null_tag == "ไม่มี") { // กรณีไม่มี tag เลย ให้ปิด ชื่อสถานะ
        document.querySelector(".topic").hidden = true;
      }
    }

    $('.note-full-container').fadeIn();
    $('.cookie-tag').hide();
    if (this.id == 'all-category') {
      if (document.querySelector(".topic") != null) {
        document.querySelector(".topic").hidden = false;
      }
      if (document.querySelector(".topic_cancel") != null) {
        document.querySelector(".topic_cancel").hidden = false;
      }
      if (document.querySelector(".topic_use") != null) {
        document.querySelector(".topic_use").hidden = false;
      }

      var $el = $('.' + this.id).fadeIn();
      $('.note-full-container > div').not($el).hide();
    } else {
      var $el = $('.tag_show_' + (this.id).split(",")[1]).fadeIn();
      $('.note-full-container > div').not($el).hide();
    }
    $btns.removeClass('active');
    $(this).addClass('active');
  });

  // $('#add-notes').on('click', function (event) {
  //   $('#addnotesmodal').modal('show');
  //   $('#btn-n-save').hide();
  //   $('#btn-n-add').show();
  // })

  // Button add
  $("#btn-n-add").on('click', function (event) {
    event.preventDefault();
    /* Act on the event */
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth()); //January is 0!
    var yyyy = today.getFullYear();
    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    today = dd + ' ' + monthNames[mm] + ' ' + yyyy;

    var $_noteTitle = document.getElementById('note-has-title').value;
    var $_noteDescription = document.getElementById('note-has-description').value;

    $html = '<div class="col-md-4 single-note-item all-category"><div class="card card-body">' +
      '<span class="side-stick"></span>' +
      '<h5 class="note-title text-truncate w-75 mb-0" data-noteHeading="' + $_noteTitle + '">' + $_noteTitle + '<i class="point fas fa-circle ml-1 font-10"></i></h5>' +
      '<p class="note-date font-12 text-muted">' + today + '</p>' +
      '<div class="note-content">' +
      '<p class="note-inner-content text-muted" data-noteContent="' + $_noteDescription + '">' + $_noteDescription + '</p>' +
      '</div>' +
      '<div class="d-flex align-items-center">' +
      '<span class="mr-1"><i class="far fa-star favourite-note"></i></span>' +
      '<span class="mr-1"><i class="far fa-trash-alt remove-note"></i></span>' +
      '<div class="ml-auto">' +
      '<div class="category-selector btn-group">' +
      '<a class="nav-link dropdown-toggle category-dropdown label-group p-0" data-toggle="dropdown" href="#" role="button" aria-haspopup="true" aria-expanded="true">' +
      '<div class="category">' +
      '<div class="category-business"></div>' +
      '<div class="category-social"></div>' +
      '<div class="category-important"></div>' +
      '<span class="more-options text-dark"><i class="icon-options-vertical"></i></span>' +
      '</div>' +
      '</a>' +
      '<div class="dropdown-menu dropdown-menu-right category-menu">' +
      '<a class="note-business badge-group-item badge-business dropdown-item position-relative category-business text-success" href="javascript:void(0);"><i class="mdi mdi-checkbox-blank-circle-outline mr-1"></i>Business</a>' +
      '<a class="note-social badge-group-item badge-social dropdown-item position-relative category-social text-info" href="javascript:void(0);"><i class="mdi mdi-checkbox-blank-circle-outline mr-1"></i> Social</a>' +
      '<a class="note-important badge-group-item badge-important dropdown-item position-relative category-important text-danger" href="javascript:void(0);"><i class="mdi mdi-checkbox-blank-circle-outline mr-1"></i> Important</a>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div></div> ';

    $("#note-full-container").prepend($html);
    $('#addnotesmodal').modal('hide');

    removeNote();
    favouriteNote();
    addLabelGroups();
  });

  $('#addnotesmodal').on('hidden.bs.modal', function (event) {
    event.preventDefault();
    document.getElementById('note-has-title').value = '';
    document.getElementById('note-has-description').value = '';
  })

  removeNote();
  favouriteNote();
  addLabelGroups();

  $('#btn-n-add').attr('disabled', 'disabled');
})

$('#note-has-title').keyup(function () {
  var empty = false;
  $('#note-has-title').each(function () {
    if ($(this).val() == '') {
      empty = true;
    }
  });

  if (empty) {
    $('#btn-n-add').attr('disabled', 'disabled');
  } else {
    $('#btn-n-add').removeAttr('disabled');
  }
});