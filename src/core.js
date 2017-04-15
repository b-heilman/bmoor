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
function isUndefined( value ) {
	return value === undefined;
}

/**
 * Tests if the value is not undefined
 *
 * @function isDefined
 * @param {*} value The variable to test
 * @return {boolean}
 **/
function isDefined( value ) {
	return value !== undefined;
}

/**
 * Tests if the value is a string
 *
 * @function isString
 * @param {*} value The variable to test
 * @return {boolean}
 **/
function isString( value ){
	return typeof value === 'string';
}

/**
 * Tests if the value is numeric
 *
 * @function isNumber
 * @param {*} value The variable to test
 * @return {boolean}
 **/
function isNumber( value ){
	return typeof value === 'number';
}

/**
 * Tests if the value is a function
 *
 * @function isFuncion
 * @param {*} value The variable to test
 * @return {boolean}
 **/
function isFunction( value ){
	return typeof value === 'function';
}

/**
 * Tests if the value is an object
 *
 * @function isObject
 * @param {*} value The variable to test
 * @return {boolean}
 **/
function isObject( value ){
	return value  && typeof value === 'object';
}

/**
 * Tests if the value is a boolean
 *
 * @function isBoolean
 * @param {*} value The variable to test
 * @return {boolean}
 **/
function isBoolean( value ){
	return typeof value === 'boolean';
}

/**
 * Tests if the value can be used as an array
 *
 * @function isArrayLike
 * @param {*} value The variable to test
 * @return {boolean}
 **/
function isArrayLike( value ) {
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
 * @param {*} value The variable to test
 * @return {boolean}
 **/
function isArray( value ) {
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

function parse( path ){
	if ( !path ){
		return [];
	}else if ( isString(path) ){
		return path.split('.');
	}else if ( isArray(path) ){
		return path.slice(0);
	}else{
		throw new Error(
			'unable to parse path: '+
			path+ ' : '+typeof(path)
		);
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
function set( root, space, value ){
	var i, c, 
		old,
		val,
		nextSpace,
		curSpace = root;
	
	space = parse(space);

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

function makeSetter( space ){
	var i,
		fn,
		readings = parse(space);

	for( i = readings.length-1; i > -1; i-- ){
		fn = _makeSetter( readings[i], fn );
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
function get( root, path ){
	var i, c,
		space,
		nextSpace,
		curSpace = root;
	
	space = parse(path);
	if ( space.length ){
		for( i = 0, c = space.length; i < c; i++ ){
			nextSpace = space[i];
				
			if ( isUndefined(curSpace[nextSpace]) ){
				return;
			}
			
			curSpace = curSpace[nextSpace];
		}
	}

	return curSpace;
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

function makeGetter( path ){
	var i,
		fn,
		space = parse(path);

	if ( space.length ){
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

/**
 * Delete a namespace, returns the old value
 *
 * @function del
 * @param {object} root The root of the namespace, bMoor.namespace.root if not defined
 * @param {string|array} space The namespace
 * @return {*}
 **/
function del( root, space ){
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
 * @param {array} arr The array to iterate through
 * @param {function} fn The function to call against each element
 * @param {object} context The context to call each function against
 **/
function loop( arr, fn, context ){
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
 * @param {object} arr The object to iterate through
 * @param {function} fn The function to call against each element
 * @param {object} context The context to call each function against
 **/
function each( obj, fn, context ){
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
 * @param {object} obj The object to iterate through
 * @param {function} fn The function to call against each element
 * @param {object} context The scope to call each function against
 **/
function iterate( obj, fn, context ){
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
 * @param {object} obj - The object to iterate through
 * @param {function} fn - The function to call against each element
 * @param {object} scope - The scope to call each function against
 **/
function safe( obj, fn, context ){
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

function naked( obj, fn, context ){
	safe( obj, function( t, k, o ){
		if ( !isFunction(t) ){
			fn.call( context, t, k, o );
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