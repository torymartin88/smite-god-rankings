

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

var leftSide = true;

var hoverNode = document.createElement('div');
hoverNode.classList.add('god-icon');
hoverNode.classList.add('empty');
hoverNode.id = 'add-god';




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

    groups = document.querySelectorAll('.god-icons');

	[].forEach.call(groups, function(group) {
		if (group.id != 'all') {
			var emptyNode = document.createElement('div');
			emptyNode.classList.add('god-icon');
			emptyNode.classList.add('empty');
			emptyNode.draggable = false;
	    	group.appendChild(emptyNode);
	    }
	});

	addEventListeners();
  } else {
    // We reached our target server, but it returned an error
    Alert('Cannot read JSON.');
  }
};

request.onerror = function() {
  // There was a connection error of some sort
};

request.send();




// Event Handlers
var godIconEvents = {
	dragStart: function(e) {

		// The start element
		dragSrcEl = this;
		dragSrcRowID = this.parentNode.id;

		activeGroup = this.parentNode.id;

		if (activeGroup != 'all' && godsList[activeGroup - 1] != 0) {
			document.getElementById(this.parentNode.id).insertBefore(hoverNode, this.nextSibling);
		}

		this.classList.add('dragger');

		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setDragImage(this, 0, 0);
	},

	dragOver: function(e) {
		if ( activeGroup != 'all' && dragSrcEl != this ) {
			if (e.offsetX < 25 && leftSide == false) {
				leftSide = true;

				if (godsList[activeGroup - 1] != 0) {
					document.getElementById(this.parentNode.id).insertBefore(hoverNode, this);
				}
			} else if (e.offsetX >= 25 && leftSide == true) {
				leftSide = false;

				if (godsList[activeGroup - 1] != 0) {
					document.getElementById(this.parentNode.id).insertBefore(hoverNode, this.nextSibling);
				}
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

				if (godsList[activeGroup - 1] != 0) {
					document.getElementById(this.parentNode.id).insertBefore(hoverNode, this);
				}
			} else {
				leftSide = false;

				if (godsList[activeGroup - 1] != 0) {
					document.getElementById(this.parentNode.id).insertBefore(hoverNode, this.nextSibling);
				}
			}

			dragEnterSrcEl.classList.add('over');

		} else {
			// console.log(this.parentNode);
			// try {
			// 	document.getElementById(this.parentNode.id).removeChild(hoverNode);
			// } catch(err) {
			// 	console.log(err)
			// }
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

		console.log('dropped');

		return false;
	},

	dragEnd: function(e) {
		document.getElementById(activeGroup).classList.remove('over');

		[].forEach.call(cols, function (col) {
			col.classList.remove('over');
		});

		dragSrcEl.classList.remove('dragger');
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
		} else if (this.id == 'all') {
			document.getElementById(activeGroup).classList.remove('over');
		}

	},

	dragLeave: function(e) {
		// Drag Leave
	},

	// Handle all dropping at this level
	dragDrop: function(e) {
		var groupEl = document.getElementById(this.id);

		if (e.stopPropagation)
			e.stopPropagation();

		if (activeGroup != 'all') {
			// var columns = null;
			// columns = dragEnterSrcEl.parentNode.parentNode.getElementsByClassName('god-icons');

			var droppedId = null;

			if (dragEnterSrcEl == dragSrcEl) {
				groupEl.appendChild(dragSrcEl);
			} else {
				if (leftSide)
					droppedId = document.getElementById(activeGroup).insertBefore(dragSrcEl, dragEnterSrcEl).id;
				else
					droppedId = document.getElementById(activeGroup).insertBefore(dragSrcEl, dragEnterSrcEl.nextSibling).id;
			}

			console.log(groupEl.getElementsByClassName("empty").length);

			if (groupEl.getElementsByClassName("empty").length)
				groupEl.removeChild(groupEl.getElementsByClassName("empty")[0]);

			godsList[dragSrcRowID - 1]--;
			godsList[activeGroup - 1]++;

			groupEl.classList.remove('over');
			// try {
			// 	if (columns && dragEnterSrcEl.parentNode.id != 'all')
			// 		equalHeightColumns(columns);
			// } catch(err) {
			// 	console.log(err);
			// }
		}

		return false;
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


function handleResize(e) {
	// var columns = dragEnterSrcEl.parentNode.parentNode.getElementsByClassName('god-icons');
	// equalHeightColumns(columns);
}




function addEventListeners() {
	// rows = document.querySelectorAll('.god-rows');
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
	});

	[].forEach.call(groups, function(group) {
		group.addEventListener('dragover', godGroupEvents.dragOver, false);
		group.addEventListener('dragenter', godGroupEvents.dragEnter, false);
		group.addEventListener('dragleave', godGroupEvents.dragLeave, false);
		group.addEventListener('drop', godGroupEvents.dragDrop, false);
	});

	[].forEach.call(titles, function(title) {
		title.addEventListener('dragover', titleEvents.dragOver, false);
	});

	// [].forEach.call(rows, function(row) {
	// 	row.addEventListener('dragenter', godRowEvents.dragEnter, false);
	// });

	window.addEventListener('resize', handleResize, false);
}




Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}