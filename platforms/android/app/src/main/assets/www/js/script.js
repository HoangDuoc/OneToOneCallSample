$(document).ready(function () {
	// button turn off/on

	$.fx.off = !$.fx.off;
	$('.click-toggle').on('click', function () {
		$(this).find(".icon-toggle").toggle(
				function () {
					$(this).removeClass("display-none");
				}, function () {
			$(this).addClass("display-none");
		}
		);
	});
});

