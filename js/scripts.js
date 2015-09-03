

// Firebase Setup
var firebaseCache = new Firebase("https://smite-god-rankings.firebaseio.com/");
var firebaseListCache = firebaseCache.child('lists');

// Globals
var rows, groups, cols;

var dragSrcEl = null;
var dragSrcRowID = null;
var dragEnterSrcEl = null;
var activeGroup = null;
var lastActiveGroup = null;
var godsList = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var scrollbarList, scrollbarBin;

var iconHalfWidth = 25;

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

var scrollbarListEl = document.getElementById("scrollbarList");
var scrollbarBinEl = document.getElementById("scrollbarBin");

scrollbarList = Ps.initialize(scrollbarListEl);
scrollbarBin = Ps.initialize(scrollbarBinEl);

// Load Gods
var request = new XMLHttpRequest();
request.open('GET', 'gods.json', true);

request.onload = function() {
  if (request.status >= 200 && request.status < 400) {
    // Success!
    var data = JSON.parse(request.responseText);

    var godsList = document.getElementById('all');

    var fragment = document.createDocumentFragment();

    [].forEach.call(data, function(god) {
    	var godNode = document.createElement('div');
		godNode.classList.add('god-icon');
		godNode.style.backgroundImage = "url('god_icons/" + god.filename + "')";
		godNode.id = god.id;
		godNode.setAttribute('data-short-id', god.short_id);
		godNode.setAttribute('data-type', god.type);
		godNode.draggable = true;
    	fragment.appendChild(godNode);
	});

	godsList.appendChild(fragment);

	setDefaults();
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
	var queryStr = getParameterByName('key');
	var localStore = localStorage.getItem('godsListCache', godsListCache);

	var temp = null;
	var loadedFromQueryString = false;

	if (queryStr) {
		try {
			firebaseListCache.child(queryStr).once('value', function(snapshot) {
				temp = snapshot.val().list;
				listName = snapshot.val().name;
				created = snapshot.val().created;

				for (var key in temp) {
				   	if (temp.hasOwnProperty(key)) {
				       	var obj = temp[key];
				        for (var prop in obj) {
				        	if(obj.hasOwnProperty(prop)){
				        		godsListCache[parseInt(key)].push(obj[prop]);
				        		godsList[parseInt(key)]++;
				        		var group = document.getElementById(parseInt(key) + 1);
				        		group.appendChild(document.getElementById(obj[prop]));
				          	}
				       	}
				    }
				}

				for (var i in godsListCache) {
					if (godsListCache[i].length == 0)
						document.getElementById(parseInt(i) + 1).appendChild(emptyNode.cloneNode(true));
				}

				equalHeightColumns();

				// set title
				document.getElementById('js--list-title').value = listName;
				document.getElementById('js--list-date').innerHTML = moment(created).format("dddd, MM/DD/YY");

				if (document.getElementById('all').getElementsByClassName('god-icon').length == 0)
					document.getElementById('js--no-gods-left').classList.remove('hide');

				document.getElementById('js--loading').classList.add('hide');
			});
		} catch (err) {
			console.log(err);
			alert('This god list is invalid. Please check that you copied the whole link!');
		}
	} else if (localStore != null) {
		try {
			godsListCache = JSON.parse(localStore);
			godsListTitle = localStorage.getItem('godsListTitle', godsListTitle);

			[].forEach.call(godsListCache, function(group, i) {
				if (group.length != 0) {
					[].forEach.call(group, function(god, j) {
						document.getElementById(i + 1).appendChild(document.getElementById(god));
					});
					godsList[i] = group.length;
				} else {
					document.getElementById(i + 1).appendChild(emptyNode.cloneNode(true));
				}
			});

			if (document.getElementById('all').getElementsByClassName('god-icon').length == 0) {
				document.getElementById('js--publish').removeAttribute('disabled');
				document.getElementById('js--no-gods-left').classList.remove('hide');
			}

			equalHeightColumns();

			document.getElementById('js--list-title').value = godsListTitle;
			document.getElementById('js--loading').classList.add('hide');
		} catch (err) {
			console.log(err);
			alert('Error with cached values!');
			localStorage.removeItem('godsListCache');
		}
	} else {
		var groupsList = document.getElementsByClassName('god-icons');

    	[].forEach.call(groupsList, function(group) {
    		if (group.id != 'all')
    			group.appendChild(emptyNode.cloneNode(true));
    	});
    	document.getElementById('js--loading').classList.add('hide');
	}

	updateScrollBars();
}

// window.onload = function() {
//     scrollbarList = tinyscrollbar(document.getElementById("scrollbarList"));
//     scrollbarBin = tinyscrollbar(document.getElementById("scrollbarBin"));
// }



// Event Handlers
var godIconEvents = {
	dragStart: function(e) {

		// The start element
		dragSrcEl = this;
		dragSrcRowID = this.parentNode.id;

		activeGroup = this.parentNode.id;

		this.classList.add('dragger');

		e.dataTransfer.setData('god_id', this.id);
		e.dataTransfer.effectAllowed = 'move';
		return true;
	},

	dragOver: function(e) {
		if ( activeGroup != 'all' && dragSrcEl != this ) {
			if (e.offsetX < iconHalfWidth && leftSide == false) {
				leftSide = true;

				if (godsList[activeGroup - 1] != 0)
					document.getElementById(this.parentNode.id).insertBefore(hoverNode, this);
			} else if (e.offsetX >= iconHalfWidth && leftSide == true) {
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

		if ( activeGroup != 'all' && dragSrcEl != dragEnterSrcEl ) {
			if (e.offsetX < iconHalfWidth) {
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

		equalHeightColumns();

		return false;
	},

	dragLeave: function(e) {

		dragEnterSrcEl.classList.remove('over');
		return false;
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


		var group = document.getElementById(activeGroup);
		var emptyEl = group.getElementsByClassName("empty")[0];

		if (emptyEl)
			group.removeChild(group.getElementsByClassName("empty")[0]);

		return false;
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
		// console.log('over');
	},

	mouseOut: function(e) {
		// console.log('out');
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
			activeGroup = this.id;
		}

		return false;
	},

	dragLeave: function(e) {
		// Drag Leave
		return false;
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

		if (groupEl.id != 'all')
			moveGod(groupEl);

		return false;
	},

	click: function(e) {
		// if clicking on group, but not on a god-icon
		if (!e.target.classList.contains('god-icon')) {

			// Get selected god icons
			var elements = document.getElementsByClassName('selected');

			if (elements.length != 0)
				moveGods(this, elements);
		}
	}
};


var titleEvents = {
	dragOver: function(e) {
		if (e.preventDefault) {
			e.preventDefault();
		}

		return false;
	}
};


function moveGod(group) {

	// Remove hover and empty state box
	if (group.getElementsByClassName("empty").length)
		group.removeChild(group.getElementsByClassName("empty")[0]);

	lastActiveGroup = dragSrcEl.parentNode.id;
	// activeGroup = group;

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

	// increment new group
	godsList[activeGroup - 1]++;

	// Add empty state if empty
	if (godsList[dragSrcRowID - 1] == 0)
		document.getElementById(dragSrcRowID).appendChild(emptyNode).addEventListener('click', godIconEvents.click, false);

	// Remove group over class
	group.classList.remove('over');

	lastActiveGroup = group.id;

	setTimeout(function() {
		if (document.getElementById('all').getElementsByClassName('god-icon').length == 0){
			document.getElementById('js--publish').removeAttribute('disabled');
			document.getElementById('js--no-gods-left').classList.remove('hide');
		}
		equalHeightColumns();
	}, 50);

	updateScrollBars();

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

	// Remove empty icons
	if (group.getElementsByClassName("empty").length)
		group.removeChild(group.getElementsByClassName("empty")[0]);

	var selected_links = document.getElementsByClassName('add-selected');

	[].forEach.call(selected_links, function(link) {
		link.classList.remove('show');
	});

	setTimeout(function() {
		if (document.getElementById('all').getElementsByClassName('god-icon').length == 0) {
			document.getElementById('js--publish').removeAttribute('disabled');
			document.getElementById('js--no-gods-left').classList.remove('hide');
		}
		equalHeightColumns();
	}, 50);

	updateScrollBars();

	return 0;
}



function equalHeightColumns() {
	if (document.getElementsByClassName('tier-list')[0].classList.contains('view-standard')) {
		columns = document.getElementsByClassName('god-icons');
		[].forEach.call(columns, function(col) {
			col.style.height = '';
		});

		// SS and S+
		if (columns[1].clientHeight > columns[2].clientHeight)
			columns[2].style.height = columns[1].clientHeight + 'px';
		else
			columns[1].style.height = columns[2].clientHeight + 'px';

		// S- and A+
		if (columns[4].clientHeight > columns[5].clientHeight)
			columns[5].style.height = columns[4].clientHeight + 'px';
		else
			columns[4].style.height = columns[5].clientHeight + 'px';

		// A- and B+
		if (columns[6].clientHeight > columns[8].clientHeight)
			columns[8].style.height = columns[7].clientHeight + 'px';
		else
			columns[7].style.height = columns[8].clientHeight + 'px';

		var heightRow = columns[10].clientHeight;

		// C, D and NEW
		if (columns[11].clientHeight > heightRow)
			heightRow = columns[11].clientHeight;
		else if (columns[12].clientHeight > heightRow)
			heightRow = columns[12].clientHeight;


		columns[10].style.height = heightRow + 'px';
		columns[11].style.height = heightRow + 'px';
		columns[12].style.height = heightRow + 'px';
	}

	updateScrollBars();
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

	document.getElementById('js--deselect-all').addEventListener('click', deselectIcons, false);
	document.getElementById('js--reset-page').addEventListener('click', resetPage, false);
	document.getElementById('js--publish').addEventListener('click', publishPage, false);
	document.getElementById('js--search-gods').addEventListener('keyup', searchGods, false);
	document.getElementById('js--list-title').addEventListener('keyup', listTitleChange, false);
	document.getElementById('js--menu-trigger').addEventListener('click', menuTriggerClick, false);
	document.getElementById('js--view-standard').addEventListener('click', viewClick, false);
	document.getElementById('js--view-compact').addEventListener('click', viewClick, false);
	document.getElementById('js--colors-cb').addEventListener('change', colorsChange, false);
}

function setDefaults() {
	var tierList = document.getElementsByClassName('tier-list')[0]
	var colors = localStorage.getItem('smitetierlist_colors');

	if (colors == 'true') {
		tierList.classList.add('colors');
		document.getElementById('js--colors-cb').setAttribute('checked', true);
	}


	var view = localStorage.getItem('smitetierlist_view');

	if (view == 'compact')
		tierList.classList.add('view-compact');
	else
		tierList.classList.add('view-standard');

}

function deselectIcons(e) {
	// Inefficient!
	var elements = document.getElementsByClassName('god-icon');
	[].forEach.call(elements, function(icon) {
		icon.classList.remove('selected');
	});

	var selected_links = document.getElementsByClassName('add-selected');
	[].forEach.call(selected_links, function(link) {
		link.classList.remove('show');
	});
}

function resetPage(e) {
	localStorage.removeItem('godsListCache');
	window.location.href = 'http://smitegodrankings.com/index.html';
}

function publishPage(e) {
	var listName = document.getElementById('js--list-title').value;
	var key = firebaseListCache.push({name: listName, created: Firebase.ServerValue.TIMESTAMP, list: godsListCache}).key();
	document.getElementById('publish_id').value = 'http://smitegodrankings.com/index.html?key=' + key;

	document.getElementById('js--publish').disabled = true;
}

function searchGods(e) {
	var icons = document.getElementById('all').getElementsByClassName('god-icon');
	var searchTerm = this.value.toLowerCase().replace(/\s+/g, '');;

	var hiddenIcons = 0;

	[].forEach.call(icons, function(icon) {
		if (icon.id.toLowerCase().replace(/\s+/g, '').indexOf(searchTerm) == -1 && icon.getAttribute('data-type').toLowerCase().replace(/\s+/g, '').indexOf(searchTerm) == -1) {
			icon.classList.add('hide');
			hiddenIcons++;
		} else {
			icon.classList.remove('hide');
		}
	});

	if (hiddenIcons == icons.length)
		document.getElementById('js--no-gods-left').classList.remove('hide');
	else
		document.getElementById('js--no-gods-left').classList.add('hide');

	updateScrollBars();
}

function listTitleChange(e) {
	localStorage.setItem('godsListTitle', this.value);
}

function menuTriggerClick(e) {
	var parent = this.parentNode;
	parent.parentNode.classList.add('collapse');

	setTimeout(function() {
		parent.addEventListener('click', sidebarClick, false);
		this.removeEventListener('click', menuTriggerClick);
	}, 10);
}

function sidebarClick(e) {
	var me = this;
	me.parentNode.classList.remove('collapse');

	setTimeout(function() {
		document.getElementById('js--menu-trigger').addEventListener('click', menuTriggerClick, false);
		me.removeEventListener('click', sidebarClick);
	}, 10);
}

function viewClick(e) {
	this.parentNode.parentNode.classList.remove('view-standard');
	this.parentNode.parentNode.classList.remove('view-compact');

	if (this.id == 'js--view-standard'){
		this.parentNode.parentNode.classList.add('view-standard');
		iconHalfWidth = 25;
		equalHeightColumns();
		localStorage.setItem('smitetierlist_view', 'standard');
	} else if (this.id == 'js--view-compact') {
		columns = document.getElementsByClassName('god-icons');
		[].forEach.call(columns, function(col) {
			col.style.height = '';
		});
		iconHalfWidth = 20;
		this.parentNode.parentNode.classList.add('view-compact');
		localStorage.setItem('smitetierlist_view', 'compact');
	}

	updateScrollBars();
}

function colorsChange(e) {
	this.parentNode.parentNode.parentNode.classList.toggle('colors');
	localStorage.setItem('smitetierlist_colors', this.parentNode.parentNode.parentNode.classList.contains('colors'));
}

function updateScrollBars() {
	var binContentPosition = 0, listContentPosition = 0;

	// try {
	// 	binContentPosition = scrollbarBin.contentPosition;
	// 	listContentPosition = scrollbarList.contentPosition;
	// } catch (e) {
	// 	console.log(e);
	// }

	// scrollbarBin.update(binContentPosition);
	// scrollbarList.update(listContentPosition);
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
