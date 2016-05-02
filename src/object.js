var bmoor = require('./core.js');

export function values( obj ){
	var res = [];

	bmoor.naked( obj, function( v ){
		res.push( v );
	});

	return res;
}

export function keys( obj ){
	var res = [];

	if ( Object.keys ){
		return Object.keys(obj);
	}else{
		bmoor.naked( obj, function( v, key ){
			res.push( key );
		});

		return res;
	}
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
export function explode( target, mappings ){
	bmoor.iterate( mappings, function( val, mapping ){
		bmoor.set( target, mapping, val );
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
export function mask( obj ){
	if ( Object.create ){
		var T = function Masked(){};

		T.prototype = obj;

		return new T();
	}else{
		return Object.create( obj );
	}
}

/**
 * Create a new instance from an object and some arguments.  This is a shallow copy to <- from[...]
 * 
 * @function extend
 * @namespace bMoor
 * @param {object} to Destination object.
 * @param {...object} src Source object(s).
 * @returns {object} Reference to `dst`.
 **/
export function extend( to ){
	bmoor.loop( arguments, function(cpy){
		if ( cpy !== to ) {
			if ( to && to.extend ){
				to.extend( cpy );
			}else{
				bmoor.iterate( cpy, function(value, key){
					to[key] = value;
				});
			}
			
		}
	});

	return to;
}

export function empty( to ){
	bmoor.iterate( to, function( v, k ){
		delete to[k]; // TODO : would it be ok to set it to undefined?
	});
}

export function copy( to ){
	empty( to );

	return extend.apply( undefined, arguments );
}

// Deep copy version of extend
export function merge( to ){
	var from,
		i, c,
		m = function( val, key ){
			to[ key ] = merge( to[key], val );
		};

	for( i = 1, c = arguments.length; i < c; i++ ){
		from = arguments[i];

		if ( to === from || !from ){
			continue;
		}else if ( to && to.merge ){
			to.merge( from );
		}else if ( !bmoor.isObject(to) ){
			if ( bmoor.isObject(from) ){
				to = merge( {}, from );
			}else{
				to = from;
			}
		}else{
			bmoor.safe( from, m );
		}
	}
	
	return to;
}

/*
function arrayOverride( to, from, deep ){
	var i, c,
		f,
		t;

	if ( isArrayLike(to) && isArrayLike(from) ){
		to.length = from.length;
	}

	for( i = 0, c = from.length; i < c; i++ ){
		f = from[i];
		t = to[i];

		if ( t === undefined && !deep ){
			to[ i ] = f;
		} else if ( isArrayLike(f) ){
			if ( !isArrayLike(t) ){
				t = to[i] = [];
			}

			arrayOverride( t, f, deep );
		} else if ( isObject(f) ){
			if ( !isObject(t) ){
				t = to[i] = {};
			}

			override( t, f, deep );
		} else if ( f !== t ){
			to[ i ] = f;
		}
	}

	return to;
}

// will do a deep copy of to <- from[1], removing anything in to that isn't in from
export function override( to, from, deep ){
	safe( from, function( f, key ){
		var t = to[ key ];

		if ( t === undefined && (!deep||f&&f.$constructor) ){
			to[ key ] = f;
		}else if ( isArrayLike(f) ){
			if ( !isArrayLike(t) ){
				t = to[ key ] = [];
			}

			arrayOverride( t, f, deep );
		}else if ( isObject(f) ){
			if ( !isObject(t) ){
				t = to[ key ] = {};
			}

			override( t, f, deep );
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
*/

/**
 * A general comparison algorithm to test if two objects are equal
 *
 * @function equals
 * @namespace bMoor
 * @param {object} obj1 The object to copy the content from
 * @param {object} obj2 The object into which to copy the content
 * @preturns {boolean}
 **/
export function equals( obj1, obj2 ){
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
			if ( bmoor.isArrayLike(obj1) ){
				if ( !bmoor.isArrayLike(obj2) ){ 
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
			}else if ( !bmoor.isArrayLike(obj2) ){
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