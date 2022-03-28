/**
 * Object helper functions
 * @module bmoor.object
 **/

var bmoor = require('./core.js');

/**
 * Takes a hash and uses the indexs as namespaces to add properties to an objs
 *
 * @function explode
 * @param {object} target The object to map the variables onto
 * @param {object} mappings An object orientended as [ namespace ] => value
 * @return {object} The object that has had content mapped into it
 **/
function explode(target, mappings) {
	if (!mappings) {
		mappings = target;
		target = {};
	}

	for (const key in mappings) {
		bmoor.set(target, key, mappings[key]);
	}

	return target;
}

function makeExploder(paths) {
	var fn;

	paths.forEach(function (path) {
		var old = fn,
			setter = bmoor.makeSetter(path);

		if (old) {
			fn = function (ctx, obj) {
				setter(ctx, obj[path]);
				old(ctx, obj);
			};
		} else {
			fn = function (ctx, obj) {
				setter(ctx, obj[path]);
			};
		}
	});

	return function (obj) {
		var rtn = {};

		fn(rtn, obj);

		return rtn;
	};
}

function implode(obj, settings = {}) {
	var rtn = {};

	let ignore = {};
	if (settings.ignore) {
		ignore = settings.ignore;
	}

	let format = null;

	if (bmoor.isArray(obj)) {
		format = function fn1(key, next) {
			if (next) {
				if (next[0] === '[') {
					return '[' + key + ']' + next;
				} else {
					return '[' + key + '].' + next;
				}
			} else {
				return '[' + key + ']';
			}
		};
	} else {
		format = function fn2(key, next) {
			if (next) {
				if (next[0] === '[') {
					return key + next;
				} else {
					return key + '.' + next;
				}
			} else {
				return key;
			}
		};
	}

	for (const key in obj) {
		const val = obj[key];
		const t = ignore[key];

		if (t !== true) {
			if (settings.skipArray && bmoor.isArray(val)) {
				rtn[format(key)] = val;
			} else if (
				bmoor.isObject(val) &&
				!(val instanceof Symbol) &&
				(!settings.instanceOf || !(val instanceof settings.instanceOf))
			) {
				const todo = implode(val, Object.assign({}, settings, {ignore: t}));

				for (const k in todo) {
					rtn[format(key, k)] = todo[k];
				}
			} else {
				rtn[format(key)] = val;
			}
		}
	}

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
function mask(obj) {
	if (Object.create) {
		var T = function Masked() {};

		T.prototype = obj;

		return new T();
	} else {
		return Object.create(obj);
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
function extend() {
	return Object.assign(...arguments);
}

function empty(to) {
	for (const key in to) {
		delete to[key]; // TODO : would it be ok to set it to undefined?
	}
}

function copy(to) {
	empty(to);

	return extend(...arguments);
}

// TODO
function deepCopy(from) {
	return JSON.parse(JSON.stringify(from));
}

function merge(to, ...args) {
	function m(val, key) {
		if (bmoor.isArray(val)) {
			to[key] = val;
		} else {
			to[key] = merge(to[key], val);
		}
	}

	for (let i = 0, c = args.length; i < c; i++) {
		let from = args[i];

		if (to === from) {
			continue;
		} else if (to && to.merge) {
			to.merge(from);
		} else if (!bmoor.isObject(from)) {
			to = from;
		} else if (!bmoor.isObject(to)) {
			to = merge({}, from);
		} else {
			for (const key in from) {
				m(from[key], key);
			}
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
function equals(obj1, obj2) {
	var t1 = typeof obj1,
		t2 = typeof obj2,
		keyCheck;

	if (obj1 === obj2) {
		return true;
	} else if (obj1 !== obj1 && obj2 !== obj2) {
		return true; // silly NaN
	} else if (
		obj1 === null ||
		obj1 === undefined ||
		obj2 === null ||
		obj2 === undefined
	) {
		return false; // undefined or null
	} else if (obj1.equals) {
		return obj1.equals(obj2);
	} else if (obj2.equals) {
		return obj2.equals(obj1); // because maybe somene wants a class to be able to equal a simple object
	} else if (t1 === t2) {
		if (t1 === 'object') {
			if (bmoor.isArrayLike(obj1)) {
				if (!bmoor.isArrayLike(obj2)) {
					return false;
				}

				if (obj1.length === obj2.length) {
					for (let i = 0, c = obj1.length; i < c; i++) {
						if (!equals(obj1[i], obj2[i])) {
							return false;
						}
					}

					return true;
				}
			} else if (!bmoor.isArrayLike(obj2)) {
				keyCheck = {};
				for (let i in obj1) {
					if (Object.prototype.hasOwnProperty.call(obj1, i)) {
						if (!equals(obj1[i], obj2[i])) {
							return false;
						}

						keyCheck[i] = true;
					}
				}

				for (let i in obj2) {
					if (Object.prototype.hasOwnProperty.call(obj2, i)) {
						if (!keyCheck && obj2[i] !== undefined) {
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
	explode,
	makeExploder,
	implode,
	mask,
	extend,
	empty,
	copy,
	deepCopy,
	merge,
	equals
};
