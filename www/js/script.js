$(document).ready(function() {
  // button turn off/on
  $.fx.off = !$.fx.off;
  $(".click-toggle").on("click", function() {
    var iconSlash = $(this).find(".icon-toggle");
    if (iconSlash.hasClass("display-none")) {
      iconSlash.removeClass("display-none");
    } else {
      iconSlash.addClass("display-none");
    }
  });
});
