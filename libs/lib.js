var lib = window.lib || {};
var UID = window.UID || {};
var GET = window.GET || {};

lib.url = {	
	getVar: function(){
		var sGet = window.location.search;
		
		if (sGet){
			sGet = sGet.substr(1);
			var sNVPairs = sGet.split("&");
	
			for (var i = 0; i < sNVPairs.length; i++){
				var sNV = sNVPairs[i].split("=");
				
				var sName = sNV[0];
				var sValue = sNV[1];
				GET[sName] = sValue;
			}
		}
	}
};

lib.alert = {};

lib.browser = {
	getTranslate : function(){
		var tempLang = '';
		
		if(typeof(navigator.language) == "undefined"){
			tempLang = window.navigator.browserLanguage;	
		}else{
			tempLang = navigator.language;
		}
		
		var newlang = tempLang.toLowerCase();
		var vetLang = newlang.split("-");
		var lang = vetLang[0] + vetLang[1];	
			
		return lang;			
	},
		
 	setCookie : function(name, value, expires, path, domain, secure) {
		var curCookie = name + "=" + escape(value) +
		((expires) ? "; expires=" + expires.toGMTString() : "") +
		((path) ? "; path=" + path : "") +
		((domain) ? "; domain=" + domain : "") +
		((secure) ? "; secure" : "");
		document.cookie = curCookie;
	},
 
	getCookie : function(name) {
	   var dc = document.cookie;
	   var prefix = name + "=";
	   var begin = dc.indexOf("; " + prefix);
	   if (begin == -1) {
			  begin = dc.indexOf(prefix);
			  if (begin != 0) return null;
	   } else
	   begin += 2;
	   var end = document.cookie.indexOf(";", begin);
	   if (end == -1)
	   end = dc.length;
	   return unescape(dc.substring(begin + prefix.length, end));
	},
 
	deleteCookie : function(name, path, domain) {
       if (lib.browser.getCookie(name)) {
              document.cookie = name + "=" + 
              ((path) ? "; path=" + path : "") +
              ((domain) ? "; domain=" + domain : "") +
              "; expires=Thu, 01-Jan-70 00:00:01 GMT";
              history.go(0);
       }
	}
};

lib.dom = {
        attr: function(elem, name, value) {
            if (elem && typeof elem != 'undefined') {
                if (name && typeof name != 'undefined') {
                    if (value && typeof value != 'undefined') {
                        elem.setAttribute(name, value);
                    } else {
                        return elem.getAttribute(name);
                    }
                }
            }
        }
};

lib.views = {

	lastHeight: 0,
	lastWidth: 0,
	stack: [],
	orientation: "",
	props: {},
	exitViews: [],
	loadView: "loading",
	_DEFAULT: {
		loadView: "loading",
		callbackPrepareForTransition: function() {
			},
		callbackPerformForTransition: function() {
			}
	},

	hide: function(elem) {
		document.getElementById(elem).style.display = 'none';
	},

	show: function(elem) {
		document.getElementById(elem).style.display = 'block';
	},

	getLoadView: function() {
		return lib.views.loadView;
	},

	setLoadView: function(view) {
		if (typeof(view) == "string") {
			lib.views.loadView = view;
		}
	},

	hideLoading: function() {
		var loadView = lib.views.getLoadView();
		if (loadView && loadView !== "") {
			lib.views.hide(loadView);
		}
		else {
			lib.views.hide(lib.views._DEFAULT.loadView);
		}
		lib.views.performTransition();
	},

	showLoading: function() {
		var loadView = lib.views.getLoadView();
		if (loadView && loadView !== "") {
			lib.views.show(loadView);
		}
		else {
			lib.views.show(lib.views._DEFAULT.loadView);
		}
		lib.views.prepareForTransition();
	},

	prepareForTransition: function() {
		lib.views._DEFAULT.callbackPrepareForTransition();
	},

	performTransition: function() {
		lib.views._DEFAULT.callbackPerformForTransition();
	},

	setPrepareForTransistion: function(callback) {
		if (typeof(callback) == "function") {
			lib.views._DEFAULT.callbackPrepareForTransition = callback;
		}
	},

	setPerformTransistion: function(callback) {
		if (typeof(callback) == "function") {
			lib.views._DEFAULT.callbackPerformForTransition = callback;
		}
	},

	set: function(viewId, init_args, object) {
		var instance = lib.views;
		
		if (instance.stack.length > 0) {
			var last_view = instance.getCurrentView().viewId;
			instance.hide(last_view);
			if (object && typeof(object) != "undefined") {
				object[last_view].destroy();
			}
			if (init_args && init_args.ignore) {
				instance.stack.pop();
			}
		}

		if (instance.exitViews.join(';').indexOf(viewId) >= 0) {
			instance.stack = [];
		}
		var equals = false;
		if (lib.views.stack.length > 0) {
			var last_view = instance.stack[instance.stack.length - 1];
			if (last_view.viewId == viewId) {
				for (var name in last_view.init_args) {
					if (! (name in init_args && last_view.init_args[name] == init_args[name])) {
						equals = true;
						break;
					}
				}
			}
			else {
				equals = true;
			}
		}
		else {
			equals = true;
		}
		if (equals) {
			instance.stack.push({
				'viewId': viewId,
				'init_args': init_args
			});
		}
		object[viewId].init(init_args);

		instance.show(instance.getCurrentView().viewId);
		window.scrollTo(0, 0);
	},
    getCurrentView: function() {
    	return lib.views.stack[lib.views.stack.length - 1];
    }    
};

window.lib = lib;

