var bmoor = require('./core.js'),
	regex = {};

// TODO: put in a polyfill block
if ( window && !bmoor.isFunction(window.CustomEvent) ){

	let CustomEvent = function( event, params ) {
		params = params || { bubbles: false, cancelable: false, detail: undefined };
		
		let evt = document.createEvent( 'CustomEvent' );
		
		evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
		
		return evt;
	};

	CustomEvent.prototype = window.Event.prototype;

	window.CustomEvent = CustomEvent;
}

if ( Element && !Element.prototype.matches ) {
    Element.prototype.matches = Element.prototype.msMatchesSelector;
}

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

function triggerEvent( node, eventName, eventData, eventSettings ){
	if ( node.dispatchEvent ){
		if ( !eventSettings ){
			eventSettings = { 'view': window, 'bubbles': true, 'cancelable': true };
		}else{
			if ( eventSettings.bubbles === undefined ){
				eventSettings.bubbles = true;
			}
			if ( eventSettings.cancelable === undefined ){
				eventSettings.cancelable = true;
			}
		}

		eventSettings.detail = eventData;

		let event = new CustomEvent( eventName, eventSettings );
		event.$bmoor = true; // allow detection of bmoor events
		
		node.dispatchEvent(event);
	}else if ( node.fireEvent ){
		let doc;

		if ( !bmoor.isString(eventName) ){
			throw new Error('Can not throw custom events in IE');
		}

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

		let event = doc.createEventObject();
		event.detail = eventData;
		event.$bmoor = true; // allow detection of bmoor events

		node.fireEvent('on' + eventName, event);
	}else{
		throw new Error('We can not trigger events here');
	}
}

function onEvent( node, eventName, cb, qualifier ){
	node.addEventListener(eventName, function( event ){
		if ( qualifier && 
			!(event.target||event.srcElement).matches(qualifier) 
		){
			return;
		}

		cb( event.detail, event );
	});
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
	bringForward: bringForward,
	triggerEvent: triggerEvent,
	onEvent: onEvent,
	on: function( node, settings ){
		Object.keys(settings).forEach( eventName => {
			var ops = settings[eventName];

			if ( bmoor.isFunction(ops) ){
				onEvent( node, eventName, ops );
			}else{
				Object.keys(ops).forEach( qualifier => {
					var cb = ops[qualifier];

					onEvent( node, eventName, cb, qualifier );
				});
			}
		});
	}
};