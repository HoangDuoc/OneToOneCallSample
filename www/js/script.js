$(document).ready(function() {
  // button turn off/on
  $.fx.off = !$.fx.off;
  $(".click-toggle").on("click", function() {
    console.log("DA CO CLICK");
    $(this)
      .find(".icon-toggle")
      .toggle(
        function() {
          $(this).removeClass("display-none");
        },
        function() {
          $(this).addClass("display-none");
        }
      );

    $(this).find("");
  });
});
