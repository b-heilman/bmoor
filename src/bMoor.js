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

	function instantiate( obj, args ){
		var i, c,
			construct;

		construct = 'return new obj(';

		for( i = 0, c = args.length; i < c; i++ ){
			if ( i ){
				construct += ',';
			}

			construct += 'args['+i+']';
		}

		construct += ')';
		/*jshint -W054 */
		return ( new Function('obj','args',construct) )( obj, args );
	}

	/*
		set a value for a root space
		returns the old value
	*/
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
	
	/*
		delete a variable from a root space
		return the value removed
	*/
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

	/*
		get a variable from root space
	*/
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

	/*
		map a hash into an object
	*/
	function map( mappings, root ){
		if ( !root ){
			root = {};
		}

		iterate( mappings, function( obj, mapping ){
			set( mapping, obj, root );
		});

		return root;
	}

	/*
		returns back the space or undefined
	*/
	function _exists( space, curSpace ){
		var position,
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

	/*
		return back the variable in the space, undefined otherwise
		accepts a list of roots or just one
	*/
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

	/**
		register an alias
	**/
	function register( alias, obj ){ 
		aliases[ alias ] = obj; 
	}

	/**
		look to see if an alias is defined
	**/
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
		if ( isObject(error) && error.stack ){
			console.warn( error );
			console.debug( error.stack );
		}else{
			console.warn( error );
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

		if ( isQuark(value) ){
			return value.$promise; // this way they get when the quark is ready
		}else{
			d = new Defer(); 
			d.resolve( value );
			return d.promise;
		}
	}

	function isEmpty( obj ){
		var key;

		if ( isObject(obj) ){
			for( key in obj ){ 
				if ( obj.hasOwnProperty(key) ){
					return false;
				}
			}
		}else if ( isArrayLike(obj) ){
			return obj.length === 0;
		}

		return true;
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

	function isBoolean(value){
		return typeof value === 'boolean';
	}

	// type  checks
	function isArrayLike(obj) {
		// for me, if you have a length, I'm assuming you're array like, might change
		return obj && (typeof obj.length === 'number') && obj.push;
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

		for( key in obj ){ 
			if ( obj.hasOwnProperty(key) && key.charAt(0) !== '_' && 
				key !== 'prototype' && key !== 'length' && 
				key !== 'name' 
			){
				fn.call( scope, obj[key], key, obj );
			}
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

	

	function isQuark( def ){
		return typeof(def) === 'function' && def.$isQuark;
	}

	function makeQuark( namespace ){
		var path,
			defer,
			quark = function Quark ( args ){}

		quark.$isQuark = true;

		path = parse( namespace )

		if ( Defer ){
			defer = new Defer();

			quark.$promise = defer.promise;
			quark.$ready = function( obj ){
				if ( defer.resolve ){
					defer.resolve( obj );
				}

				// replace yourself
				if ( path ){
					set( path, obj );
				}
			};
		}

		set( path, quark );

		return quark;
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

	function translate( arr, root ){
		var lead,
			rtn = [];

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

	function request( request, root ){
		var obj;

		if ( isString(request) ){
			obj = ensure( request, root );

			if ( isQuark(obj) ){
				// was created by the system
				return obj.promise;
			}else{
				// some other object, need to play nice
				return dwrap( obj );
			}
		}else if( isArrayLike(request) ){
			obj = new DeferGroup();

			loop( request, function( req, key ){
				if ( isQuark(req) ){
					req.$promise.then(function( o ){
						request[ key ] = o;
					});
					obj.add( req.$promise );
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

	function isInjectable( obj ){
		return isArray( obj ) && isFunction( obj[obj.length-1] );
	}

	function inject( arr, root, context ){
		var i, c,
			rtn,
			func,
			args;

		// TODO : is there a way to do a no wait injection?
		if ( isFunction(arr) ){
			func = arr;
			arr = [];
		}else if ( isArray(arr) ){
			func = arr[ arr.length - 1 ];
		}else{
			throw 'inject needs arr to be either Array or Function';
		}

		return request( translate(arr,root) ).then(function( args ){
			return func.apply( context, args );
		});
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
	
	function Promise( defer ){
		this.defer = defer;
	}
	
	set( 'bmoor.defer.Promise', Promise );

	extend( Promise.prototype, {
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
		"reject" : function( error ){
			// a short cut that allows you to not need to throw inside the then
			if ( this.sub ){
				this.sub.reject( error );
			}else{
				throw 'must reject from inside a then';
			}
		},
		"done": function(callback){
			this.then( callback );
			return this; // for chaining with the defer
		},
		"fail": function(callback){
			this.then( null, callback );
			return this; 
		},
		"always": function(callback){
			this['finally']( callback );
			return this;
		},
		"catch": function(callback) {
			return this.then(null, callback);
		},
		"finally": function(callback) {
			function makePromise(value, resolved) {
				var result = bmoor.defer.Basic();

				if (resolved) {
					result.resolve(value);
				} else {
					result.reject(value);
				}

				return result.promise;
			}

			function handleCallback(value, isResolved) {
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
		}
	});

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
			defaultHandler : function( ex ){ bMoor.error.report(ex); },
			defaultSuccess : function( value ){ return value; },
			defaultFailure : function( message ){ throw message; }, // keep passing the buck till someone stops it
			register : function( callback, failure ){
				if ( this.value ){
					this.value.then( callback, failure );
				}else{
					this.callbacks.push( [callback, failure] );
				}
			},
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
			reject : function( reason ){
				this.resolve( rejection(reason) );
			},
			sub : function(){
				return new bmoor.defer.Basic( this.handler );
			}
		});
	}());

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
			run : function(){
				this.loaded = true;
				check.call( this );
			}
		});
	}());
	/**
	Externalizing the functionality
	**/
	extend( bMoor, {
		// namespace interactions
		'parseNS'     : parse,
		'dwrap'       : dwrap,
		'set'         : set,
		'get'         : get,
		'del'         : del,
		'map'         : map,
		'exists'      : exists,
		'register'    : register,
		'check'       : check,
		'find'        : find,
		'install'     : install,
		'ensure'      : ensure,
		'request'     : request,
		'translate'   : translate,
		'inject'      : inject,
		'plugin'      : plugin,
		'makeQuark'   : makeQuark,
		'instantiate' : instantiate,
		// allow a type expectation
		'loop'        : loop, // array
		'each'        : each, // object
		'iterate'     : iterate, // object + safe
		// general looping
		'forEach'     : forEach,
		// all the is tests
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
		// object stuff
		'object' : {
			'create'      : create,
			'extend'      : extend,
			'copy'        : copy,
			'equals'      : equals
		},
		// string functionality 
		'string'      : {
			'trim' : trim 
		},
		// array functionality
		'array'       : {
			'compare' : compareFunc,
			'indexOf' : indexOf,
			'remove' : remove,
			'removeAll' : removeAll,
			'filter' : filter
		},
		// error handling and logging : TODO : move verbose error handling
		'error'       : {
			report : error
		},
		// other utils - TODO : move out
		'url' : {
			'resolve'  : urlResolve
		},
		// defer functions
		'defer' : {
			'all' : function(){
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
			}
		}
	});
}( this ));
