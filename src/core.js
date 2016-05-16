/**
 * Library Functions
 **/
/**
 * Tests if the value is undefined
 *
 * @function isUndefined
 * @namespace bMoor
 * @param {something} value The variable to test
 * @return {boolean}
 **/
export function isUndefined( value ) {
	return value === undefined;
}

/**
 * Tests if the value is not undefined
 *
 * @function isDefined
 * @namespace bMoor
 * @param {something} value The variable to test
 * @return {boolean}
 **/
export function isDefined( value ) {
	return value !== undefined;
}

/**
 * Tests if the value is a string
 *
 * @function isString
 * @namespace bMoor
 * @param {something} value The variable to test
 * @return {boolean}
 **/
export function isString( value ){
	return typeof value === 'string';
}

/**
 * Tests if the value is numeric
 *
 * @function isNumber
 * @namespace bMoor
 * @param {something} value The variable to test
 * @return {boolean}
 **/
export function isNumber( value ){
	return typeof value === 'number';
}

/**
 * Tests if the value is a function
 *
 * @function isFuncion
 * @namespace bMoor
 * @param {something} value The variable to test
 * @return {boolean}
 **/
export function isFunction( value ){
	return typeof value === 'function';
}

/**
 * Tests if the value is an object
 *
 * @function isObject
 * @namespace bMoor
 * @param {something} value The variable to test
 * @return {boolean}
 **/
export function isObject( value ){
	return value  && typeof value === 'object';
}

/**
 * Tests if the value is a boolean
 *
 * @function isBoolean
 * @namespace bMoor
 * @param {something} value The variable to test
 * @return {boolean}
 **/
export function isBoolean( value ){
	return typeof value === 'boolean';
}

/**
 * Tests if the value can be used as an array
 *
 * @function isArrayLike
 * @namespace bMoor
 * @param {something} value The variable to test
 * @return {boolean}
 **/
export function isArrayLike( value ) {
	// for me, if you have a length, I'm assuming you're array like, might change
	if ( value ){
		return isObject( value ) && ( value.length === 0 || (0 in value && (value.length-1) in value) );
	}else{
		return false;
	}
}

/**
 * Tests if the value is an array
 *
 * @function isArray
 * @namespace bMoor
 * @param {something} value The variable to test
 * @return {boolean}
 **/
export function isArray( value ) {
	return value instanceof Array;
}

/**
 * Tests if the value has no content.
 * If an object, has no own properties.
 * If array, has length == 0.
 * If other, is not defined
 *
 * @function isEmpty
 * @namespace bMoor
 * @param {something} value The variable to test
 * @return {boolean}
 **/
export function isEmpty( value ){
	var key;

	if ( isObject(value) ){
		for( key in value ){ 
			if ( value.hasOwnProperty(key) ){
				return false;
			}
		}
	}else if ( isArrayLike(value) ){
		return value.length === 0;
	}else{
		return isUndefined( value );
	}

	return true;
}

function parse( space ){
	if ( !space ){
		return [];
	}else if ( isString(space) ){
		return space.split('.'); // turn strings into an array
	}else if ( isArray(space) ){
		return space.slice(0);
	}else{
		return space;
	}
}

/**
 * Sets a value to a namespace, returns the old value
 *
 * @function set
 * @namespace bMoor
 * @param {object} root The root of the namespace, bMoor.namespace.root if not defined
 * @param {string|array} space The namespace
 * @param {something} value The value to set the namespace to
 * @return {something}
 **/
export function set( root, space, value ){
	var i, c, 
		old,
		val,
		nextSpace,
		curSpace = root;
	
	if ( isString(space) ){
		space = space.split('.');

		val = space.pop();

		for( i = 0, c = space.length; i < c; i++ ){
			nextSpace = space[ i ];
				
			if ( isUndefined(curSpace[nextSpace]) ){
				curSpace[ nextSpace ] = {};
			}
				
			curSpace = curSpace[ nextSpace ];
		}

		old = curSpace[ val ];
		curSpace[ val ] = value;
	}

	return old;
}

function _makeSetter( property, next ){
	if ( next ){
		return function( ctx, value ){
			var t = ctx[property];

			if ( !t ){
				t = ctx[property] = {};
			}
			
			return next( t, value );
		};
	}else{
		return function( ctx, value ){
			var t = ctx[property];
			ctx[property] = value;
			return t;
		};
	}
}

export function makeSetter( space ){
	var i,
		fn,
		readings = space.split('.');

	for( i = readings.length-1; i > -1; i-- ){
		fn = _makeSetter( readings[i], fn );
	}

	return fn;
}

/**
 * get a value from a namespace, if it doesn't exist, the path will be created
 *
 * @function get
 * @namespace bMoor
 * @param {object} root The root of the namespace, bMoor.namespace.root if not defined
 * @param {string|array|function} space The namespace
 * @return {array}
 **/
export function get( root, space ){
	var i, c,
		curSpace = root,
		nextSpace;
	
	if ( isString(space) ){
		if ( space.length ){
			space = space.split('.');
			
			for( i = 0, c = space.length; i < c; i++ ){
				nextSpace = space[i];
					
				if ( isUndefined(curSpace[nextSpace]) ){
					return;
				}
				
				curSpace = curSpace[nextSpace];
			}
		}

		return curSpace;
	}else{
		throw new Error('unsupported type: '+space);
	}
}

function _makeGetter( property, next ){
	if ( next ){
		return function( obj ){
			try {
				return next( obj[property] );
			}catch( ex ){
				return undefined;
			}
		};
	}else{
		return function( obj ){
			try {
				return obj[property];
			}catch( ex ){
				return undefined;
			}
		};
	}
}

export function makeGetter( space ){
	var i,
		fn;

	if ( space.length ){
		space = space.split('.');

		for( i = space.length-1; i > -1; i-- ){
			fn = _makeGetter( space[i], fn );
		}
	}else{
		return function( obj ){
			return obj;
		};
	}

	return fn;
}

export function load( root, space ){
	var i, c,
		arr,
		res;

	space = space.split('[]');
	if ( space.length === 1 ){
		return [ get(root,space[0]) ];
	}else{
		arr = get( root, space[0] );
		res = [];

		if ( arr ){
			for( i = 0, c = arr.length; i < c; i++ ){
				res.push( get(arr[i],space[1]) );
			}
		}

		return res;
	}
}

export function makeLoader( space ){
	var getArray,
		getVariable;

	space = space.split('[]');

	if ( space.length === 1 ){
		return [ makeGetter(space[0]) ];
	}else{
		getArray = makeGetter( space[0] );
		getVariable = makeGetter( space[1] );

		return function( obj ){
			var i, c, 
				arr = getArray(obj),
				res = [];

			if ( arr ){
				for( i = 0, c = arr.length; i < c; i++ ){
					res.push( getVariable(arr[i]) );
				}
			}

			return res;
		};
	}
}

/**
 * Delete a namespace, returns the old value
 *
 * @function del
 * @namespace bMoor
 * @param {object} root The root of the namespace, bMoor.namespace.root if not defined
 * @param {string|array} space The namespace
 * @return {something}
 **/
export function del( root, space ){
	var old,
		val,
		nextSpace,
		curSpace = root;
	
	if ( space && (isString(space) || isArrayLike(space)) ){
		space = parse( space );

		val = space.pop();

		for( var i = 0; i < space.length; i++ ){
			nextSpace = space[ i ];
				
			if ( isUndefined(curSpace[nextSpace]) ){
				return;
			}
				
			curSpace = curSpace[ nextSpace ];
		}

		old = curSpace[ val ];
		delete curSpace[ val ];
	}

	return old;
}

/**
 * Call a function against all elements of an array like object, from 0 to length.  
 *
 * @function loop
 * @namespace bMoor
 * @param {array} arr The array to iterate through
 * @param {function} fn The function to call against each element
 * @param {object} context The context to call each function against
 **/
export function loop( arr, fn, context ){
	var i, c;

	if ( !context ){
		context = arr;
	}

	if ( arr.forEach ){
		arr.forEach( fn, context );
	}else{
		for ( i = 0, c = arr.length; i < c; ++i ){
			if ( i in arr ) {
				fn.call(context, arr[i], i, arr);
			}
		}
	}
}

/**
 * Call a function against all own properties of an object.  
 *
 * @function each
 * @namespace bMoor
 * @param {object} arr The object to iterate through
 * @param {function} fn The function to call against each element
 * @param {object} context The context to call each function against
 **/
export function each( obj, fn, context ){
	var key;

	if ( !context ){
		context = obj;
	}

	for( key in obj ){
		if ( obj.hasOwnProperty(key) ){
			fn.call( context, obj[key], key, obj );
		}
	}
}

/**
 * Call a function against all own properties of an object, skipping specific framework properties.
 * In this framework, $ implies a system function, _ implies private, so skip _
 *
 * @function iterate
 * @namespace bMoor
 * @param {object} obj The object to iterate through
 * @param {function} fn The function to call against each element
 * @param {object} context The scope to call each function against
 **/
export function iterate( obj, fn, context ){
	var key;

	if ( !context ){
		context = obj;
	}

	for( key in obj ){ 
		if ( obj.hasOwnProperty(key) && key.charAt(0) !== '_' ){
			fn.call( context, obj[key], key, obj );
		}
	}
}

/**
 * Call a function against all own properties of an object, skipping specific framework properties.
 * In this framework, $ implies a system function, _ implies private, so skip both
 *
 * @function safe
 * @namespace bMoor
 * @param {object} obj The object to iterate through
 * @param {function} fn The function to call against each element
 * @param {object} scope The scope to call each function against
 **/
export function safe( obj, fn, context ){
	var key;

	if ( !context ){
		context = obj;
	}

	for( key in obj ){ 
		if ( obj.hasOwnProperty(key) && key.charAt(0) !== '_' && key.charAt(0) !== '$' ){
			fn.call( context, obj[key], key, obj );
		}
	}
}

export function naked( obj, fn, context ){
	safe( obj, function( t, k, o ){
		if ( !isFunction(t) ){
			fn.call( context, t, k, o );
		}
	});
}

/**
 * Borrowed From Angular : I can't write it better
 * ----------------------------------------
 *
 * Implementation Notes for non-IE browsers
 * ----------------------------------------
 * Assigning a URL to the href property of an anchor DOM node, even one attached to the DOM,
 * results both in the normalizing and parsing of the URL.  Normalizing means that a relative
 * URL will be resolved into an absolute URL in the context of the application document.
 * Parsing means that the anchor node's host, hostname, protocol, port, pathname and related
 * properties are all populated to reflect the normalized URL.  This approach has wide
 * compatibility - Safari 1+, Mozilla 1+, Opera 7+,e etc.  See
 * http://www.aptana.com/reference/html/api/HTMLAnchorElement.html
 *
 * Implementation Notes for IE
 * ---------------------------
 * IE >= 8 and <= 10 normalizes the URL when assigned to the anchor node similar to the other
 * browsers.  However, the parsed components will not be set if the URL assigned did not specify
 * them.  (e.g. if you assign a.href = 'foo', then a.protocol, a.host, etc. will be empty.)  We
 * work around that by performing the parsing in a 2nd step by taking a previously normalized
 * URL (e.g. by assigning to a.href) and assigning it a.href again.  This correctly populates the
 * properties such as protocol, hostname, port, etc.
 *
 * IE7 does not normalize the URL when assigned to an anchor node.  (Apparently, it does, if one
 * uses the inner HTML approach to assign the URL as part of an HTML snippet -
 * http://stackoverflow.com/a/472729)  However, setting img[src] does normalize the URL.
 * Unfortunately, setting img[src] to something like 'javascript:foo' on IE throws an exception.
 * Since the primary usage for normalizing URLs is to sanitize such URLs, we can't use that
 * method and IE < 8 is unsupported.
 *
 * References:
 *   http://developer.mozilla.org/en-US/docs/Web/API/HTMLAnchorElement
 *   http://www.aptana.com/reference/html/api/HTMLAnchorElement.html
 *   http://url.spec.whatwg.org/#urlutils
 *   https://github.com/angular/angular.js/pull/2902
 *   http://james.padolsey.com/javascript/parsing-urls-with-the-dom/
 *
 * @function
 * @param {string} url The URL to be parsed.
 * @description Normalizes and parses a URL.
 * @returns {object} Returns the normalized URL as a dictionary.
 *
 *   | member name   | Description |
 *   |---------------|-------------|
 *   | href          | A normalized version of the provided URL if it was not an absolute URL |
 *   | protocol      | The protocol including the trailing colon                              |
 *   | host          | The host and port (if the port is non-default) of the normalizedUrl    |
 *   | search        | The search params, minus the question mark                             |
 *   | hash          | The hash string, minus the hash symbol
 *   | hostname      | The hostname
 *   | port          | The port, without ':'
 *   | pathname      | The pathname, beginning with '/'
 *
 */
 // TODO : Whhhhyyyy do I have this here?
 /*
function urlResolve( url ) {
	var href = url,
		urlParsingNode = document.createElement('a');

	if (msie) {
		// Normalize before parse.  Refer Implementation Notes on why this is
		// done in two steps on IE.
		urlParsingNode.setAttribute('href', href);
		href = urlParsingNode.href;
	}

	urlParsingNode.setAttribute('href', href);

	// urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
	return {
		href: urlParsingNode.href,
		protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
		host: urlParsingNode.host,
		search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
		hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
		hostname: urlParsingNode.hostname,
		port: urlParsingNode.port,
		pathname: (urlParsingNode.pathname.charAt(0) === '/') ? 
			urlParsingNode.pathname : '/' + urlParsingNode.pathname
	};
}
*/