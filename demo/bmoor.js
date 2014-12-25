;(function(){
/** bmoor v0.0.4 **/
var bMoor = {};

(function( g ){
	'use strict';

	var _root = {},
		msie,
		environment,
		aliases = {};

	if ( g.navigator ){
		// this means we're in a browser
		g.bMoor = bMoor;
		
		msie = parseInt((/msie (\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1], 10);
		if (isNaN(msie)) {
			msie = parseInt((/trident\/.*; rv:(\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1], 10);
		}

		environment = {
			isNode : false,
			'msie' : msie
		};
	}else{
		// this means we're in a node environment
		module.exports = bMoor;
		environment = {
			isNode : true
		};
	}
	/**
	 * namespace
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
	 * @param {object} root The root of the namespace, bMoor.namespace.root if not defined
	 * @return {something}
	 **/
	function set( space, value, root ){
		var old,
			val,
			nextSpace,
			curSpace = root || _root;
		
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
	 * @param {object} root The root of the namespace, bMoor.namespace.root if not defined
	 * @return {something}
	 **/
	function del( space, root ){
		var old,
			val,
			nextSpace,
			curSpace = root || bMoor.namespace.root;
		
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
	 * @param {object} root The root of the namespace, bMoor.namespace.root if not defined
	 * @return {array}
	 **/
	function get( space, root ){
		var curSpace = root || bMoor.namespace.root,
			nextSpace;
		
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
			throw new Error('unsupported type');
		}
	}

	function _exists( space, root ){
		var curSpace = root || bMoor.namespace.root;
		
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
			throw new Error('unsupported type');
		}
	}

	/**
	 * get a value from a namespace, undefinded if it doesn't exist
	 *
	 * @function exists
	 * @namespace bMoor
	 * @param {string|array} space The namespace
	 * @param {object|array} root Array of roots to check, the root of the namespace, or bMoor.namespace.root if not defined
	 * @return {array}
	 **/
	function exists( space, root ){
		var i, c,
			res;

		// TODO : somehow the root is showing up with a length, this is a temp fix.
		if ( isArrayLike(root) && root.length > 0 ){
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
	 * @param {object|array} root Array of roots to check, the root of the namespace, or bMoor.namespace.root if not defined
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
	 * @param {object|array} root Array of roots to check, the root of the namespace, or bMoor.namespace.root if not defined
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
	 * @param {string|array} name The namespace
	 * @param {something} obj The value to set the namespace to
	 **/
	// TODO : is this really needed?
	function plugin( name, obj ){ 
		set( name, obj, bMoor ); 
	}

	/**
	 * object
	 **/

	/**
	 * Create a new instance from a constructor and some arguments
	 *
	 * @function instantiate
	 * @namespace bMoor
	 * @param {function} obj The constructor
	 * @param {array} args The arguments to pass to the constructor
	 * @param {root} obj The root to search against
	 **/
	function instantiate( obj, args, root ){
		var i, c,
			construct;

		if ( isString(obj) ){
			obj = get( obj, root );
		}

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
	 * @function explode
	 * @namespace bMoor
	 * @param {object} target The object to map the variables onto
	 * @param {object} mappings An object orientended as [ namespace ] => value
	 * @return {object} The object that has had content mapped into it
	 **/
	function explode( target, mappings ){
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
	 * Create a new instance from an object and some arguments
	 *
	 * @function mask
	 * @namespace bMoor
	 * @param {function} obj The basis for the constructor
	 * @param {array} args The arguments to pass to the constructor
	 * @return {object} The new object that has been constructed
	 **/
	function mask( obj ){
		if ( Object.create ){
			var T = function Masked(){};

			T.prototype = obj;

			return new T();
		}else{
			return Object.create( obj );
		}
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
				iterate( cpy, function(value, key){
					obj[key] = value;
				});
			}
		});

		return obj;
	}

	function merge( to ){
		var from,
			i, c,
			m = function( val, key ){
				to[ key ] = merge( to[key], val );
			};

		for( i = 1, c = arguments.length; i < c; i++ ){
			from = arguments[i];

			if ( to === from || !from ){
				continue;
			}else if ( !isObject(to) ){
				if ( isObject(from) ){
					to = merge( {}, from );
				}else{
					to = from;
				}
			}else{
				safe( from, m );
			}
		}
		
		return to;
	}

	function override( to, from ){
		safe( from, function( f, key){
			var t = to[ key ];

			if ( t === undefined ){
				to[ key ] = f;
			}else if ( bMoor.isArrayLike(f) ){
				if ( !bMoor.isArrayLike(t) ){
					t = to[ key ] = [];
				}

				arrayOverride( t, f );
			}else if ( bMoor.isObject(f) ){
				if ( !bMoor.isObject(t) ){
					t = to[ key ] = {};
				}

				override( t, f );
			}else if ( f !== t ){
				to[ key ] = f;
			}
		});

		// now we prune the 'to'
		safe( to, function( f, key){
			if ( from[key] === undefined ){
				delete to[key];
			}
		});

		return to;
	}

	function arrayOverride( to, from ){
		var i, c,
			f,
			t;

		if ( isArrayLike(to) && isArrayLike(from) ){
			to.length = from.length;
		}

		for( i = 0, c = from.length; i < c; i++ ){
			f = from[i];
			t = to[i];

			if ( t === undefined ){
				to[ i ] = f;
			} else if ( bMoor.isArrayLike(f) ){
				if ( !bMoor.isArrayLike(t) ){
					t = to[i] = [];
				}

				arrayOverride( t, f );
			} else if ( bMoor.isObject(f) ){
				if ( !bMoor.isObject(t) ){
					t = to[i] = {};
				}

				override( t, f );
			} else if ( f !== t ){
				to[ i ] = f;
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

		if ( obj1 === obj2 ){
			return true;
		}else if ( obj1 !== obj1 && obj2 !== obj2 ){
			return true; // silly NaN
		}else if ( obj1 === null || obj1 === undefined || obj2 === null || obj2 === undefined ){
			return false; // undefined or null
		}else if ( obj1.equals ){
			return obj1.equals( obj2 );
		}else if ( obj2.equals ){
			return obj2.equals( obj1 ); // because maybe somene wants a class to be able to equal a simple object
		}else if ( t1 === t2 ){
			if ( t1 === 'object' ){
				if ( isArrayLike(obj1) ){
					if ( !isArrayLike(obj2) ){ 
						return false; 
					}

					if ( (c = obj1.length) === obj2.length ){
						for( i = 0; i < c; i++ ){
							if ( !equals(obj1[i], obj2[i]) ) { 
								return false;
							}
						}

						return true;
					}
				}else if ( !isArrayLike(obj2) ){
					keyCheck = {};
					for( i in obj1 ){
						if ( obj1.hasOwnProperty(i) ){
							if ( !equals(obj1[i],obj2[i]) ){
								return false;
							}

							keyCheck[i] = true;
						}
					}

					for( i in obj2 ){
						if ( obj2.hasOwnProperty(i) ){
							if ( !keyCheck && obj2[i] !== undefined ){
								return false;
							}
						}
					}
				}
			}
		}

		return false;
	}

	/**
	 * Messaging
	 **/

	/**
	 * Reports an error
	 *
	 * @function error
	 * @namespace bMoor
	 * @param {object} error The error to be reporting
	 **/
	function error( err ){
		if ( err.message ){
			console.log( err.message );
			console.log( err.stack );
		}else{
			console.log( err );
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
		if ( value ){
			return isObject( value ) && typeof value.length === 'number';
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
	var isArray = function( value ) {
		return value instanceof Array;
	};

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
			return isUndefined( value );
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

		for ( i = 0, c = arr.length; i < c; ++i ){
			if ( i in arr ) {
				fn.call(scope, arr[i], i, arr);
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
	 * @param {object} scope The scope to call each function against
	 **/
	function each( obj, fn, scope ){
		var key;

		if ( !scope ){
			scope = obj;
		}

		for( key in obj ){
			if ( obj.hasOwnProperty(key) ){
				fn.call( scope, obj[key], key, obj );
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
	 * @param {object} scope The scope to call each function against
	 **/
	function iterate( obj, fn, scope ){
		var key;

		if ( !scope ){
			scope = obj;
		}

		for( key in obj ){ 
			if ( obj.hasOwnProperty(key) && key.charAt(0) !== '_' ){
				fn.call( scope, obj[key], key, obj );
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
	function safe( obj, fn, scope ){
		var key;

		if ( !scope ){
			scope = obj;
		}

		for( key in obj ){ 
			if ( obj.hasOwnProperty(key) && key.charAt(0) !== '_' && key.charAt(0) !== '$' ){
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
	 * @param {object} root The root of the namespace to position the quark, defaults to bMoor.namespace.root
	 * @return {Quark}
	 **/
	function makeQuark( namespace, root ){
		var path = parse( namespace ),
			t = exists( path ),
			defer,
			quark = function Quark (){
				throw new Error('You tried to construct a Quark: '+path.join( '.' ));
			};

		if ( isQuark(t) ){
			return t;
		}else{
			root = root || bMoor.namespace.root;

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
	 * @param {object} root The root of the namespace to search, defaults to bMoor.namespace.root
	 * @return {Quark}
	 **/
	function ensure( namespace, root, debug ){
		var obj = exists( namespace, root, debug );
		
		if ( obj ){
			return dwrap( obj );
		}else{
			return makeQuark( namespace, root ).$promise;
		}
	}


	/**
	 * Accepts a string and returns back the object reference
	 *
	 * @function decode
	 * @namespace bMoor
	 * @param {string} str The string that needs to be decoded
	 * @param {object} root The root of the namespace to search, defaults to bMoor.namespace.root
	 * @return {object}
	 **/
	function decode( str, root ){
		var ch = str.charAt( 0 );
		
		if ( ch === '@' ){
			return check( str.substr(1), root );
		}else if ( ch === '-' ){
			return exists( str.substr(1), root );
		}else{
			if ( ch === '+' ){
				str = str.substr(1);
			}
			
			return ensure( str, root );
		}
	}

	/**
	 * Accepts an array, and returns an array of the same size, but the values inside it decoded to
	 * values or object referenced by the string values
	 *
	 * @function translate
	 * @namespace bMoor
	 * @param {array} arr The array to be translated
	 * @param {object} root The root of the namespace to search, defaults to bMoor.namespace.root
	 * @return {array}
	 **/
	function translate( arr, root ){
		var rtn = [];

		loop( arr, function( value, key ){
			if ( isString(value) ){
				rtn[key] = bMoor.decode( value, root );
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
	 * @param {array} req The array to be translated
	 * @param {array} translate If unknown strings should be ensured
	 * @param {object} root The root of the namespace to search, defaults to bMoor.namespace.root
	 * @return {bmoor.defer.Promise}
	 **/
	function request( req, translate, root ){
		var obj;

		if ( isString(req) ){
			return ensure( req, root );
		}else if( isArrayLike(req) ){
			obj = new DeferGroup();

			loop( req, function( r, key ){
				if ( translate && isString(r) ){
					r = ensure( r, root );
				}

				if ( isDeferred(r) ){
					r.then(function( o ){
						req[ key ] = o;
					});
					obj.add( r );
				}else{
					req[ key ] = r;
				}
			});

			obj.run();
			
			return obj.promise.then(function(){
				return req;
			});
		}
	}

	/**
	 * Will inject all requested variables into the function, returns a promise that will have the resultant of the function.
	 *
	 * @function inject
	 * @namespace bMoor
	 * @param {Injectable} arr An array with a function as the last value
	 * @param {object} root The root of the namespace to search, defaults to bMoor.namespace.root
	 * @param {object} context The context to call the function against
	 * @return {bmoor.defer.Promise}
	 **/
	function inject( arr, root, context ){
		var func;

		// TODO : is there a way to do a no wait injection?
		if ( isFunction(arr) ){
			func = arr;
			arr = [];
		}else if ( isInjectable(arr) ){
			func = arr[ arr.length - 1 ];
		}else{
			throw new Error(
				'inject needs arr to be either Injectable or Function, received:' + typeof( arr )
			);
		}

		if ( !context ){
			context = bMoor;
		}

		return request( translate(arr,root), false, root ).then(function( args ){
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

	/**
	 * String functions
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
			var length = parseInt( arr.length, 0 );

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
	 * @return {array} array containing removed element
	 **/
	function remove( arr, searchElement, fromIndex ){
		var pos = indexOf( arr, searchElement, fromIndex );

		if ( pos > -1 ){
			return arr.splice( pos, 1 )[0];
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
		var r,
			pos = indexOf( arr, searchElement, fromIndex );

		if ( pos > -1 ){
			r = removeAll( arr, searchElement, pos+1 );
			r.unshift( arr.splice(pos,1)[0] );
			
			return r;
		} else {
			return [];
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
				t = Object( this ), // jshint ignore:line
				c = parseInt( t.length, 10 ),
				res = [];

			if ( !isFunction(func) ){
				throw new Error('func needs to be a function');
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
		var cmp,
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

	register( 'undefined', undefined );

	/**
	 * The DeferPromise component for defered statements
	 *
	 * @class DeferPromise 
	 * @namespace bmoor.defer
	 * @constructor
	 **/
	function DeferPromise( defer ){
		this.defer = defer;
	}

	set( 'bmoor.defer.Promise', DeferPromise );

	extend( DeferPromise.prototype, {
		/**
		 * Initializes the element for the instance
		 * 
		 * @method then
		 * @param {function} callback The function called on success
		 * @param {function} errback The function called on error
		 * @return {bmoor.defer.Promise} A sub promise
		 **/
		'then' : function( callback, errback ){
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
		 * @return {this} Returns back the sub DeferPromise
		 **/
		'catch': function( callback ) {
			return this.then( null, callback );
		},
		/**
		 * A short cut that allows you to not need to throw inside the then
		 * 
		 * @method reject
		 * @param {something} error The function called on success
		 **/
		'reject' : function( error ){
			if ( this.sub ){
				this.sub.reject( error );
			}else{
				throw new Error('must reject from inside a then');
			}
		},
		/**
		 * Supplies a function to call on success, it doesn't create a new chain
		 * 
		 * @method done
		 * @param {function} callback The function called on success
		 * @return {this} Returns back the DeferPromise, not the generated sub DeferPromise
		 **/
		'done': function( callback ){
			this.then( callback );
			return this; // for chaining with the defer
		},
		/**
		 * Supplies a function to call on failure, it doesn't create a new chain
		 * 
		 * @method fail
		 * @param {function} callback The function called on failure
		 * @return {this} Returns back the DeferPromise, not the generated sub DeferPromise
		 **/
		'fail': function( callback ){
			this.then( null, callback );
			return this; 
		},
		// TODO
		'finally': function( callback ) {
			var dis = this;

			function makeDeferPromise(value, resolved) {
				var result = new Defer();

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
					return makeDeferPromise(e, false);
				}

				if (callbackOutput && bMoor.isFunction(callbackOutput.then)) {
					return callbackOutput.then(
						function() {
							return makeDeferPromise(value, isResolved);
						}, 
						function(error) {
							return makeDeferPromise(error, false);
						}
					);
				} else {
					return makeDeferPromise(value, isResolved);
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
		'always': function( callback ){
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
		this.handler = exceptionHandler || this.defaultHandler;
		this.callbacks = [];
		this.value = null;
		this.promise = new DeferPromise( this );
	}

	set( 'bmoor.defer.Basic', Defer );

	(function(){
		function resolution( value ){
			if ( value && value.then ) {
				return value;
			} return {
				then: function ResolutionDeferPromise( callback ){
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
				then : function RejectionDeferPromise( callback, errback ){
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
				if ( message instanceof Error ){
					throw message;
				}else{
					throw new Error(message); // keep passing the buck till someone stops it
				}
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
			 * Issue the value for the DeferPromise
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
			 * Issue the value for the DeferPromise
			 * 
			 * @method resolve
			 * @param {something} reason The reason for rejection
			 **/
			reject : function( reason ){
				this.resolve( rejection(reason) );
			},
			/**
			 * Generate a sub DeferPromise
			 * 
			 * @method sub
			 **/
			sub : function(){
				return new Defer( this.handler );
			}
		});
	}());

	/**
	 * A collection of DeferPromises that can be grouped into one
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
		function check( dg ){
			if ( dg.count === 0 && dg.loaded ){
				if ( dg.errors.length ){ 
					dg.defer.reject( dg.errors ); 
				}else{
					dg.defer.resolve( true ); 
				}
			}
		}

		function rtn( dg ){
			dg.count--; 
			check( dg ); 
		}

		extend( DeferGroup.prototype, {
			/**
			 * Add a DeferPromise to the group
			 * 
			 * @method add
			 * @param {bmoor.defer.Promise} promise A DeferPromise to add to the collection.
			 **/
			add : function( promise ){
				var dis = this;
				this.count++;

				promise.then(
					function(){
						rtn( dis );
					},
					function( error ){
						dis.errors.push( error );
						rtn( dis );
					}
				);
			},
			/**
			 * Issue when all DeferPromises have been added
			 * 
			 * @method resolve
			 * @param {something} reason The reason for rejection
			 **/
			run : function(){
				this.loaded = true;
				check( this );
			}
		});
	}());

	/**
	 * externalized wrapper for bmoor.defer.Group
	 *
	 * @function all
	 * @namespace bmoor.defer
	 * @param {...bmoor.defer.Promise} defer All of the DeferPromises to combine into one DeferPromise
	 * @return {bmoor.defer.Promise} The result promise of a bmoor.defer.Group
	 **/
	set( 'bmoor.defer.all', function(){
		var group = new DeferGroup(),
			DeferPromises;

		if ( isNumber(arguments[0].length) ){
			DeferPromises = arguments[0];
		}else{
			DeferPromises = arguments;
		}

		bMoor.forEach(DeferPromises, function(p){
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
		'namespace'   : {
			root : _root
		},
		// accessors
		'parseNS'     : parse,
		'dwrap'       : dwrap,
		'set'         : set,
		'get'         : get,
		'del'         : del,
		'exists'      : exists,
		'register'    : register, // defines an alias
		'check'       : check,	// checks for an alias
		// injection
		'makeQuark'   : makeQuark,
		'ensure'      : ensure,
		'decode'      : decode,
		'request'     : request,
		'translate'   : translate,
		'inject'      : inject,
		'plugin'      : plugin, // adds it to bMoor
		// loop
		'loop'        : loop, // array
		'each'        : each, // object
		'iterate'     : iterate, // object + safe
		'forEach'     : forEach, // picks the best to use for the instance
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
		'object' : {
			'safe'      : safe,
			'mask'      : mask,
			'equals'    : equals,
			'instantiate' : instantiate,
			// what is the difference between these?
			'extend'    : extend, // copy properties from one object to another
			'merge'     : merge, // deep version of extend
			'override'  : override, // copies in all values, but uses original object
			// modifiers
			'explode' : explode
			// TODO : implode -> convert multi layer hash into single layer hash
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
			'filter' : filter,
			'override' : arrayOverride
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
/**
Allows for the compilation of object from a definition structure

@class Compiler 
@namespace bmoor.build
@constructor
**/
bMoor.inject(
	['bmoor.defer.Basic',
	function( Defer ){
		'use strict';

		var eCompiler = bMoor.makeQuark('bmoor.build.Compiler'),
			Compiler = function(){
				this.preProcess = [];
				this.postProcess = [];
				this.clean = true;

				this.root = bMoor.namespace.root;
			},
			definitions = {},
			instance;

		/**
		 * The internal construction engine for the system.  Generates the class and uses all modules.
		 **/
		function make( dis, definition ){
			var obj,
				$d = new Defer(),
				promise = $d.promise;

			// a hash has been passed in to be processed
			if ( bMoor.isObject(definition) ){
				if ( definition.abstract ){
					obj = function Abstract(){
						throw new Error(
							'You tried to instantiate an abstract class'
						);
					};
				}else if ( definition.construct ){
					obj = definition.construct;
				}else{
					// throw namespace + 'needs a constructor, event if it just calls the parent it should be named'
					obj = function GenericConstruct(){};
					obj.$generic = true;
				}

				if ( !dis.clean ){
					dis.preProcess.sort(function( a, b ){
						return b.rank - a.rank;
					});
					dis.postProcess.sort(function( a, b ){
						return b.rank - a.rank;
					});
					
					dis.clean = true;
				}

				bMoor.loop( dis.preProcess, function( maker ){
					promise = promise.then(function( target ){
						return bMoor.inject( maker.module, definition, target ).then(function( t ){
							return t ? t : target;
						});
					});
				});

				bMoor.loop( dis.postProcess, function( maker ){
					promise = promise.then(function( target ){
						return bMoor.inject( maker.module, definition, target ).then(function( t ){
							return t ? t : target;
						});
					});
				});

				// defines a class
				definition.$aliases = {
					'this' : obj,
					whenDefined : promise
				};
				
				$d.resolve( obj );

				return promise;
			}else{
				throw new Error(
					'Constructor has no idea how to handle as definition of ' + definition
				);
			}
		}

		/**
		 * Add a module to the build process
		 *
		 * @this {bmoor.build.Compiler}
		 * @access addModule
		 *
		 * @param {number} rank The time in the build stage to run the module, negative numbers are after build
		 * @param {string} namePath Optional ability to install the module
		 * @param {array} injection The injectable element to be used as a module for building
		 */
		Compiler.prototype.addModule = function( rank, namePath, injection ){
			rank = parseInt( rank, 10 );

			this.clean = false;

			if ( arguments.length < 3 ){
				injection = namePath;
			}else{
				bMoor.set( namePath, injection[injection.length-1], this.root );
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

		/**
		 * Add a module to the build process
		 *
		 * @this {bmoor.build.Compiler}
		 * @access make
		 *
		 * @param {number} rank The time in the build stage to run the module, negative numbers are after build
		 * @param {string} namePath Optional ability to install the module
		 * @param {array} injection The injectable element to be used as a module for building
		 *
		 * @return {bmoor.defer.Promise} A quark's promise that will eventually return the defined object
		 */
		Compiler.prototype.make = function( name, definition ){
			var namespace,
				onReady,
				quark;

			if ( bMoor.isString(name) ){
				namespace = bMoor.parseNS( name );
			}else if ( bMoor.isArray(name) ){
				namespace = name;
				name = name.join('.');
			}else{
				throw new Error(
					JSON.stringify(name) + ' > ' +
					JSON.stringify(definition) + ' > ' +
					'message : you need to define a name and needs to be either a string or an array'
				);
			}
			
			definitions[ name ] = definition;

			quark = bMoor.makeQuark( namespace, this.root );
			onReady = quark.$ready;

			delete quark.$ready; // prevent accidental injection

			return this.build( definition ).then(function( result ){
				if ( result.prototype ){
					result.prototype.$namespace = name;
				}else{
					result.$namespace = name;
				}

				onReady( result );
			});
		};

		Compiler.prototype.setRoot = function( r ){
			this.root = r;
		};

		Compiler.prototype.build = function( definition ){
			var dis = this;

			if ( !bMoor.isInjectable(definition) ){
				(function(){
					var d = definition;
					definition = [function(){
						return d;
					}];
				}());
			}

			return bMoor.inject( definition, this.root ).then(function( def ){
				return make( dis, def );
			});
		};

		Compiler.prototype.remake = function(){
			var dis = this;

			this.root = bMoor.namespace.root;

			bMoor.iterate( definitions, function( definition, name ){
				dis.make( name, definition );
			});
		};

		/**
		 * Create a mock of a previously defined object
		 *
		 * @this {bmoor.build.Compiler}
		 * @access mock
		 *
		 * @param {string} name The name of the definition to create a mock of
		 * @param {object} mocks Hash containing the mocks to user to override in the build
		 *
		 * @return {bmoor.defer.Promise} A quark's promise that will eventually return the mock object
		 */
		Compiler.prototype.mock = function( name, mocks ){
			var dis = this,
				r = bMoor.object.extend( {}, this.root, mocks ),
				definition = definitions[name];

			if ( !bMoor.isInjectable(definition) ){
				// TODO : bMoor.makeInjectable
				(function(){
					var d = definition;
					definition = [function(){
						return d;
					}];
				}());
			}

			return bMoor.inject( definition, r ).then(function( def ){
				return make( dis, def );
			});
		};

		/**
		 * Set a value on the namespace, first placing a quark in its place
		 *
		 * @this {bmoor.build.Compiler}
		 * @access define
		 *
		 * @param {string} name The name of the value
		 * @param {object} value The value to define in the namespace
		 *
		 * @return {bmoor.defer.Promise} A quark's promise that will eventually return the mock object
		 */
		Compiler.prototype.define = function( name, value ){
			var quark = bMoor.makeQuark( name, this.root );
			
			if ( bMoor.isInjectable(value) ){
				bMoor.inject( value ).then( function( v ){
					quark.$ready( v );
				});
			}else{
				quark.$ready( value );
			}

			return quark.$promise;
		};

		instance = new Compiler();
		instance.$constructor = Compiler; // because it is a singleton

		bMoor.plugin( 'make', function( namespace, definition ){
			return instance.make( namespace, definition );
		});

		bMoor.plugin( 'define', function( namespace, value ){
			return instance.define( namespace, value );
		});

		bMoor.plugin( 'test', {
			remake : function(){
				instance.remake();
			},
			make : function( definition ){
				var t;

				instance.build( definition ).then(function( built ){
					t = built;
				});

				return t;
			},
			mock : function( namespace, mock ){
				var t;

				instance.mock( namespace, bMoor.object.explode(mock) ).then(function( built ){
					t = built;
				});

				return t;
			}
		});
		
		eCompiler.$ready( instance );
	}
]);
bMoor.inject(['bmoor.build.Compiler', function( compiler ){
	'use strict';

	compiler.addModule( 11, 'bmoor.build.ModExtend', 
		['-extend', function( extensions ){
			var i, c,
				proto = this.prototype;

			if ( extensions ){
				for( i = 0, c = extensions.length; i < c; i++ ){
					extensions[i]._extend( proto );
				}
			}
		}]
	);
}]);
bMoor.inject(['bmoor.build.Compiler', function( compiler ){
	'use strict';

	compiler.addModule( 5, 'bmoor.build.ModFactory', 
		['-factory', function( factories ){
			var obj = this;

			if ( factories ){
				bMoor.iterate( factories, function( factory /* factory */, name /* string */ ){
					obj[ '$'+name ] = function(){
						return factory.apply( obj, arguments );
					};
				});
			}
		}]
	);
}]);
bMoor.inject(['bmoor.build.Compiler', function( compiler ){
	'use strict';

	compiler.addModule( 1, 'bmoor.build.ModFinalize', 
		['-onMake', '-parent', function( onMake, parent ){
			if ( onMake ){
				this.$onMake = onMake;
			}else if ( parent ){
				this.$onMake = parent.$onMake;
			}
		}]
	);
}]);
bMoor.inject(['bmoor.build.Compiler',function( compiler ){
	'use strict';

	compiler.addModule( 90, 'bmoor.build.ModInherit', 
		['-id','-namespace','-name', '-mount','-parent',
		function( id, namespace, name, mount, parent ){
			var construct,
				proto;

			if ( parent ){
				construct = this;

				if ( bMoor.isFunction(parent) ){
					// we assume this a constructor function
					proto = parent.prototype;
				}else{
					// we want to inherit directly from this object
					proto = parent;
				}

				this.prototype = bMoor.object.mask( proto );
				this.prototype.constructor = construct;

				delete this.$generic;
			}
		}]
	);
}]);
bMoor.inject(['bmoor.build.Compiler',function( compiler ){
	'use strict';

	compiler.addModule( -1, 'bmoor.build.ModInstances', 
		['-instances',function( instances ){
			var obj = this;

			if ( instances ){
				bMoor.iterate( instances, function( args /* arguments to construct with */, name /* string */ ){
					obj[ '$'+name ] = bMoor.instantiate( obj, args );
				});
			}
		}]
	);
}]);
bMoor.inject(['bmoor.build.Compiler',function( compiler ){
	'use strict';

	compiler.addModule( 10, 'bmoor.build.ModProperties', 
		['-properties', function( properties ){
			var proto = this.prototype;
			
			if ( properties ){
				bMoor.each( properties, function( prop, name ){
					proto[ name ] = prop;
				});
			}
		}]
	);
}]);
bMoor.inject(['bmoor.build.Compiler',function( compiler ){
	'use strict';

	compiler.addModule( 0, 'bmoor.build.ModRegister', 
		['-id', function( id ){
			bMoor.register( id, this );
		}]
	);
}]);
(function(){
	'use strict';

	// TODO : this is no longer needed
}());

bMoor.inject(['bmoor.build.Compiler',function( compiler ){
	'use strict';

	compiler.addModule( -1, 'bmoor.build.ModSingleton', 
		['-singleton',function( singleton ){
			var t,
				obj = this;

			if ( singleton ){
				t = bMoor.object.instantiate( obj, [] );
				t.$constructor = obj;

				return t;
			}
		}]
	);
}]);
bMoor.inject(['bmoor.build.Compiler', function( compiler ){
	'use strict';

	compiler.addModule( 10, 'bmoor.build.ModStatics', 
		['-statics', function( statics ){
			var dis = this;

			if ( statics ){
				bMoor.iterate( statics, function( v, name ){
					dis[ name ] = v;
				});
			}
		}]
	);
}]);

bMoor.make( 'bmoor.defer.Stack', [function(){
	'use strict';
	
	function stackOn( stack, func, args ){
		return stack.promise.then(function(){
			return func.apply( {}, args || [] );
		});
	}

	return {
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
					this.promise = stackOn( this, func, args );
				}else{
					this.promise = func.apply( {}, args );
					if ( !this.promise.then ){
						this.promise = null;
					}
				}

				return this.promise;
			}
		}
	};
}]);
bMoor.make('bmoor.flow.Batch', 
	[ 'bmoor.flow.Timeout',
	function( Timeout ){
		'use strict';
		
		return {
			construct : function(){
				this.content = null;
				this.timeoutId = null;
				this.notices = [];
			},
			properties : {
				wrap : function( func ){
					var dis = this;

					return function(){
						dis.set( func.apply(this,arguments) );
					};
				},
				set : function( content ){
					this.registerCall();

					this.content = bMoor.object.merge(
						this.content, 
						content
					);
				},
				notice : function( callback ){
					this.notices.push( callback );
				},
				registerCall : function(){
					var dis = this,	
						notices = this.notices;

					Timeout.clear( this.timeoutId );

					this.timeoutId = Timeout.set(function(){
						var content = dis.content,
							i, c;

						dis.content = null;
						for( i = 0, c = notices.length; i < c; i++ ){
							notices[ i ]( content );
						}
					}, 30);
				}
			}
		};
	}]
);
bMoor.make( 'bmoor.flow.Interval', 
	[
	function(){
		'use strict';

		return {
			construct : function Interval(){
				this.clearAll();
			},
			properties : {
				set : function( func, interval ){
					var list = this.timeouts[ interval ],
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
				},
				clearAll : function(){
					this._c = 0;
					this.timeouts = {};
					this.hash = {};
				}
			},
			singleton : true
		};
	}]
);

bMoor.make('bmoor.flow.Regulator', 
	[ 'bmoor.flow.Timeout',
	function( Timeout ){
		'use strict';
		
		return {
			construct : function(){
				this.content = null;
				this.timeoutId = null;
				this.notices = [];
			},
			properties : {
				wrap : function( func ){
					var dis = this;

					return function(){
						dis.set( func.apply(this,arguments) );
					};
				},
				set : function( content ){
					this.registerCall();

					this.content = bMoor.object.merge(
						this.content, 
						content
					);
				},
				notice : function( callback ){
					this.notices.push( callback );
				},
				registerCall : function(){
					var dis = this,	
						notices = this.notices;

					if ( !this.timeoutId ){
						this.timeoutId = Timeout.set(function(){
							var content = dis.content,
								i, c;

							dis.content = null;
							this.timeoutId = null;

							for( i = 0, c = notices.length; i < c; i++ ){
								notices[ i ]( content );
							}
						}, 30);
					}
				}
			}
		};
	}]
);
bMoor.make( 'bmoor.flow.Timeout', 
	[
	function(){
		'use strict';

		return {
			construct : function Timeout(){
			},
			properties : {
				set : function( func, interval ){
					return setTimeout( func, interval );
				},
				clear : function( timeoutId ){
					clearTimeout( timeoutId );
				}
			},
			singleton : true
		};
	}]
);
bMoor.make( 'bmoor.error.Basic', ['@undefined',function(undefined){
	'use strict';

	return {
		parent: Error,
		construct : function ErrorBasic( message, filename, lineNumber ){
			var stack,
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
bMoor.make('bmoor.extender.Decorator', [
	function(){
		'use strict';

		function override( key, target, action ){
			var old = target[key];
			
			if ( old === undefined ){
				target[key] = action;
			} else {
				if ( bMoor.isFunction(action) ){
					if ( bMoor.isFunction(old) ){
						target[key] = function(){
							var backup = this.$wrapped,
								rtn;

							this.$wrapped = old;

							rtn = action.apply( this, arguments );

							this.$wrapped = backup;

							return rtn;
						};
					} else {
						throw 'attempting to decorate '+key+' an instance of '+typeof(old);
					}
				}else{
					throw 'attempting to decorate with '+key+' and instance of '+typeof(action);
				}
			}
		}

		return {
			construct : function Decorator(){
				throw 'You neex to extend Decorator, no instaniating it directly';
			},
			properties : {
				_extend : function( target ){
					var key;

					for( key in this ){
						if ( key.charAt(0) !== '_' ){
							override( key, target, this[key] );
						}
					}
				}
			}
		};
	}]
);
bMoor.make('bmoor.extender.Mixin', [
	function(){
		'use strict';

		return {
			construct : function Mixin(){
				throw 'You neex to extend Mixin, no instaniating it directly';
			},
			properties : {
				_extend : function( obj ){
					var key;

					for( key in this ){
						if ( key.charAt(0) !== '_' ){
							obj[key] = this[key];
						}
					}
				}
			}
		};
	}]
);
bMoor.make('bmoor.extender.Plugin', [
	function(){
		'use strict';

		function override( key, target, plugin ){
			var action = plugin[key],
				old = target[key];
			
			if ( old === undefined ){
				if ( bMoor.isFunction(action) ){
					target[key] = function(){
						return action.apply( plugin, arguments );
					};
				} else {
					target[key] = action;
				}
			} else {
				if ( bMoor.isFunction(action) ){
					if ( bMoor.isFunction(old) ){
						target[key] = function(){
							var backup = plugin.$wrapped,
								rtn;

							plugin.$wrapped = function(){
								old.apply( target, arguments );
							};

							rtn = action.apply( plugin, arguments );

							plugin.$wrapped = backup;

							return rtn;
						};
					}else{
						throw 'attempting to plug-n-play '+key+' an instance of '+typeof(old);
					}
				}else{
					throw 'attempting to plug-n-play with '+key+' and instance of '+typeof(action);
				}
			}
		}

		return {
			construct : function Plugin(){
				throw 'You neex to extend Plugin, no instaniating it directly';
			},
			properties : {
				_extend : function( target ){
					var key;

					for( key in this ){
						if ( key.charAt(0) !== '_' ){
							override( key, target, this );
						}
					}
				}
			}
		};
	}]
);
}());