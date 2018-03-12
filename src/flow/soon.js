
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

	let fn = function sooned(){
		ctx = this;
		args = arguments;

		if ( !timeout ){
			timeout = setTimeout( fire, time );
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

	return fn;
};