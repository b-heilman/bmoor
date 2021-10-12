/**
 * A debounce method that has a sliding window, there's a minimum and maximum wait time
 **/
module.exports = function (cb, min, max, settings) {
	var ctx, args, next, limit, timeout;

	if (!settings) {
		settings = {};
	}

	function fire() {
		limit = null;
		cb.apply(settings.context || ctx, args);
	}

	function run() {
		var now = Date.now();

		if (now >= limit || now >= next) {
			fire();
		} else {
			timeout = setTimeout(run, Math.min(limit, next) - now);
		}
	}

	let fn = function windowed() {
		var now = Date.now();

		ctx = this;
		args = arguments;
		next = now + min;

		if (!limit) {
			limit = now + max;
			timeout = setTimeout(run, min);
		}
	};

	fn.clear = function () {
		clearTimeout(timeout);
		timeout = null;
		limit = null;
	};

	fn.flush = function () {
		fire();
		fn.clear();
	};

	fn.shift = function (diff) {
		limit += diff;
	};

	fn.active = function () {
		return !!limit;
	};

	return fn;
};
