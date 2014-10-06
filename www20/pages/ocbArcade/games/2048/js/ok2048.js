//스크립트 참고하시고, 개발시에는 필요한데로 재 개발 하세요~ ^_^
(function($) {
	$.fn.setTabMenu = function( _option ) {
		return this.each( function( ) {
			var settings = $.extend({
				rootSelector : $( this ),
				selector : '>li> a',
				showType :'href', // href, next
				tabContent :'li>div',
				$tabContent: null,
				active: null
			}, _option);

			$(settings.rootSelector).each(function(idx){
				var $selector = $(this).find(settings.selector);
				var $tabContent = settings.$tabContent ? settings.$tabContent : $(settings.tabContent);

				$tabContent.hide();
				$($selector.filter('.active').attr('href')).show();


				$selector.on('click',function(e){
					e.preventDefault();

					$(settings.rootSelector).find(settings.selector).removeClass("active");
					$tabContent.hide();

					if(settings.showType=='href'){
						$($(this).attr('href')).show();
					}else if(settings.showType=='next'){
						$(this).next().show(settings.tabContent);
					};
					$(this).addClass('active');

					if(settings.active){
						settings.active(this);
					}
				});
			});
		} );
	};
})(jQuery);

$(document).ready(function(){
	$('.open_pop').bind('click', function(){
		$(this).addClass('active_open');

		var $openContent = $($(this).attr('href'));
		$('.evt_wrap').append('<div class="dimmed">')
		$('.evt_wrap .dimmed').height( $('.evt_wrap').outerHeight());

		$openContent.show(0, function(){
			$openContent.find('.pop_close').one('click', function(){
				$openContent.hide();
				$('.dimmed').remove();
				$('.active_open').focus().removeClass('active_open');
			});

			var popHeight = 'auto'
			//var popHeight = $openContent.outerHeight()//> $(window).height() ? $(window).height() : $openContent.outerHeight();
			$openContent.css({
				'margin' : '30px 0 0 0',
				'z-index' : 100,
				'height' : popHeight
			})
		});
	});
});
