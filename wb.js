window.onload = function() {

	lib.url.getVar();
	wb.setTranslate();
	wb.init();
};
var wb = window.wb || {};
wb = {
	pageList : ['home'],
	lang : '',

	init : function() {
		
		// Recupera Cookies
		wb.user = lib.browser.getCookie("UID") != 'undefined' ? JSON.parse(lib.browser.getCookie("UID")) : null;		
		wb.recovery = lib.browser.getCookie("RECV") != 'undefined' ? JSON.parse(lib.browser.getCookie("RECV")) : null;
				
		//Trata Cookies
		if( typeof (wb.user) == 'undefined')
			wb.user = null;
		if(wb.user != null && wb.user != 'undefined'){
			wb.setupUser();			
		}
					
		//loading the loading ;D
		//lib.views.showLoading();
		
		//Loading the page
		wb.getPage(GET["page"]);
		
		//Hide loading page
		//lib.views.hideLoading();
			
		wb.bind();
	},
	bind : function() {	},
	getPage : function(page) {
		if(page != undefined && lib.browser.getCookie("UID") != undefined) {

			var regex = new RegExp(page);

			if(regex.test(wb.pageList)) {
				lib.views.set(page, {}, wb);
			} else {
				location.href = 'erro.php';
			}

		} else if(page != undefined && lib.browser.getCookie("UID") == undefined) {
			var regex = new RegExp(page);

			if(regex.test(wb.pageList)) {
				lib.views.set(page, {}, wb);
			} else {
				location.href = 'erro.php';
			}
		} else {
			lib.views.set('home', {}, wb);
		}
	},
	setTranslate : function(temp) {
		if( typeof (temp) == "undefined") {
			wb.lang = lib.browser.getTranslate();
		} else {
			wb.lang = temp;
		}
	},
	login : function(user, pass) {
		var params = {
			url : service.getBaseUrl() + "login.php",
			global : false,
			type : "POST",
			data : {
				login : document.getElementById('text_username').value,
				senha : sha1(document.getElementById('text_password').value)

			},
			dataType : "json",
			async : false,
			success : function(data) {
				var sessao = data.results.items[0];
				wb.user = sessao;
				lib.browser.setCookie("UID", JSON.stringify(sessao), "", "", "", "");
				window.location = 'index.php'
			},
			error : function(data) {
				alert('Wrong User');
			}
		};
		$.ajax(params);
	},
	logout : function() {
		sessionService.getLogout(function(data) {
			if(data.status.code == 200) {
				if(lib.browser.getCookie("UID") != 'undefined') {
					// alert(lib.browser.getCookie("UID"));
					lib.browser.deleteCookie("UID", "", "");
				}
				lib.views.set('home', {}, wb);
				wb.user = null;
				wb.setupUser();
			}
		});
	}
};
window.wb = wb;
