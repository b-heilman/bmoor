var bmoor = require('./core.js');

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

function bisect( arr, value, func, preSorted ){
	var idx,
		val,
		bottom = 0,
		top = arr.length - 1;

	if ( !preSorted ){
		arr.sort(function(a,b){
			return func(a) - func(b);
		});
	}

	if ( func(arr[bottom]) >= value ){
		return {
			left : bottom,
			right : bottom
		};
	}

	if ( func(arr[top]) <= value ){
		return {
			left : top,
			right : top
		};
	}

	if ( arr.length ){
		while( top - bottom > 1 ){
			idx = Math.floor( (top+bottom)/2 );
			val = func( arr[idx] );

			if ( val === value ){
				top = idx;
				bottom = idx;
			}else if ( val > value ){
				top = idx;
			}else{
				bottom = idx;
			}
		}

		// if it is one of the end points, make it that point
		if ( top !== idx && func(arr[top]) === value ){
			return {
				left : top,
				right : top
			};
		}else if ( bottom !== idx && func(arr[bottom]) === value ){
			return {
				left : bottom,
				right : bottom
			};
		}else{
			return {
				left : bottom,
				right : top
			};
		}
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

		if ( !bmoor.isFunction(func) ){
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
function compare( arr1, arr2, func ){
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

module.exports = {
	indexOf: indexOf,
	remove: remove,
	removeAll: removeAll,
	bisect: bisect,
	filter: filter,
	compare: compare
};