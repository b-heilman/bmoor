
/**
 * A debounce method that will call after N seconds of first call
 **/
module.exports = function( cb, time, settings ){
	var ctx,
		args,
		timeout;

	if ( !settings ){
		settings = {};
	}

	function fire(){
		timeout = null;
		cb.apply( settings.context || ctx, args );
	}

	let fn = function debounced(){
		ctx = this;
		args = arguments;

		if (!timeout){
			timeout = setTimeout(fire, time);
		}
	};

	fn.clear = function(){
		clearTimeout( timeout );
		timeout = null;
	};

	fn.flush = function(){
		fire();
		fn.clear();
	};

	fn.active = function(){
		return !!timeout;
	};

	return fn;
};
