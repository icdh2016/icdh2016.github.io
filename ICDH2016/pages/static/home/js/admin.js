$(function(){
	initURL() // 
	initActiveNav()
	$('.btn-delete').click(function(){
		if(!confirm("confirm delete this?"))
			return
		var obj = this
		var del_url = $(this).attr('del_url')
		$.ajax({
			url: del_url,
			success: function(ret){
				if (ret == 'success')
					$(obj).parent().parent().hide(200)
				else
					alert("Fail:"+ret)
			}
		})
	})
	$('.btn-op').click(function(){
		var obj = this
		var url = $(this).attr('url')
		var msg = $(this).attr('msg')
		if(!msg)
			msg = "confirm this operation?"
		if(!confirm(msg))
			return
		$.ajax({
			url: url,
			success: function(ret){
				if (ret == 'success')
					$(obj).parent().parent().hide(200)
				else
					alert("Fail:"+ret)
			}
		})
	})

	$(".view-file").click(function(){
		var url = $(this).attr("url")
		var win = window.open(url,"_blank","config='toolbar=no, menubar=no'");
		win.focus()
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

	var sort = false
	if('sort' in URL.args){
		sort = URL.args['sort']
		if(sort[0] === '-')
			sort = sort.substr(1)
	}
	$('.tablesorter thead th').each(function(){ // skip frist row
		var key = $(this).attr('sort')
		if(key){
			$(this).addClass('header')
			if('sort' in URL.args && key === sort){
				if( URL.args['sort'][0] == '-'){
					$(this).addClass('headerSortUp')
					$(this).attr('sort', sort)
				}
				else{
					$(this).attr('sort', '-' + sort)
					$(this).addClass('headerSortDown')
				}
			}
		}
	})
	$('.tablesorter thead th.header').click(function(){
		window.location.href = URL.path + '?sort=' + $(this).attr('sort')
	})

	$('.toggle_next').click(function(){
		$(this).next().toggle()
	})
})

function initURL(){
	URL = {href: window.location.href, path: window.location.pathname, 
			host: window.location.host, args: {}}
	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
		URL.args[key] = value;
	})
}

function initActiveNav(){
	var path = URL.path.substring(7) //strip admin
	var urls = {
		//'.nav-home': /(.*)/, default
		'.nav-paper-deleted': /^paper\/deleted/,
		'.nav-new-submitted': /^paper\/new/,
		'.nav-search-paper': /^paper\/search/,
		'.nav-paper-review': /^paper\/review/,
		'.nav-paper-final': /^paper\/final/,
		'.nav-paper-list': /^paper(.*)/,
		'.nav-administrator': /^administrator(.*)/,
		'.nav-author-list': /^author(.*)/,
		'.nav-page': /^page(.*)$/,
		'.nav-user-admin': /^user(.*)$/,
		'.nav-setting': /^setting(.*)$/,
		'.nav-reviewer': /^reviewer(.*)$/
	}
	for(var cls in urls){
		if (path.match(urls[cls])){
			$('.nav-list .active').removeClass('active')
			$(cls).addClass('active')
			break
		}
	}
}
function resetSearch(){
	window.location.reload()
}
function selectAll(){
	if($(this).attr('checked')){
		$(this).attr('checked', false)
		$('.select-item').attr('checked', false)		
	}
	else{
		$(this).attr('checked', 'checked')
		$('.select-item').attr('checked', 'checked')
	}
}
function submitInvate(){
	ret = ''
	$('.select-item').each(function(){
		if ($(this).attr('checked') == 'checked')
			ret += $(this).parent().attr('pid') + '|'
	})
	if(ret == '')
		return false
	$('#all-papers').val(ret)
}