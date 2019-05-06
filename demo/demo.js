var bmoor =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * The core of bmoor's usefulness
 * @module bmoor
 **/

/**
 * Tests if the value is undefined
 *
 * @function isUndefined
 * @param {*} value - The variable to test
 * @return {boolean}
 **/
function isUndefined(value) {
	return value === undefined;
}

/**
 * Tests if the value is not undefined
 *
 * @function isDefined
 * @param {*} value The variable to test
 * @return {boolean}
 **/
function isDefined(value) {
	return value !== undefined;
}

/**
 * Tests if the value is a string
 *
 * @function isString
 * @param {*} value The variable to test
 * @return {boolean}
 **/
function isString(value) {
	return typeof value === 'string';
}

/**
 * Tests if the value is numeric
 *
 * @function isNumber
 * @param {*} value The variable to test
 * @return {boolean}
 **/
function isNumber(value) {
	return typeof value === 'number';
}

/**
 * Tests if the value is a function
 *
 * @function isFuncion
 * @param {*} value The variable to test
 * @return {boolean}
 **/
function isFunction(value) {
	return typeof value === 'function';
}

/**
 * Tests if the value is an object
 *
 * @function isObject
 * @param {*} value The variable to test
 * @return {boolean}
 **/
function isObject(value) {
	return value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object';
}

/**
 * Tests if the value is a boolean
 *
 * @function isBoolean
 * @param {*} value The variable to test
 * @return {boolean}
 **/
function isBoolean(value) {
	return typeof value === 'boolean';
}

/**
 * Tests if the value can be used as an array
 *
 * @function isArrayLike
 * @param {*} value The variable to test
 * @return {boolean}
 **/
function isArrayLike(value) {
	// for me, if you have a length, I'm assuming you're array like, might change
	if (value) {
		return isObject(value) && (value.length === 0 || 0 in value && value.length - 1 in value);
	} else {
		return false;
	}
}

/**
 * Tests if the value is an array
 *
 * @function isArray
 * @param {*} value The variable to test
 * @return {boolean}
 **/
function isArray(value) {
	return value instanceof Array;
}

/**
 * Tests if the value has no content.
 * If an object, has no own properties.
 * If array, has length == 0.
 * If other, is not defined
 *
 * @function isEmpty
 * @param {*} value The variable to test
 * @return {boolean}
 **/
function isEmpty(value) {
	var key;

	if (isObject(value)) {
		for (key in value) {
			if (value.hasOwnProperty(key)) {
				return false;
			}
		}
	} else if (isArrayLike(value)) {
		return value.length === 0;
	} else {
		return isUndefined(value);
	}

	return true;
}

function parse(path) {
	if (!path) {
		return [];
	} else if (isString(path)) {
		return path.split('.');
	} else if (isArray(path)) {
		return path.slice(0);
	} else {
		throw new Error('unable to parse path: ' + path + ' : ' + (typeof path === 'undefined' ? 'undefined' : _typeof(path)));
	}
}

/**
 * Sets a value to a namespace, returns the old value
 *
 * @function set
 * @param {object} root The root of the namespace, bMoor.namespace.root if not defined
 * @param {string|array} space The namespace
 * @param {*} value The value to set the namespace to
 * @return {*}
 **/
function set(root, space, value) {
	var i,
	    c,
	    val,
	    nextSpace,
	    curSpace = root;

	space = parse(space);

	val = space.pop();

	for (i = 0, c = space.length; i < c; i++) {
		nextSpace = space[i];

		if (isUndefined(curSpace[nextSpace])) {
			curSpace[nextSpace] = {};
		}

		curSpace = curSpace[nextSpace];
	}

	curSpace[val] = value;

	return curSpace;
}

function _makeSetter(property, next) {
	if (next) {
		return function (ctx, value) {
			var t = ctx[property];

			if (!t) {
				t = ctx[property] = {};
			}

			return next(t, value);
		};
	} else {
		return function (ctx, value) {
			ctx[property] = value;
			return ctx;
		};
	}
}

function makeSetter(space) {
	var i,
	    fn,
	    readings = parse(space);

	for (i = readings.length - 1; i > -1; i--) {
		fn = _makeSetter(readings[i], fn);
	}

	return fn;
}

/**
 * get a value from a namespace, if it doesn't exist, the path will be created
 *
 * @function get
 * @param {object} root The root of the namespace, bMoor.namespace.root if not defined
 * @param {string|array|function} space The namespace
 * @return {array}
 **/
function get(root, path) {
	var i,
	    c,
	    space,
	    nextSpace,
	    curSpace = root;

	if (!root) {
		return root;
	}

	space = parse(path);
	if (space.length) {
		for (i = 0, c = space.length; i < c; i++) {
			nextSpace = space[i];

			if (isUndefined(curSpace[nextSpace])) {
				return;
			}

			curSpace = curSpace[nextSpace];
		}
	}

	return curSpace;
}

function _makeGetter(property, next) {
	if (next) {
		return function (obj) {
			try {
				return next(obj[property]);
			} catch (ex) {
				return undefined;
			}
		};
	} else {
		return function (obj) {
			try {
				return obj[property];
			} catch (ex) {
				return undefined;
			}
		};
	}
}

function makeGetter(path) {
	var i,
	    fn,
	    space = parse(path);

	if (space.length) {
		for (i = space.length - 1; i > -1; i--) {
			fn = _makeGetter(space[i], fn);
		}
	} else {
		return function (obj) {
			return obj;
		};
	}

	return fn;
}

/**
 * Delete a namespace, returns the old value
 *
 * @function del
 * @param {object} root The root of the namespace, bMoor.namespace.root if not defined
 * @param {string|array} space The namespace
 * @return {*}
 **/
function del(root, space) {
	var old,
	    val,
	    nextSpace,
	    curSpace = root;

	if (space && (isString(space) || isArrayLike(space))) {
		space = parse(space);

		val = space.pop();

		for (var i = 0; i < space.length; i++) {
			nextSpace = space[i];

			if (isUndefined(curSpace[nextSpace])) {
				return;
			}

			curSpace = curSpace[nextSpace];
		}

		old = curSpace[val];
		delete curSpace[val];
	}

	return old;
}

/**
 * Call a function against all elements of an array like object, from 0 to length.  
 *
 * @function loop
 * @param {array} arr The array to iterate through
 * @param {function} fn The function to call against each element
 * @param {object} context The context to call each function against
 **/
function loop(arr, fn, context) {
	var i, c;

	if (!context) {
		context = arr;
	}

	if (arr.forEach) {
		arr.forEach(fn, context);
	} else {
		for (i = 0, c = arr.length; i < c; ++i) {
			if (i in arr) {
				fn.call(context, arr[i], i, arr);
			}
		}
	}
}

/**
 * Call a function against all own properties of an object.  
 *
 * @function each
 * @param {object} arr The object to iterate through
 * @param {function} fn The function to call against each element
 * @param {object} context The context to call each function against
 **/
function each(obj, fn, context) {
	var key;

	if (!context) {
		context = obj;
	}

	for (key in obj) {
		if (obj.hasOwnProperty(key)) {
			fn.call(context, obj[key], key, obj);
		}
	}
}

/**
 * Call a function against all own properties of an object, skipping specific framework properties.
 * In this framework, $ implies a system function, _ implies private, so skip _
 *
 * @function iterate
 * @param {object} obj The object to iterate through
 * @param {function} fn The function to call against each element
 * @param {object} context The scope to call each function against
 **/
function iterate(obj, fn, context) {
	var key;

	if (!context) {
		context = obj;
	}

	for (key in obj) {
		if (obj.hasOwnProperty(key) && key.charAt(0) !== '_') {
			fn.call(context, obj[key], key, obj);
		}
	}
}

/**
 * Call a function against all own properties of an object, skipping specific framework properties.
 * In this framework, $ implies a system function, _ implies private, so skip both
 *
 * @function safe
 * @param {object} obj - The object to iterate through
 * @param {function} fn - The function to call against each element
 * @param {object} scope - The scope to call each function against
 **/
function safe(obj, fn, context) {
	var key;

	if (!context) {
		context = obj;
	}

	for (key in obj) {
		if (obj.hasOwnProperty(key) && key.charAt(0) !== '_' && key.charAt(0) !== '$') {
			fn.call(context, obj[key], key, obj);
		}
	}
}

function naked(obj, fn, context) {
	safe(obj, function (t, k, o) {
		if (!isFunction(t)) {
			fn.call(context, t, k, o);
		}
	});
}

module.exports = {
	// booleans
	isUndefined: isUndefined,
	isDefined: isDefined,
	isString: isString,
	isNumber: isNumber,
	isFunction: isFunction,
	isObject: isObject,
	isBoolean: isBoolean,
	isArrayLike: isArrayLike,
	isArray: isArray,
	isEmpty: isEmpty,
	// access
	parse: parse,
	set: set,
	makeSetter: makeSetter,
	get: get,
	makeGetter: makeGetter,
	del: del,
	// controls
	loop: loop,
	each: each,
	iterate: iterate,
	safe: safe,
	naked: naked
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (cb, min, max, settings) {
	var ctx, args, next, limit, timeout;

	if (!settings) {
		settings = {};
	}

	function fire() {
		limit = null;
		cb.apply(settings.context || ctx, args);
	}

	function run() {
		var now = Date.now();

		if (now >= limit || now >= next) {
			fire();
		} else {
			timeout = setTimeout(run, Math.min(limit, next) - now);
		}
	}

	var fn = function windowed() {
		var now = Date.now();

		ctx = this;
		args = arguments;
		next = now + min;

		if (!limit) {
			limit = now + max;
			timeout = setTimeout(run, min);
		}
	};

	fn.clear = function () {
		clearTimeout(timeout);
		timeout = null;
		limit = null;
	};

	fn.flush = function () {
		fire();
		fn.clear();
	};

	fn.shift = function (diff) {
		limit += diff;
	};

	return fn;
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var bmoor = __webpack_require__(3);

bmoor.dom.triggerEvent(bmoor.dom.getDomElement('#bmoor'), 'click');

var target = bmoor.dom.getDomElement('#target'),
    positioned = bmoor.dom.getDomElement('#positioned');

bmoor.dom.centerOn(target, positioned);

setTimeout(function () {
	target.style.width = 50;
	target.style.height = 50;

	bmoor.dom.centerOn(target, positioned);
}, 2000);

setTimeout(function () {
	bmoor.dom.getDomCollection('#wrapper')[0].style.position = 'static';
	positioned.style.position = 'fixed';

	positioned.style.left = '20%';
	positioned.style.top = '20%';

	bmoor.dom.showOn(target, positioned);
}, 4000);

setTimeout(function () {
	positioned.style.left = '20%';
	positioned.style.top = '80%';

	bmoor.dom.showOn(target, positioned);
}, 6000);

setTimeout(function () {
	positioned.style.left = '80%';
	positioned.style.top = '80%';

	bmoor.dom.showOn(target, positioned);
}, 8000);

setTimeout(function () {
	positioned.style.left = '80%';
	positioned.style.top = '20%';

	bmoor.dom.showOn(target, positioned);
}, 10000);

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var bmoor = Object.create(__webpack_require__(0));

bmoor.dom = __webpack_require__(4);
bmoor.data = __webpack_require__(5);
bmoor.flow = __webpack_require__(6);
bmoor.array = __webpack_require__(9);
bmoor.build = __webpack_require__(10);
bmoor.object = __webpack_require__(14);
bmoor.string = __webpack_require__(15);
bmoor.promise = __webpack_require__(16);

bmoor.Memory = __webpack_require__(17);
bmoor.Eventing = __webpack_require__(18);

module.exports = bmoor;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var bmoor = __webpack_require__(0),
    regex = {};

// TODO: put in a polyfill block
if (typeof window !== 'undefined' && !bmoor.isFunction(window.CustomEvent)) {

	var _CustomEvent = function _CustomEvent(event, params) {
		params = params || { bubbles: false, cancelable: false, detail: undefined };

		var evt = document.createEvent('CustomEvent');

		evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);

		return evt;
	};

	_CustomEvent.prototype = window.Event.prototype;

	window.CustomEvent = _CustomEvent;
}

if (typeof Element !== 'undefined' && !Element.prototype.matches) {
	Element.prototype.matches = Element.prototype.msMatchesSelector;
}

function getReg(className) {
	var reg = regex[className];

	if (!reg) {
		reg = new RegExp('(?:^|\\s)' + className + '(?!\\S)');
		regex[className] = reg;
	}

	return reg;
}

function getScrollPosition(doc) {
	if (!doc) {
		doc = document;
	}

	return {
		left: window.pageXOffset || (doc.documentElement || doc.body).scrollLeft,
		top: window.pageYOffset || (doc.documentElement || doc.body).scrollTop
	};
}

function getBoundryBox(element) {
	return element.getBoundingClientRect();
}

function centerOn(element, target, doc) {
	var el = getBoundryBox(element),
	    targ = getBoundryBox(target),
	    pos = getScrollPosition(doc);

	if (!doc) {
		doc = document;
	}

	element.style.top = pos.top + targ.top + targ.height / 2 - el.height / 2;
	element.style.left = pos.left + targ.left + targ.width / 2 - el.width / 2;
	element.style.right = '';
	element.style.bottom = '';

	element.style.position = 'absolute';
	doc.body.appendChild(element);
}

function showOn(element, target, doc) {
	var direction,
	    targ = getBoundryBox(target),
	    x = targ.x + targ.width / 2,
	    y = targ.y + targ.height / 2,
	    centerX = window.innerWidth / 2,
	    centerY = window.innerHeight / 2,
	    pos = getScrollPosition(doc);

	if (!doc) {
		doc = document;
	}

	if (x < centerX) {
		// right side has more room
		direction = 'r';
		element.style.left = pos.left + targ.right;
		element.style.right = '';
	} else {
		// left side has more room
		//element.style.left = targ.left - el.width - offset;
		direction = 'l';
		element.style.right = window.innerWidth - targ.left - pos.left;
		element.style.left = '';
	}

	if (y < centerY) {
		// more room on bottom
		direction = 'b' + direction;
		element.style.top = pos.top + targ.bottom;
		element.style.bottom = '';
	} else {
		// more room on top
		direction = 't' + direction;
		element.style.bottom = window.innerHeight - targ.top - pos.top;
		element.style.top = '';
	}

	element.style.position = 'absolute';
	doc.body.appendChild(element);

	return direction;
}

function massage(elements) {
	if (!bmoor.isArrayLike(elements)) {
		elements = [elements];
	}

	return elements;
}

function getDomElement(element, doc) {
	if (!doc) {
		doc = document;
	}

	if (bmoor.isString(element)) {
		return doc.querySelector(element);
	} else {
		return element;
	}
}

function getDomCollection(elements, doc) {
	var i,
	    c,
	    j,
	    co,
	    el,
	    selection,
	    els = [];

	if (!doc) {
		doc = document;
	}

	elements = massage(elements);

	for (i = 0, c = elements.length; i < c; i++) {
		el = elements[i];
		if (bmoor.isString(el)) {
			selection = doc.querySelectorAll(el);
			for (j = 0, co = selection.length; j < co; j++) {
				els.push(selection[j]);
			}
		} else {
			els.push(el);
		}
	}

	return els;
}

function addClass(elements, className) {
	var i,
	    c,
	    node,
	    baseClass,
	    reg = getReg(className);

	elements = massage(elements);

	for (i = 0, c = elements.length; i < c; i++) {
		node = elements[i];
		baseClass = node.getAttribute('class') || '';

		if (!baseClass.match(reg)) {
			node.setAttribute('class', baseClass + ' ' + className);
		}
	}
}

function removeClass(elements, className) {
	var i,
	    c,
	    node,
	    reg = getReg(className);

	elements = massage(elements);

	for (i = 0, c = elements.length; i < c; i++) {
		node = elements[i];
		node.setAttribute('class', (node.getAttribute('class') || '').replace(reg, ''));
	}
}

function bringForward(elements) {
	var i, c, node;

	elements = massage(elements);

	for (i = 0, c = elements.length; i < c; i++) {
		node = elements[i];

		if (node.parentNode) {
			node.parentNode.appendChild(node);
		}
	}
}

function triggerEvent(node, eventName, eventData, eventSettings) {
	if (node.dispatchEvent) {
		if (!eventSettings) {
			eventSettings = { 'view': window, 'bubbles': true, 'cancelable': true };
		} else {
			if (eventSettings.bubbles === undefined) {
				eventSettings.bubbles = true;
			}
			if (eventSettings.cancelable === undefined) {
				eventSettings.cancelable = true;
			}
		}

		eventSettings.detail = eventData;

		var event = new CustomEvent(eventName, eventSettings);
		event.$bmoor = true; // allow detection of bmoor events

		node.dispatchEvent(event);
	} else if (node.fireEvent) {
		var doc = void 0;

		if (!bmoor.isString(eventName)) {
			throw new Error('Can not throw custom events in IE');
		}

		if (node.ownerDocument) {
			doc = node.ownerDocument;
		} else if (node.nodeType === 9) {
			// the node may be the document itself, nodeType 9 = DOCUMENT_NODE
			doc = node;
		} else if (typeof document !== 'undefined') {
			doc = document;
		} else {
			throw new Error('Invalid node passed to fireEvent: ' + node.id);
		}

		var _event = doc.createEventObject();
		_event.detail = eventData;
		_event.$bmoor = true; // allow detection of bmoor events

		node.fireEvent('on' + eventName, _event);
	} else {
		throw new Error('We can not trigger events here');
	}
}

function onEvent(node, eventName, cb, qualifier) {
	node.addEventListener(eventName, function (event) {
		if (qualifier && !(event.target || event.srcElement).matches(qualifier)) {
			return;
		}

		cb(event.detail, event);
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
	on: function on(node, settings) {
		Object.keys(settings).forEach(function (eventName) {
			var ops = settings[eventName];

			if (bmoor.isFunction(ops)) {
				onEvent(node, eventName, ops);
			} else {
				Object.keys(ops).forEach(function (qualifier) {
					var cb = ops[qualifier];

					onEvent(node, eventName, cb, qualifier);
				});
			}
		});
	}
};

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Array helper functions
 * @module bmoor.data
 **/

var _id = 0;

function nextUid() {
	return ++_id;
}

function setUid(obj) {
	var t = obj.$$bmoorUid;

	if (!t) {
		t = obj.$$bmoorUid = nextUid();
	}

	return t;
}

function getUid(obj) {
	if (!obj.$$bmoorUid) {
		setUid(obj);
	}

	return obj.$$bmoorUid;
}

module.exports = {
	setUid: setUid,
	getUid: getUid
};

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
	soon: __webpack_require__(7),
	debounce: __webpack_require__(8),
	window: __webpack_require__(1)
};

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (cb, time, settings) {
	var ctx, args, timeout;

	if (!settings) {
		settings = {};
	}

	function fire() {
		timeout = null;
		cb.apply(settings.context || ctx, args);
	}

	var fn = function sooned() {
		ctx = this;
		args = arguments;

		if (!timeout) {
			timeout = setTimeout(fire, time);
		}
	};

	fn.clear = function () {
		clearTimeout(timeout);
		timeout = null;
	};

	fn.flush = function () {
		fire();
		fn.clear();
	};

	return fn;
};

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (cb, time, settings) {
	var ctx, args, limit, timeout;

	if (!settings) {
		settings = {};
	}

	function fire() {
		timeout = null;
		cb.apply(settings.context || ctx, args);
	}

	function run() {
		var now = Date.now();

		if (now >= limit) {
			fire();
		} else {
			timeout = setTimeout(run, limit - now);
		}
	}

	var fn = function debounced() {
		var now = Date.now();

		ctx = this;
		args = arguments;
		limit = now + time;

		if (!timeout) {
			timeout = setTimeout(run, time);
		}
	};

	fn.clear = function () {
		clearTimeout(timeout);
		timeout = null;
		limit = null;
	};

	fn.flush = function () {
		fire();
		fn.clear();
	};

	fn.shift = function (diff) {
		limit += diff;
	};

	return fn;
};

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Array helper functions
 * @module bmoor.array
 **/

var bmoor = __webpack_require__(0);

/**
 * Search an array for an element and remove it, starting at the begining or a specified location
 *
 * @function remove
 * @param {array} arr An array to be searched
 * @param {*} searchElement Content for which to be searched
 * @param {integer} fromIndex The begining index from which to begin the search, defaults to 0
 * @return {array} array containing removed element
 **/
function remove(arr, searchElement, fromIndex) {
	var pos = arr.indexOf(searchElement, fromIndex);

	if (pos > -1) {
		return arr.splice(pos, 1)[0];
	}
}

/**
 * Search an array for an element and remove all instances of it, starting at the begining or a specified location
 *
 * @function remove
 * @param {array} arr An array to be searched
 * @param {*} searchElement Content for which to be searched
 * @param {integer} fromIndex The begining index from which to begin the search, defaults to 0
 * @return {integer} number of elements removed
 **/
function removeAll(arr, searchElement, fromIndex) {
	var r,
	    pos = arr.indexOf(searchElement, fromIndex);

	if (pos > -1) {
		r = removeAll(arr, searchElement, pos + 1);
		r.unshift(arr.splice(pos, 1)[0]);

		return r;
	} else {
		return [];
	}
}

function bisect(arr, value, func, preSorted) {
	var idx,
	    val,
	    bottom = 0,
	    top = arr.length - 1;

	if (!preSorted) {
		arr.sort(function (a, b) {
			return func(a) - func(b);
		});
	}

	if (func(arr[bottom]) >= value) {
		return {
			left: bottom,
			right: bottom
		};
	}

	if (func(arr[top]) <= value) {
		return {
			left: top,
			right: top
		};
	}

	if (arr.length) {
		while (top - bottom > 1) {
			idx = Math.floor((top + bottom) / 2);
			val = func(arr[idx]);

			if (val === value) {
				top = idx;
				bottom = idx;
			} else if (val > value) {
				top = idx;
			} else {
				bottom = idx;
			}
		}

		// if it is one of the end points, make it that point
		if (top !== idx && func(arr[top]) === value) {
			return {
				left: top,
				right: top
			};
		} else if (bottom !== idx && func(arr[bottom]) === value) {
			return {
				left: bottom,
				right: bottom
			};
		} else {
			return {
				left: bottom,
				right: top
			};
		}
	}
}

/**
 * Compare two arrays.
 *
 * @function remove
 * @param {array} arr1 An array to be compared
 * @param {array} arr2 An array to be compared
 * @param {function} func The comparison function
 * @return {object} an object containing the elements unique to the left, matched, and unqiue to the right
 **/
function compare(arr1, arr2, func) {
	var cmp,
	    left = [],
	    right = [],
	    leftI = [],
	    rightI = [];

	arr1 = arr1.slice(0);
	arr2 = arr2.slice(0);

	arr1.sort(func);
	arr2.sort(func);

	while (arr1.length > 0 && arr2.length > 0) {
		cmp = func(arr1[0], arr2[0]);

		if (cmp < 0) {
			left.push(arr1.shift());
		} else if (cmp > 0) {
			right.push(arr2.shift());
		} else {
			leftI.push(arr1.shift());
			rightI.push(arr2.shift());
		}
	}

	while (arr1.length) {
		left.push(arr1.shift());
	}

	while (arr2.length) {
		right.push(arr2.shift());
	}

	return {
		left: left,
		intersection: {
			left: leftI,
			right: rightI
		},
		right: right
	};
}

/**
 * Create a new array that is completely unique
 *
 * @function unique
 * @param {array} arr The array to be made unique
 * @param {function|boolean} sort If boolean === true, array is presorted.  If function, use to sort
 **/
function unique(arr, sort, uniqueFn) {
	var rtn = [];

	if (arr.length) {
		if (sort) {
			// more efficient because I can presort
			if (bmoor.isFunction(sort)) {
				arr = arr.slice(0).sort(sort);
			}

			var last = void 0;

			for (var i = 0, c = arr.length; i < c; i++) {
				var d = arr[i],
				    v = uniqueFn ? uniqueFn(d) : d;

				if (v !== last) {
					last = v;
					rtn.push(d);
				}
			}
		} else if (uniqueFn) {
			var hash = {};

			for (var _i = 0, _c = arr.length; _i < _c; _i++) {
				var _d = arr[_i],
				    _v = uniqueFn(_d);

				if (!hash[_v]) {
					hash[_v] = true;
					rtn.push(_d);
				}
			}
		} else {
			// greedy and inefficient
			for (var _i2 = 0, _c2 = arr.length; _i2 < _c2; _i2++) {
				var _d2 = arr[_i2];

				if (rtn.indexOf(_d2) === -1) {
					rtn.push(_d2);
				}
			}
		}
	}

	return rtn;
}

// I could probably make this sexier, like allow uniqueness algorithm, but I'm keeping it simple for now
function intersection(arr1, arr2) {
	var rtn = [];

	if (arr1.length > arr2.length) {
		var t = arr1;

		arr1 = arr2;
		arr2 = t;
	}

	for (var i = 0, c = arr1.length; i < c; i++) {
		var d = arr1[i];

		if (arr2.indexOf(d) !== -1) {
			rtn.push(d);
		}
	}

	return rtn;
}

function difference(arr1, arr2) {
	var rtn = [];

	for (var i = 0, c = arr1.length; i < c; i++) {
		var d = arr1[i];

		if (arr2.indexOf(d) === -1) {
			rtn.push(d);
		}
	}

	return rtn;
}

function watch(arr, insert, remove, preload) {
	if (insert) {
		var oldPush = arr.push.bind(arr);
		var oldUnshift = arr.unshift.bind(arr);

		arr.push = function () {
			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			args.forEach(insert);

			oldPush.apply(undefined, args);
		};

		arr.unshift = function () {
			for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
				args[_key2] = arguments[_key2];
			}

			args.forEach(insert);

			oldUnshift.apply(undefined, args);
		};

		if (preload) {
			arr.forEach(insert);
		}
	}

	if (remove) {
		var oldShift = arr.shift.bind(arr);
		var oldPop = arr.pop.bind(arr);
		var oldSplice = arr.splice.bind(arr);

		arr.shift = function () {
			remove(oldShift.apply(undefined, arguments));
		};

		arr.pop = function () {
			remove(oldPop.apply(undefined, arguments));
		};

		arr.splice = function () {
			var res = oldSplice.apply(undefined, arguments);

			res.forEach(remove);

			return res;
		};
	}
}

module.exports = {
	remove: remove,
	removeAll: removeAll,
	bisect: bisect,
	compare: compare,
	unique: unique,
	intersection: intersection,
	difference: difference,
	watch: watch
};

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var bmoor = __webpack_require__(0),
    mixin = __webpack_require__(11),
    plugin = __webpack_require__(12),
    decorate = __webpack_require__(13);

function proc(action, proto, def) {
	var i, c;

	if (bmoor.isArray(def)) {
		for (i = 0, c = def.length; i < c; i++) {
			action(proto, def[i]);
		}
	} else {
		action(proto, def);
	}
}

function maker(root, config, base) {
	if (!base) {
		base = function BmoorPrototype() {};

		if (config) {
			if (bmoor.isFunction(root)) {
				base = function BmoorPrototype() {
					root.apply(this, arguments);
				};

				base.prototype = Object.create(root.prototype);
			} else {
				base.prototype = Object.create(root);
			}
		} else {
			config = root;
		}
	}

	if (config.mixin) {
		proc(mixin, base.prototype, config.mixin);
	}

	if (config.decorate) {
		proc(decorate, base.prototype, config.decorate);
	}

	if (config.plugin) {
		proc(plugin, base.prototype, config.plugin);
	}

	return base;
}

maker.mixin = mixin;
maker.decorate = decorate;
maker.plugin = plugin;

module.exports = maker;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var bmoor = __webpack_require__(0);

module.exports = function (to, from) {
	bmoor.iterate(from, function (val, key) {
		to[key] = val;
	});
};

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var bmoor = __webpack_require__(0);

function override(key, target, action, plugin) {
	var old = target[key];

	if (old === undefined) {
		if (bmoor.isFunction(action)) {
			target[key] = function () {
				return action.apply(plugin, arguments);
			};
		} else {
			target[key] = action;
		}
	} else {
		if (bmoor.isFunction(action)) {
			if (bmoor.isFunction(old)) {
				target[key] = function () {
					var backup = plugin.$old,
					    reference = plugin.$target,
					    rtn;

					plugin.$target = target;
					plugin.$old = function () {
						return old.apply(target, arguments);
					};

					rtn = action.apply(plugin, arguments);

					plugin.$old = backup;
					plugin.$target = reference;

					return rtn;
				};
			} else {
				console.log('attempting to plug-n-play ' + key + ' an instance of ' + (typeof old === 'undefined' ? 'undefined' : _typeof(old)));
			}
		} else {
			console.log('attempting to plug-n-play with ' + key + ' and instance of ' + (typeof action === 'undefined' ? 'undefined' : _typeof(action)));
		}
	}
}

module.exports = function (to, from, ctx) {
	bmoor.iterate(from, function (val, key) {
		override(key, to, val, ctx);
	});
};

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var bmoor = __webpack_require__(0);

function override(key, target, action) {
	var old = target[key];

	if (old === undefined) {
		target[key] = action;
	} else {
		if (bmoor.isFunction(action)) {
			if (bmoor.isFunction(old)) {
				target[key] = function () {
					var backup = this.$old,
					    rtn;

					this.$old = old;

					rtn = action.apply(this, arguments);

					this.$old = backup;

					return rtn;
				};
			} else {
				console.log('attempting to decorate ' + key + ' an instance of ' + (typeof old === 'undefined' ? 'undefined' : _typeof(old)));
			}
		} else {
			console.log('attempting to decorate with ' + key + ' and instance of ' + (typeof action === 'undefined' ? 'undefined' : _typeof(action)));
		}
	}
}

module.exports = function (to, from) {
	bmoor.iterate(from, function (val, key) {
		override(key, to, val);
	});
};

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * Object helper functions
 * @module bmoor.object
 **/

var bmoor = __webpack_require__(0);

function values(obj) {
	var res = [];

	bmoor.naked(obj, function (v) {
		res.push(v);
	});

	return res;
}

function keys(obj) {
	var res = [];

	if (Object.keys) {
		return Object.keys(obj);
	} else {
		bmoor.naked(obj, function (v, key) {
			res.push(key);
		});

		return res;
	}
}

/**
 * Takes a hash and uses the indexs as namespaces to add properties to an objs
 *
 * @function explode
 * @param {object} target The object to map the variables onto
 * @param {object} mappings An object orientended as [ namespace ] => value
 * @return {object} The object that has had content mapped into it
 **/
function explode(target, mappings) {
	if (!mappings) {
		mappings = target;
		target = {};
	}

	bmoor.iterate(mappings, function (val, mapping) {
		bmoor.set(target, mapping, val);
	});

	return target;
}

function makeExploder(paths) {
	var fn;

	paths.forEach(function (path) {
		var old = fn,
		    setter = bmoor.makeSetter(path);

		if (old) {
			fn = function fn(ctx, obj) {
				setter(ctx, obj[path]);
				old(ctx, obj);
			};
		} else {
			fn = function fn(ctx, obj) {
				setter(ctx, obj[path]);
			};
		}
	});

	return function (obj) {
		var rtn = {};

		fn(rtn, obj);

		return rtn;
	};
}

function implode(obj, ignore) {
	var rtn = {};

	if (!ignore) {
		ignore = {};
	}

	bmoor.iterate(obj, function (val, key) {
		var t = ignore[key];

		if (bmoor.isObject(val)) {
			if (t === false) {
				rtn[key] = val;
			} else if (!t || bmoor.isObject(t)) {
				bmoor.iterate(implode(val, t), function (v, k) {
					rtn[key + '.' + k] = v;
				});
			}
		} else if (!t) {
			rtn[key] = val;
		}
	});

	return rtn;
}

/**
 * Create a new instance from an object and some arguments
 *
 * @function mask
 * @param {function} obj The basis for the constructor
 * @param {array} args The arguments to pass to the constructor
 * @return {object} The new object that has been constructed
 **/
function mask(obj) {
	if (Object.create) {
		var T = function Masked() {};

		T.prototype = obj;

		return new T();
	} else {
		return Object.create(obj);
	}
}

/**
 * Create a new instance from an object and some arguments.  This is a shallow copy to <- from[...]
 * 
 * @function extend
 * @param {object} to Destination object.
 * @param {...object} src Source object(s).
 * @returns {object} Reference to `dst`.
 **/
function extend(to) {
	bmoor.loop(arguments, function (cpy) {
		if (cpy !== to) {
			if (to && to.extend) {
				to.extend(cpy);
			} else {
				bmoor.iterate(cpy, function (value, key) {
					to[key] = value;
				});
			}
		}
	});

	return to;
}

function empty(to) {
	bmoor.iterate(to, function (v, k) {
		delete to[k]; // TODO : would it be ok to set it to undefined?
	});
}

function copy(to) {
	empty(to);

	return extend.apply(undefined, arguments);
}

// Deep copy version of extend
function merge(to) {
	var from,
	    i,
	    c,
	    m = function m(val, key) {
		to[key] = merge(to[key], val);
	};

	for (i = 1, c = arguments.length; i < c; i++) {
		from = arguments[i];

		if (to === from) {
			continue;
		} else if (to && to.merge) {
			to.merge(from);
		} else if (!bmoor.isObject(from)) {
			to = from;
		} else if (!bmoor.isObject(to)) {
			to = merge({}, from);
		} else {
			bmoor.safe(from, m);
		}
	}

	return to;
}

/**
 * A general comparison algorithm to test if two objects are equal
 *
 * @function equals
 * @param {object} obj1 The object to copy the content from
 * @param {object} obj2 The object into which to copy the content
 * @preturns {boolean}
 **/
function equals(obj1, obj2) {
	var t1 = typeof obj1 === 'undefined' ? 'undefined' : _typeof(obj1),
	    t2 = typeof obj2 === 'undefined' ? 'undefined' : _typeof(obj2),
	    c,
	    i,
	    keyCheck;

	if (obj1 === obj2) {
		return true;
	} else if (obj1 !== obj1 && obj2 !== obj2) {
		return true; // silly NaN
	} else if (obj1 === null || obj1 === undefined || obj2 === null || obj2 === undefined) {
		return false; // undefined or null
	} else if (obj1.equals) {
		return obj1.equals(obj2);
	} else if (obj2.equals) {
		return obj2.equals(obj1); // because maybe somene wants a class to be able to equal a simple object
	} else if (t1 === t2) {
		if (t1 === 'object') {
			if (bmoor.isArrayLike(obj1)) {
				if (!bmoor.isArrayLike(obj2)) {
					return false;
				}

				if ((c = obj1.length) === obj2.length) {
					for (i = 0; i < c; i++) {
						if (!equals(obj1[i], obj2[i])) {
							return false;
						}
					}

					return true;
				}
			} else if (!bmoor.isArrayLike(obj2)) {
				keyCheck = {};
				for (i in obj1) {
					if (obj1.hasOwnProperty(i)) {
						if (!equals(obj1[i], obj2[i])) {
							return false;
						}

						keyCheck[i] = true;
					}
				}

				for (i in obj2) {
					if (obj2.hasOwnProperty(i)) {
						if (!keyCheck && obj2[i] !== undefined) {
							return false;
						}
					}
				}
			}
		}
	}

	return false;
}

// TODO : property watch

module.exports = {
	keys: keys,
	values: values,
	explode: explode,
	makeExploder: makeExploder,
	implode: implode,
	mask: mask,
	extend: extend,
	empty: empty,
	copy: copy,
	merge: merge,
	equals: equals
};

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var bmoor = __webpack_require__(0);

/**
 * Array helper functions
 * @module bmoor.string
 **/

function trim(str, chr) {
	if (!chr) {
		chr = '\\s';
	}
	return str.replace(new RegExp('^' + chr + '+|' + chr + '+$', 'g'), '');
}

function ltrim(str, chr) {
	if (!chr) {
		chr = '\\s';
	}
	return str.replace(new RegExp('^' + chr + '+', 'g'), '');
}

function rtrim(str, chr) {
	if (!chr) {
		chr = '\\s';
	}
	return str.replace(new RegExp(chr + '+$', 'g'), '');
}

// TODO : eventually I will make getCommands and getFormatter more complicated, but for now
//        they work by staying simple
function getCommands(str) {
	var commands = str.split('|');

	commands.forEach(function (command, key) {
		var args = command.split(':');

		args.forEach(function (arg, k) {
			args[k] = trim(arg);
		});

		commands[key] = {
			command: command,
			method: args.shift(),
			args: args
		};
	});

	return commands;
}

function stackFunctions(newer, older) {
	return function (o) {
		return older(newer(o));
	};
}

var filters = {
	precision: function precision(dec) {
		dec = parseInt(dec, 10);

		return function (num) {
			return parseFloat(num, 10).toFixed(dec);
		};
	},
	currency: function currency() {
		return function (num) {
			return '$' + num;
		};
	},
	url: function url() {
		return function (param) {
			return encodeURIComponent(param);
		};
	}
};

function doFilters(ters) {
	var fn, command, filter;

	while (ters.length) {
		command = ters.pop();
		fn = filters[command.method];

		if (fn) {
			fn = fn.apply(null, command.args);

			if (filter) {
				filter = stackFunctions(fn, filter);
			} else {
				filter = fn;
			}
		}
	}

	return filter;
}

function doVariable(lines) {
	var fn, rtn, dex, line, getter, command, commands, remainder;

	if (!lines.length) {
		return null;
	} else {
		line = lines.shift();
		dex = line.indexOf('}}');
		fn = doVariable(lines);

		if (dex === -1) {
			return function () {
				return '| no close |';
			};
		} else if (dex === 0) {
			// is looks like this {{}}
			remainder = line.substr(2);
			getter = function getter(o) {
				if (bmoor.isObject(o)) {
					return JSON.stringify(o);
				} else {
					return o;
				}
			};
		} else {
			commands = getCommands(line.substr(0, dex));
			command = commands.shift().command;
			remainder = line.substr(dex + 2);
			getter = bmoor.makeGetter(command);

			if (commands.length) {
				commands = doFilters(commands, getter);

				if (commands) {
					getter = stackFunctions(getter, commands);
				}
			}
		}

		//let's optimize this a bit
		if (fn) {
			// we have a child method
			rtn = function rtn(obj) {
				return getter(obj) + remainder + fn(obj);
			};
			rtn.$vars = fn.$vars;
		} else {
			// this is the last variable
			rtn = function rtn(obj) {
				return getter(obj) + remainder;
			};
			rtn.$vars = [];
		}

		if (command) {
			rtn.$vars.push(command);
		}

		return rtn;
	}
}

function getFormatter(str) {
	var fn,
	    rtn,
	    lines = str.split(/{{/g);

	if (lines.length > 1) {
		str = lines.shift();
		fn = doVariable(lines);
		rtn = function rtn(obj) {
			return str + fn(obj);
		};
		rtn.$vars = fn.$vars;
	} else {
		rtn = function rtn() {
			return str;
		};
		rtn.$vars = [];
	}

	return rtn;
}

getFormatter.filters = filters;

module.exports = {
	trim: trim,
	ltrim: ltrim,
	rtrim: rtrim,
	getCommands: getCommands,
	getFormatter: getFormatter
};

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var window = __webpack_require__(1);

function always(promise, func) {
	promise.then(func, func);
	return promise;
}

function stack(calls, settings) {

	if (!calls) {
		throw new Error('calling stack with no call?');
	}

	if (!settings) {
		settings = {};
	}

	var min = settings.min || 1,
	    max = settings.max || 10,
	    limit = settings.limit || 5,
	    update = window(settings.update || function () {}, min, max);

	return new Promise(function (resolve, reject) {
		var run,
		    timeout,
		    errors = [],
		    active = 0,
		    callStack = calls.slice(0);

		function registerError(err) {
			errors.push(err);
		}

		function next() {
			active--;

			update({ active: active, remaining: callStack.length });

			if (callStack.length) {
				if (!timeout) {
					timeout = setTimeout(run, 1);
				}
			} else if (!active) {
				if (errors.length) {
					reject(errors);
				} else {
					resolve();
				}
			}
		}

		run = function run() {
			timeout = null;

			while (active < limit && callStack.length) {
				var fn = callStack.pop();

				active++;

				fn().catch(registerError).then(next);
			}
		};

		run();
	});
}

function hash(obj) {
	var rtn = {};

	return Promise.all(Object.keys(obj).map(function (key) {
		var p = obj[key];

		if (p && p.then) {
			p.then(function (v) {
				rtn[key] = v;
			});
		} else {
			rtn[key] = p;
		}

		return p;
	})).then(function () {
		return rtn;
	});
}

module.exports = {
	hash: hash,
	stack: stack,
	always: always
};

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var master = {};

var Memory = function () {
	function Memory(name) {
		_classCallCheck(this, Memory);

		var index = {};

		this.name = name;
		this.get = function (name) {
			return index[name];
		};

		this.check = function (name) {
			console.log('Memory::check will soon removed');
			return index[name];
		};

		this.isSet = function (name) {
			return !!index[name];
		};

		this.register = function (name, obj) {
			index[name] = obj;
		};

		this.clear = function (name) {
			if (name in index) {
				delete index[name];
			}
		};

		this.keys = function () {
			return Object.keys(index);
		};
	}

	_createClass(Memory, [{
		key: 'import',
		value: function _import(json) {
			var _this = this;

			Object.keys(json).forEach(function (key) {
				_this.register(key, json[key]);
			});
		}
	}, {
		key: 'export',
		value: function _export() {
			var _this2 = this;

			return this.keys().reduce(function (rtn, key) {
				rtn[key] = _this2.get(key);

				return rtn;
			}, {});
		}
	}]);

	return Memory;
}();

module.exports = {
	Memory: Memory,
	use: function use(title) {
		var rtn = master[title];

		if (rtn) {
			throw new Error('Memory already exists ' + title);
		} else {
			rtn = master[title] = new Memory(title);
		}

		return rtn;
	}
};

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Eventing = function () {
	function Eventing() {
		_classCallCheck(this, Eventing);

		this._listeners = {};
	}

	_createClass(Eventing, [{
		key: "on",
		value: function on(event, cb) {
			var listeners;

			if (!this._listeners[event]) {
				this._listeners[event] = [];
			}

			listeners = this._listeners[event];

			listeners.push(cb);

			return function clear$on() {
				listeners.splice(listeners.indexOf(cb), 1);
			};
		}
	}, {
		key: "once",
		value: function once(event, cb) {
			var clear,
			    fn = function fn() {
				clear();
				cb.apply(this, arguments);
			};

			clear = this.on(event, fn);

			return clear;
		}
	}, {
		key: "subscribe",
		value: function subscribe(subscriptions) {
			var dis = this,
			    kills = [],
			    events = Object.keys(subscriptions);

			events.forEach(function (event) {
				var action = subscriptions[event];

				kills.push(dis.on(event, action));
			});

			return function killAll() {
				kills.forEach(function (kill) {
					kill();
				});
			};
		}
	}, {
		key: "trigger",
		value: function trigger(event) {
			var _this = this;

			var args = Array.prototype.slice.call(arguments, 1);

			if (this.hasWaiting(event)) {
				this._listeners[event].slice(0).forEach(function (cb) {
					cb.apply(_this, args);
				});
			}
		}
	}, {
		key: "hasWaiting",
		value: function hasWaiting(event) {
			return !!this._listeners[event];
		}
	}]);

	return Eventing;
}();

module.exports = Eventing;

/***/ })
/******/ ]);