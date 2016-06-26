var bmoor = require('./core.js'),
	regex = {};

function getReg( className ){
	var reg = regex[className];

	if ( !reg ){
		reg = new RegExp('(?:^|\\s)'+className+'(?!\\S)');
		regex[className] = reg;
	}

	return reg;
}

function getScrollPosition( doc ){
	if ( !doc ){
		doc = document;
	}

	return {
		left:  window.pageXOffset || ( doc.documentElement || doc.body ).scrollLeft ,
		top: window.pageYOffset || ( doc.documentElement || doc.body ).scrollTop
	};
}

function getBoundryBox( element ){
	return element.getBoundingClientRect();
}

function centerOn( element, target, doc ){
	var el = getBoundryBox(element),
		targ = getBoundryBox( target ),
		pos = getScrollPosition( doc );

	if ( !doc ){
		doc = document;
	}

	element.style.top = pos.top + targ.top + targ.height/2 - el.height / 2;
	element.style.left = pos.left + targ.left + targ.width/2 - el.width / 2;
	element.style.right = '';
	element.style.bottom = '';

	element.style.position = 'absolute';
	doc.body.appendChild( element );
}

function showOn( element, target, doc ){
	var direction,
		targ = getBoundryBox( target ),
		x = targ.x + targ.width / 2,
		y = targ.y + targ.height / 2,
		centerX = window.innerWidth / 2,
		centerY = window.innerHeight / 2,
		pos = getScrollPosition( doc );

	if ( !doc ){
		doc = document;
	}

	if ( x < centerX ){
		// right side has more room
		direction = 'r';
		element.style.left = pos.left + targ.right;
		element.style.right = '';
	}else{
		// left side has more room
		//element.style.left = targ.left - el.width - offset;
		direction = 'l';
		element.style.right = window.innerWidth - targ.left - pos.left;
		element.style.left = '';
	}

	if ( y < centerY ){
		// more room on bottom
		direction = 'b' + direction;
		element.style.top = pos.top + targ.bottom;
		element.style.bottom = '';
	}else{
		// more room on top
		direction = 't' + direction;
		element.style.bottom = window.innerHeight - targ.top - pos.top;
		element.style.top = '';
	}
	
	element.style.position = 'absolute';
	doc.body.appendChild( element );

	return direction;
}

function massage( elements ){
	if ( !bmoor.isArrayLike(elements) ){
		elements = [elements];
	}

	return elements;
}

function getDomElement( element, doc ){
	if ( !doc ){
		doc = document;
	}

	if ( bmoor.isString(element) ){
		return doc.querySelector( element );
	}else{
		return element;
	}
}

function getDomCollection( elements, doc ){
	var i, c,
		j, co,
		el,
		selection,
		els = [];

	if ( !doc ){
		doc = document;
	}

	elements = massage(elements);

	for( i = 0, c = elements.length; i < c; i++ ){
		el = elements[i];
		if ( bmoor.isString(el) ){
			selection = doc.querySelectorAll(el);
			for( j = 0, co = selection.length; j < co; j++ ){
				els.push( selection[j] );
			}
		}else{
			els.push( el );
		}
	}

	return els;
}

function addClass( elements, className ){
	var i, c,
		node,
		baseClass,
		reg = getReg( className );

	elements = massage( elements );
	
	for( i = 0, c = elements.length; i < c; i++ ){
		node = elements[i];
		baseClass = node.getAttribute('class') || '';

		if ( !baseClass.match(reg) ){
			node.setAttribute( 'class', baseClass+' '+className );
		}
	}
}

function removeClass( elements, className ){
	var i, c,
		node,
		reg = getReg( className );

	elements = massage( elements );
	
	for( i = 0, c = elements.length; i < c; i++ ){
		node = elements[i];
		node.setAttribute( 'class', (node.getAttribute('class')||'').replace(reg,'') );
	}
}

function triggerEvent( elements, eventName, eventData ){
	var i, c,
		doc,
		node,
		event,
		EventClass;

	elements = massage( elements );
	
	for( i = 0, c = elements.length; i < c; i++ ){
		node = elements[i];
		
		// Make sure we use the ownerDocument from the provided node to avoid cross-window problems
		if (node.ownerDocument){
			doc = node.ownerDocument;
		}else if (node.nodeType === 9){
			// the node may be the document itself, nodeType 9 = DOCUMENT_NODE
			doc = node;
		}else if ( typeof document !== 'undefined' ){
			doc = document;
		}else{
			throw new Error('Invalid node passed to fireEvent: ' + node.id);
		}

		if ( node.dispatchEvent ){
			try{
				// modern, except for IE still? https://developer.mozilla.org/en-US/docs/Web/API/Event
				// I ain't doing them all
				// slightly older style, give some backwards compatibility
				switch (eventName) {
					case 'click':
					case 'mousedown':
					case 'mouseup':
						EventClass = MouseEvent;
						break;

					case 'focus':
					case 'blur':
						EventClass = FocusEvent; // jshint ignore:line
						break;

					case 'change':
					case 'select':
						EventClass = UIEvent; // jshint ignore:line
						break;

					default:
						EventClass = CustomEvent;
				}

				if ( !eventData ){
					eventData = { 'view': window, 'bubbles': true, 'cancelable': true };
				}else{
					if ( eventData.bubbles === undefined ){
						eventData.bubbles = true;
					}
					if ( eventData.cancelable === undefined ){
						eventData.cancelable = true;
					}
				}

				event = new EventClass( eventName, eventData );
			}catch( ex ){
				// slightly older style, give some backwards compatibility
				switch (eventName) {
					case 'click':
					case 'mousedown':
					case 'mouseup':
						EventClass = 'MouseEvents';
						break;

					case 'focus':
					case 'change':
					case 'blur':
					case 'select':
						EventClass = 'HTMLEvents';
						break;

					default:
						EventClass = 'CustomEvent';
				}
				event = doc.createEvent(EventClass);
				event.initEvent(eventName, true, true); 
			}

			event.$synthetic = true; // allow detection of synthetic events
			
			node.dispatchEvent(event);
		}else if (node.fireEvent){
			// IE-old school style
			event = doc.createEventObject();
			event.$synthetic = true; // allow detection of synthetic events
			node.fireEvent('on' + eventName, event);
		}
	}
}

function bringForward( elements ){
	var i, c,
		node;

	elements = massage( elements );

	for( i = 0, c = elements.length; i < c; i++ ){
		node = elements[i];

		if ( node.parentNode ){
			node.parentNode.appendChild( node );
		}
	}
}

module.exports = {
	getScrollPosition: getScrollPosition,
	getBoundryBox: getBoundryBox,
	getDomElement: getDomElement,
	getDomCollection: getDomCollection,
	showOn: showOn,
	centerOn: centerOn,
	addClass: addClass,
	removeClass: removeClass,
	triggerEvent: triggerEvent,
	bringForward: bringForward
};