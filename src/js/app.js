(function(){

	//Board configuration
	var rows, cols, mines, max;

	//Game variables
	var model, remaining, matchedMinesCount, timer, time, running, level;

	var state = {
		running: false,
		finished: false
	};

	var levels = {
		easy : {rows: 9, cols: 9, mines: 10},
		medium: {rows: 16, cols: 16, mines: 40},
		hard: {rows: 16, cols: 30, mines: 99}
	};

	var css = {
		1: 'one',
		2: 'two',
		3: 'three',
		4: 'four',
		5: 'five',
		6: 'six',
		7: 'seven',
		8: 'eight'
	};

	var configure = function(options){
	  level = options.level;
		var l = levels[level];
		rows = l.rows;
		cols = l.cols;
		mines = l.mines;
		max = rows * cols;

		$('.difficulty .nav-pills li').removeClass('active');
		$('button[rel=' + level + ']').parent().addClass('active');

		$('.board').removeClass('easy medium hard').addClass(options.level);
	};

	var reset = function(){

    var i, j;
		//Reset game variables
		stopTick();
		state.running = false;
		state.finished = false;
		time = 0;
		matchedMinesCount = 0;
		remaining = mines;
		$('.mines').html(remaining);
		$('.time').html('0');
		$('.container').removeClass('win loss');
		_resetScores();

		//Redraw board
		var html = "";
		for(i = 0; i < rows; i++){
			html += "<div class='r'>";
			for(j = 0; j < cols; j++){
				var id = i + "_" + j;
				html += "<div class='c' id='" +  id +"' ></div>";
			}
			html += "</div>";
		}
		$('.board').html(html);

		//Reset model
		model = new Array(rows);
		for(i = 0; i < rows; i++){
			var row = new Array(cols);
			for(j = 0; j < cols; j++){
				row[j] = 0;
			}
			model[i] = row;
		}

		//Fill mines
		var count = mines;
    while (count !== 0){
        var mp = Math.floor(Math.random() * max);
        var mr = Math.floor(mp / cols);
        var mc = mp - (mr * cols);
        if (model[mr][mc] === 0){
            model[mr][mc] = -1;
            count = count - 1;
        }
    }

		//Sum numbers around mines
    for (i = 0; i < model.length; i++) {
      var row = model[i];
      for (j = 0; j < row.length; j++) {
          if (model[i][j] == -1){
              continue;
          }
          var sum = _countCell(i, j);
          model[i][j] = sum;
      }
    }

	};

	var _resetScores = function(){
		$.each(['easyScore', 'mediumScore', 'hardScore'], function(index, value){
			var l = value;
			var s = Ms.Settings.scores({level : l});
			$('.' + l).html(s);
		});
	}

  var _countCell = function(x, y){
      var sum = 0;
      sum += _checkMine(x-1, y-1);
      sum += _checkMine(x-1, y);
      sum += _checkMine(x-1, y+1);
      sum += _checkMine(x, y-1);
      sum += _checkMine(x, y+1);
      sum += _checkMine(x+1, y-1);
      sum += _checkMine(x+1, y);
      sum += _checkMine(x+1, y+1);
      return sum;
  };

	var _checkMine = function(x, y){
        if (_isSafe(x,y)){
            return model[x][y] === -1 ? 1 : 0;
        }
        return 0;
    };

	var _isSafe = function(x, y){
        return (x >=0 && x < rows) && (y >= 0 && y < cols);
    };

	var _doom = function(){
		finish({win: false});
		for(var i = 0; i < model.length; i++){
			var row = model[i];
			for(var j = 0; j < row.length; j++){
				if (model[i][j] !== -1){
					continue;
				}
				var id = "#" + i + "_" + j;
				$(id).addClass('doom');
				$(id).html('<span class="glyphicon glyphicon-certificate" aria-hidden="true"></span>');
			}
		}
	};

	var _open = function(r, c){
		if (!_isSafe(r,c)){
			return;
		}
		var v, id, $e;
		v = model[r][c];
		if (v === -1){
			_doom();
			return;
		}
		id = "#" + r + "_" + c;
		$e = $(id);
		if ($e.hasClass('open')){
			return;
		}
		if (v !== 0){
			var c = 'open ' + css[v];
			$e.addClass(c).html(v);
			return;
		} else {
			$e.addClass('open');

			_open(r-1, c-1);
			_open(r-1, c);
			_open(r-1, c+1);

			_open(r, c-1);
			_open(r, c+1);

			_open(r+1, c-1);
			_open(r+1, c);
			_open(r+1, c+1);
		}
	};

	var finishIfApplicable = function(){
		if (matchedMinesCount === mines){
			finish({win: true});
		}
	};

	var finish = function(options){
		options = options || {};

		stopTick();
		if (options.win){
			$('.container').addClass('win');
			var t = $('.time').html();
			t = parseInt(t);
			var hs = Ms.Settings.scores({level : level + 'Score'});
			if (t > hs){
				var scr = {level : level + 'Score'};
				scr.value = t;
				Ms.Settings.scores(scr);
				_resetScores();
			}
		} else {
			$('.container').addClass('loss');
		}
		state.finished = true;
		state.running = false;
	};

	var startTick = function(){
		timer = setInterval(function(){
			onTick();
		}, 1000);
	};

	var onTick = function(){
		time = time + 1;
		$('.time').html(time);
	};

	var stopTick = function(){
		clearInterval(timer);
	};

	var _onClick = function(e){
		if (state.finished){
			return;
		}

		if (!state.running){
			state.running = true;
			startTick();
		}
		var id = $(e.target).attr('id');
		var r = parseInt(id.split('_')[0]);
		var c = parseInt(id.split('_')[1]);
		var v = model[r][c];

		_open(r,c);
	};

	var _onDblClick = function(e){
		if (state.finished){
			return;
		}
		var el = $(e.target);
		if (!el.hasClass('open')){
			return;
		}
		var id = $(e.target).attr('id');
		var r = parseInt(id.split('_')[0]);
		var c = parseInt(id.split('_')[1]);

		var count = model[r][c];
		var mines = 0;
		mines = mines + (_isAlreadyMined(r-1, c-1) ? 1 : 0);
		mines = mines + (_isAlreadyMined(r-1, c) ? 1 : 0);
		mines = mines + (_isAlreadyMined(r-1, c+1) ? 1 : 0);
		mines = mines + (_isAlreadyMined(r, c-1) ? 1 : 0);
		mines = mines + (_isAlreadyMined(r, c+1) ? 1 : 0);
		mines = mines + (_isAlreadyMined(r+1, c-1) ? 1 : 0);
		mines = mines + (_isAlreadyMined(r+1, c) ? 1 : 0);
		mines = mines + (_isAlreadyMined(r+1, c+1) ? 1 : 0);

		//All mines are placed, open all neighbours
		if (count === mines){
			_openNeighbour(r-1, c-1);
			_openNeighbour(r-1, c);
			_openNeighbour(r-1, c+1);

			_openNeighbour(r, c-1);
			_openNeighbour(r, c+1);

			_openNeighbour(r+1, c-1);
			_openNeighbour(r+1, c);
			_openNeighbour(r+1, c+1);
		}
	};

	var _openNeighbour = function(x,y){
		if (!_isAlreadyMined(x,y)){
			_open(x,y);
		}
	};

	var _isAlreadyMined = function(x, y){
		if (_isSafe(x,y)){
			var id = "#" + x + "_" + y;
			return $(id).hasClass('mine');
		}
		return false;
	};

	var _onRightClick = function(e){
		e.preventDefault();
		if (state.finished){
			return;
		}
		var elem = e.target;
		if (elem.tagName === 'SPAN'){
			elem = elem.parentNode;
		}
		var el = $(elem);
		var id = el.attr('id');
		var r = parseInt(id.split('_')[0]);
		var c = parseInt(id.split('_')[1]);
		var count = model[r][c];

		if (el.hasClass('open')){
			return;
		} else {
			if (el.hasClass('mine')){
				el.removeClass('mine');
				el.html('');
				remaining = remaining + 1;
				if (count === -1){
					matchedMinesCount = matchedMinesCount - 1;
				}
			} else {
				el.addClass('mine');
				el.html('<span class="glyphicon glyphicon-flag" aria-hidden="true"></span>');
				remaining = remaining - 1;
				if (count === -1){
					matchedMinesCount = matchedMinesCount + 1;
				}
			}
			$('.mines').html(remaining);
			finishIfApplicable();
		}
	};

	$('.board').click(_onClick);
	$('.board').dblclick(_onDblClick);
	$('.board').bind('contextmenu', _onRightClick);
	$('.reset').click(reset);
	$('.levelLink').click(function(){
	  var v = $(this).attr('rel');
		Ms.Settings.level(v);
		Ms.configure({level: v});
		Ms.reset();
	});

	Ms.configure = configure;
  Ms.reset = reset;

})();
Ms.Settings.init(function(){
  var l = Ms.Settings.level();
  l = l || 'easy';
  Ms.configure({level: l});
  Ms.reset();
});
