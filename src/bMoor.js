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
	 * @param {object|array} root Array of roots to check, the root of the namespace, or global if not defined
	 **/
	function register( alias, obj, root ){
		var a;

		if ( root ){
			if ( !root.$aliases ){
				root.$aliases = {};
			}

			a = root.$aliases;
		}else{
			a = aliases;
		}

		a[ alias ] = obj; 
	}

	/**
	 * Returns back the alias value
	 *
	 * @function check
	 * @namespace bMoor
	 * @param {string} alias The name of the alias
	 * @param {object|array} root Array of roots to check, the root of the namespace, or global if not defined
	 * @return {something}
	 **/
	function check( alias, root ){
		var a;

		if ( root ){
			if ( !root.$aliases ){
				root.$aliases = {};
			}

			a = root.$aliases;
		}else{
			a = aliases;
		}

		return a[ alias ];
	}

	/**
	 * Sets a value to a namespace, returns the old value, the namespace is always bMoor
	 *
	 * @function plugin
	 * @namespace bMoor
	 * @param {string|array} plugin The namespace
	 * @param {something} obj The value to set the namespace to
	 **/
	// TODO : is this really needed?
	function plugin( plugin, obj ){ 
		set( plugin, obj, bMoor ); 
	}

	/**
	 * first searches to see if an alias exists, then sees if the namespace exists
	 *
	 * @function find
	 * @namespace bMoor
	 * @param {string|array} space The namespace
	 * @param {object|array} root Array of roots to check, the root of the namespace, or global if not defined
	 * @return {something}
	 **/
	// TODO : is this really needed?
	function find( namespace, root ){
		var t;
		
		if ( root === undefined ){
			t = check( isArray(namespace)?namespace.join('.'):namespace );
			if ( t ){
				return t;
			}
		}

		return exists( namespace, root );
	}

	/**
	 * first sets the variable to the namespace, then registers it as an alias
	 *
	 * @function install
	 * @namespace bMoor
	 * @param {string|array} alias The namespace
	 * @param {something} obj The thing being installed into the namespace
	 **/
	// TODO : is this really needed?
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
						rtn[key] = check( value.substr(1), root );
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
	 * @param {array} translate If unknown strings should be ensured
	 * @param {object} root The root of the namespace to search, defaults to global
	 * @return {bmoor.defer.Promise}
	 **/
	function request( request, translate, root ){
		var obj;

		if ( isString(request) ){
			return ensure( request, root );
		}else if( isArrayLike(request) ){
			obj = new DeferGroup();

			loop( request, function( req, key ){
				if ( translate && isString(req) ){
					req = ensure( req ,root );
				}

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

		return request( translate(arr,root), false ).then(function( args ){
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
	 * externalized wrapper for bmoor.defer.Group
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

		if ( isNumber(arguments[0].length) ){
			promises = arguments[0];
		}else{
			promises = arguments;
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
