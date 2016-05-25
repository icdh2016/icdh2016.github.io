$(function(){
	var href_tag = 1
	$('.nav-sidebar li a').each(function(){
		if (href_tag && $(this).attr('href') == window.location.pathname){
			$(this).parent().addClass('active')
			href_tag = 0
		}
	})

	$('.set-lang').click(function(){
		setCookie('lang', $(this).attr('lang'))
		window.location.reload()
	})
	$(".submitting").before('<div class="metro-loading"><img class="hide" src="/static/home/img/metro-loading.gif"></div>')
	$.get("/static/home/img/metro-loading.gif")
	$(".submitting").click(function(){
		if($(this).hasClass('disabled'))
			return false;
		$(this).prev().children().show();
		$(this).addClass('disabled')
		$(this).html('Submitting')
	})
})
function setCookie(name,value){
	document.cookie= name + "=" + value + ";path=/";
}