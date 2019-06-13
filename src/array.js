/**
 * Array helper functions
 * @module bmoor.array
 **/

var bmoor = require('./core.js');

/**
 * Search an array for an element and remove it, starting at the begining or a specified location
 *
 * @function remove
 * @param {array} arr An array to be searched
 * @param {*} searchElement Content for which to be searched
 * @param {integer} fromIndex The begining index from which to begin the search, defaults to 0
 * @return {array} array containing removed element
 **/
function remove( arr, searchElement, fromIndex ){
	var pos = arr.indexOf( searchElement, fromIndex );

	if ( pos > -1 ){
		return arr.splice( pos, 1 )[0];
	}
}

/**
 * Search an array for an element and remove all instances of it, starting at the begining or a specified location
 *
 * @function remove
 * @param {array} arr An array to be searched
 * @param {*} searchElement Content for which to be searched
 * @param {integer} fromIndex The begining index from which to begin the search, defaults to 0
 * @return {integer} number of elements removed
 **/
function removeAll( arr, searchElement, fromIndex ){
	var r,
		pos = arr.indexOf( searchElement, fromIndex );

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
 * Compare two arrays.
 *
 * @function remove
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

/**
 * Create a new array that is completely unique
 *
 * @function unique
 * @param {array} arr The array to be made unique
 * @param {function|boolean} sort If boolean === true, array is presorted.  If function, use to sort
 **/
function unique( arr, sort, uniqueFn ){
	var rtn = [];

	if ( arr.length ){
		if ( sort ){
			// more efficient because I can presort
			if ( bmoor.isFunction(sort) ){
				arr = arr.slice(0).sort(sort);
			}

			let last;
			
			for( let i = 0, c = arr.length; i < c; i++ ){
				let d = arr[i],
					v = uniqueFn ? uniqueFn(d) : d;

				if ( v !== last ){
					last = v;
					rtn.push( d );
				}
			}
		}else if ( uniqueFn ){
			let hash = {};

			for( let i = 0, c = arr.length; i < c; i++ ){
				let d = arr[i],
					v = uniqueFn(d);

				if ( !hash[v] ){
					hash[v] = true;
					rtn.push( d );
				}
			}
		}else{
			// greedy and inefficient
			for( let i = 0, c = arr.length; i < c; i++ ){
			 	let d = arr[i];

			 	if ( rtn.indexOf(d) === -1 ){
			 		rtn.push( d );
			 	}
			}
		}
	}

	return rtn;
}

// I could probably make this sexier, like allow uniqueness algorithm, but I'm keeping it simple for now
function intersection(arr1, arr2){
	var rtn = [];

	if ( arr1.length > arr2.length ){
		let t = arr1;

		arr1 = arr2;
		arr2 = t;
	}

	for( let i = 0, c = arr1.length; i < c; i++ ){
		let d = arr1[i];

		if ( arr2.indexOf(d) !== -1 ){
			rtn.push( d );
		}
	}

	return rtn;
}

function difference(arr1, arr2){
	var rtn = [];

	for(let i = 0, c = arr1.length; i < c; i++){
		let d = arr1[i];

		if (arr2.indexOf(d) === -1){
			rtn.push( d );
		}
	}

	return rtn;
}

function equals(arr1, arr2){
	if (arr1 === arr2){
		return true;
	} else if (arr1.length !== arr2.length){
		return false;
	} else {
		for(let i = 0, c = arr1.length; i < c; i++){
			if (arr1[i] !== arr2[i]){
				return false;
			}
		}

		return true;
	}
}

function watch( arr, insert, remove, preload ){
	if (insert){
		let oldPush = arr.push.bind(arr);
		let oldUnshift = arr.unshift.bind(arr);

		arr.push = function(...args){
			args.forEach(insert);

			oldPush(...args);
		};

		arr.unshift = function(...args){
			args.forEach(insert);

			oldUnshift(...args);
		};

		if(preload){
			arr.forEach(insert);
		}
	}

	if (remove){
		let oldShift = arr.shift.bind(arr);
		let oldPop = arr.pop.bind(arr);
		let oldSplice = arr.splice.bind(arr);

		arr.shift = function(...args){
			remove(oldShift(...args));
		};

		arr.pop = function(...args){
			remove(oldPop(...args));
		};

		arr.splice = function(...args){
			var res = oldSplice(...args);

			res.forEach(remove);

			return res;
		};
	}
}

module.exports = {
	remove,
	removeAll,
	bisect,
	compare,
	unique,
	intersection,
	difference,
	watch,
	equals
};
