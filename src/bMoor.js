;(function( global, undefined ){
	"use strict";

	var msie,
		bMoor = global.bMoor || {},
		bmoor = global.bmoor || {},
		aliases = {},
		Defer,
		DeferGroup;

	/**
	 * TODO : I really want to have an env variable, but right now not needed
	 * IE 11 changed the format of the UserAgent string.
	 * See http://msdn.microsoft.com/en-us/library/ms537503.aspx
	 */
	msie = parseInt((/msie (\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1], 10);
	if (isNaN(msie)) {
		msie = parseInt((/trident\/.*; rv:(\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1], 10);
	}

	/**
	Namespace set up
	**/
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

	function set( space, obj, root ){
		var nextSpace,
			curSpace = root || global;
		
		if ( space && (isString(space) || isArrayLike(space)) ){
			space = parse( space );
			for( var i = 0; i < space.length; i++ ){
				nextSpace = space[i];
					
				if ( i === space.length - 1 ){
					curSpace[nextSpace] = obj;
				}else{
					if ( !curSpace[nextSpace] ){
						curSpace[nextSpace] = {};
					}
					
					curSpace = curSpace[nextSpace];
				}
			}
		}
	}
	
	function get( space, root ){
		var curSpace = root || global,
			nextSpace,
			position,
			name;
		
		if ( space && (isString(space) || isArrayLike(space)) ){
			space = parse( space );
			
			for( var i = 0; i < space.length; i++ ){
				nextSpace = space[i];
					
				if ( !curSpace[nextSpace] ){
					curSpace[nextSpace] = {};
				}
				
				curSpace = curSpace[nextSpace];
			}

			return curSpace;
		}else if ( isObject(space) ){
			return space;
		}else{
			return null;
		}
	}
	/*
		returns back the space or null
	*/
	function _exists( space, curSpace ){
		var position,
			name;
		
		if ( isString(space) || isArrayLike(space) ){
			space = parse( space );

			for( var i = 0; i < space.length; i++ ){
				var nextSpace = space[i];
					
				if ( !curSpace[nextSpace] ){
					return null;
				}
				
				curSpace = curSpace[nextSpace];
			}
			
			return curSpace;
		}else if ( isObject(space) ){
			return space;
		}else{
			return null;
		}
	}

	function exists( space, root ){
		var i, c,
			res;

		if ( root ){
			if ( isArrayLike(root) ){
				for( i = 0, c = root.length; i < c && !res; i++ ){
					res = _exists( space, root[i] );
				}

				return res;
			}else{
				return _exists( space, root );
			}
		}else{
			return _exists( space, global );
		}
	}

	function register( alias, obj ){ 
		aliases[ alias ] = obj; 
	}

	function check( alias ){
		return aliases[ alias ];
	}

	function find( alias, root ){
		var t;
		
		if ( root === undefined ){
			t = check( isArray(alias)?alias.join('.'):alias );
			if ( t ){
				return t;
			}
		}

		return exists( alias, root );
	}

	function install( alias, obj ){
		set( alias, obj );
		register( alias, obj );
	}
	/**
	Messaging functions
	**/
	function error( error ){
		if ( isObject(error) ){
			console.log( error );
			console.log( error.stack );
		}else{
			console.log( error );
			console.trace();
		}
		
	}

	/**
	Library Functions
	**/
	function toString( obj ){
		return Object.prototype.toString.call( obj );
	}

	function dwrap( value ){
		var d;

		if ( value.$defer ){
			d = value.$defer;
		}else{
			d = new Defer(); 
			d.resolve( value );
		}
		
		return d.promise;
	}

	function isUndefined(value) {
		return value === undefined;
	}

	function isDefined(value) {
		return value !== undefined;
	}

	function isString(value){
		return typeof value === 'string';
	}

	function isNumber(value){
		return typeof value === 'number';
	}

	function isFunction(value){
		return typeof value === 'function';
	}

	function isObject(value){
		return value  && typeof value === 'object';
	}

	// type  checks
	function isArrayLike(obj) {
		// for me, if you have a length, I'm assuming you're array like, might change
		return ( obj && (typeof obj.length === 'number') && (obj.length != 1 || obj[0]) ) ;
	}

	function isArray(value) {
		return value && toString(value) === '[object Array]';
	}

	// array for
	function loop( arr, fn, scope ){
		var i, c;

		if ( !scope ){
			scope = arr;
		}

		//if ( isUndefined(arr) || isUndefined(arr.length) ){
		//	console.trace();
		//}

		for ( i = 0, c = arr.length; i < c; ++i ) if ( i in arr ) {
			fn.call(scope, arr[i], i, arr);
		}
	}

	// obj functions
	function each( obj, fn, scope ){
		var key;

		if ( !scope ){
			scope = obj;
		}

		for( key in obj ) if ( obj.hasOwnProperty(key) ){
			fn.call( scope, obj[key], key, obj );
		}
	}

	function iterate( obj, fn, scope ){
		var key;

		if ( !scope ){
			scope = obj;
		}

		for( key in obj ) if ( key !== 'prototype' && key !== 'length' && key !== 'name' &&
			obj.hasOwnProperty(key) ){
			fn.call( scope, obj[key], key, obj );
		}
	}

	function forEach( obj, fn, scope ){
		if ( obj ){
			if ( obj.forEach && obj.forEach !== forEach ){
				obj.forEach( fn, scope );
			}else if ( isArrayLike(obj) ){
				loop( obj, fn, scope );
			}else if ( isFunction(obj) ){
				iterate( obj, fn, scope );
			}else{
				each( obj, fn, scope );
			}
		}
	}

	// basic framework constructs
	function create( obj ){
		if ( Object.create ){
			return Object.create(obj);
		}else{
			var T = function(){};

			if (arguments.length !== 1) {
				throw new Error('create implementation only accepts one parameter.');
			}

			T.prototype = obj;

			return new T();
		}
	}

	function extend( obj ){
		loop( arguments, function(cpy){
			if ( cpy !== obj ) {
				each( cpy, function(value, key){
					obj[key] = value;
				});
			}
	  });

	  return obj;
	}

	function copy( from, to, deep ){
		if ( from === to ){
			return to;
		}else if ( !to ){
			to = from; // this lets all other things pass through

			if ( from ){
				if ( from.clone ){
					to = from.clone();
				}else if ( isArrayLike(from) ){
					to = copy( from, [], deep );
				}else{
					to = copy( from, {}, deep );
				}
			}
		}else if ( to.copy ){
			to.copy( from );
		}else{
			if ( isArrayLike(from) ){
				to.length = 0;  // this clears the array
				for( var i = 0, c = from.length; i < c; i++ ){
					to.push( copy(from[i]) );
				}
			}else{
				each( to, function( value, key ){ delete to[key]; });
				each( from, function( value, key ){ to[key] = value; });
			}
		}

		return to;
	}

	function equals( obj1, obj2 ){
		var t1 = typeof obj1,
			t2 = typeof obj2,
			c,
			i,
			keyCheck;

		if ( obj1 === obj2 ) return true;
		if ( obj1 !== obj1 && obj2 !== obj2 ) return true; // silly NaN
		if ( obj1 === null || obj1 === undefined || obj2 === null || obj2 === null ) return false; // undefined or null
		if ( obj1.equals ) return obj1.equals( obj2 );
		if ( obj2.equals ) return obj2.equals( obj1 ); // because maybe somene wants a class to be able to equal a simple object
		if ( t1 === t2 ){
			if ( t1 === 'object' ){
				if ( isArrayLike(obj1) ){
					if ( !isArrayLike(obj2) ){ return false; }
					if ( (c = obj1.length) === obj2.length ){
						for( i = 0; i < c; i++ ){
							if ( !equals(obj1[i], obj2[i]) ) { return false; }
						}

						return true;
					}
				}else if ( !isArrayLike(obj2) ){
					keyCheck = {};
					for( i in obj1 ) if ( obj1.hasOwnProperty(i) ){
						if ( !equals(obj1[i],obj2[i]) ) return false;
						keyCheck[i] = true;
					}
					for( i in obj2 ) if ( obj2.hasOwnProperty(i) ){
						if ( !keyCheck && obj2[i] !== undefined ){
							return false;
						}
					}
				}
			}
		}

		return false;
	}

	function makeQuark( namespace ){
		function Quark ( args ){ // TODO : I would love to name this to the class, camel cased.
			if ( args && args.$arguments ){
				this._construct.apply( this,args );
			}else{
				this._construct.apply( this,arguments );
			}
		}

		if ( Defer ){
			Quark.$defer = new Defer();
		}
		
		Quark.prototype.__class = namespace;
		Quark.prototype._construct = function(){};

		set( namespace, Quark );

		return Quark;
	}

	// check to see if the element exists, if not, create a Quark in its place
	function ensure( namespace, root ){
		var obj = exists( namespace, root );
		if ( !namespace ){
			console.trace();
		}

		if ( !obj ){
			return makeQuark( namespace );
		}else{
			return obj;
		}
	}

	function request( request, root ){
		var rtn,
			obj;

		if ( isString(request) ){
			obj = ensure( request, root );

			if ( obj.$defer ){
				// was created by the system
				return obj.$defer.promise;
			}else{
				// some other object, need to play nice
				return dwrap( obj );
			}
		}else if ( isArrayLike(request) ){
			rtn = new DeferGroup();
			obj = [];
			obj.$inject;

			loop( request, function( req, key ){
				var o;

				o = ensure( req );

				if ( o.$defer ){
					rtn.add( o.$defer.promise );
				}

				obj[key] = o;
			});

			return rtn.promise.then(function(){
				return obj;
			});
		}else{
			// TODO : need an error class
			throw {
				message : 'Request needs a string or array passed in'
			};
		}
	}

	function translate( arr, root ){
		var lead,
			rtn = [];

		loop( arr, function( value, key ){
			if ( isString(value) ){
				lead = value.charAt( 0 );

				if ( lead === '-' ){
					rtn[key] = exists( value.substr(1), root );
				}else if ( lead === '@' ){
					// uses alias
					rtn[key] = check( value.substr(1) );
				}else{
					// ensure
					rtn[key] = ensure( value, root );
				}
			}else{
				rtn[key] = value;
			}
		});

		return rtn;
	}

	function isInjectable( obj ){
		return isFunction( obj ) || ( isArray(obj) && isFunction(obj[obj.length-1]) );
	}

	function inject( arr, root, context ){
		var i, c,
			func,
			res;

		if ( isFunction(arr) ){
			func = arr;
			arr = [];
		}else if ( isArray(arr) ){
			func = arr.pop();
		}else{
			throw 'inject needs arr to be either Array or Function';
		}

		res = translate( arr, root );
		arr.push( func ); // put it back on...

		return func.apply( context, res );
	}

	function plugin( plugin, obj ){ 
		set( plugin, obj, bMoor ); 
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
	 * them.  (e.g. if you assign a.href = "foo", then a.protocol, a.host, etc. will be empty.)  We
	 * work around that by performing the parsing in a 2nd step by taking a previously normalized
	 * URL (e.g. by assigning to a.href) and assigning it a.href again.  This correctly populates the
	 * properties such as protocol, hostname, port, etc.
	 *
	 * IE7 does not normalize the URL when assigned to an anchor node.  (Apparently, it does, if one
	 * uses the inner HTML approach to assign the URL as part of an HTML snippet -
	 * http://stackoverflow.com/a/472729)  However, setting img[src] does normalize the URL.
	 * Unfortunately, setting img[src] to something like "javascript:foo" on IE throws an exception.
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
	 *   | member name   | Description    |
	 *   |---------------|----------------|
	 *   | href          | A normalized version of the provided URL if it was not an absolute URL |
	 *   | protocol      | The protocol including the trailing colon                              |
	 *   | host          | The host and port (if the port is non-default) of the normalizedUrl    |
	 *   | search        | The search params, minus the question mark                             |
	 *   | hash          | The hash string, minus the hash symbol
	 *   | hostname      | The hostname
	 *   | port          | The port, without ":"
	 *   | pathname      | The pathname, beginning with "/"
	 *
	 */
	function urlResolve(url, base) {
		var href = url,
			urlParsingNode = document.createElement("a");

		if (msie) {
			// Normalize before parse.  Refer Implementation Notes on why this is
			// done in two steps on IE.
			urlParsingNode.setAttribute("href", href);
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

	/**
	String functions
	**/
	function trim( str ){
		if ( str.trim ){
			str.trim();
		}else{
			str.replace( /^\s+|\s+$/g, '' );
		}
	}

	/**
	Array functions
	**/
	function indexOf( arr, searchElement, fromIndex ){
		if ( arr.indexOf ){
			return arr.indexOf( searchElement, fromIndex );
		} else {
			var length = arr.length >>> 0; // Hack to convert object.length to a UInt32

			fromIndex = +fromIndex || 0;

			if (Math.abs(fromIndex) === Infinity){
				fromIndex = 0;
			}

			if (fromIndex < 0){
				fromIndex += length;
				if (fromIndex < 0) {
					fromIndex = 0;
				}
			}

			for ( ; fromIndex < length; fromIndex++ ){
				if ( arr[fromIndex] === searchElement ){
					return fromIndex;
				}
			}

			return -1;
		}
	}

	function remove( arr, searchElement, fromIndex ){
		var pos = indexOf( arr, searchElement, fromIndex );

		if ( pos > -1 ){
			arr.splice( pos, 1 );
		}
	}

	function removeAll( arr, searchElement, fromIndex ){
		var pos = indexOf( arr, searchElement, fromIndex );

		if ( pos > -1 ){
			arr.splice( pos, 1 );
			removeAll( arr, searchElement, pos );
		}
	}

	function filter( arr, func, thisArg ){
		if ( arr.filter ){
			return arr.filter( func, thisArg );
		}else{
			var i,
				val,
				t = Object(this),
				c = t.length >>> 0,
				res = [];

			if (typeof func != "function"){
				throw 'func needs to be a function';
			}

			for ( i = 0; i < c; i++ ){
				if ( i in t ){
					val = t[i];

					if ( func.call(thisArg, val, i, t) ){
						res.push( val );
					}
				}
			}

			return res;
		}
	}

	// I can't assume sorting...
	// compare -> < 0 : a less; 0 : equal ; > 0 : b less
	function compare( arr1, arr2, compare ){
		var m,
            cmp,
            left = [],
            right = [],
            leftI = [],
            rightI = [];

        arr1 = arr1.slice(0);
        arr2 = arr2.slice(0);

        arr1.sort( compare );
        arr2.sort( compare );

        while( arr1.length > 0 && arr2.length > 0 ){
            cmp = compare( arr1[0], arr2[0] );

            if ( cmp < 0 ){
                left.push( arr1.shift() );
            }else if ( cmp > 0 ){
                right.push( arr2.shift() );
            }else{
                leftI.push( arr1.shift() );
                rightI.push( arr2.shift() );
            }
        }

        while( arr1.length ){
            left.push( arr1.shift() );
        }

        while( arr2.length ){
            right.push( arr2.shift() );
        }

        return {
            left : left,
            intersection : {
                left : leftI,
                right : rightI
            },
            right : right
        };
	}

	/**
	Externalizing the functionality
	**/
	extend( bMoor, {
		// namespace interactions
		"parseNS"     : parse,
		"dwrap"       : dwrap,
		"set"         : set,
		"get"         : get,
		"exists"      : exists,
		"register"    : register,
		"check"       : check,
		"find"        : find,
		"install"     : install,
		"ensure"      : ensure,
		"request"     : request, // wraps require with a defer
		"translate"   : translate,
		"inject"      : inject,
		"plugin"      : plugin,
		"makeQuark"   : makeQuark,
		// allow a type expectation
		"loop"        : loop, // array
		"each"        : each, // object
		"iterate"     : iterate, // object + safe
		// general looping
		"forEach"     : forEach,
		// all the is tests
		"isDefined"   : isDefined,
		"isUndefined" : isUndefined,
		"isArray"     : isArray,
		"isArrayLike" : isArrayLike,
		"isObject"    : isObject,
		"isFunction"  : isFunction,
		"isNumber"    : isNumber,
		"isString"    : isString,
		"isInjectable" : isInjectable,
		// object stuff
		"object" : {
			"create"      : create,
			"extend"      : extend,
			"copy"        : copy,
			"equals"      : equals
		},
		// string functionality 
		"string"      : {
			"trim" : trim 
		},
		// array functionality
		"array"       : {
			"compare" : compare,
			"indexOf" : indexOf,
			"remove" : remove,
			"removeAll" : removeAll,
			"filter" : filter
		},
		// error handling and logging : TODO : move verbose error handling
		"error"       : {
			report : error
		},
		// other utils - TODO : move out
		"url" : {
			"resolve"  : urlResolve
		}
	});

	register( 'global', global );
	register( 'undefined', undefined );

	set( 'bMoor', bMoor );
	set( 'bmoor', bmoor );

	inject(['bmoor.defer.Basic', 'bmoor.defer.Group', function( b, g ){
		var c = 0;

		Defer = b;
		DeferGroup = g;

		// chicken before the egg... so bootstrap
		Defer.prototype._construct = function(){
			this.promise = {
				count : c++,
				then : function JunkPromise( callback ){
					if ( this.waiting && this.waiting.push ){
						this.waiting.push( callback );
					}else{
						callback( this.waiting );
					}
					
					return this;
				},
				waiting : []
			}
		};

		Defer.prototype.resolve = function( r ){
			loop( this.promise.waiting, function(func){ func(r); });
			this.promise.waiting = r;
		};
	}]);

}( this ));
