;(function( global, undefined ){
	"use strict";

	var bMoor = global.bMoor || {},
		bmoor = global.bmoor || {},
		aliases = {},
		Defer,
		DeferGroup;

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
		var d = new Defer(); 
		d.resolve( value ); 
		return d.promise;
	}

	function require( space, root ){ 
		return find( space, root ); 
	} // alias for get here

	function request( space, root, notAClass ){ 
		return dwrap( require(space, root) ); 
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

	function translate( arr, async, root ){
		var rtn = [],
			group;

		if ( async ){
			group = new DeferGroup();

			loop( arr, function( value, key ){
				group.add( request(value,root).then(function( obj ){ rtn[key] = obj; }) );
			});

			group.run();

			return group.promise.then(
				function(){ return rtn; },
				function( errors ){
					error( 'translation failure', errors );
					throw 'unable to request for translation';
				}
			);
		}else{
			loop( arr, function( value, key ){
				rtn[key] = exists( value, root );
			});

			return rtn;
		}
	}

	function inject( arr, async, context, root ){
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

		res = translate( arr, async, root );
		arr.push( func ); // put it back on...

		if ( async ){
			return res.then(
				function( trans ){ return func.apply( context, trans ); },
				function( errors ){ error( 'injection error', errors ); }
			);
		}else{
			return func.apply( context, res );
		}
	}

	function plugin( plugin, obj ){ 
		set( plugin, obj, bMoor ); 
	}

	function makeQuark( namespace, withDefer ){
		function Quark ( args ){ 
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

	/**
	Externalizing the functionality
	**/
	extend( bMoor, {
		// namespace interactions
		"parse"       : parse,
		"set"         : set,
		"get"         : get,
		"exists"      : exists,
		"register"    : register,
		"check"       : check,
		"find"        : find,
		"install"     : install,
		"require"     : require, // alias for find here
		"request"     : request, // wraps require with a defer
		"translate"   : translate,
		"inject"      : inject,
		"plugin"      : plugin,
		"makeQuark"   : makeQuark,
		"ensure"      : ensure,
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
		"error"       : error
	});

	set( 'bMoor', bMoor );
	set( 'bmoor', bmoor );

	Defer = ensure('bmoor.defer.Basic', true);
	DeferGroup = ensure('bmoor.defer.Group', true);

	// chicken before the egg... so bootstrap
	Defer.prototype.resolve = function(){};
	Defer.prototype.promise = {
		then : function JunkPromise( callback ){
			callback();
			return Defer.prototype.promise;
		}
	};

}( this ));
;(function( bMoor, undefined ){

	var instance,
		Defer = bMoor.ensure('bmoor.defer.Basic');

	function Compiler(){
		this.stack = [];
		this.clean = true;
	}

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
			settings.namespace = bMoor.parse( settings.name );
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
				bMoor.inject( maker.module, false, obj, settings ); 
			});
		});


		return promise.then(function(){
			if ( obj.prototype.__postMake ){
				obj.prototype.__postMake( obj );
			}

			if ( obj.$defer ){
				obj.$defer.resolve( true );
				delete obj.$defer;
			}

			return obj;
		});
	};

	instance = new Compiler();

	bMoor.install( 'bmoor.build.Compiler', Compiler );
	bMoor.plugin( ['compiler'], instance );
	bMoor.plugin( ['define'], function( settings ){
		return instance.make( settings );
	});

}( bMoor ));
;(function( compiler ){

	compiler.addModule( 20, 'bmoor.build.ModConstruct', ['construct', 'id', function( construct, id ){
		if ( construct ){
			this.prototype._construct = construct;
		}
	}]);

}( bMoor.compiler ));
;(function( compiler ){

	compiler.addModule( 9, 'bmoor.build.Decorate', ['decorators', function( decorators ){
		var obj = this.prototype;

		if ( decorators ){
			if ( !bMoor.isArray( decorators ) ){
				throw 'the decoration list must be an array';
			}

			return bMoor.translate( decorators, true ).then(function( decs ){
				bMoor.loop( decs, function( dec ){
					if ( dec.$singleton ){
						dec.$singleton.$decorate( obj );
					}
				});
			});
		}
	}]);

}( bMoor.compiler ));
;(function( compiler ){

	compiler.addModule( 5, 'bmoor.build.ModFactory', ['factory', 'mount', 
		function( factory, namespace ){

		var obj = this,
			def;

		if ( factory ){
			namespace[ factory ] = function(){
				var args = arguments;
				args.$arguments = true;
				return new obj( args );
			};
		}
	}]);

}( bMoor.compiler ));;(function( bMoor, compiler ){

	compiler.addModule( 1, 'bmoor.build.Finalize', ['namespace','name', 'id', 'mount', 'postMake', 
		function( namespace, name, id, mount, postMake ){

		var obj = this,
			old,
			proto = obj.prototype;

		proto.__namespace = namespace;
		proto.__name = name;
		proto.__class = id;
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

}( bMoor, bMoor.compiler ));
;(function( bMoor, compiler ){

compiler.addModule( 90, 'bmoor.build.Inherit', ['parent', function( Parent ){
	Parent = bMoor.find(Parent);

	if ( Parent ){
		if ( Parent.$construct !== undefined ){
			Parent.$construct = false;
			this.prototype = new Parent();
			Parent.$construct = true;
		}else{
			this.prototype = new Parent();
		}
		
		this.prototype.constructor = this;
		this.prototype[ Parent.prototype.__class ] = Parent.prototype;
	}
}]);

}( bMoor, bMoor.compiler ));
;(function( bMoor, compiler ){

	function def( obj, properties ){
		var name;

		for( name in properties ){
			obj.prototype[name] = properties[name];
		}
	}

	compiler.addModule( 10, ['properties', function( properties ){
		var dis = this;

		if ( bMoor.isArray(properties) ){
			/**
				allows you to define ['Class1','Class2', function(Class1, Class2){
					return {
						getClass1(){
							return new Class1();
						}
					}
				}];
			**/
			return bMoor.inject( properties, true ).then(function( props ){
				def( dis, props );
			});
		}else{
			def( this, properties );
		}
	}]);

}( bMoor, bMoor.compiler ));
;(function( bMoor, compiler ){

	compiler.addModule( 0, 'bmoor.build.Register', ['id', function( id ){
		bMoor.register( id, this );
	}]);

}( bMoor, bMoor.compiler ));
;(function( compiler ){

compiler.addModule( 5, 'bmoor.build.Singleton', ['singleton', 'mount', 'name', 
	function( singleton, namespace, name ){

	var obj = this,
		def;

	name = name.charAt(0).toLowerCase() + name.slice(1);
	
	if ( singleton ){
		if ( !bMoor.isArray(singleton) ){
			singleton = [];
		}

		singleton.$arguments = true;

		obj.$singleton = namespace[ name ] = new obj( singleton );
	}
}]);

}( bMoor.compiler ));;(function(){
	function _then( callback, errback ){
		var dis = this,
			sub = this.sub(),
			tCallback,
			tErrback;

		tCallback = function( value ){
			try{
				sub.resolve( (callback||dis.defaultSuccess)(value) );
			}catch( ex ){
				sub.reject( ex );
				dis.handler( ex );
			}
		};

		tErrback = function( value ){
			try{
				sub.resolve( (errback||dis.defaultFailure)(value) );
			}catch( ex ){
				sub.reject( ex );
				dis.handler( ex );
			}
		};

		if ( this.value ){
			this.value.then( tCallback, tErrback );
		}else{
			this.callbacks.push( [tCallback, tErrback] );
		}

		return sub.promise;
	}

	function resolution( value ){
		if ( value && value.then ) return value;
		return {
			then: function ResolutionPromise( callback ){
				callback( value );
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
			this.init();
		},
		properties : {
			defaultHandler : function( ex ){ bMoor.error(ex); },
			defaultSuccess : function( value ){ return value; },
			defaultFailure : function( message ){ return undefined; },
			init : function(){
				var dis = this;

				this.promise = {
					then :  function BasicPromise( callback, errback ){
						return _then.call( dis, callback, errback );
					}
				};
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
			add : function( defered ){
				var dis = this;
				this.count++;

				defered.then(
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
		require : [
			'bmoor.build.Decorate'
		],
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