jQuery(document).ready(function($) {
  // Initial resize all items in [cusrev_reviews_grid]
  resizeAllGridItems();
  // Resize all items in [cusrev_reviews_grid] on window resize
  jQuery(window).on( "resize", function () {
    resizeAllGridItems();
  } );
  //enable attachment of images to comments
  jQuery("form#commentform").attr( "enctype", "multipart/form-data" ).attr( "encoding", "multipart/form-data" );
  //prevent review submission if captcha is not solved
  jQuery("#commentform").on( "submit", function(event) {
    if( ajax_object.ivole_recaptcha === '1' ) {
      var recaptcha = jQuery("#g-recaptcha-response").val();
      if (recaptcha === "") {
        event.preventDefault();
        alert("Please confirm that you are not a robot");
      }
    }
    var cr_ajax_comment = jQuery("#cr-ajax-reviews-review-form form#commentform textarea#comment");
    if( cr_ajax_comment.length > 0 ) {
      if( ajax_object.ivole_allow_empty_comment === '0' && cr_ajax_comment.val().trim().length === 0 ) {
        event.preventDefault();
        alert(ajax_object.ivole_allow_empty_comment_alert);
      }
    }
  } );
  //show lightbox when click on images attached to reviews
  jQuery("ol.commentlist").on("click", ".ivole-comment-a", function(t) {
    if(ajax_object.ivole_disable_lightbox === '0') {
        //only if lightbox is not disabled in settings of the plugin
        t.preventDefault();
        var o = jQuery(".pswp")[0];
        var pics = jQuery(this).parent().parent().find("img");
        var this_pic = jQuery(this).find("img");
        var inx = 0;
        if (pics.length > 0 && this_pic.length > 0) {
            var a = [];
            for (i = 0; i < pics.length; i++) {
                a.push({
                    src: pics[i].src,
                    w: pics[i].naturalWidth,
                    h: pics[i].naturalHeight,
                    title: pics[i].alt
                });
                if (this_pic[0].src == pics[i].src) {
                    inx = i;
                }
            }
            var r = {
                index: inx
            };
            new PhotoSwipe(o, PhotoSwipeUI_Default, a, r).init();
        }
    }
  });
  //register a listener for votes on for reviews
  initVoteClick("ol.commentlist", ".ivole-a-button");
  //register a listener for the voting buttons on modal
  initVoteClick(".cr-ajax-reviews-cus-images-modal", ".ivole-a-button");

  //show lightbox when click on images attached to reviews
  jQuery(".ivole-video-a, .iv-comment-video-icon").on( "click", function(t) {
    if( ! jQuery( "#iv-comment-videos-id" ).hasClass( "iv-comment-videos-modal" ) ) {
      var tt = t.target.closest("[id^='iv-comment-video-id-']");
      var iid = "#" + tt.id;
      jQuery( "#iv-comment-videos-id" ).addClass( "iv-comment-videos-modal" );
      jQuery( iid ).addClass( "iv-comment-video-modal" );
      jQuery( iid ).find( "video" ).prop( "controls", true );
      jQuery( iid ).find( ".iv-comment-video-icon" ).hide();
      jQuery( iid ).find( "video" ).get(0).play();
      jQuery( iid ).css({
        "top": "50%",
        "margin-top": function() { return -$(this).outerHeight() / 2 }
      });
      return false;
    }
  } );
  //close video lightbox
  jQuery("#iv-comment-videos-id").on( "click", function(t) {
    if( jQuery( "#iv-comment-videos-id" ).hasClass( "iv-comment-videos-modal" ) ) {
      jQuery( "#iv-comment-videos-id" ).removeClass( "iv-comment-videos-modal" );
      var vids = jQuery( "#iv-comment-videos-id" ).find("[id^='iv-comment-video-id-']");
      var i = 0;
      var iid = "";
      for( i = 0; i < vids.length; i++ ) {
        iid = "#" + vids[i].id;
        if( jQuery( iid ).hasClass( "iv-comment-video-modal" ) ) {
          jQuery( iid ).removeClass( "iv-comment-video-modal" );
          jQuery( iid ).find( "video").get(0).pause();
          jQuery( iid ).find( "video" ).prop( "controls", false );
          jQuery( iid ).find( ".iv-comment-video-icon" ).show();
          jQuery( iid ).removeAttr("style");
        }
      }
      return false;
    }
  } );
  //show more ajax reviews
  jQuery("#cr-show-more-reviews-id").on( "click", function(t) {
    t.preventDefault();
    var cr_product_id = jQuery(".commentlist.cr-ajax-reviews-list").attr("data-product");
    var cr_nonce = jQuery(this).attr("data-nonce");
    var cr_page = jQuery(this).attr("data-page");
    var cr_sort = jQuery("#cr-ajax-reviews-sort").children("option:selected").val();
    var cr_rating = jQuery("div.ivole-summaryBox.cr-summaryBox-ajax tr.ivole-histogramRow.ivole-histogramRow-s a.ivole-histogram-a").attr("data-rating");
    var cr_search = jQuery(".cr-ajax-search input").val();
    var cr_tags = [];
    jQuery(".cr-review-tags-filter .cr-tags-filter.cr-tag-selected").each(function() {
      cr_tags.push(jQuery(this).attr("data-crtagid"));
    });
    if(!cr_rating){
      cr_rating = 0;
    }
    var cr_data = {
      "action": "cr_show_more_reviews",
      "productID": cr_product_id,
      "page": cr_page,
      "sort": cr_sort,
      "rating": cr_rating,
      "search": cr_search,
      "tags": cr_tags,
      "security": cr_nonce
    };
    jQuery(".cr-search-no-reviews").hide();
    jQuery("#cr-show-more-reviews-id").hide();
    jQuery("#cr-show-more-review-spinner").show();
    jQuery("div.ivole-summaryBox.cr-summaryBox-ajax").addClass("cr-summaryBar-updating");
    jQuery("#cr-ajax-reviews-sort").addClass("cr-sort-updating");
    jQuery("div.cr-review-tags-filter").addClass("cr-review-tags-filter-disabled");
    jQuery.post(ajax_object.ajax_url, cr_data, function(response) {
      jQuery("#cr-show-more-review-spinner").hide();
      jQuery("div.ivole-summaryBox.cr-summaryBox-ajax").removeClass("cr-summaryBar-updating");
      jQuery("#cr-ajax-reviews-sort").removeClass("cr-sort-updating");
      jQuery("div.cr-review-tags-filter").removeClass("cr-review-tags-filter-disabled");
      if(response.page > 0){
        jQuery(".commentlist.cr-ajax-reviews-list").append(response.html);
        jQuery("#cr-show-more-reviews-id").attr("data-page",response.page);
        if(!response.last_page){
          jQuery("#cr-show-more-reviews-id").show();
        }
      }
      if(response.html == null && response.page === 1){
        jQuery(".cr-search-no-reviews").show();
      }
    }, "json");
  } );
  //ajax sorting of reviews
  jQuery("#cr-ajax-reviews-sort").on( "change", function(t) {
    t.preventDefault();
    var cr_product_id = jQuery(".commentlist.cr-ajax-reviews-list").attr("data-product");
    var cr_nonce = jQuery(this).attr("data-nonce");
    var cr_sort = jQuery(this).children("option:selected").val();
    var cr_rating = jQuery("div.ivole-summaryBox.cr-summaryBox-ajax tr.ivole-histogramRow.ivole-histogramRow-s a.ivole-histogram-a").attr("data-rating");
    if(!cr_rating){
      cr_rating = 0;
    }
    var cr_data = {
      "action": "cr_sort_reviews",
      "productID": cr_product_id,
      "sort": cr_sort,
      "rating": cr_rating,
      "security": cr_nonce
    };
    jQuery(".cr-search-no-reviews").hide();
    jQuery('.cr-ajax-search input').val("").trigger("change");
    jQuery("#cr-show-more-reviews-id").hide();
    jQuery(".commentlist.cr-ajax-reviews-list").hide();
    jQuery("#cr-show-more-review-spinner").show();
    jQuery("div.ivole-summaryBox.cr-summaryBox-ajax").addClass("cr-summaryBar-updating");
    jQuery("#cr-ajax-reviews-sort").addClass("cr-sort-updating");
    jQuery.post(ajax_object.ajax_url, cr_data, function(response) {
      jQuery("#cr-show-more-review-spinner").hide();
      jQuery("div.ivole-summaryBox.cr-summaryBox-ajax").removeClass("cr-summaryBar-updating");
      jQuery("#cr-ajax-reviews-sort").removeClass("cr-sort-updating");
      if(response.page>0){
        jQuery(".commentlist.cr-ajax-reviews-list").empty();
        jQuery(".commentlist.cr-ajax-reviews-list").append(response.html);
        jQuery(".commentlist.cr-ajax-reviews-list").show();
        jQuery("#cr-show-more-reviews-id").attr("data-page",response.page);
        if(!response.last_page){
          jQuery("#cr-show-more-reviews-id").show();
        }
      }
    }, "json");
  } );
  //ajax filtering of reviews
  jQuery("div.ivole-summaryBox.cr-summaryBox-ajax").on("click", "a.ivole-histogram-a, .ivole-seeAllReviews", function(t){
    t.preventDefault();
    var cr_product_id = jQuery(".commentlist.cr-ajax-reviews-list").attr("data-product");
    var cr_nonce = jQuery("div.ivole-summaryBox.cr-summaryBox-ajax").attr("data-nonce");
    var cr_rating = jQuery(this).attr("data-rating");
    var cr_sort = jQuery("#cr-ajax-reviews-sort").children("option:selected").val();
    var cr_data = {
      "action": "cr_filter_reviews",
      "productID": cr_product_id,
      "rating": cr_rating,
      "sort": cr_sort,
      "security": cr_nonce
    };
    jQuery("div.ivole-summaryBox.cr-summaryBox-ajax tr.ivole-histogramRow.ivole-histogramRow-s").removeClass("ivole-histogramRow-s");
    if( cr_rating > 0 ) {
      jQuery(this).closest("tr.ivole-histogramRow").addClass("ivole-histogramRow-s");
    }
    jQuery(".cr-search-no-reviews").hide();
    jQuery('.cr-ajax-search input').val("").trigger("change");
    jQuery("#cr-show-more-reviews-id").hide();
    jQuery(".commentlist.cr-ajax-reviews-list").hide();
    jQuery("#cr-show-more-review-spinner").show();
    jQuery("div.ivole-summaryBox.cr-summaryBox-ajax").addClass("cr-summaryBar-updating");
    jQuery("#cr-ajax-reviews-sort").addClass("cr-sort-updating");
    jQuery.post(ajax_object.ajax_url, cr_data, function(response) {
      jQuery("#cr-show-more-review-spinner").hide();
      jQuery("div.ivole-summaryBox.cr-summaryBox-ajax").removeClass("cr-summaryBar-updating");
      jQuery("#cr-ajax-reviews-sort").removeClass("cr-sort-updating");
      if(response.page>0){
        jQuery("div#cr-ajax-reviews-fil-sta").remove();
        jQuery("div.ivole-summaryBox.cr-summaryBox-ajax").append(response.filter_note);
        jQuery(".commentlist.cr-ajax-reviews-list").empty();
        jQuery(".commentlist.cr-ajax-reviews-list").append(response.html);
        jQuery(".commentlist.cr-ajax-reviews-list").show();
        jQuery("#cr-show-more-reviews-id").attr("data-page",response.page);
        if(!response.last_page){
          jQuery("#cr-show-more-reviews-id").show();
        }
      }
    }, "json");
  });
  //ajax search of reviews
  jQuery('.cr-ajax-search input').on("keyup", function(e){
    if(e.keyCode == 13){
      jQuery(".cr-ajax-search button").trigger("click");
    }
    //show clear icon
    if(jQuery(this).val() != "") jQuery(".cr-ajax-search .cr-clear-input").css("display", "inline-block");
  }).on("change", function(){
    if(jQuery(this).val() === "") jQuery(".cr-ajax-search .cr-clear-input").hide();
  });
  jQuery(".cr-ajax-search .cr-clear-input").on("click", function () {
    jQuery(this).prev("input").val("");
    jQuery(".cr-ajax-search .cr-clear-input").hide();
    jQuery(".cr-ajax-search button").trigger("click");
  });
  jQuery(".cr-ajax-search button").on("click", function (e) {
    e.preventDefault();

    jQuery("#cr-show-more-reviews-id").attr("data-page", 0);
    //clear reviews
    jQuery(".cr-reviews-ajax-comments .cr-ajax-reviews-list").empty();

    jQuery("#cr-show-more-reviews-id").trigger("click");
  });
  jQuery("button.cr-ajax-reviews-add-review").on( "click", function(t) {
    t.preventDefault();
    jQuery("#comments.cr-reviews-ajax-comments").hide();
    jQuery("#cr-ajax-reviews-review-form").show();
  } );
  jQuery("a#cr-ajax-reviews-cancel").on( "click", function(t) {
    t.preventDefault();
    jQuery("#cr-ajax-reviews-review-form").hide();
    jQuery("#comments.cr-reviews-ajax-comments").show();
  } );
  //click to filter reviews by tags
  jQuery(".cr-review-tags-filter span.cr-tags-filter").on( "click", function (e) {
    e.preventDefault();
    jQuery("#cr-show-more-reviews-id").attr("data-page", 0);

    //clear reviews
    jQuery(".cr-reviews-ajax-comments .cr-ajax-reviews-list").empty();

    if(jQuery(this).hasClass("cr-tag-selected")) {
      jQuery(this).removeClass("cr-tag-selected");
    } else {
      jQuery(this).addClass("cr-tag-selected");
    }
    jQuery("#cr-show-more-reviews-id").trigger("click");
  } );
  //open popup window with pictures
  jQuery("div.iv-comment-image-top img").on( "click", function(t) {
    t.preventDefault();
    var slide_no = jQuery(this).data("slide");
    jQuery("#reviews.cr-reviews-ajax-reviews div.cr-ajax-reviews-cus-images-modal-cont").addClass("cr-mask-active");
    jQuery("body").addClass("cr-noscroll");
    jQuery("#reviews.cr-reviews-ajax-reviews div.cr-ajax-reviews-cus-images-modal div.cr-ajax-reviews-cus-images-slider-main").slick('setPosition');
    jQuery("#reviews.cr-reviews-ajax-reviews div.cr-ajax-reviews-cus-images-modal div.cr-ajax-reviews-cus-images-slider-nav").slick('setPosition');
    if(typeof slide_no !== 'undefined') {
      jQuery("#reviews.cr-reviews-ajax-reviews div.cr-ajax-reviews-cus-images-modal div.cr-ajax-reviews-cus-images-slider-main").slick('slickGoTo',slide_no,true);
      jQuery("#reviews.cr-reviews-ajax-reviews div.cr-ajax-reviews-cus-images-modal div.cr-ajax-reviews-cus-images-slider-nav").slick('slickGoTo',slide_no,true);
    }
  } );
  //close popup window with pictures
  jQuery("#reviews.cr-reviews-ajax-reviews div.cr-ajax-reviews-cus-images-modal-cont, #reviews.cr-reviews-ajax-reviews div.cr-ajax-reviews-cus-images-modal button.cr-ajax-reviews-cus-images-close").on( "click", function(t) {
    t.preventDefault();
    jQuery("#reviews.cr-reviews-ajax-reviews .cr-mask-active div.cr-ajax-reviews-cus-images-modal div.cr-ajax-reviews-cus-images-slider-main").slick('slickGoTo',0,true);
    jQuery("#reviews.cr-reviews-ajax-reviews .cr-mask-active div.cr-ajax-reviews-cus-images-modal div.cr-ajax-reviews-cus-images-slider-nav").slick('slickGoTo',0,true);
    jQuery("#reviews.cr-reviews-ajax-reviews div.cr-ajax-reviews-cus-images-modal-cont").removeClass("cr-mask-active");
    jQuery("body").removeClass("cr-noscroll");
  } );
  jQuery("#reviews.cr-reviews-ajax-reviews div.cr-ajax-reviews-cus-images-modal").on( "click", function(t) {
    t.stopPropagation();
  } );
  //Product variations
  $( ".single_variation_wrap" ).on( "show_variation", function ( event, variation ) {
    if(jQuery(".cr_gtin").length){
      jQuery(".cr_gtin_val").text(variation._cr_gtin);
    }
    if(jQuery(".cr_mpn").length){
      jQuery(".cr_mpn_val").text(variation._cr_mpn);
    }
    if(jQuery(".cr_brand").length){
      jQuery(".cr_brand_val").text(variation._cr_brand);
    }
  });
  //Reset Product variations
  jQuery(document).on('reset_data', function () {

    var $cr_gtin = jQuery(".cr_gtin"),
        $cr_mpn = jQuery(".cr_mpn"),
        $cr_brand = jQuery(".cr_brand");

    if($cr_gtin.length){
      jQuery(".cr_gtin_val").text($cr_gtin.data("o_content"));
    }
    if($cr_mpn.length){
      jQuery(".cr_mpn_val").text($cr_mpn.data("o_content"));
    }
    if($cr_brand.length){
      jQuery(".cr_brand_val").text($cr_brand.data("o_content"));
    }
  });
  //show more ajax reviews in the grid
  jQuery(".ivole-show-more-button").on("click", function (e) {
    e.preventDefault();

    var $this = jQuery(this),
    $spinner =  $this.next(".ivole-show-more-spinner"),
    attributes = $this.parents(".ivole-reviews-grid").data("attributes");

    attributes.offset = $this.parents(".ivole-reviews-grid").find(".ivole-review-card.cr-card-product").length;
    attributes.shop_offset = $this.parents(".ivole-reviews-grid").find(".ivole-review-card.cr-card-shop").length;

    var grid_data = {
      'action': "ivole_show_more_grid_reviews",
      'attributes': attributes
    };

    $this.hide();
    $spinner.show();

    jQuery.post(ajax_object.ajax_url, grid_data, function(response) {
      $spinner.hide();
      $reviews = jQuery(response.html).find(".ivole-reviews-grid-inner");
      if($reviews.length){
        $this.parents(".ivole-reviews-grid").find(".ivole-reviews-grid-inner").append($reviews.html());
        $this.show();
        resizeAllGridItems();
      } else {
        $this.hide();
      }
    }).fail(function(response) {
      $spinner.hide();
      $this.show();
      $this.parent().append('<div style="color: #cd2653;text-align: center;display: block;">'+response.responseText+'</div>');
    });
  });
  jQuery('#cr_floatingtrustbadge_front').on( "click", function() {
    if( !jQuery(this).hasClass( 'cr-floatingbadge-big' ) ) {
      jQuery(this).find('img.cr_floatingtrustbadge_small').hide();
      jQuery(this).find('a.cr_floatingtrustbadge_big').css( 'display', 'block' );
      jQuery(this).find('div.cr-floatingbadge-close').css( 'display', 'block' );
      jQuery(this).addClass( 'cr-floatingbadge-big' );
      //update colors
      var crcolors = jQuery(this).data('crcolors');
      if (typeof crcolors !== 'undefined') {
        jQuery(this).css( 'border-color', crcolors['big']['border'] );
        jQuery(this).find('div.cr-floatingbadge-background-top').css( 'background-color', crcolors['big']['top'] );
        jQuery(this).find('div.cr-floatingbadge-background-middle').css( 'background-color', crcolors['big']['middle'] );
        jQuery(this).find('div.cr-floatingbadge-background-bottom').css( 'background-color', crcolors['big']['bottom'] );
        jQuery(this).find('div.cr-floatingbadge-background-bottom').css( 'border-color', crcolors['big']['border'] );
      }
    }
  } );
  jQuery('#cr_floatingtrustbadge_front .cr-floatingbadge-close').on( "click", function(event) {
    if( jQuery('#cr_floatingtrustbadge_front').hasClass( 'cr-floatingbadge-big' ) ) {
      jQuery(this).closest('#cr_floatingtrustbadge_front').find('a.cr_floatingtrustbadge_big').hide();
      jQuery(this).closest('#cr_floatingtrustbadge_front').find('img.cr_floatingtrustbadge_small').css( 'display', 'block' );
      jQuery(this).closest('#cr_floatingtrustbadge_front').removeClass( 'cr-floatingbadge-big' );
      //update colors
      var crcolors = jQuery(this).closest('#cr_floatingtrustbadge_front').data('crcolors');
      if (typeof crcolors !== 'undefined') {
        jQuery(this).closest('#cr_floatingtrustbadge_front').css( 'border-color', crcolors['small']['border'] );
        jQuery(this).closest('#cr_floatingtrustbadge_front').find('div.cr-floatingbadge-background-top').css( 'background-color', crcolors['small']['top'] );
        jQuery(this).closest('#cr_floatingtrustbadge_front').find('div.cr-floatingbadge-background-middle').css( 'background-color', crcolors['small']['middle'] );
        jQuery(this).closest('#cr_floatingtrustbadge_front').find('div.cr-floatingbadge-background-bottom').css( 'background-color', crcolors['small']['bottom'] );
        jQuery(this).closest('#cr_floatingtrustbadge_front').find('div.cr-floatingbadge-background-bottom').css( 'border-color', crcolors['small']['border'] );
      }
    } else {
      jQuery('#cr_floatingtrustbadge_front').hide();
      document.cookie = 'cr_hide_trustbadge=true; path=/; max-age='+60*60*24+';';
    }
    event.stopPropagation();
  } );
  jQuery('.cr-slider-read-more a').on( "click", function (e) {
    e.preventDefault();
    let parent = jQuery(this).parents(".review-text");
    parent.find(".cr-slider-read-more").hide();
    parent.find(".cr-slider-details").css("display", "inline");
  } );
  jQuery('.cr-slider-read-less a').on( "click", function (e) {
    e.preventDefault();
    let parent = jQuery(this).parents(".review-text");
    parent.find(".cr-slider-details").hide();
    parent.find(".cr-slider-read-more").css("display", "inline");
  } );
  jQuery('#cr_qna.cr-qna-block .cr-qna-search-block button.cr-qna-ask-button').on( "click", function (e) {
    e.preventDefault();
    jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form').addClass( "cr-q-modal" );
    jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form.cr-qna-new-a-form').removeClass( "cr-q-modal" );
    jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay').addClass( "cr-q-modal" );
    jQuery("body").addClass("cr-noscroll");
  } );
  jQuery("#cr_qna.cr-qna-block .cr-qna-list-block .cr-qna-list-block-inner").on( "click", ".cr-qna-ans-button", function (e) {
    e.preventDefault();
    let parent = jQuery(this).parents(".cr-qna-list-q-cont");
    let question = parent.find("span.cr-qna-list-question").text();
    if( question.length ) {
      jQuery( "#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form.cr-qna-new-a-form .cr-qna-new-q-form-input .cr-qna-new-q-form-text").text(question);
    }
    let question_id = jQuery(this).attr( "data-question" );
    if( question_id.length ) {
      jQuery( "#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form .cr-qna-new-q-form-input .cr-qna-new-q-form-s-b").attr( "data-question", question_id );
    }
    jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form').removeClass( "cr-q-modal" );
    jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form.cr-qna-new-a-form').addClass( "cr-q-modal" );
    jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay').addClass( "cr-q-modal" );
    jQuery("body").addClass("cr-noscroll");
  } );
  jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay').on( "click", function (e) {
    e.preventDefault();
    jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form .cr-qna-new-q-form-ok').css( 'display', 'none' );
    jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form .cr-qna-new-q-form-error').css( 'display', 'none' );
    jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form .cr-qna-new-q-form-input').css( 'display', 'block' );
    jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form').removeClass( 'cr-q-modal' );
    jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay').removeClass( 'cr-q-modal' );
    jQuery("body").removeClass("cr-noscroll");
  } );
  jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form .cr-qna-new-q-form-close').on( "click", function (e) {
    e.preventDefault();
    jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form .cr-qna-new-q-form-ok').css( 'display', 'none' );
    jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form .cr-qna-new-q-form-error').css( 'display', 'none' );
    jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form .cr-qna-new-q-form-input').css( 'display', 'block' );
    jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form').removeClass( 'cr-q-modal' );
    jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay').removeClass( 'cr-q-modal' );
    jQuery("body").removeClass("cr-noscroll");
  } );
  jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form').on( "click", function (e) {
    e.stopPropagation();
  } );
  jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form .cr-qna-new-q-form-q, #cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form .cr-qna-new-q-form-name, #cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form .cr-qna-new-q-form-email').on( "input", function (e) {
    jQuery(this).addClass( 'cr-qna-new-q-form-notinit' );
    crValidateQna();
  } );
  jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form .cr-qna-new-q-form-input .cr-qna-new-q-form-s-b').on( "click", function (e) {
    if( crValidateQnaHelper() ) {
      var cr_cptcha = jQuery(this).attr("data-crcptcha");
      if( cr_cptcha && cr_cptcha.length > 0 ) {
        grecaptcha.ready(function() {
          grecaptcha.execute(cr_cptcha, {action: 'submit'}).then(function(token) {
            crNewQna(token)
          });
        });
      } else {
        crNewQna('');
      }
    }
  } );
  jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form .cr-qna-new-q-form-ok .cr-qna-new-q-form-s-b').on( "click", function (e) {
    e.preventDefault();
    jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form .cr-qna-new-q-form-ok').css( 'display', 'none' );
    jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form .cr-qna-new-q-form-error').css( 'display', 'none' );
    jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form .cr-qna-new-q-form-input').css( 'display', 'block' );
    jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form').removeClass( 'cr-q-modal' );
    jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay').removeClass( 'cr-q-modal' );
    jQuery("body").removeClass("cr-noscroll");
  } );
  //voting for questions
  jQuery("#cr_qna.cr-qna-block .cr-qna-list-block").on( "click", ".cr-qna-list-q-cont .cr-qna-list-q-b .cr-qna-list-q-b-r .cr-qna-q-voting img", function (e) {
    e.preventDefault();
    var cr_upvote = 0;
    var cr_question_id = 0;
    cr_question_id = jQuery(this).parents(".cr-qna-q-voting").attr("data-vquestion");;
    cr_upvote = jQuery(this).attr("data-upvote");
    var cr_data = {
      "action": "cr_vote_question",
      "questionID": cr_question_id,
      "upvote": cr_upvote
    };
    jQuery(this).parents(".cr-qna-q-voting").addClass( "cr-q-vote-loading" );
    jQuery(this).parents(".cr-qna-list-q-b-r").find(".cr-qna-q-voting-spinner").addClass( "cr-q-vote-loading" );
    jQuery.post(ajax_object.ajax_url, cr_data, function(response) {
      jQuery("#cr_qna.cr-qna-block .cr-qna-list-block .cr-qna-list-q-cont .cr-qna-list-q-b .cr-qna-list-q-b-r .cr-qna-q-voting-spinner-" + response.qid).removeClass( "cr-q-vote-loading" );
      jQuery("#cr_qna.cr-qna-block .cr-qna-list-block .cr-qna-list-q-cont .cr-qna-list-q-b .cr-qna-list-q-b-r .cr-qna-q-voting-" + response.qid).removeClass( "cr-q-vote-loading" );
      if( 0 === response.code ) {
        jQuery("#cr_qna.cr-qna-block .cr-qna-list-block .cr-qna-list-q-cont .cr-qna-list-q-b .cr-qna-list-q-b-r .cr-qna-q-voting-" + response.qid + " .cr-qna-q-voting-upvote").text( "(" + response.upvotes + ")" );
        jQuery("#cr_qna.cr-qna-block .cr-qna-list-block .cr-qna-list-q-cont .cr-qna-list-q-b .cr-qna-list-q-b-r .cr-qna-q-voting-" + response.qid + " .cr-qna-q-voting-downvote").text( "(" + response.downvotes + ")" );
      }
    }, "json");
  } );
  //show more questions and answers
  jQuery("#cr_qna.cr-qna-block #cr-show-more-q-id").on( "click", function(t) {
    t.preventDefault();
    var cr_product_id = jQuery(this).attr("data-product");
    var cr_nonce = jQuery(this).attr("data-nonce");
    var cr_page = jQuery(this).attr("data-page");
    var cr_search = jQuery("#cr_qna.cr-qna-block .cr-ajax-qna-search input").val();
    var cr_data = {
      "action": "cr_show_more_qna",
      "productID": cr_product_id,
      "page": cr_page,
      "search": cr_search,
      "security": cr_nonce
    };
    jQuery("#cr_qna.cr-qna-block .cr-search-no-qna").hide();
    jQuery("#cr_qna.cr-qna-block #cr-show-more-q-id").hide();
    jQuery("#cr_qna.cr-qna-block #cr-show-more-q-spinner").show();
    jQuery.post(ajax_object.ajax_url, cr_data, function(response) {
      jQuery("#cr_qna.cr-qna-block #cr-show-more-q-spinner").hide();
      if(response.page >= 0){
        jQuery("#cr_qna.cr-qna-block .cr-qna-list-block .cr-qna-list-block-inner").append(response.html);
        jQuery("#cr_qna.cr-qna-block #cr-show-more-q-id").attr("data-page",response.page);
        if(!response.last_page){
          jQuery("#cr_qna.cr-qna-block #cr-show-more-q-id").show();
        }
      }
      if(response.html === "" && response.page === 0){
        jQuery("#cr_qna.cr-qna-block .cr-search-no-qna").show();
      }
    }, "json");
  } );
  //search questions and answers
  jQuery("#cr_qna.cr-qna-block .cr-ajax-qna-search input").on("keyup", cr_keyup_delay(function(e) {
    // do nothing if it's an arrow key
    var code = (e.keyCode || e.which);
    if(code == 37 || code == 38 || code == 39 || code == 40) {
      return;
    }
    jQuery("#cr_qna.cr-qna-block #cr-show-more-q-id").attr("data-page", -1);
    jQuery("#cr_qna.cr-qna-block .cr-qna-list-block .cr-qna-list-block-inner").empty();
    jQuery("#cr_qna.cr-qna-block #cr-show-more-q-id").trigger("click");
  }, 500));
  jQuery("#cr_qna.cr-qna-block .cr-ajax-qna-search input").on("keyup", function(e){
    //show clear icon
    if(jQuery(this).val() !== "") {
      jQuery("#cr_qna.cr-qna-block .cr-ajax-qna-search .cr-clear-input").css("display", "inline-block");
    } else {
      if(jQuery(this).val() === "") jQuery("#cr_qna.cr-qna-block .cr-ajax-qna-search .cr-clear-input").hide();
    }
  }).on("change", function(){
    if(jQuery(this).val() === "") jQuery("#cr_qna.cr-qna-block .cr-ajax-qna-search .cr-clear-input").hide();
  });
  jQuery("#cr_qna.cr-qna-block .cr-ajax-qna-search .cr-clear-input").on("click", function () {
    jQuery(this).prev("input").val("");
    jQuery("#cr_qna.cr-qna-block .cr-ajax-qna-search .cr-clear-input").hide();
    jQuery("#cr_qna.cr-qna-block #cr-show-more-q-id").attr("data-page", -1);
    jQuery("#cr_qna.cr-qna-block .cr-qna-list-block .cr-qna-list-block-inner").empty();
    jQuery("#cr_qna.cr-qna-block #cr-show-more-q-id").trigger("click");
  });
  //show QnA tab
  jQuery("body").on("click", "a.cr-qna-link", function () {
    jQuery( '.cr_qna_tab a' ).click();
    return true;
  });
});

function resizeAllGridItems(){
    jQuery('.ivole-reviews-grid-inner > .ivole-review-card').each(function() {
      let $parent = jQuery(this).parent();
      let parent_width = $parent.width();
      let classes = ["ivole-reviews-grid-inner"];

      if(parent_width < 680){
          classes.push("cr-grid-columns-2");
      }else classes = classes.filter(val => val !== "cr-grid-columns-2"); //remove from array
      if(parent_width < 480){
        classes.push("cr-single-column");
      }else classes = classes.filter(val => val !== "cr-single-column"); //remove from array

      $parent.removeClass();
      $parent[0].className = classes.join(" ");

      let rowHeight = parseInt( $parent.css('grid-auto-rows') );
      if(isNaN(rowHeight)) rowHeight = 0;
      let rowGap = parseInt( $parent.css('grid-row-gap') );
      let rowSpan = Math.ceil(
        (
          jQuery( this ).find('.ivole-review-card-content').height() +
          parseInt(jQuery( this ).css("borderTopWidth")) + parseInt(jQuery( this ).css("borderBottomWidth")) +
          parseInt(jQuery( this ).css("paddingTop")) + parseInt(jQuery( this ).css("paddingBottom")) +
          rowGap
        ) / ( rowHeight + rowGap )
      );
      jQuery( this ).css( 'gridRowEnd', 'span ' + rowSpan );
    });
}

function initVoteClick(sel1, sel2){
  jQuery(sel1).on("click", sel2, function(e) {
    e.preventDefault();

    let reviewIDhtml = jQuery(this).data("vote");
    let $parent = jQuery(this).parents(".ivole-voting-cont");

    if(reviewIDhtml != null) {
      let reviewID = reviewIDhtml;
      let data = {
        "action": "ivole_vote_review",
        "reviewID": reviewID,
        "upvote": jQuery(this).data("upvote"),
        "security": ajax_object.ajax_nonce
      };

      $parent.find(".ivole-declarative").hide();
      $parent.find(".ivole-reviewvoting-" + reviewID).text(ajax_object.text_processing);
      jQuery.post(ajax_object.ajax_url, data, function(response) {
        if( response.code === 0 ) {
          $parent.find(".ivole-reviewvoting-" + reviewID).text(ajax_object.text_thankyou);
        } else if( response.code === 1 ) {
          $parent.find(".ivole-reviewvoting-" + reviewID).text(ajax_object.text_thankyou);
        } else if( response.code === 2 ) {
          $parent.find(".ivole-reviewvoting-" + reviewID).text(ajax_object.text_thankyou);
        } else if( response.code === 3 ) {
          $parent.find(".ivole-reviewvoting-" + reviewID).text(ajax_object.text_error1);
        } else {
          $parent.find(".ivole-reviewvoting-" + reviewID).text(ajax_object.text_error2);
        }
      }, "json");
    }
  });
}

function crValidateQnaHelper() {
  var ret = true;
  if( jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form.cr-q-modal .cr-qna-new-q-form-q').val().trim().length <= 0 ) {
    jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form.cr-q-modal .cr-qna-new-q-form-q').addClass( 'cr-qna-new-q-form-invalid' );
    ret = false;
  } else {
    jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form.cr-q-modal .cr-qna-new-q-form-q').removeClass( 'cr-qna-new-q-form-invalid' );
  }
  if( jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form.cr-q-modal .cr-qna-new-q-form-name').val().trim().length <= 0 ) {
    jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form.cr-q-modal .cr-qna-new-q-form-name').addClass( 'cr-qna-new-q-form-invalid' );
    ret = false;
  } else {
    jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form.cr-q-modal .cr-qna-new-q-form-name').removeClass( 'cr-qna-new-q-form-invalid' );
  }
  if( !crValidateEmail(jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form.cr-q-modal .cr-qna-new-q-form-email').val().trim()) ) {
    jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form.cr-q-modal .cr-qna-new-q-form-email').addClass( 'cr-qna-new-q-form-invalid' );
    ret = false;
  } else {
    jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form.cr-q-modal .cr-qna-new-q-form-email').removeClass( 'cr-qna-new-q-form-invalid' );
  }
  return ret;
}

function crValidateQna() {
  if( crValidateQnaHelper() ) {
    jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form.cr-q-modal .cr-qna-new-q-form-s button.cr-qna-new-q-form-s-b').addClass( 'cr-q-active' );
  } else {
    jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form.cr-q-modal .cr-qna-new-q-form-s button.cr-qna-new-q-form-s-b').removeClass( 'cr-q-active' );
  }
}

function crValidateEmail(email) {
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
}

function crNewQna(token) {
  var cr_nonce = jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form.cr-q-modal .cr-qna-new-q-form-input .cr-qna-new-q-form-s-b').attr("data-nonce");
  var cr_product_id = jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form.cr-q-modal .cr-qna-new-q-form-input .cr-qna-new-q-form-s-b').attr("data-product");
  var cr_text = jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form.cr-q-modal .cr-qna-new-q-form-q').val().trim();
  var cr_name = jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form.cr-q-modal .cr-qna-new-q-form-name').val().trim();
  var cr_email = jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form.cr-q-modal .cr-qna-new-q-form-email').val().trim();
  var cr_question_id = jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form.cr-q-modal .cr-qna-new-q-form-input .cr-qna-new-q-form-s-b').attr("data-question");
  var cr_data = {
    "action": "cr_new_qna",
    "productID": cr_product_id,
    "questionID": cr_question_id,
    "text": cr_text,
    "name": cr_name,
    "email": cr_email,
    "security": cr_nonce,
    "cptcha": token
  };
  jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form.cr-q-modal .cr-qna-new-q-form-input .cr-qna-new-q-form-s-b').css( 'display', 'none' );
  jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form.cr-q-modal .cr-qna-new-q-form-input .cr-qna-new-q-form-s-p').css( 'display', 'inline-block' );
  jQuery.post(ajax_object.ajax_url, cr_data, function(response) {
    if( 0 === response.code ) {
      jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form.cr-q-modal .cr-qna-new-q-form-error').css( 'display', 'none' );
      jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form.cr-q-modal .cr-qna-new-q-form-input').css( 'display', 'none' );
      jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form.cr-q-modal .cr-qna-new-q-form-ok').css( 'display', 'block' );
    } else {
      if( response.description && response.description.length > 0 ) {
        jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form.cr-q-modal .cr-qna-new-q-form-error p.cr-qna-new-q-form-text').append( ' ' + response.description );
      }
      jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form.cr-q-modal .cr-qna-new-q-form-ok').css( 'display', 'none' );
      jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form.cr-q-modal .cr-qna-new-q-form-input').css( 'display', 'none' );
      jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form.cr-q-modal .cr-qna-new-q-form-error').css( 'display', 'block' );
    }
    jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form.cr-q-modal .cr-qna-new-q-form-q').val('');
    jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form.cr-q-modal .cr-qna-new-q-form-name').val('');
    jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form.cr-q-modal .cr-qna-new-q-form-email').val('');
    jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form.cr-q-modal .cr-qna-new-q-form-q, #cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form .cr-qna-new-q-form-name, #cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form .cr-qna-new-q-form-email').removeClass( 'cr-qna-new-q-form-notinit' );
    jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form.cr-q-modal .cr-qna-new-q-form-input .cr-qna-new-q-form-s-b').css( 'display', 'inline-block' );
    jQuery('#cr_qna.cr-qna-block .cr-qna-new-q-overlay .cr-qna-new-q-form.cr-q-modal .cr-qna-new-q-form-input .cr-qna-new-q-form-s-p').css( 'display', 'none' );
  }, "json");
}

function cr_keyup_delay(fn, ms) {
  let timer = 0;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(fn.bind(this, ...args), ms || 0);
  };
}
