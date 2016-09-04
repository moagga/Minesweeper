var Ms = Ms || {};
(function(){
	'use strict';

	var storageAvailable = false;
	if (window.chrome && window.chrome.storage){
	  storageAvailable = true;
	}

	var props = ['level', 'easyScore', 'mediumScore', 'hardScore'];
	var values = {
		level : 'easy',
		easyScore : 0,
		mediumScore : 0,
		hardScore : 0
	};

	var init = function(callback){
		if (storageAvailable){
			chrome.storage.local.get(props, function(items){
				for(var key in items){
					values[key] = items[key];
				}
				callback();
			});
		} else {
			callback();
		}
	};

	var get = function(key){
		var val;
		if (key === null){
			return null;
		}
		val = values[key];
  	return val;
	};

	var set = function(obj){
		for (var key in obj){
			values[key] = obj[key];
		}
		if (storageAvailable){
			chrome.storage.local.set(obj);
		}
	};

	var level = function(value){
	  if (value){
	    set({level: value});
	  } else {
	    return values['level'];
	  }
	};

	var scores = function(obj){
		var level = obj.level;
		var value = obj.value;
		if (value){
			var o = {};
			o[level] = value;
			set(o);
		} else {
			var s = get(level);
			s = s || 0;
			return s;
	  }
	};

	Ms.Settings = {
	  level: level,
	  scores: scores,
		init: init
	};

})();
