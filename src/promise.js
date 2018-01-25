var window = require('./flow/window.js');

function always( promise, func ){
	promise.then(func, func);
	return promise;
}

function stack( calls, settings ){
	
	if ( !calls ){
		throw new Error('calling stack with no call?');
	}

	if ( !settings ){
		settings = {};
	}

	let min = settings.min || 1,
		max = settings.max || 10,
		limit = settings.limit || 5,
		update = window( settings.update || function(){}, min, max );

	return new Promise(function( resolve, reject ){
		var run,
			timeout,
			errors = [],
			active = 0,
			callStack = calls.slice(0);

		function registerError( err ){
			errors.push( err );
		}

		function next(){
			active--;

			update( {active: active, remaining: callStack.length} );

			if ( callStack.length ){
				if ( !timeout ){
					timeout = setTimeout( run, 1 );
				}
			}else if ( !active ){
				if ( errors.length ){
					reject( errors );
				}else{
					resolve();
				}
			}
		}

		run = function(){
			timeout = null;

			while ( active < limit && callStack.length ){
				let fn = callStack.pop();

				active++;

				fn()
				.catch( registerError )
				.then( next );
			}
		};

		run();
	});
}

module.exports = {
	always: always,
	stack: stack
};
