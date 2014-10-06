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
		$("#container").append("<button id='prev'>prev</button><button id='next'>next</button>");

		$("#prev").click(function(){
			var $prev = $stage.prev(".stage");
			if($prev.length !== 0) {
				$stage = $prev;
				showStage($stage.attr("id"));
			}
		});
		$("#next").click(function(){
			var $next = $stage.next(".stage");
			if($next.length !== 0) {
				$stage = $next;
				showStage($stage.attr("id"));
			}
		});
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