var Ms = Ms || {};
(function(){
	'use strict';
	
	var storageAvailable = false;
	if (window.chrome && window.chrome.storage){
	  storageAvailable = true;
	}
	
	var props = ['level', 'easyScore', 'mediumScore', 'hardScore'];
	var values = {};
	
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
	  if (obj){
	    set(obj);
	  } else {
	    var r = {};
	    r['easyScore'] = get('easyScore');
	    r['mediumScore'] = get('mediumScore');
	    r['hardScore'] = get('hardScore');

	    return r;
	  }
	};
	
	Ms.Settings = {
	  level: level,
	  scores: scores,
		init: init
	};
	
	Object.freeze(Ms.Settings);
	
})();