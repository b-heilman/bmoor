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
