;(function( global, undefined ){
	'use strict';

	var msie,
		bMoor = global.bMoor || {},
		bmoor = global.bmoor || {},
		aliases = {},
		Defer,
		Promise,
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
	 namespace
	 **/

	/**
	 * Split each section of the namespace into an array
	 *
	 * @function parse
	 * @namespace bMoor
	 * @param {string|array} space The namespace
	 * @return {array}
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

	/**
	 * Sets a value to a namespace, returns the old value
	 *
	 * @function set
	 * @namespace bMoor
	 * @param {string|array} space The namespace
	 * @param {something} value The value to set the namespace to
	 * @param {object} root The root of the namespace, global if not defined
	 * @return {something}
	 **/
	function set( space, value, root ){
		var old,
			val,
			nextSpace,
			curSpace = root || global;
		
		if ( space && (isString(space) || isArrayLike(space)) ){
			space = parse( space );

			val = space.pop();

			for( var i = 0; i < space.length; i++ ){
				nextSpace = space[ i ];
					
				if ( !curSpace[ nextSpace ] ){
					curSpace[ nextSpace ] = {};
				}
					
				curSpace = curSpace[ nextSpace ];
			}

			old = curSpace[ val ];
			curSpace[ val ] = value;
		}

		return old;
	}
	
	/**
	 * Sets a value to a namespace, returns the old value, the namespace is always bMoor
	 *
	 * @function plugin
	 * @namespace bMoor
	 * @param {string|array} plugin The namespace
	 * @param {something} obj The value to set the namespace to
	 **/
	function plugin( plugin, obj ){ 
		set( plugin, obj, bMoor ); 
	}

	/**
	 * Delete a namespace, returns the old value
	 *
	 * @function del
	 * @namespace bMoor
	 * @param {string|array} space The namespace
	 * @param {object} root The root of the namespace, global if not defined
	 * @return {something}
	 **/
	function del( space, root ){
		var old,
			val,
			nextSpace,
			curSpace = root || global;
		
		if ( space && (isString(space) || isArrayLike(space)) ){
			space = parse( space );

			val = space.pop();

			for( var i = 0; i < space.length; i++ ){
				nextSpace = space[ i ];
					
				if ( !curSpace[ nextSpace ] ){
					curSpace[ nextSpace ] = {};
				}
					
				curSpace = curSpace[ nextSpace ];
			}

			old = curSpace[ val ];
			delete curSpace[ val ];
		}

		return old;
	}

	/**
	 * get a value from a namespace, if it doesn't exist, the path will be created
	 *
	 * @function get
	 * @namespace bMoor
	 * @param {string|array} space The namespace
	 * @param {object} root The root of the namespace, global if not defined
	 * @return {array}
	 **/
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
			throw 'unsupported type';
		}
	}

	function _exists( space, root ){
		var curSpace = root || global,
			position,
			name;
		
		if ( isString(space) || isArrayLike(space) ){
			space = parse( space );

			for( var i = 0; i < space.length; i++ ){
				var nextSpace = space[i];
					
				if ( !curSpace[nextSpace] ){
					return undefined;
				}
				
				curSpace = curSpace[nextSpace];
			}
			
			return curSpace;
		}else if ( isObject(space) ){
			return space;
		}else{
			throw 'unsupported type';
		}
	}

	/**
	 * get a value from a namespace, undefinded if it doesn't exist
	 *
	 * @function exists
	 * @namespace bMoor
	 * @param {string|array} space The namespace
	 * @param {object|array} root Array of roots to check, the root of the namespace, or global if not defined
	 * @return {array}
	 **/
	function exists( space, root ){
		var i, c,
			res;

		if ( isArrayLike(root) ){
			for( i = 0, c = root.length; i < c && !res; i++ ){
				res = _exists( space, root[i] );
			}

			return res;
		}else{
			return _exists( space, root );
		}
	}

	/**
	 * defines an alias
	 *
	 * @function register
	 * @namespace bMoor
	 * @param {string} alias The name of the alias
	 * @param {object} obj The value to be aliased
	 **/
	function register( alias, obj ){ 
		aliases[ alias ] = obj; 
	}

	/**
	 * Returns back the alias value
	 *
	 * @function check
	 * @namespace bMoor
	 * @param {string} alias The name of the alias
	 * @return {something}
	 **/
	function check( alias ){
		return aliases[ alias ];
	}

	/**
	 * first searches to see if an alias exists, then sees if the namespace exists
	 *
	 * TODO : does this really need to exist anymore?
	 *
	 * @function find
	 * @namespace bMoor
	 * @param {string|array} space The namespace
	 * @param {object|array} root Array of roots to check, the root of the namespace, or global if not defined
	 * @return {something}
	 **/
	function find( space, root ){
		var t;
		
		if ( root === undefined ){
			t = check( isArray(namespace)?namespace.join('.'):namespace );
			if ( t ){
				return t;
			}
		}

		return exists( alias, root );
	}

	/**
	 * first sets the variable to the namespace, then registers it as an alias
	 *
	 * TODO : does this really need to exist anymore?
	 *
	 * @function install
	 * @namespace bMoor
	 * @param {string|array} alias The namespace
	 * @param {something} obj The thing being installed into the namespace
	 **/
	function install( alias, obj ){
		set( alias, obj );
		register( alias, obj );
	}

	/**
	 object
	 **/

	/**
	 * Create a new instance from a constructor and some arguments
	 *
	 * @function instantiate
	 * @namespace bMoor
	 * @param {function} obj The constructor
	 * @param {array} args The arguments to pass to the constructor
	 **/
	function instantiate( obj, args ){
		var i, c,
			construct;

		construct = 'return new obj(';

		if ( arguments.length > 1 ){
			for( i = 0, c = args.length; i < c; i++ ){
				if ( i ){
					construct += ',';
				}

				construct += 'args['+i+']';
			}
		}

		construct += ')';
		/*jshint -W054 */
		return ( new Function('obj','args',construct) )( obj, args );
	}
	
	/**
	 * Takes a hash and uses the indexs as namespaces to add properties to an objs
	 *
	 * @function map
	 * @namespace bMoor
	 * @param {object} target The object to map the variables onto
	 * @param {object} mappings An object orientended as [ namespace ] => value
	 * @return {object} The object that has had content mapped into it
	 **/
	function map( target, mappings ){
		if ( arguments.length === 1 ){
			mappings = target;
			target = {};
		}

		iterate( mappings, function( val, mapping ){
			set( mapping, val, target );
		});

		return target;
	}

	/**
	 * Converts an object to a string
	 *
	 * @function toString
	 * @namespace bMoor
	 * @param {object} obj The object to convert
	 **/
	function toString( obj ){
		return Object.prototype.toString.call( obj );
	}

	/**
	 * Create a new instance from an object and some arguments
	 *
	 * @function mask
	 * @namespace bMoor
	 * @param {function} obj The basis for the constructor
	 * @param {array} args The arguments to pass to the constructor
	 * @return {object} The new object that has been constructed
	 **/
	function mask( obj ){
		var T = function(){};

		T.prototype = obj;

		return instantiate( T );
	}

	/**
	 * Create a new instance from an object and some arguments
	 *
	 * @function extend
	 * @namespace bMoor
	 * @param {object} obj Destination object.
 	 * @param {...object} src Source object(s).
 	 * @returns {object} Reference to `dst`.
 	 **/
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

	/**
	 * Copy content from one object into another
	 *
	 * @function copy
	 * @namespace bMoor
	 * @param {object} from The object to copy the content from
 	 * @param {object} to The object into which to copy the content
 	 * @param {boolean} deep Whether or not to deep copy the data
 	 * @returns {object} The object copied into
 	 **/
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
			to.copy( from, deep );
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

	/**
	 * A general comparison algorithm to test if two objects are equal
	 *
	 * @function equals
	 * @namespace bMoor
	 * @param {object} obj1 The object to copy the content from
 	 * @param {object} obj2 The object into which to copy the content
 	 * @preturns {boolean}
 	 **/
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

	/**
	 Messaging
	**/

	/**
	 * Reports an error
	 *
	 * @function map
	 * @namespace bMoor
	 * @param {object} error The error to be reporting
	 **/
	function error( error ){
		if ( isObject(error) && error.stack ){
			console.warn( error );
			console.debug( error.stack );
		}else{
			console.warn( error );
			console.trace();
		}
	}

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
	function isUndefined( value ) {
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
	function isDefined( value ) {
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
	function isString( value ){
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
	function isNumber( value ){
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
	function isFunction( value ){
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
	function isObject( value ){
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
	function isBoolean( value ){
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
	function isArrayLike( value ) {
		// for me, if you have a length, I'm assuming you're array like, might change
		return value && (typeof value.length === 'number') && value.push;
	}

	/**
	 * Tests if the value is an array
	 *
	 * @function isArray
	 * @namespace bMoor
	 * @param {something} value The variable to test
	 * @return {boolean}
	 **/
	function isArray( value ) {
		return value && toString(value) === '[object Array]';
	}

	/**
	 * Tests if the value is a Quark, a placeholder for code being loaded
	 *
	 * @function isQuark
	 * @namespace bMoor
	 * @param {something} value The variable to test
	 * @return {boolean}
	 **/
	function isQuark( value ){
		return typeof(value) === 'function' && value.$isQuark;
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
	function isEmpty( value ){
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
			return isUndefined( obj );
		}

		return true;
	}

	/**
	 * Checks to see if the variable is deferred 
	 *
	 * @function isDeferred
	 * @namespace bMoor
	 * @param {something} value The variable to test
	 * @return {boolean}
	 **/
	function isDeferred( value ){
		return isObject( value ) && value.then !== undefined;
	}

	/**
	 * Tests if it is an array with the last element being a function.
	 *
	 * @function isInjectable
	 * @namespace bMoor
	 * @param {object} obj The object to test
	 * @return {boolean}
	 **/
	function isInjectable( obj ){
		return isArray( obj ) && isFunction( obj[obj.length-1] );
	}

	/**
	 * Call a function against all elements of an array like object, from 0 to length.  
	 *
	 * @function loop
	 * @namespace bMoor
	 * @param {array} arr The array to iterate through
	 * @param {function} fn The function to call against each element
	 * @param {object} scope The scope to call each function against
	 **/
	function loop( arr, fn, scope ){
		var i, c;

		if ( !scope ){
			scope = arr;
		}

		for ( i = 0, c = arr.length; i < c; ++i ) if ( i in arr ) {
			fn.call(scope, arr[i], i, arr);
		}
	}

	/**
	 * Call a function against all own properties of an object.  
	 *
	 * @function each
	 * @namespace bMoor
	 * @param {object} arr The object to iterate through
	 * @param {function} fn The function to call against each element
	 * @param {object} scope The scope to call each function against
	 **/
	function each( obj, fn, scope ){
		var key;

		if ( !scope ){
			scope = obj;
		}

		for( key in obj ) if ( obj.hasOwnProperty(key) ){
			fn.call( scope, obj[key], key, obj );
		}
	}

	/**
	 * Call a function against all own properties of an object, skipping specific framework properties.  
	 *
	 * @function iterate
	 * @namespace bMoor
	 * @param {object} obj The object to iterate through
	 * @param {function} fn The function to call against each element
	 * @param {object} scope The scope to call each function against
	 **/
	function iterate( obj, fn, scope ){
		var key;

		if ( !scope ){
			scope = obj;
		}

		for( key in obj ){ 
			if ( obj.hasOwnProperty(key) && key.charAt(0) !== '_' && 
				key !== 'prototype' && key !== 'length' && 
				key !== 'name' 
			){
				fn.call( scope, obj[key], key, obj );
			}
		}
	}

	/**
	 * Unified looping function, tries to pick the function for the data type.
	 *
	 * @function iterate
	 * @namespace bMoor
	 * @param {object} obj The object to iterate through
	 * @param {function} fn The function to call against each element
	 * @param {object} scope The scope to call each function against
	 **/
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

	/**
	 * basic framework constructs
	 **/
	
	/**
	 * Wraps the value in a promise and returns the promise
	 *
	 * @function dwrap
	 * @namespace bMoor
	 * @param {something} value The value to be returned by the promise.
	 * @return {bmoor.defer.Promise}
	 **/
	function dwrap( value ){
		var d;

		if ( isQuark(value) ){
			return value.$promise; // this way they get when the quark is ready
		}else{
			d = new Defer(); 
			d.resolve( value );
			return d.promise;
		}
	}

	/**
	 * Wraps the value in a promise and returns the promise
	 *
	 * TODO : this should pass back the object of structure : { quark, ready } 
	 *
	 * @function makeQuark
	 * @namespace bMoor
	 * @param {string|array} namespace The path to the quark
	 * @param {object} root The root of the namespace to position the quark, defaults to global
	 * @return {Quark}
	 **/
	function makeQuark( namespace, root ){
		var path = parse( namespace ),
			t = exists( path ),
			defer,
			quark = function Quark ( args ){}

		if ( isQuark(t) ){
			return t;
		}else{
			root = root || global;

			quark.$isQuark = true;

			if ( Defer ){
				defer = new Defer();

				quark.$promise = defer.promise;
				quark.$ready = function( obj ){
					if ( defer.resolve ){
						defer.resolve( obj );
					}

					// replace yourself
					if ( path ){
						set( path, obj, root );
					}
				};
			}

			set( path, quark, root );

			return quark;
		}
	}

	/**
	 * Check to see if the element exists, if not, create a Quark in its place
	 *
	 * TODO : It might be better if this is set up to always return a promise?
	 *
	 * @function ensure
	 * @namespace bMoor
	 * @param {string|array} namespace The path to the quark
	 * @param {object} root The root of the namespace to search, defaults to global
	 * @return {Quark}
	 **/
	function ensure( namespace, root ){
		var obj = exists( namespace, root );
		
		if ( obj ){
			return dwrap( obj );
		}else{
			return makeQuark( namespace, root ).$promise;
		}
	}

	/**
	 * Accepts an array, and returns an array of the same size, but the values inside it translated to
	 * values or object referenced by the string values
	 *
	 * @function translate
	 * @namespace bMoor
	 * @param {array} arr The array to be translated
	 * @param {object} root The root of the namespace to search, defaults to global
	 * @return {array}
	 **/
	function translate( arr, root ){
		var rtn = [];

		loop( arr, function( value, key ){
			if ( isString(value) ){
				switch( value.charAt(0) ){
					case '@' :
						// uses alias
						rtn[key] = check( value.substr(1) );
						break;
					case '-' :
						// from global scope, undefined it no match
						rtn[key] = exists( value.substr(1), root );
						break;
					case '+' :
						// will be a bMoor construct
						value = value.substr( 1 );
					default :
						// pull from global scope
						rtn[key] = ensure( value, root );
						break;
				}
			}else{
				rtn[key] = value;
			}
		});

		return rtn;
	}

	/**
	 * Prepares the requests for content and returns it in the resultant of a promise.
	 *
	 * @function request
	 * @namespace bMoor
	 * @param {array} request The array to be translated
	 * @param {object} root The root of the namespace to search, defaults to global
	 * @return {bmoor.defer.Promise}
	 **/
	function request( request, root ){
		var obj;

		if ( isString(request) ){
			return ensure( request, root );
		}else if( isArrayLike(request) ){
			obj = new DeferGroup();

			loop( request, function( req, key ){
				if ( isDeferred(req) ){
					req.then(function( o ){
						request[ key ] = o;
					});
					obj.add( req );
				}else{
					request[ key ] = req;
				}
			});

			obj.run();
			
			return obj.promise.then(function(){
				return request;
			});
		}
	}

	/**
	 * Will inject all requested variables into the function, returns a promise that will have the resultant of the function.
	 *
	 * @function inject
	 * @namespace bMoor
	 * @param {Injectable} arr An array with a function as the last value
	 * @param {object} root The root of the namespace to search, defaults to global
	 * @param {object} context The context to call the function against
	 * @return {bmoor.defer.Promise}
	 **/
	function inject( arr, root, context ){
		var i, c,
			rtn,
			func,
			args;

		// TODO : is there a way to do a no wait injection?
		if ( isFunction(arr) ){
			func = arr;
			arr = [];
		}else if ( isInjectable(arr) ){
			func = arr[ arr.length - 1 ];
		}else{
			throw 'inject needs arr to be either Injectable or Function';
		}

		return request( translate(arr,root) ).then(function( args ){
			return func.apply( context, args );
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
	 *   | member name   | Description    |
	 *   |---------------|----------------|
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
	function urlResolve(url, base) {
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

	/**
	String functions
	**/

	// TODO
	function trim( str ){
		if ( str.trim ){
			return str.trim();
		}else{
			return str.replace( /^\s+|\s+$/g, '' );
		}
	}

	/**
	Array functions
	**/
	/**
	 * Search an array for an element, starting at the begining or a specified location
	 *
	 * @function indexOf
	 * @namespace bMoor
	 * @param {array} arr An array to be searched
	 * @param {something} searchElement Content for which to be searched
	 * @param {integer} fromIndex The begining index from which to begin the search, defaults to 0
	 * @return {integer} -1 if not found, otherwise the location of the element
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

	/**
	 * Search an array for an element and remove it, starting at the begining or a specified location
	 *
	 * @function remove
	 * @namespace bMoor
	 * @param {array} arr An array to be searched
	 * @param {something} searchElement Content for which to be searched
	 * @param {integer} fromIndex The begining index from which to begin the search, defaults to 0
	 * @return {integer} number of elements removed
	 **/
	function remove( arr, searchElement, fromIndex ){
		var pos = indexOf( arr, searchElement, fromIndex );

		if ( pos > -1 ){
			arr.splice( pos, 1 );
			return 1;
		}else{
			return 0;
		}
	}

	/**
	 * Search an array for an element and remove all instances of it, starting at the begining or a specified location
	 *
	 * @function remove
	 * @namespace bMoor
	 * @param {array} arr An array to be searched
	 * @param {something} searchElement Content for which to be searched
	 * @param {integer} fromIndex The begining index from which to begin the search, defaults to 0
	 * @return {integer} number of elements removed
	 **/
	function removeAll( arr, searchElement, fromIndex ){
		var res,
			pos = indexOf( arr, searchElement, fromIndex );

		if ( pos > -1 ){
			arr.splice( pos, 1 );
			return removeAll( arr, searchElement, pos ) + 1;
		} else {
			return 0;
		}
	}

	/**
	 * Generate a new array whose content is a subset of the intial array, but satisfies the supplied function
	 *
	 * @function remove
	 * @namespace bMoor
	 * @param {array} arr An array to be searched
	 * @param {something} searchElement Content for which to be searched
	 * @param {integer} fromIndex The begining index from which to begin the search, defaults to 0
	 * @return {integer} number of elements removed
	 **/
	function filter( arr, func, thisArg ){
		if ( arr.filter ){
			return arr.filter( func, thisArg );
		}else{
			var i,
				val,
				t = Object(this),
				c = t.length >>> 0,
				res = [];

			if (typeof func != 'function'){
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


	/**
	 * Compare two arrays, 
	 *
	 * @function remove
	 * @namespace bMoor
	 * @param {array} arr1 An array to be compared
	 * @param {array} arr2 An array to be compared
	 * @param {function} func The comparison function
	 * @return {object} an object containing the elements unique to the left, matched, and unqiue to the right
	 **/
	function compareFunc( arr1, arr2, func ){
		var m,
            cmp,
            left = [],
            right = [],
            leftI = [],
            rightI = [];

        arr1 = arr1.slice(0);
        arr2 = arr2.slice(0);

        arr1.sort( func );
        arr2.sort( func );

        while( arr1.length > 0 && arr2.length > 0 ){
            cmp = func( arr1[0], arr2[0] );

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

	register( 'global', global );
	register( 'undefined', undefined );

	set( 'bMoor', bMoor );
	set( 'bmoor', bmoor );
	
	/**
	 * The promise component for defered statements
	 *
	 * @class Promise 
	 * @namespace bmoor.defer
	 * @constructor
	 **/
	function Promise( defer ){
		this.defer = defer;
	}
	
	set( 'bmoor.defer.Promise', Promise );

	extend( Promise.prototype, {
		/**
		 * Initializes the element for the instance
		 * 
		 * @method then
		 * @param {function} callback The function called on success
		 * @param {function} errback The function called on error
		 * @return {bmoor.defer.Promise} A sub promise
		 **/
		"then" : function( callback, errback ){
			var dis = this,
				defer = this.defer,
				sub = this.sub = this.defer.sub(),
				tCallback,
				tErrback;

			tCallback = function( value ){
				try{
					sub.resolve( (callback||defer.defaultSuccess)(value) );
					dis.sub = null;
				}catch( ex ){
					dis.sub = null;
					sub.reject( ex );
					defer.handler( ex );
				}
			};

			tErrback = function( value ){
				try{
					sub.resolve( (errback||defer.defaultFailure)(value) );
					dis.sub = null;
				}catch( ex ){
					dis.sub = null;
					sub.reject( ex );
					defer.handler( ex );
				}
			};

			defer.register( tCallback, tErrback );

			return sub.promise;
		},
		/**
		 * Supplies a function to call on failure, it creates a new chain
		 * 
		 * @method catch
		 * @param {function} callback The function called on failure
		 * @return {this} Returns back the sub promise
		 **/
		"catch": function( callback ) {
			return this.then( null, callback );
		},
		/**
		 * A short cut that allows you to not need to throw inside the then
		 * 
		 * @method reject
		 * @param {something} error The function called on success
		 **/
		"reject" : function( error ){
			if ( this.sub ){
				this.sub.reject( error );
			}else{
				throw 'must reject from inside a then';
			}
		},
		/**
		 * Supplies a function to call on success, it doesn't create a new chain
		 * 
		 * @method done
		 * @param {function} callback The function called on success
		 * @return {this} Returns back the promise, not the generated sub promise
		 **/
		"done": function( callback ){
			this.then( callback );
			return this; // for chaining with the defer
		},
		/**
		 * Supplies a function to call on failure, it doesn't create a new chain
		 * 
		 * @method fail
		 * @param {function} callback The function called on failure
		 * @return {this} Returns back the promise, not the generated sub promise
		 **/
		"fail": function( callback ){
			this.then( null, callback );
			return this; 
		},
		// TODO
		"finally": function( callback ) {
			function makePromise(value, resolved) {
				var result = bmoor.defer.Basic();

				if (resolved) {
					result.resolve( value );
				} else {
					result.reject( value );
				}

				return result.promise;
			}

			function handleCallback( value, isResolved ){
				var callbackOutput = null;
				try {
					callbackOutput = (callback || dis.defaultSuccess)();
				} catch(e) {
					return makePromise(e, false);
				}

				if (callbackOutput && bMoor.isFunction(callbackOutput.then)) {
					return callbackOutput.then(
						function() {
							return makePromise(value, isResolved);
						}, 
						function(error) {
							return makePromise(error, false);
						}
					);
				} else {
					return makePromise(value, isResolved);
				}
			}

			return this.then(
				function(value) {
					return handleCallback(value, true);
				}, 
				function(error) {
					return handleCallback(error, false);
				}
			);
		},
		// TODO
		"always": function( callback ){
			this['finally']( callback );
			return this;
		}
	});

	/**
	 * The basic kind of defer statement
	 *
	 * @class Basic 
	 * @namespace bmoor.defer
	 * @constructor
	 **/
	function Defer( exceptionHandler ){
		var dis = this;

		this.handler = exceptionHandler || this.defaultHandler;
		this.callbacks = [];
		this.value = null;
		this.promise = new Promise( this );
	}

	set( 'bmoor.defer.Basic', Defer );

	(function(){
		function resolution( value ){
			if ( value && value.then ) {
				return value;
			} return {
				then: function ResolutionPromise( callback ){
					if ( bMoor.isArrayLike(value) && value.$inject ){
						callback.apply( undefined, value );
					}else{
						callback( value );
					}
				}
			};
		}

		function rejection( reason ){
			return {
				then : function RejectionPromise( callback, errback ){
					errback( reason );
				}
			};
		}

		extend( Defer.prototype, {
			/**
			 * Called on the failure of a success or failure 
			 * 
			 * @method defaultHandler
			 * @param {function} ex The value to be reported back
			 **/
			defaultHandler : function( ex ){ 
				bMoor.error.report(ex);
			},
			/**
			 * Called to handle a successful value 
			 * 
			 * @method defaultSuccess
			 * @param {function} ex The value to be reported back
			 **/
			defaultSuccess : function( value ){ 
				return value;
			},
			/**
			 * Called to handle a failure value 
			 * 
			 * @method defaultFailure
			 * @param {function} message The value to be reported back
			 **/
			defaultFailure : function( message ){ 
				throw message; // keep passing the buck till someone stops it
			}, 
			/**
			 * Set up functions to be called when value is resolved
			 * 
			 * @method register
			 * @param {function} callback The value to be reported back
			 * @param {function} failure The value to be reported back
			 **/
			register : function( callback, failure ){
				if ( this.value ){
					this.value.then( callback, failure );
				}else{
					this.callbacks.push( [callback, failure] );
				}
			},
			/**
			 * Issue the value for the promise
			 * 
			 * @method resolve
			 * @param {something} value The value to be reported back
			 **/
			resolve : function( value ){
				var callbacks,
					cbSet,
					i,
					c;

				if ( this.callbacks ){
					callbacks = this.callbacks;
					this.callbacks = null;
					this.value = resolution( value );

					for( i = 0, c = callbacks.length; i < c; i++ ){
						cbSet = callbacks[i];
						this.value.then( cbSet[0], cbSet[1] );
					}
				}
			},
			/**
			 * Issue the value for the promise
			 * 
			 * @method resolve
			 * @param {something} reason The reason for rejection
			 **/
			reject : function( reason ){
				this.resolve( rejection(reason) );
			},
			/**
			 * Generate a sub promise
			 * 
			 * @method sub
			 **/
			sub : function(){
				return new bmoor.defer.Basic( this.handler );
			}
		});
	}());

	/**
	 * A collection of promises that can be grouped into one
	 *
	 * @class Group 
	 * @namespace bmoor.defer
	 * @constructor
	 **/
	function DeferGroup(){
		this.count = 0;
		this.loaded = false;
		this.errors = [];
		this.defer = new Defer();
		this.promise = this.defer.promise;
	}

	set( 'bmoor.defer.Group', DeferGroup );

	(function(){
		function check(){
			if ( this.count === 0 && this.loaded ){
				if ( this.errors.length ){
					this.defer.reject( this.errors );
				}else{
					this.defer.resolve( true );
				}
			}
		}

		function rtn(){
			this.count--;
			check.call( this );
		}

		extend( DeferGroup.prototype, {
			/**
			 * Add a promise to the group
			 * 
			 * @method add
			 * @param {bmoor.defer.Promise} promise A promise to add to the collection.
			 **/
			add : function( promise ){
				var dis = this;
				this.count++;

				promise.then(
					function(){
						rtn.call( dis );
					},
					function( error ){
						dis.errors.push( error );
						rtn.call( dis );
					}
				);
			},
			/**
			 * Issue when all promises have been added
			 * 
			 * @method resolve
			 * @param {something} reason The reason for rejection
			 **/
			run : function(){
				this.loaded = true;
				check.call( this );
			}
		});
	}());

	/**
	 * Compare two arrays, 
	 *
	 * @function all
	 * @namespace bmoor.defer
	 * @param {...bmoor.promise.Defer} defer All of the promises to combine into one promise
	 * @return {bmoor.promise.Defer} The result promise of a bmoor.defer.Group
	 **/
	set( 'bmoor.defer.all', function(){
		var inst = this,
			group = new DeferGroup(),
			promises;

		if ( arguments.length > 1 ){
			promises = arguments;
		}else{
			promises = arguments[0];
		}

		bMoor.forEach(promises, function(p){
			group.add( p );
		});

		group.run();

		return group.promise;
	});

	/**
	Externalizing the functionality
	**/
	extend( bMoor, {
		// namespace
		'parseNS'     : parse,
		'dwrap'       : dwrap,
		'set'         : set,
		'get'         : get,
		'del'         : del,
		'exists'      : exists,
		'register'    : register,
		'check'       : check,
		'find'        : find,
		'install'     : install,
		// injection
		'makeQuark'   : makeQuark,
		'ensure'      : ensure,
		'request'     : request,
		'translate'   : translate,
		'inject'      : inject,
		'plugin'      : plugin,
		// loop
		'loop'        : loop, // array
		'each'        : each, // object
		'iterate'     : iterate, // object + safe
		'forEach'     : forEach,
		// test
		'isBoolean'   : isBoolean,
		'isDefined'   : isDefined,
		'isUndefined' : isUndefined,
		'isArray'     : isArray,
		'isArrayLike' : isArrayLike,
		'isObject'    : isObject,
		'isFunction'  : isFunction,
		'isNumber'    : isNumber,
		'isString'    : isString,
		'isInjectable' : isInjectable,
		'isEmpty'     : isEmpty, 
		'isQuark'     : isQuark,
		// object
		'instantiate' : instantiate,
		'map'         : map,
		'object' : {
			'mask'      : mask,
			'extend'    : extend,
			'copy'      : copy,
			'equals'    : equals
		},
		// string
		'string' : {
			'trim' : trim 
		},
		// array
		'array' : {
			'compare' : compareFunc,
			'indexOf' : indexOf,
			'remove' : remove,
			'removeAll' : removeAll,
			'filter' : filter
		},
		// error
		'error' : {
			report : error
		},
		// other utils - TODO : move out
		'url' : {
			'resolve'  : urlResolve
		}
	});
}( this ));
;bMoor.inject(
	['bmoor.defer.Basic','@global', 
	function( Defer, global ){
		var eCompiler = bMoor.makeQuark('bmoor.build.Compiler'),
			Compiler = function(){
				this.preProcess = [];
				this.postProcess = [];
				this.clean = true;
			},
			definitions = {},
			instance;

		function make( name, quark, definition ){
			var i, c,
				obj,
				id = name.name,
				namespace = name.namespace,
				dis = this,
				stillDoing = true,
				$d = new Defer(),
				promise = $d.promise,
				maker;

			// a hash has been passed in to be processed
			if ( bMoor.isObject(definition) ){
				if ( definition.abstract ){
					obj = function Abstract(){
						throw namespace + ' is abstracted, either extend or use only static members';
					};
				}else if ( definition.construct ){
					obj = definition.construct;
				}else{
					// throw namespace + 'needs a constructor, event if it just calls the parent it should be named'
					obj = function GenericConstruct(){};
				}

				// defines a class
				definition.id = id;
				definition.name = namespace.pop();
				definition.mount = bMoor.get( namespace );
				definition.namespace = namespace;
				definition.whenDefined = quark.$promise;
				
				if ( !this.clean ){
					this.preProcess.sort(function( a, b ){
						return b.rank - a.rank;
					});
					this.postProcess.sort(function( a, b ){
						return b.rank - a.rank;
					});
					
					this.clean = true;
				}

				$d.resolve();

				bMoor.loop( this.preProcess, function( maker ){
					promise = promise.then(function(){
						return bMoor.inject( maker.module, definition, obj ); 
					});
				});

				return promise.then(function(){
					// TODO : I really want to rethink this
					if ( obj.$onMake ){
						obj.$onMake( definition );
					}

					return obj;
				});
			}else{
				throw 'Constructor has no idea how to handle as definition of ' + definition;
			}
		}

		Compiler.prototype.addModule = function( rank, namePath, injection ){
			rank = parseInt( rank, 10 );

			this.clean = false;

			if ( arguments.length < 3 ){
				injection = namePath;
			}else{
				bMoor.install( namePath, injection[injection.length-1] );
			}

			if ( rank >= 0 ){
				this.preProcess.push({
					rank : rank,
					module : injection
				});
			}else{
				this.postProcess.push({
					rank : rank,
					module : injection
				});
			}
		};

		Compiler.prototype.make = function( name, definition ){
			var dis = this,
				postProcess = function( def ){
					make.call( dis, {name:name,namespace:namespace}, quark, def ).then(function( defined ){
						var $d = new Defer(),
							promise = $d.promise;

						$d.resolve();

						bMoor.loop( dis.postProcess, function( maker ){
							promise = promise.then(function(){
								return bMoor.inject( maker.module, def, defined ); 
							});
						});
						
						return promise.then(function(){
							quark.$ready( defined );

							return defined;
						});
					});
				},
				namespace,
				quark;

			if ( arguments.length !== 2 ) {
				throw 'you need to define a name and a definition';
			}
			
			if ( bMoor.isString(name) ){
				namespace = bMoor.parseNS( name );
			}else if ( bMoor.isArray(name) ){
				namespace = name;
				name = name.join('.');
			}else{
				throw JSON.stringify(name) + ' > ' + JSON.stringify(definition) + ' > ' +
					'message : you need to define a name and needs to be either a string or an array';
			}

			quark = bMoor.makeQuark( namespace );

			definitions[ name ] = definition;

			if ( bMoor.isInjectable(definition) ){
				if ( bMoor.require ){
					bMoor.require.inject( definition ).then( postProcess );
				}else{
					bMoor.inject( definition ).then( postProcess );
				}
			}else{
				postProcess( definition );
			}

			return quark.$promise;
		};

		Compiler.prototype.mock = function( name, mocks ){
			var dis = this,
				defer = new Defer(),
				quark = {
					$promise : defer.promise
				};

			console.log( 'mocking', definitions[name], mocks );
			return bMoor.inject( definitions[name], mocks ).then(function( def ){
				console.log( 'making mock' );
				return make.call( dis, {name:'mock',namespace:['mock']}, quark, def ).then(function( defined ){
					var $d = new Defer(),
						promise = $d.promise;
					console.log( 'postProcess mock' );
					$d.resolve();

					bMoor.loop( dis.postProcess, function( maker ){
						promise = promise.then(function(){
							return bMoor.inject( maker.module, def, defined ); 
						});
					});

					return promise.then(function(){
						defer.resolve( quark );

						return defined;
					});
				});
			});
		};

		Compiler.prototype.define = function( namespace, value ){
			var quark = bMoor.makeQuark( namespace );
			
			if ( bMoor.isInjectable(value) ){
				bMoor.inject( value ).then( function( v ){
					quark.$ready( v );
				});
			}else{
				quark.$ready( value );
			}
		};

		instance = new Compiler();
		Compiler.$instance = instance;
		
		bMoor.install( 'bmoor.build.$compiler', instance );

		bMoor.plugin( 'make', function( namespace, definition ){
			return instance.make( namespace, definition );
		});
		
		bMoor.plugin( 'mock', function( namespace, mocks ){
			return instance.mock( namespace, bMoor.map(mocks) );
		});

		bMoor.plugin( 'define', function( namespace, value ){
			return instance.define( namespace, value );
		});

		eCompiler.$ready( Compiler );
	}
]);
;bMoor.inject(['bmoor.build.Compiler',function( Compiler ){
	Compiler.$instance.addModule( 9, 'bmoor.build.ModDecorate', 
		['-decorators', function( decorators ){
			var proto = this.prototype;

			if ( decorators ){
				if ( !bMoor.isArray( decorators ) ){
					throw 'the decoration list must be an array';
				}
				
				bMoor.loop( decorators, function( dec ){
					if ( dec.$wrap ){
						dec.$wrap( proto );
					}
				});
			}
		}]
	);
}]);
;bMoor.inject(['bmoor.build.Compiler', function( Compiler ){
	Compiler.$instance.addModule( 5, 'bmoor.build.ModFactory', 
		['-factory', function( factories ){
			var obj = this;

			if ( factories ){
				bMoor.iterate( factories, function( factory /* factory */, name /* string */ ){
					var calls = [],
						construct;

					obj[ '$'+name ] = function(){
						return factory.apply( obj, arguments );
					};
				});
			}
		}]
	);
}]);;bMoor.inject(['bmoor.build.Compiler', function( Compiler ){
	Compiler.$instance.addModule( 1, 'bmoor.build.ModFinalize', 
		['-onMake', '-parent', function( onMake, parent ){
			if ( onMake ){
				this.$onMake = onMake;
			}else if ( parent ){
				this.$onMake = parent.$onMake;
			}
		}]
	);
}]);
;bMoor.inject(['bmoor.build.Compiler',function( Compiler ){
	Compiler.$instance.addModule( 90, 'bmoor.build.ModInherit', 
		['-id','-namespace','-name', '-mount','-parent', 
		function( id, namespace, name, mount, parent){
			var dis = this,
				t;

			if ( parent ){
				t = function(){ 
					this.constructor = dis; // once called, define
				};
				t.prototype = parent.prototype;
				this.prototype = new t();
			}
			
			this.prototype.$static = dis;	
			this.prototype.__class = id;
			this.prototype.__namespace = namespace;
			this.prototype.__name = name;
			this.prototype.__mount = mount;
		}]
	);
}]);
;bMoor.inject(['bmoor.build.Compiler', function( Compiler ){
	Compiler.$instance.addModule( 8, 'bmoor.build.ModMixins', 
		['-mixins', function( mixins ){
			if ( mixins ){
				if ( !bMoor.isArray( mixins ) ){
					mixins = [ mixins ];
				}else{
					mixins = mixins.splice(0);
				}

				mixins.unshift( this.prototype );

				bMoor.object.extend.apply( this, mixins );
			}
		}]
	);
}]);
;bMoor.inject(['bmoor.build.Compiler', function( Compiler ){
	Compiler.$instance.addModule( -2, 'bmoor.build.ModPlugin', 
		['-plugins', function( plugins ){
			var obj = this;

			if ( plugins ){
				bMoor.loop( plugins, function( request ){
					var o;

					if ( !request.instance ){
						o = obj;
					}else if ( bMoor.isString(request.instance) ){
						o = obj[ '$' + request.instance ]; // link to singletons
					}else{
						o = bMoor.instantiate( obj, request.instance );
					} 

					bMoor.iterate( request.funcs, function( func, plugin ){
						if ( bMoor.isString(func) ){
							func = obj[ func ];
						}

						bMoor.plugin( plugin, function(){ 
							return func.apply( o, arguments ); 
						});
					});
				});
			}
		}]
	);
}]);
;bMoor.inject(['bmoor.build.Compiler',function( Compiler ){
	Compiler.$instance.addModule( 10, 'bmoor.build.ModProperties', 
		['-properties', function( properties ){
			var name;

			for( name in properties ){
				this.prototype[ name ] = properties[ name ];
			}
		}]
	);
}]);
;bMoor.inject(['bmoor.build.Compiler',function( Compiler ){
	Compiler.$instance.addModule( 0, 'bmoor.build.ModRegister', 
		['-id', function( id ){
			bMoor.register( id, this );
		}]
	);
}]);
;(function(){
	// TODO : this is no longer needed
}());
;bMoor.inject(['bmoor.build.Compiler',function( Compiler ){
	Compiler.$instance.addModule( -1, 'bmoor.build.ModSingleton', 
		['-singleton',function( singleton ){
			var obj = this;

			if ( singleton ){
				bMoor.iterate( singleton, function( args /* arguments to construct with */, name /* string */ ){
					obj[ '$'+name ] = bMoor.instantiate( obj, args );
				});
			}
		}]
	);
}]);;bMoor.inject(['bmoor.build.Compiler', function( Compiler ){
	Compiler.$instance.addModule( 10, 'bmoor.build.ModStatics', 
		['-statics', function( statics ){
			var name;

			for( name in statics ){
				this.prototype[ name ] = statics[ name ];
			}
		}]
	);
}]);
;(function(){
	
	function stackOn( func, args ){
		return this.promise.then(function(){
			return func.apply( {}, args || [] );
		});
	}

	bMoor.make( 'bmoor.defer.Stack', {
		construct : function(){
			this.promise = null;
		},
		properties : {
			getPromise : function(){
				return this.promise;
			},
			isStacked : function(){
				return this.promise !== null;
			},
            // TODO: there is a bug in here, when a controller uses multiple it will break.
            // -- highly unlikely, but noted
			begin : function(){
				this.promise = null;
			},
			run : function( func ){
				if ( !this.promise ){
					func();
				}else{
					this.promise['finally']( func );
				}
			},
			add : function( func, args ){
				if ( this.promise ){
					this.promise = stackOn.call( this, [func,args] );
				}else{
					this.promise = func.apply( {}, args );
					if ( !this.promise.then ){
						this.promise = null;
					}
				}

				return this.promise;
			}
		}
	});

}());;(function(){
	
	bMoor.make( 'bmoor.comm.Connector', {
		properties : {
			request : function( type, options ){
				return ( new bmoor.comm[type](options) ).promise;
			},
			http : function( options ){
				return this.request( 'Http', options );
			},
			get : function( options, data ){
				if ( bMoor.isString(options) ){
					options = { url : options };
				}

				if ( data ){
					options.data = data;
				}

				options.method = 'GET';

				return this.http( options );
			},
			post : function( options, data ){
				if ( bMoor.isString(options) ){
					options = { url : options };
				}

				if ( data ){
					options.data = data;
				}

				options.method = 'POST';

				return this.http( options );
			},
			script : function( src ){
				if ( bMoor.isObject(src) ){
					src = src.url || src.src;
				}

				return this.request( 'Script', src );
			},
			style : function( src ){
				if ( bMoor.isObject(src) ){
					src = src.url || src.src;
				}

				return this.request( 'Style', src );
			},
			image : function( src ){
				var $d = new bmoor.defer.Basic(),
					img = new Image();
				
				if ( src[0] == '#' ){
					src = $( src )[0].src;
				}
				
				// TODO : what about failure?
				img.onload = function(){
					$d.resolve({
						data : img,
						valid : true,
						status : 200,
						headers : undefined
					});
				};
				img.src = src;

				return $d.promise;
			}
		}
	});

}());

/*
parseTemplate : function( template ){
			var rtn = null;

			switch( typeof(template) ){
				case 'string' :
					rtn = template.replace( /\s*<!\[CDATA\[\s*|\s*\]\]>\s*|[\r\n\t]/g, '' );
					break;
					
				case 'function' :
					rtn = ( template.isTemplate ) ? template :
						template.toString().split(/\n/).slice(1, -1).join('\n'); 
					break;
					
				default :
					break;
			}

			return rtn;
		},
*/;(function(){
	var XHR = window.XMLHttpRequest || function() {
			/* global ActiveXObject */
			try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); } catch (e1) {}
			try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); } catch (e2) {}
			try { return new ActiveXObject("Msxml2.XMLHTTP"); } catch (e3) {}
			throw 'error' /* TODO : error */;
		};

	// TODO : need to handle headers better
	// Accept: "application/json, text/plain, */*", 
	// Content-Type: "application/json;charset=utf-8"}
	// how to add better support for response types?
	bMoor.make( 'bmoor.comm.Http', {
		construct : function CommHTTP( options ){
			var dis = this,
				xhr = this.makeXHR( 
					options.method.toUpperCase(), 
					options.url, 
					(options.async === undefined ? true : options.async),
					options.user,
					options.password
				);

			xhr.onreadystatechange = function() {
				if (xhr.readyState == 4) {
					if( dis.status !== -2 ) {
						dis.status = xhr.status;
					}

					dis.resolve(
						xhr.responseType ? xhr.response : xhr.responseText,
						xhr.getAllResponseHeaders()
					);
				}
			};

			bMoor.forEach( options.headers, function( value, key ){
				xhr.setRequestHeader(key, value);
			});

			if ( options.mimeType ) {
				xhr.overrideMimeType( options.mimeType );
			}

			if ( options.responseType ) {
				xhr.responseType = options.responseType;
			}

			this.url = bMoor.url.resolve( options.url );
			this.status = null;
			this.connection = xhr;
			this.$defer = new bmoor.defer.Basic();
			this.promise = this.$defer.promise;

			xhr.send(options.data || null);
		},
		properties : { // 7900
			makeXHR : function( method, url, async, user, password ){
				var xhr = new XHR();

				if ( "withCredentials" in xhr ){
					// doop
				}else if ( typeof XDomainRequest != "undefined") {
					// Otherwise, check if XDomainRequest.
					// XDomainRequest only exists in IE, and is IE's way of making CORS requests.
					xhr = new XDomainRequest();
				} else {
					// Otherwise, CORS is not supported by the browser.
					xhr = null;
				}

				xhr.open( method, url, async, user, password );

				return xhr;
			},
			abort : function(){
				// TODO : this status should ideally be from somewhere?
				if ( this.status === null ){
					this.status = -2;
					if ( this.connection ){
						this.connection.abort();
					}
				}
			},
			resolve : function( response, headers ){
				var r,
					action,
					status = this.status,
					valid = ( 200 <= status && status < 300 ),
					protocol = this.url.protocol;

				this.connection = null;

				// fix status code for file protocol (it's always 0)
				status = (protocol == 'file' && status === 0) ? (response ? 200 : 404) : status;

				// normalize IE bug (http://bugs.jquery.com/ticket/1450)
				status = status == 1223 ? 204 : status;
				action = valid ? 'resolve' : 'reject';

				r = [ response, status, headers ];
				r.$inject = true; // TODO : do I really need this? no, I should pass back an object

				this.$defer[action]( r );
			}
		},
		plugins : [{
			funcs : {
				'$http' : function( options ){
					var dis = this;

					dis = new dis( options );

					return dis.promise;
				}
			}
		}]
	});
}());
;(function( bMoor, undefined ){
	"use strict";

	bMoor.make( 'bmoor.comm.Registry', {
		singleton: {
			instance : []
		},
		construct : function CommRegistry(){
			var scripts,
				scriptTag, // will be this script
				match;

			if ( !bMoor.root ){
				scripts = document.getElementsByTagName( 'script' );
				scriptTag = scripts[ scripts.length - 1 ]; // will be this script

				if ( scriptTag.hasAttribute('root') ){
					bMoor.root = scriptTag.getAttribute('root');
				}else{
					match = scriptTag.getAttribute('src').match(/^(.*)\/b[Mm]oor(\.min)?\.js/);

					if ( match ){
						bMoor.root = match[ 1 ];
					}else{
						match = scriptTag.getAttribute('src').match(/^(.*)\/(js|src|scripts)/);

						if ( match ){
							bMoor.root = match[0];
						}else{
							bMoor.root = '';
						}
					}
				}
			}

			this.reset( bMoor.root );
		},
		plugins : [{
			instance : 'instance',
			funcs : {
				'ns.locate' : function( ns ){
					return this.locate( ns );
				},
				'ns.register' : function( className, path, settings, catchAll ){
					return this.set( className, path, settings, catchAll );
				}
			}
		}],
		properties : {
			// A multi level hash that allows for different libraries 
			// to be located in different locations
			libRoots : {},
			parseResource : function( root ){
				var resourceMatch = root.match(/^(.*)\/(js|src)/);
				
				if ( resourceMatch ){
					return resourceMatch[1];
				} else /* if( root.match(/^[js|src]/) ){
					return null;
				}else */{
					return null;
				}
			},
			reset : function( path ){
				this.libRoots = {};
				this.setRoot( path );
			},
			setRoot : function( path ){
				this.libRoots['.'] = { 
					fullName : false 
				};
				this.libRoots['/'] = path;
				this.libRoots['>'] = this.parseResource( path );
				this.libRoots.jquery = {
					'/' : path + '/jquery',
					'.' : {
						fullName : true
					}
				};
			},
			/** 
			 * set the location of a library
			 * 
			 * @var {array,string} className The class to set up a path to
			 * @var {string} path The URL path to the library's base
			 */
			set : function( className, path, settings, catchAll ){
				var
					lib = this.libRoots,
					classPath = bMoor.parseNS( className );
				
				if ( !settings ){
					settings = {};
				}
				
				while( classPath.length ){
					var
						dir = classPath.shift();
					
					if ( lib[ dir ] === undefined ){
						lib[ dir ] = {};
					}
					lib = lib[ dir ];
				}
				
				lib['/'] = path;
				lib['.'] = settings;
				lib['*'] = catchAll === true; // type caste
				lib['>'] = this.parseResource( path );
			},
			del : function( className ){
				var
					lib = this.libRoots,
					prevLib = null,
					prevDir = null,
					classPath = bMoor.parseNS( className );
				
				while( classPath.length && lib ){
					var
						dir = classPath.shift();
					
					if ( lib[dir] ){
						prevLib = lib;
						prevDir = dir;
						
						lib = lib[ prevDir ];
					}else{
						lib = null;
					}
				}
				
				if ( lib ){
					delete prevLib[ prevDir ];
				}
			},
			/**
			 * 
			 * @param className
			 * @returns
			 */
			get : function( className, namespace ){
				var
					lib = this.libRoots,
					masterLib = this.libRoots, 
					classPath = bMoor.parseNS( className ),
					name = namespace ? null : classPath.pop(),
					masterPath = classPath.slice(0);
				
				while( classPath.length ){
					var
						dir = classPath[0];
					
					if ( lib[dir] ){
						lib = lib[ classPath.shift() ];
						
						if ( lib['/'] ){
							masterLib = lib;
							masterPath = classPath.slice(0);
						}
					}else{
						break;
					}
				}
				
				return { 
					root : masterLib['/'], 
					path : ( masterLib['*'] ? [] : masterPath ),         
					name : name, 
					settings : masterLib['.'], 
					resource : masterLib['>']
				};
			},
			locate : function( reference ){
				var info = this.get( reference );

				return info.root + ( info.path.length ? '/'+info.path.join('/') : '' ) + '/' + 
					( info.settings.fullName ? reference : info.name );
			}
		}
	});

}( bMoor ));;bMoor.make( 'bmoor.comm.Require', 
	['bmoor.comm.Script','bmoor.defer.Group', function( Script, Group ){

		return {
			construct : function CommRequire(){},
			properties : {
				forceSync : false, 
				translate : function( arr, root ){
					var r,
						key,
						requirement,
						group = new Group();

					for( key in arr ){
						requirement = arr[ key ];

						if ( requirement.charAt(0) === '>' ){
							requirement = requirement.substr( 1 ).split( '>' );

							arr[ key ] = '-'+requirement[0];

							group.add(this.get(
								requirement[0],
								true,
								requirement[1]
							));
						}
					}

					group.run();

					return group.promise.then(function(){
						return bMoor.translate( arr );
					});
				},
				inject : function( arr, root, context ){
					var i, c,
						func,
						res;

					if ( bMoor.isFunction(arr) ){
						func = arr;
						arr = [];
					}else if ( bMoor.isArray(arr) ){
						arr = arr.slice( 0 );
						func = arr.pop();
					}else{
						throw 'inject needs arr to be either Array or Function';
					}

					return this.translate.call( this, arr, root ).then(function( args ){
						return bMoor.request( args ).then(function(){
							return func.apply( context, args );
						});
					});
				},
				get : function( requirement, async, alias ){
					var quark,
						req;

					req = bMoor.exists( requirement );

					if ( req === undefined ){
						quark = bMoor.ensure( requirement );

						( new Script( 
							alias || bMoor.ns.locate(requirement)+'.js', 
							this.forceSync ? false : async 
						) ).promise.then(function(){
							quark.$ready( bMoor.exists(requirement) );
						});

						return quark.$promise;
					}else if ( bMoor.isQuark(req) ){
						return req.$promise;
					}else{
						return bMoor.dwrap( req );
					}
				},
				hash : function( aliases ){
					var key,
						group = bmoor.defer.Group();

					for( key in aliases ){
						group.add( this.get(key,true,aliases[key]) );
					}

					group.run();
				},
				list : function( requirements ){
					var i, c,
						group = bmoor.defer.Group();

					for( i = 0, c = requirements.length; i < c; i++ ){
						group.add( this.get(requirements[i]) );
					}

					group.run();
				}
			},
			plugins : [{
				instance : [],
				funcs : {
					'require' : function( require, alias ){
						var el;

						this.forceSync = true;
						el = this.get( require, alias );
						this.forceSync = false;

						return el;
					},
					'require.translate' : function( arr, root ){
						return this.translate( arr, root );
					},
					'require.inject' : function( arr, root, context ){
						return this.inject( arr, root, context );
					}
				}
			}]
		};
	}]
);
;(function( undefined ){
	"use strict";

	bMoor.make( 'bmoor.comm.Resource', {
		construct : function CommResource( src, async ){
			var dis = this;

			this.$defer = new bmoor.defer.Basic();
			this.promise = this.$defer.promise;

			(new bmoor.comm.Http({
				'method' : 'GET',
				'url' : src,
				'async' : async
			})).promise.then( 
				function resourceSuccess( response, status ){
					try{
						dis.status = 200;
						dis.success( dis.apply(response) );
					}catch( ex ){
						dis.status = 17003;
						dis.failure( ex );
					}
				},
				function resourceFailure( response, status, headers ){
					dis.status = status;
					dis.failure( response );
				}
			);
		},
		properties : {
			apply : function( content ){
				return content;
			},
			success : function( data ){
				this.status = this.status || 200;
				this.resolve( data );
			},
			failure : function( data ){
				this.status = this.status || 19129;
				this.resolve( data );
			},
			resolve : function( data ){
				if ( this.status === 200 ){
					this.$defer.resolve({
						data : data,
						status : this.status,
						headers : undefined
					});
				}else{
					this.$defer.reject({
						data : data,
						status : this.status,
						headers : undefined
					});
				}
			}
		}
	});

}());;bMoor.make( 'bmoor.comm.Script', 
	['bmoor.comm.Resource',function( Resource ){
		return {
			parent : Resource,
			construct : function CommScript(){
				Resource.apply( this, arguments );
			},
			properties : {
				apply : function scriptApply( content ){
					var script = document.createElement( 'script' );

					script.text = content;
					document.body.appendChild( script );

					return;
				}
			}
		};
	}]
);;bMoor.make( 'bmoor.comm.Style', 
	['bmoor.comm.Resource', function( Resource ){
		return {
			parent : Resource,
			construct : function CommStyle(){
				Resource.apply( this, arguments );
			},
			properties : {
				apply : function styleApply( content ){
					var style = document.createElement( 'style' );

					if (style.styleSheet){
						style.styleSheet.cssText = content;
					} else {
						style.appendChild( document.createTextNode(content) );
					}
					
					document.body.appendChild( style );

					return;
				}
			}
		};
	}]
);;bMoor.make( 'bmoor.core.Collection', ['bmoor.core.Model', function( Model ){
	return {
		parent : Array,
		traits : [
			Model
		],
		construct : function Collection( content ){
			this.merge( this.inflate(content) );
		},
		properties : {
			simplify : function(){
				return this.deflate().slice( 0 );
			}
		}
	};
}]);;bMoor.make('bmoor.core.CollectionObserver', 
	['bmoor.core.MapObserver', function( MapObserver ){
		return {
			parent : MapObserver,
			construct : function CollectionObserver(){
				MapObserver.apply( this, arguments );
			},
			properties : {
				observe : function( collection ){
					var dis = this;
					
					this.removals = [];
					this.watches = [];
					this.changes = {
						moves : [],
						removals : []
					};

					collection.pop = function(){
						var t = Array.prototype.pop.call( this );

						if ( t.$markRemoval === undefined ){
							t.$markRemoval = dis.removals.length;
						}

						dis.removals.push( t );

						return t;
					};

					collection.shift = function(){
						var t = Array.prototype.shift.call( this );

						if ( t.$markRemoval === undefined ){
							t.$markRemoval = dis.removals.length;
						}

						dis.removals.push( t );

						return t;
					};

					collection.splice = function(){
						var 
							i,
							c,
							t = Array.prototype.splice.apply(this, arguments);

						for( i = 0, c = t.length; i < c; i++ ){
							if ( t[i].$markRemoval === undefined ){
								t[i].$markRemoval = dis.removals.length + i;
							}
						}

						dis.removals = dis.removals.concat( t );

						return t;
					};

					MapObserver.prototype.observe.call( this, collection );
				},
				watchChanges : function( func ){
					this.watches.push( func );
				},
				check : function(){
					var i, c,
						dis = this;
					
					if ( !this.checking ){
						MapObserver.prototype.check.call( this );
						
						this.checking = true;
						this.changes = this.checkChanges();
						if ( this._needNotify(this.changes) ){
							bMoor.loop( this.watches, function( f ){
								f( dis.changes );
							});
						}
						this.checking = false;
					}
				}, 
				checkChanges : function(){
					var
						i,
						val,
						key,
						list,
						model = this.model,
						changes = {},
						cleaned = this.cleaned,
						removals,
						moves = {};

					for( key in model ) {
						if ( model.hasOwnProperty(key) && key[0] !== '_' ){
							val = model[key];
							
							if ( typeof(val) == 'function' ){
								continue;
							} else {
								i = parseInt( key, 10 );

								if ( !isNaN(i) ){
									// TODO : do i really want to do this?
									if ( !val._co ){
										val._co = {};
									}

									if ( val.$remove ){
										// allow for a model to force its own removal
										this.model.splice( i, 1 );
									}else if ( val._co.index === undefined ){
										// new row added
										moves[ key ] = val;
									}else if ( val._co.index != i ){
										moves[ key ] = val;
										if ( val.$markRemoval !== undefined ){
											this.removals[ val.$markRemoval ] = undefined;
											delete val.$markRemoval;
										}
									}
									
									val._co.index = i;
								}
							}
						}
					}
					
					changes.removals = this.removals;
					changes.moves = moves;

					this.removals = [];

					return changes;
				},
				_needNotify : function( changes ){
					var key;

					for( key in changes ) {
						if ( changes.hasOwnProperty(key) ){
							if ( key == 'removals' ){
								if ( changes.removals.length ){
									return true;
								}
							}else if ( key == 'moves' ){
								if ( !bMoor.isEmpty(changes.moves) ){
									return true;
								}
							}else{
								return true;
							}
						}
					}

					return false;
				}
			}
		};
	}]
);

;bMoor.make( 'bmoor.core.Decorator', [function(){
	function override( key, el, action ){
		var 
			type = typeof(action),
			old = el[key];
		
		if (  type == 'function' ){
			el[key] = function(){
				var backup = this._wrapped,
					rtn;

				this.$wrapped = old;

				rtn = action.apply( this, arguments );

				this.$wrapped = backup;

				return rtn;
			};
		}else if ( type == 'string' ){
			// for now, I am just going to append the strings with a white space between...
			el[key] += ' ' + action;
		}
	}

	return {
		construct : function Decorator(){},
		onMake : function(){
			var inst = this,
				t = new inst();

			inst.$wrap = function Decoration( obj ){
				var key;
				
				for( key in t ){
					if ( key === '_construct' ){
						continue;
					}else if ( obj[key] ){
						// the default override is post
						override( key, obj, t[key] );
					}else{
						obj[key] = t[key];
					}
				}
			};
		}
	};
}]);;(function(){
	
	bMoor.make( 'bmoor.core.Interval', {
		singleton : {
			instance : []
		},
		construct : function(){
			this._c = 0;
			this.timeouts = {};
			this.hash = {};
		},
		properties : {
			set : function( func,interval ){
				var list = this.timeouts[interval],
					hk = this._c++,
					lhk;

				if ( !list ){
					list = this.timeouts[interval] = { _c : 0 };

					if ( !bMoor.testMode ){
						list._hk = setInterval(function(){
							bMoor.iterate( list, function( f ){
								f();
							});
						}, interval);
					}
				}

				lhk = list._c++;
				list[ lhk ] = func;

				this.hash[ hk ] = { hk : list._c, val : interval };

				return hk;
			},
			flush : function(){
				bMoor.iterate(this.timeouts, function( list ){
					bMoor.iterate( list, function( f ){
						f();
					});
				});
			},
			clear : function( hk ){
				var lhk = this.hash[ hk ];
				if ( lhk ){
					delete this.timeouts[ lhk.val ][ lhk.hk ];
					delete this.hash[ hk ];
				}
			}
		},
		plugins : [
			{
				instance : 'instance',
				funcs : {
					'setInterval' : 'set',
					'clearInterval' : 'clear'
				}
			}
		]
	});

}());;bMoor.make( 'bmoor.core.Map', ['bmoor.core.Model', function( Model ){
	return {
		traits : [
			Model
		],
		construct : function Map( content ){
			this._merge( this._inflate(content) );
		},
		properties : {
			_simplify : function(){
				var key,
                    rtn = {},
                    content = this.deflate();

				for( key in content ){
					if ( content.hasOwnProperty(key) && key.charAt(0) !== '$' ){
						rtn[ key ] = content[ key ];
					}
				}

				return rtn;
			},
			toJson : function(){
				return JSON.stringify( this._simplify() );
			}
		}
	};
}]);

;
bMoor.make( 'bmoor.core.MapObserver', 
	['bmoor.core.Interval',function( Interval ){
		var $snapMO = 0,
		instances = {};

	return {
		construct : function MapObserver( model ){
			if ( $snapMO === 0 ){
				Interval.$instance.set(function(){
					bMoor.iterate( instances, function( inst ){
						inst.check();
					});
				}, 30);
			}
			
			this.$snapMO = $snapMO++;

			this.checking = false;
			this.watching = {};
			this.observe( model );
			this.start();
		},
		properties : {
			observe : function( model ){
				if ( this.model ){
					delete this.model.$observers[ this.$snapMO ];
				}

				this.model = model;

				if ( !model.$observers ){
					model.$observers = {};
				}

				model.$observers[ this.$snapMO ] = this;
			},
			watch : function( variable, func ){
				var p, 
					t; // registers what the observe monitors
					
				if ( !this.watching[variable] ){
					p = variable.split('.');

					this.watching[variable] = {
						path : p,
						value : this.evaluate( p ),
						calls : []
					};
				}

				t = this.watching[ variable ];

				func( t.value, undefined ); // call when first inserted
				
				t.calls.push( func );
			},
			evaluate : function( path ){
				var i, c,
					val = this.model;

				if ( bMoor.isString(path) ){
					path = path.split('.');
				}

				for( i = 0, c = path.length; i < c && val !== undefined; i++ ){
					val = val[ path[i] ];
				}

				return val;
			},
			check : function(){
				var dis = this;

				// see if anything has changed in the model
				this.checking = true;
				bMoor.iterate( this.watching, function( watch ){
					var i, c,
						val = dis.evaluate( watch.path );

					if ( val !== watch.value ){
						for( i = 0, c = watch.calls.length; i < c; i++ ){
							watch.calls[ i ]( val, watch.value );
						}

						watch.value = val;
					}
				});
				this.checking = false;
			},
			start : function(){
				instances[ this.$snapMO ] = this;
			},
			stop : function(){
				delete instances[ this.$snapMO ];
			}
		}
	};
}]);
;bMoor.define( "bmoor.core.Model", [function(){
	function merge( from, to ){
		var key, f, t;

		// merge in the 'from'
		for( key in from ){
			if ( from.hasOwnProperty(key) ){
				f = from[key];
				t = to[key];

				if ( t === undefined ){
					to[key] = f;
				}else if ( angular.isArray(f) ){
					if ( !angular.isArray(t) ){
						t = to[key] = [];
					}

					arrayMerge( f, t );
				}else if ( angular.isObject(f) ){
					if ( !angular.isObject(t) ){
						t = to[key] = {};
					}

					merge( f, t );
				}else if ( f != t ){
					to[key] = f;
				}
			}
		}

		// now we prune the 'to'
		for( key in to ){
			if ( to.hasOwnProperty(key) ){
				if ( from[key] === undefined ){
					delete to[key];
				}
			}
		}

		return to;
	}

	function arrayMerge( from, to ){
		var i, c,
			f,
			t;

		for( i = 0, c = from.length; i < c; i++ ){
			f = from[i];
			t = to[i];

			if ( t === undefined ){
				to[ i ] = f;
			}else if ( angular.isObject(f) ){
				if ( !angular.isObject(t) ){
					t = to[i] = {};
				}

				merge( f, t );
			}else if ( angular.isArray(f) ){
				if ( !anguar.isArray(t) ){
					t = to[i] = [];
				}

				arrayMerge( f, t );
			}else if ( f !== t ){
				to[ i ] = f;
			}
		}

		for( i = c, c = to.length; i < c; i++ ){
			to.pop();
		}
	}

	return {
		_merge : function( from ){
			if ( bMoor.isArray(from) ){
				arrayMerge( from, this );
			}else{
				merge( from, this );
			}

			return this;
		},
		_validate : function(){ 
			return null; 
		},
		_inflate : function( content ){
			return content;
		},
		_deflate : function(){
			return this; 
		},
		_update : function( content ){
			this._merge( content, this );
		},
		_simplify : function(){
			return this._deflate();
		},
		toJson : function(){
			return JSON.stringify( this._simplify() );
		}
	};
}]);

;bMoor.make( 'bmoor.core.Service', [function(){
	/***
	- FuncName
		-- Setup
		- massage : takes in arguments passed in, allows for modification of data object
		- validation : validated data object being sent, can reject via throw
		-- Connect
		- responseType
		- url : function or string
		- request : use this to send the request rather than the http object (returns defer) 
		- http : the connection object to send
		- headers
		- cached : defaults to false
		- method : get,post
		-- Response
		- success : handles unchanged results
		- failure : handles unchanged results
		- process : modifies results in either case (shorthand), changes response
	***/
	
	var cache = {};

	function makeServiceCall( service, options ){
		var success,
			failure;

		if ( options.success ){
			success = function serviceSuccess(){
				return options.success.apply( service, arguments );
			};
		} 

		if ( options.failure ){
			failure = function serviceFailure(){
				return options.failure.apply( service, arguments );
			};
		}

		return function(){
			var args = arguments,
				r,
				http,
				url,
				content,
				response;

			if ( bMoor.isString(options) ){
				options = {
					url : options
				};
			}
			// data setup
			if ( options.massage ){
				args[ args.length - 1 ] = options.massage.apply( service, args );
			}

			if ( !options.validation || options.validation.apply(service,args) ){
				// make the request
				url = bMoor.isFunction( options.url ) ? options.url.apply( service, args ) : options.url;

				if ( !options.cached || !cache[url] ){
					// respond
					content = args[ args.length - 1 ];

					if ( options.request ){
						response = new bmoor.defer.Basic();

						r = [
							options.request.call( service,content ),
							200
						];
						r.$inject = true;
						response.resolve( r );

						response = response.promise;
					}else{
						http = bMoor.get( options.http || 'bmoor.comm.Http' );
						response = ( 
								new http({
									url : url,
									headers : options.headers,
									method : options.type || 'GET',
									responseType : options.responseType
								}) 
							).promise;
					}

					if ( options.cached ){
						cache[ url ] = response;
					}
				}else{
					response = cache[ url ];
				}
			}

			return response.then( success, failure );
		};
	}

	return {
		onMake : function( definition ){
			var obj = this;
			
			bMoor.iterate( definition.services, function( service, name ){
				obj.prototype[name] = makeServiceCall( obj, service );
			});
		}
	};
}]);
;bMoor.make('bmoor.core.SmartMapObserver', 
	['@undefined', 'bmoor.core.MapObserver', function( undefined, MapObserver ){

		function mapUpdate( update, value ){
			var key, 
				val,
				model = this.model;

			if ( bMoor.isString( update ) ){
				// TODO : this isn't entirely right
				this.updates[ update ] = bMoor.set( update, value, this.model );
			}else if ( bMoor.isObject(update) ){
				for( key in update ){
					if ( update.hasOwnProperty(key) ){
						mapUpdate.call( this, key, update[key] );
					}
				}
			}
		}

		function mapDelete( deletion ){
			var key, 
				val,
				model = this.model;

			if ( bMoor.isString( deletion ) ){
				// TODO : this isn't entirely right
				this.updates[ update ] = bMoor.del( deletion, this.model );
			}
		}

		return {
			parent : MapObserver,
			construct : function SmartMapObserver(){
				MapObserver.apply( this, arguments );
			},
			properties : {
				observe : function( map ){
					var dis = this;
					
					this.updates = {};

					MapObserver.prototype.observe.call( this, map );

					map.$set = function(){
						mapUpdate.apply( dis, arguments );
					};

					map.$delete = function(){
						mapDelete.apply( dis, arguments );
					};
				},
				check : function(){
					var dis = this,
						key,
						watch;

					bMoor.iterate( this.updates, function( oValue, path ){
						var i, c,
							watch = dis.watching[ path ],
							val;

						if ( watch ){
							val = dis.evaluate( path );

							for( i = 0, c = watch.calls.length; i < c; i++ ){
								watch.calls[ i ]( val, oValue );
							}
						}
					});

					this.updates = {};
				}
			}
		};
	}]
);

;bMoor.make( 'bmoor.error.Basic', 
	['@undefined',function(undefined){
	return {
		parent: Error,
		construct : function ErrorBasic( message, filename, lineNumber ){
			var stack,
				pos,
				err;

			try{
				throw new Error();
			}catch( e ){
				err = e;
			}

			this.name = this.__class;
			this.error = message;
			this.fileName = filename;
			this.lineNumber = lineNumber;
			this.problem = undefined;

			if (err.stack) {
				stack = err.stack.split('\n');
				
				if ( stack[0] === 'Error' ){
					// right now, this means it is not FF
					stack.shift();
					stack.shift();
					stack.shift();
				}else{
					stack.pop();
					stack.shift();
					stack.shift();
				}
				
				this.problem = stack[0];
				this.stack = stack.join('\n');
			}

			this.message = message + '\n' + this.stack;
		},
		properties : {
			// makes it more uniform how browsers display error
			toString : function(){
				return this.name + ': ' + this.message; 
					
			}
		}
	};
}]);