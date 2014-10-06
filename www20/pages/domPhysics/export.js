/*
 * SKP Web Animation Tool : Javascript for exported html
 * Owner: Wook Shim (wshim@sk.com)
 * License: SK planet wholly owned
 */

(function($, window, document, undefined) {

	var $stage, $stages;

	$(document).ready(function() {
		$stages = $(".stage");
		$stage = $stages.eq(0);

		showStage($stage.attr("id"));
		$('#domStage').on("click",function(e){
			$('#actor0').toggleClass("active");
			$('#actor1').toggleClass("active");
			$('#actor2').toggleClass("active");
			$('#actor3').toggleClass("active");
			$('#actor4').toggleClass("active");
			$('#actor5').toggleClass("active");
			$('#actor6').toggleClass("active");
			$('#actor7').toggleClass("active");
		})
	});

	function showStage(id) {
		$stages.css("display", "none");
		$("#" + id).css("display", "");
	}

	function controlAnim(e, cmd, animCss) {
		var $elem = $(e.target);

		function start() {
			$elem.css("-webkit-animation", animCss);
		}
		function stop() {
			$elem.css("-webkit-animation", "none");
		}

		switch(cmd) {
		case "start":
			start();
			break;
		case "stop":
			stop();
			break;
		case "toggle":
			if($elem.css("-webkit-animation-name") === "none") {
				start();
			}
			else {
				stop();
			}
			break;
		default:
			break;
		}
	}
})(jQuery, window, document);