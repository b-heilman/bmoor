/**
 * Object helper functions
 * @module bmoor.object
 **/

var bmoor = require('./core.js');

function values( obj ){
	var res = [];

	bmoor.naked( obj, function( v ){
		res.push( v );
	});

	return res;
}

function keys( obj ){
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
 * @param {object} target The object to map the variables onto
 * @param {object} mappings An object orientended as [ namespace ] => value
 * @return {object} The object that has had content mapped into it
 **/
function explode( target, mappings ){
	if (!mappings ){
		mappings = target;
		target = {};
	}

	bmoor.iterate( mappings, function( val, mapping ){
		bmoor.set( target, mapping, val );
	});

	return target;
}

function makeExploder( paths ){
	var fn;

	paths.forEach(function( path ){
		var old = fn,
			setter = bmoor.makeSetter( path );

		if ( old ){
			fn = function( ctx, obj ){
				setter( ctx, obj[path] );
				old( ctx, obj );
			};
		}else{
			fn = function( ctx, obj ){
				setter( ctx, obj[path] );
			};
		}
	});

	return function( obj ){
		var rtn = {};

		fn( rtn, obj );

		return rtn;
	};
}

function implode( obj, ignore ){
	var rtn = {};

	if ( !ignore ){
		ignore = {};
	}

	bmoor.iterate( obj, function( val, key ){
		var t = ignore[key];

		if ( bmoor.isObject(val) ){
			if ( t === false ){
				rtn[key] = val;
			} else if ( !t || bmoor.isObject(t) ){
				bmoor.iterate( implode(val,t), function( v, k ){
					rtn[key+'.'+k] = v;
				});
			}
		}else if ( !t ){
			rtn[key] = val;
		}
	});

	return rtn;
}

/**
 * Create a new instance from an object and some arguments
 *
 * @function mask
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
 * Create a new instance from an object and some arguments.  This is a shallow copy to <- from[...]
 * 
 * @function extend
 * @param {object} to Destination object.
 * @param {...object} src Source object(s).
 * @returns {object} Reference to `dst`.
 **/
function extend( to ){
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

function empty( to ){
	bmoor.iterate( to, function( v, k ){
		delete to[k]; // TODO : would it be ok to set it to undefined?
	});
}

function copy( to ){
	empty( to );

	return extend.apply( undefined, arguments );
}

// Deep copy version of extend
function merge( to ){
	var from,
		i, c,
		m = function( val, key ){
			to[ key ] = merge( to[key], val );
		};

	for( i = 1, c = arguments.length; i < c; i++ ){
		from = arguments[i];

		if ( to === from ){
			continue;
		}else if ( to && to.merge ){
			to.merge( from );
		}else if ( !bmoor.isObject(from) ){
			to = from;
		}else if ( !bmoor.isObject(to) ){
			to = merge( {}, from );
		}else{
			bmoor.safe( from, m );
		}
	}
	
	return to;
}

/**
 * A general comparison algorithm to test if two objects are equal
 *
 * @function equals
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

// TODO : property watch

module.exports = {
	keys: keys,
	values: values,
	explode: explode,
	makeExploder: makeExploder,
	implode: implode,
	mask: mask,
	extend: extend,
	empty: empty,
	copy: copy,
	merge: merge,
	equals: equals
};
