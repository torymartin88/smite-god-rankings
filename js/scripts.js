

// Globals
var rows, groups, cols;

var dragSrcEl = null;
var dragSrcRowID = null;
var dragEnterSrcEl = null;
var activeGroup = null;
var lastActiveGroup = null;
var activeRow = null;
var lastActiveRow = null;
var godsList = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

var godsListCache = [[], [], [], [], [], [], [], [], [], [], [], []];

var leftSide = true;
var hoverTimer = null;

var hoverNode = document.createElement('div');
hoverNode.classList.add('god-icon');
hoverNode.classList.add('empty');
hoverNode.id = 'add-god';

var emptyNode = document.createElement('div');
emptyNode.classList.add('god-icon');
emptyNode.classList.add('empty');
emptyNode.draggable = false;


// Load Gods
var request = new XMLHttpRequest();
request.open('GET', 'gods.json', true);

request.onload = function() {
  if (request.status >= 200 && request.status < 400) {
    // Success!
    var data = JSON.parse(request.responseText);

    var godsList = document.getElementById('all');

    [].forEach.call(data, function(god) {
    	var godNode = document.createElement('div');
		godNode.classList.add('god-icon');
		godNode.style.backgroundImage = "url('god_icons/" + god.filename + "')";
		godNode.id = god.id;
		godNode.draggable = true;
    	godsList.appendChild(godNode);
	});

	addEventListeners();
	loadFromCache();
  } else {
    // We reached our target server, but it returned an error
    Alert('Cannot read JSON.');
  }
};

request.onerror = function() {
  // There was a connection error of some sort
};

request.send();


// loads previous gods from localStorage
function loadFromCache() {
	var queryStr = getParameterByName('a');
	var localStore = localStorage.getItem('godsListCache', godsListCache);
	console.log(queryStr);

	var temp = null;
	var loadedFromQueryString = false;

	if (queryStr) {
		try {
			temp = JSON.parse(window.atob(queryStr));
			console.log(temp);
			loadedFromQueryString = true;
			// var encoded = window.btoa(JSON.stringify(godsListCache));
			// var unencoded = window.atob(encoded);
			// console.log(encoded);
			// console.log(unencoded);
		} catch (err) {
			console.log(err);
			alert('This god list is invalid. Please check that you copied the whole link!');
		}
	} else if (localStorage) {
		try {
			temp = JSON.parse(localStore);
		} catch (err) {
			console.log(err);
			alert('Error with cached values!');
		}
	}

	if (temp == null) {
		var groupsList = document.getElementsByClassName('god-icons');

    	[].forEach.call(groupsList, function(group) {
    		group.appendChild(emptyNode.cloneNode(true));
    	});
	} else if (temp != null) {
		godsListCache = temp;
		[].forEach.call(godsListCache, function(group, i) {
			console.log(group);
			if (group.length != 0) {
				[].forEach.call(group, function(god, j) {
					document.getElementById(i + 1).appendChild(document.getElementById(god));
				});
				godsList[i] = group.length;
			} else {
				document.getElementById(i + 1).appendChild(emptyNode.cloneNode(true));
			}
		});
	}
}


// Event Handlers
var godIconEvents = {
	dragStart: function(e) {

		// The start element
		dragSrcEl = this;
		dragSrcRowID = this.parentNode.id;

		activeGroup = this.parentNode.id;

		this.classList.add('dragger');

		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setDragImage(this, 0, 0);
	},

	dragOver: function(e) {

		if ( activeGroup != 'all' && dragSrcEl != this ) {
			if (e.offsetX < 25 && leftSide == false) {
				leftSide = true;

				if (godsList[activeGroup - 1] != 0)
					document.getElementById(this.parentNode.id).insertBefore(hoverNode, this);
			} else if (e.offsetX >= 25 && leftSide == true) {
				leftSide = false;

				if (godsList[activeGroup - 1] != 0)
					document.getElementById(this.parentNode.id).insertBefore(hoverNode, this.nextSibling);
			}
		}

		if (e.preventDefault) {
			e.preventDefault();
		}

		e.dataTransfer.dropEffect = 'move';

		return false;
	},

	dragEnter: function(e) {
		dragEnterSrcEl = this;

		var columns = null;
		columns = dragEnterSrcEl.parentNode.parentNode.getElementsByClassName('god-icons');

		if ( activeGroup != 'all' && dragSrcEl != dragEnterSrcEl ) {
			if (e.offsetX < 25) {
				leftSide = true;

				if (godsList[activeGroup - 1] != 0)
					document.getElementById(this.parentNode.id).insertBefore(hoverNode, this);
			} else {
				leftSide = false;

				if (godsList[activeGroup - 1] != 0)
					document.getElementById(this.parentNode.id).insertBefore(hoverNode, this.nextSibling);
			}

			dragEnterSrcEl.classList.add('over');
		}

		if (columns && dragEnterSrcEl.parentNode.id != 'all')
			equalHeightColumns(columns);
	},

	dragLeave: function(e) {

		dragEnterSrcEl.classList.remove('over');
	},

	dragDrop: function(e) {
		if (e.stopPropagation) {
			e.stopPropagation();
		}

		godGroupEvents.dragDrop(this.parentNode);

		return false;
	},

	dragEnd: function(e) {
		document.getElementById(activeGroup).classList.remove('over');

		[].forEach.call(cols, function (col) {
			col.classList.remove('over');
		});

		dragSrcEl.classList.remove('dragger');
	},

	click: function(e) {
		var elements = document.getElementsByClassName('selected');
		var selected_links = document.getElementsByClassName('add-selected');

		if (!this.classList.contains('empty')) {
			this.classList.toggle('selected');
		} else if (elements.length != 0) {
			moveGods(this.parentNode, elements);
		}

		if (elements.length == 0)
			[].forEach.call(selected_links, function(link) {
				link.classList.remove('show');
			});
		else {
			[].forEach.call(selected_links, function(link) {
				link.classList.add('show');
			});
		}
	},

	mouseOver: function(e) {
		console.log('over');
	},

	mouseOut: function(e) {
		console.log('out');
	},
};


var newIconEvents = {
	dragOver: function(e) {
		if (e.preventDefault) {
			e.preventDefault();
		}

		e.dataTransfer.dropEffect = 'move';

		return false;
	}
};


var godRowEvents = {
	dragEnter: function(e) {
		if (this.id != activeRow) {
			lastActiveRow = activeRow;
			activeRow = this.id;
		}

		if (lastActiveRow == null)
			lastActiveRow = activeRow;
	}
};


var godGroupEvents = {
	dragOver: function(e) {
		if (e.preventDefault) {
			e.preventDefault();
		}

		e.dataTransfer.dropEffect = 'move';

		return false;
	},

	dragEnter: function(e) {
		if (this.id != activeGroup && this.id != 'all') {
			lastActiveGroup = activeGroup;
			activeGroup = this.id;

			this.classList.add('over');
			document.getElementById(lastActiveGroup).classList.remove('over');

			var lastGroup = document.getElementById(lastActiveGroup);

			if (lastGroup.getElementsByClassName("empty").length && godsList[lastActiveGroup - 1] != 0)
				lastGroup.removeChild(lastGroup.getElementsByClassName("empty")[0]);

			dragEnterSrcEl = dragSrcEl;

		} else if (this.id == 'all') {
			document.getElementById(activeGroup).classList.remove('over');
		}

	},

	dragLeave: function(e) {
		// Drag Leave
	},

	// Handle all dropping at this level
	dragDrop: function(e) {

		var groupEl;

		// set dropped group element id
		if (this.id)
			groupEl = document.getElementById(this.id);
		else
			groupEl = document.getElementById(e.id);

		if (e.stopPropagation)
			e.stopPropagation();

		if (activeGroup != 'all')
			moveGod(groupEl);

		return false;
	},

	click: function(e) {
		// if clicking on group, but not on a god-icon
		if (!e.srcElement.classList.contains('god-icon')) {

			// Get selected god icons
			var elements = document.getElementsByClassName('selected');

			if (elements.length != 0)
				moveGods(this, elements);
		}
	}
};


function moveGod(group) {
	// Remove hover and empty state box
	if (group.getElementsByClassName("empty").length){
		group.removeChild(group.getElementsByClassName("empty")[0]);
	}

	if (lastActiveGroup == null)
		lastActiveGroup = activeGroup;

	// Remove old god position from cache list
	if (lastActiveGroup != 'all'){
		var indexToRemove = godsListCache[lastActiveGroup - 1].indexOf(dragSrcEl.id);
		godsListCache[lastActiveGroup - 1].splice(indexToRemove, 1);

		// decrement old group
		if (godsList[dragSrcRowID - 1] > 0)
			godsList[dragSrcRowID - 1]--;
	}

	// if group is empty or will be last in the group, just add to group end
	if (godsList[group.id - 1] == 0 || dragEnterSrcEl == dragSrcEl) {
		group.appendChild(dragSrcEl);
		godsListCache[activeGroup - 1].push(dragSrcEl.id);

	// if not dragging over self icon && on the left side
	} else if (leftSide) {
		var indexToAdd = godsListCache[activeGroup - 1].indexOf(dragEnterSrcEl.id);

		if (indexToAdd < 0)
			indexToAdd = 0;

		godsListCache[activeGroup - 1].splice(indexToAdd, 0, dragSrcEl.id);

		document.getElementById(activeGroup).insertBefore(dragSrcEl, dragEnterSrcEl);

	// if on the right side of drag over icon
	} else {
		if (!dragEnterSrcEl.nextSibling) {
			godsListCache[activeGroup - 1].push(dragSrcEl.id);
		} else {
			var indexToAdd = godsListCache[activeGroup - 1].indexOf(dragEnterSrcEl.nextSibling.id);
			godsListCache[activeGroup - 1].splice(indexToAdd, 0, dragSrcEl.id);
		}
		document.getElementById(activeGroup).insertBefore(dragSrcEl, dragEnterSrcEl.nextSibling);
	}

	localStorage.setItem('godsListCache', JSON.stringify(godsListCache));

	document.getElementById('publish_id').value = 'http://localhost:8000/index.html?a=' + window.btoa(JSON.stringify(godsListCache));

	// increment new group
	godsList[activeGroup - 1]++;

	// Add empty state if empty
	if (godsList[dragSrcRowID - 1] == 0)
		document.getElementById(dragSrcRowID).appendChild(emptyNode).addEventListener('click', godIconEvents.click, false);

	// Remove group over class
	group.classList.remove('over');

	lastActiveGroup = group.id;

	return 0;
}


function moveGods(group, elements) {
	// Loop over god icons that need to be moved
	[].forEach.call(elements, function(icon) {
		if (godsList[icon.parentNode.id - 1] > 0)
			godsList[icon.parentNode.id - 1]--;

		if (icon.parentNode.id != 'all') {
			var indexToRemove = godsListCache[icon.parentNode.id - 1].indexOf(icon.id);
			godsListCache[icon.parentNode.id - 1].splice(indexToRemove, 1);
		}

		setTimeout(function() {
			group.appendChild(icon);
			setTimeout(function() {
				icon.classList.remove('selected');
				godsList[group.id - 1]++;
			}, 1);
		}, 1);

		godsListCache[group.id - 1].push(icon.id);
	});

	localStorage.setItem('godsListCache', JSON.stringify(godsListCache));

	document.getElementById('publish_id').value = 'http://localhost:8000/index.html?a=' + window.btoa(JSON.stringify(godsListCache));

	// Remove empty icons
	if (group.getElementsByClassName("empty").length)
		group.removeChild(group.getElementsByClassName("empty")[0]);

	var selected_links = document.getElementsByClassName('add-selected');

	[].forEach.call(selected_links, function(link) {
		link.classList.remove('show');
	});

	return 0;
}




var titleEvents = {
	dragOver: function(e) {
		if (e.preventDefault) {
			e.preventDefault();
		}

		return false;
	}
};


function equalHeightColumns(columns) {
	var height = 0;
	[].forEach.call(columns, function(col) {
		col.style.height = '';

		if (col.clientHeight > height)
			height = col.clientHeight;
	});

	[].forEach.call(columns, function(col) {
		if (height > 150)
			col.style.height = height + 'px';
	});
}


function addEventListeners() {
	groups = document.querySelectorAll('.god-icons');
	cols = document.querySelectorAll('.god-icon');
	titles = document.querySelectorAll('.title');

	[].forEach.call(cols, function(col) {
		col.addEventListener('dragstart', godIconEvents.dragStart, false);
		col.addEventListener('dragover', godIconEvents.dragOver, false);
		col.addEventListener('dragenter', godIconEvents.dragEnter, false);
		col.addEventListener('drop', godIconEvents.dragDrop, false);
		col.addEventListener('dragleave', godIconEvents.dragLeave, false);
		col.addEventListener('dragend', godIconEvents.dragEnd, false);
		col.addEventListener('click', godIconEvents.click, false);
		col.addEventListener('mouseover', godIconEvents.mouseOver, false);
		col.addEventListener('mouseout', godIconEvents.mouseOut, false);
	});

	[].forEach.call(groups, function(group) {
		group.addEventListener('dragover', godGroupEvents.dragOver, false);
		group.addEventListener('dragenter', godGroupEvents.dragEnter, false);
		group.addEventListener('dragleave', godGroupEvents.dragLeave, false);
		group.addEventListener('drop', godGroupEvents.dragDrop, false);
		group.addEventListener('click', godGroupEvents.click, false);
	});

	[].forEach.call(titles, function(title) {
		title.addEventListener('dragover', titleEvents.dragOver, false);
	});

	/* remove bin click listener */
	document.getElementById('all').removeEventListener('click', godGroupEvents.click);

	document.getElementById('js--deselect-all').addEventListener('click', function() {
		// Inefficient!
		var elements = document.getElementsByClassName('god-icon');
		[].forEach.call(elements, function(icon) {
			icon.classList.remove('selected');
		});

		var selected_links = document.getElementsByClassName('add-selected');
		[].forEach.call(selected_links, function(link) {
			link.classList.remove('show');
		});
	}, false);
}



/* Utils */

Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}

Array.prototype.move = function (from, to) {
	this.splice(to, 0, this.splice(from, 1)[0]);
};


function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}


// LZW-compress a string
function lzw_encode(s) {
    var dict = {};
    var data = (s + "").split("");
    var out = [];
    var currChar;
    var phrase = data[0];
    var code = 256;
    for (var i=1; i<data.length; i++) {
        currChar=data[i];
        if (dict[phrase + currChar] != null) {
            phrase += currChar;
        }
        else {
            out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
            dict[phrase + currChar] = code;
            code++;
            phrase=currChar;
        }
    }
    out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
    for (var i=0; i<out.length; i++) {
        out[i] = String.fromCharCode(out[i]);
    }
    return out.join("");
}

// Decompress an LZW-encoded string
function lzw_decode(s) {
    var dict = {};
    var data = (s + "").split("");
    var currChar = data[0];
    var oldPhrase = currChar;
    var out = [currChar];
    var code = 256;
    var phrase;
    for (var i=1; i<data.length; i++) {
        var currCode = data[i].charCodeAt(0);
        if (currCode < 256) {
            phrase = data[i];
        }
        else {
           phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
        }
        out.push(phrase);
        currChar = phrase.charAt(0);
        dict[code] = oldPhrase + currChar;
        code++;
        oldPhrase = phrase;
    }
    return out.join("");
}