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
	function exists( space, root ){
		var curSpace = root || global,
			position,
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
		//console.trace();
		console.log( error );
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

	// string functions
	function trim( str ){
		if ( str.trim ){
			str.trim();
		}else{
			str.replace( /^\s+|\s+$/g, '' );
		}
	}

	// array functions
	function loop( arr, fn, scope ){
		var i, c;

		if ( !scope ){
			scope = arr;
		}

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

	function makeQuark( namespace, withDefer ){
		function Quark ( args ){ // TODO : I would love to name this to the class, camel cased.
			if ( this._construct && Quark.$construct ){
				if ( args && args.$arguments ){
					this._construct.apply( this,args );
				}else{
					this._construct.apply( this,arguments );
				}
			}
		}

		if ( withDefer ){
			Quark.$defer = new Defer();
		}
		
		Quark.$construct = true;
		Quark.prototype.__class = namespace;

		set( namespace, Quark );

		return Quark;
	}

	function ensure( namespace, clean ){
		var obj;

		obj = find( namespace );
		
		// TODO : handle collisions better
		if ( !obj ){
			return makeQuark( namespace, !clean );
		}else{
			return obj;
		}
	}

	function request( request, clean ){
		var rtn,
			obj;

		if ( isString(request) ){
			obj = ensure( request, clean );

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

				o = ensure( req, clean );

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
		var rtn = [];

		loop( arr, function( value, key ){
			rtn[key] = exists( value, root );
		});

		return rtn;
	}

	function inject( arr, root, context ){
		var func,
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
		// object stuff
		"create"      : create,
		"extend"      : extend,
		"copy"        : copy,
		"equals"      : equals,
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
		// string functionality
		"trim"        : trim,
		// error handling and logging
		"error"       : error,
		// other utils
		"urlResolve"  : urlResolve
	});

	set( 'bMoor', bMoor );
	set( 'bmoor', bmoor );

	Defer = ensure('bmoor.defer.Basic', true);
	DeferGroup = ensure('bmoor.defer.Group', true);

	// chicken before the egg... so bootstrap
	Defer.prototype.resolve = function( r ){
		loop( this.promise.waiting, function(func){ func(r); });
		this.promise.waiting = r;
	};
	Defer.prototype.promise = {
		waiting : [],
		then : function JunkPromise( callback ){
			if ( this.waiting.push ){
				this.waiting.push( callback );
			}else{
				callback( this.waiting );
			}
			
			return Defer.prototype.promise;
		}
	};

}( this ));
;(function( bMoor, undefined ){

	var instance,
		Defer = bMoor.ensure('bmoor.defer.Basic'),
		Compiler = bMoor.ensure('bmoor.build.Compiler');

	Compiler.prototype._construct = function(){
		this.stack = [];
		this.clean = true;
	};

	Compiler.prototype.addModule = function( rank, namePath, injection ){
		this.clean = false;

		if ( arguments.length < 3 ){
			injection = namePath;
		}else{
			bMoor.install( namePath, injection[injection.length-1] );
		}

		this.stack.push({
			rank : parseInt(rank,10),
			module : injection
		});
	};

	Compiler.prototype.make = function( settings ){
		var dis = this,
			stillDoing = true,
			$d = new Defer(),
			promise = $d.promise,
			obj,
			i, c,
			maker;
		
		if ( bMoor.isString(settings.name) ){
			settings.id = settings.name;
			settings.namespace = bMoor.parseNS( settings.name );
		}else if ( bMoor.isArray(settings.name) ){
			settings.namespace = settings.name;
			settings.id = settings.name.join('.');
		}else{
			throw 'you need to define a name and needs to be either a string or an array';
		}

		obj = bMoor.ensure( settings.id );
		settings.name = settings.namespace.pop();
		settings.mount = bMoor.get( settings.namespace );

		if ( !this.clean ){
			this.stack.sort(function( a, b ){
				return b.rank - a.rank;
			});
			this.clean = true;
		}

		$d.resolve( obj );

		bMoor.loop( this.stack, function( maker ){
			promise = promise.then(function(){ 
				bMoor.inject( maker.module, settings, obj ); 
			});
		});

		promise.then(function(){
			if ( obj.prototype.__postMake ){
				obj.prototype.__postMake( obj );
			}

			if ( obj.$defer ){
				obj.$defer.resolve( obj );
				obj.$loaded = true; // what do I use this for?  Thinking vestigial
			}

			return obj;
		});

		return obj;
	};

	instance = new Compiler();

	Compiler.$instance = instance;
	Compiler.$defer.resolve( Compiler );

	bMoor.install( 'bmoor.build.Compiler', Compiler );
	bMoor.install( 'bmoor.build.$compiler', instance );
	bMoor.plugin( 'define', function( settings ){
		return instance.make( settings );
	});

}( bMoor ));
;(function(){

	bMoor.request('bmoor.build.Compiler').then(function( Compiler ){
		Compiler.$instance.addModule( 20, 'bmoor.build.ModConstruct', ['construct', 'id', function( construct, id ){
			if ( construct ){
				this.prototype._construct = construct;
			}
		}]);
	});

}());
;(function(){

	bMoor.request('bmoor.build.Compiler').then(function( Compiler ){
		Compiler.$instance.addModule( 9, 'bmoor.build.ModDecorate', ['decorators', function( decorators ){
			var obj = this.prototype;

			if ( decorators ){
				if ( !bMoor.isArray( decorators ) ){
					throw 'the decoration list must be an array';
				}

				return bMoor.request( decorators ).then(function( decs ){
					bMoor.loop( decs, function( dec ){
						if ( dec.$singleton ){
							dec.$singleton.$decorate( obj );
						}
					});
				});
			}
		}]);
	});

}());
;(function(){

	bMoor.request('bmoor.build.Compiler').then(function( Compiler ){
		Compiler.$instance.addModule( 5, 'bmoor.build.ModFactory', ['factory', function( factory ){

			var obj = this;

			if ( factory ){
				obj.$make = function(){
					var args = arguments;
					args.$arguments = true;
					return new obj( args );
				};
			}
		}]);
	});

}());;(function(){

	bMoor.request('bmoor.build.Compiler').then(function( Compiler ){
		Compiler.$instance.addModule( 1, 'bmoor.build.ModFinalize', 
			['namespace','name', 'mount', 'postMake', function( namespace, name, mount, postMake ){

			var obj = this,
				old,
				proto = obj.prototype;

			proto.__namespace = namespace;
			proto.__name = name;
			proto.__mount = mount;

			if ( postMake ){
				if ( proto.__postMake ){
					old = proto.__postMake;
					proto.__postMake = function(){
						old( obj );
						
						if ( postMake ){
							postMake( obj );
						}
					};
				}else{
					proto.__postMake = postMake;
				}
			}
		}]);
	});

}());
;(function(){

	bMoor.request('bmoor.build.Compiler').then(function( Compiler ){
		Compiler.$instance.addModule( 90, 'bmoor.build.ModInherit', ['parent', function( parent ){
			var className;

			if ( parent ){
				Parent = bMoor.ensure( parent );
				className = Parent.prototype.__class;

				if ( Parent.$construct !== undefined ){
					Parent.$construct = false;
					this.prototype = new Parent();
					Parent.$construct = true;
				}else{
					this.prototype = new Parent();
				}
				
				this.prototype.constructor = this;
				this.prototype[ className ] = Parent.prototype;
			}
		}]);
	});

}());
;(function(){

	bMoor.request('bmoor.build.Compiler').then(function( Compiler ){
		Compiler.$instance.addModule( 4, 'bmoor.build.ModPlugin', ['plugins', function( plugins ){
			var obj = this.$instance || this;

			bMoor.iterate( plugins, function( func, plugin ){
				if ( bMoor.isString(func) ){
					func = obj[ func ];
				}

				bMoor.plugin( plugin, function(){ 
					return func.apply( obj, arguments ); 
				});
			});
		}]);
	});

}());
;(function(){

	bMoor.request('bmoor.build.Compiler').then(function( Compiler ){
		function def( obj, properties ){
			var name;

			for( name in properties ){
				obj.prototype[name] = properties[name];
			}
		}

		Compiler.$instance.addModule( 10, 'bmoor.build.ModPropertoes', ['properties', function( properties ){
			var dis = this;

			if ( bMoor.isArray(properties) ){
				return bMoor.inject( properties, true ).then(function( props ){
					def( dis, props );
				});
			}else{
				def( this, properties );
			}
		}]);
	});

}());
;(function(){

	bMoor.request('bmoor.build.Compiler').then(function( Compiler ){
		Compiler.$instance.addModule( 0, 'bmoor.build.ModRegister', ['id', function( id ){
			bMoor.register( id, this );
		}]);
	});

}());
;(function(){

	bMoor.request('bmoor.build.Compiler').then(function( Compiler ){
		Compiler.$instance.addModule( 100, 'bmoor.build.ModRequire', ['require', function( require ){
			var group = new bmoor.defer.Group(),
				classes,
				aliases;

			if ( require ){
				if ( bMoor.isString(require) ){
					classes = [ require ];
				}else if ( bMoor.isArrayLike(require) ){
					classes = require;
				}else{
					classes = require.classes;
					aliases = require.aliases;
				}
				
				bMoor.loop( classes, function( namespace ){
					group.add( bmoor.comm.$require.one(namespace) );
				});

				bMoor.iterate( aliases, function( namespace, alias ){
					group.add( bmoor.comm.$require.one(namespace, true, alias) );
				});
			}

			return group.promise;
		}]);
	});

}());
;(function(){

	bMoor.request('bmoor.build.Compiler').then(function( Compiler ){
		Compiler.$instance.addModule( 5, 'bmoor.build.ModSingleton', 
			['singleton', 'name', 'mount',function( singleton, name, mount ){

			var obj = this;

			if ( singleton ){
				if ( !bMoor.isArray(singleton) ){
					singleton = [];
				}

				singleton.$arguments = true;

				obj.$instance = mount[ '$'+name.toLowerCase() ] = new obj( singleton );
			}
		}]);
	});

}());;(function( undefined ){
	
	function resolution( value ){
		if ( value && value.then ) return value;
		return {
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

	bMoor.define({
		name : 'bmoor.defer.Basic',
		construct : function( exceptionHandler ){
			this.handler = exceptionHandler || this.defaultHandler;
			this.callbacks = [];
			this.value = null;
			this.promise = new bmoor.defer.Promise( this );
		},
		properties : {
			defaultHandler : function( ex ){ bMoor.error(ex); },
			defaultSuccess : function( value ){ return value; },
			defaultFailure : function( message ){ return undefined; },
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
		}
	});
}());
;(function(){
	
	function check(){
		if ( this.count === 0 && this.loaded ){
			if ( this.errors.length ){
				this.defer.reject( errors );
			}else{
				this.defer.resolve( true );
			}
		}
	}

	function rtn(){
		this.count--;
		check.call( this );
	}

	bMoor.define({
		name : 'bmoor.defer.Group',
		construct : function(){
			this.count = 0;
			this.loaded = false;
			this.errors = [];
			this.defer = new bmoor.defer.Basic();
			this.promise = this.defer.promise;
		},
		properties : {
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
		},
		plugins : {
			'allDone' : function(){
				var inst = this,
					group = new inst(),
					promises;

				if ( arguments.length > 1 ){
					promises = arguments;
				}else{
					promises = arguments[0];
				}

				if ( bMoor.isArrayLike(promises) ){
					bMoor.loop(promises, function(p){
						group.add( p );
					});
				}else{
					bMoor.iterate(promises, function(p){
						group.add( p );
					});
				}

				group.run();

				return group.promise;
			}
		}
	});

}());;(function( undefined ){
	console.log( '==+==' );
	bMoor.define({
		name : 'bmoor.defer.Promise',
		construct : function( defer ){
			this.defer = defer;
		},
		properties : {
			"then" :  function( callback, errback ){
				var defer = this.defer,
					sub = this.defer.sub(),
					tCallback,
					tErrback;

				tCallback = function( value ){
					try{
						sub.resolve( (callback||defer.defaultSuccess)(value) );
					}catch( ex ){
						sub.reject( ex );
						defer.handler( ex );
					}
				};

				tErrback = function( value ){
					try{
						sub.resolve( (errback||defer.defaultFailure)(value) );
					}catch( ex ){
						sub.reject( ex );
						defer.handler( ex );
					}
				};

				defer.register( tCallback, tErrback );

				return sub.promise;
			},
			"done": function(callback){
				return this.then( callback );
			},
			"fail": function(callback){
				return this.then( null, callback );
			},
			"always": function(callback){
				return this['finally']( callback );
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
		}
	});
}());
;(function(){
	
	function stackOn( func, args ){
		return this.promise.then(function(){
			return func.apply( {}, args || [] );
		});
	}

	bMoor.define({
		name : 'bmoor.defer.Group',
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
	
	bMoor.define({
		name : 'bmoor.comm.Connector',
		properties : {
			request : function( type, options ){
				var request = new bmoor.comm[type]( options );

				return request.$defer.promise;
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
				
				img.onload = function(){
					$d.resolve( true );
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

	bMoor.define({
		name : 'bmoor.comm.Http',
		construct : function( options ){
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

			this.url = bMoor.urlResolve(options.url);
			this.status = null;
			this.connection = xhr;
			this.$defer = new bmoor.defer.Basic();

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
				var action,
					status = this.status,
					protocol = this.url.protocol;

				this.connection = null;

				// fix status code for file protocol (it's always 0)
				status = (protocol == 'file' && status === 0) ? (response ? 200 : 404) : status;

				// normalize IE bug (http://bugs.jquery.com/ticket/1450)
				status = status == 1223 ? 204 : status;

				action = ( 200 <= status && status < 300 ) ? 'resolve' : 'reject';

				this.$defer[action]({
					data : response,
					status : status,
					headers : headers
				});
			}
		} 
	});
}());
;(function( bMoor, undefined ){
	"use strict";

	bMoor.define({
		'name' : 'bmoor.comm.Registry',
		singleton: true,
		construct : function(){
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
		plugins : {
			'ns.locate' : function( ns ){
				return this.locate( ns );
			},
			'ns.register' : function( className, path, settings, catchAll ){
				return this.set( className, path, settings, catchAll );
			}
		},
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

}( bMoor ));;(function( undefined ){

	bMoor.define({
		name : 'bmoor.comm.Require',
		singleton : true,
		properties : {
			forceSync : false,
			one : function( requirement, async, alias ){
				var req;

				req = bMoor.exists(requirement);

				if ( !req ){
					req = new bmoor.comm.Script( 
						bMoor.ns.locate(alias||requirement)+'.js', 
						this.forceSync ? false : async 
					);

					if ( async === false ){
						return bMoor.exists( requirement );
					}else{
						return req.$defer.promise.then(function(){
							var t = bMoor.exists( requirement );

							if ( t.$defer ){
								return t.$defer.promise;
							}else{
								return t;
							}
						});
					}
				}else{
					if ( async === false ){
						return req;
					}else{
						if ( req.$defer ) {
							return req.$defer.promise;
						}else{
							return bMoor.dwrap( req );
						}
					}
				}
			},
			hash : function( aliases ){
				var key,
					group = bmoor.defer.Group();

				for( key in aliases ){
					group.add( this.one(key,true,aliases[key]) );
				}

				group.run();
			},
			list : function( requirements ){
				var i, c,
					group = bmoor.defer.Group();

				for( i = 0, c = requirements.length; i < c; i++ ){
					group.add( this.one(requirements[i]) );
				}
			}
		},
		plugins : {
			'require' : function( require, alias ){
				var el;

				this.forceSync = true;
				el = this.one( require, false, alias );
				this.forceSync = false;

				return el;
			}
		}
	});

}());
;(function( undefined ){
	"use strict";

	bMoor.define({
		name : 'bmoor.comm.Resource',
		construct : function( src, async ){
			var dis = this;

			this.$defer = new bmoor.defer.Basic();

			(new bmoor.comm.Http({
				'method' : 'GET',
				'url' : src,
				'async' : async
			})).$defer.promise.then( 
				function resourceSuccess( response ){
					dis.apply( response.data );
					dis.success();
				},
				function resourceFailure(){ 
					dis.failure();
				}
			);
		},
		properties : {
			apply : function( content ){},
			success : function(){
				this.status = 200;
				this.resolve();
			},
			failure : function(){
				this.status = 404;
				this.resolve();
			},
			resolve : function(){
				if ( this.status === 200 ){
					this.$defer.resolve();
				}else{
					this.$defer.reject();
				}
			}
		}
	});

}());;(function(){

	bMoor.define({
		name : 'bmoor.comm.Script',
		parent : 'bmoor.comm.Resource',
		properties : {
			apply : function scriptApply( content ){
				var script = document.createElement( 'script' );

				script.text = content;
				document.body.appendChild( script );
			}
		}
	});

}());;(function(){

	bMoor.define({
		name : 'bmoor.comm.Style',
		parent : 'bmoor.comm.Resource',
		properties : {
			apply : function styleApply( content ){
				var style = document.createElement( 'style' );

				if (style.styleSheet){
					style.styleSheet.cssText = content;
				} else {
					style.appendChild( document.createTextNode(content) );
				}
				
				document.body.appendChild( style );
			}
		}
	});
}());;(function( bMoor ){

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

	bMoor.define({
		name : 'bmoor.core.Decorator',
		postMake : function( inst ){
			inst.$singleton = new inst();
		},
		properties : {
			$decorate : function( obj ){
				var key;
				
				for( key in this ){
					if ( key === '_construct' || key === '$decorate' ){
						// 
						continue;
					}else if ( key === '__construct' ){
						// the default override is post
						override( '_construct', obj, this[key] );
					}else if ( obj[key] ){
						// the default override is post
						override( key, obj, this[key] );
					}else{
						obj[key] = this[key];
					}
				}
			}
		}
	});

}( this.bMoor ));