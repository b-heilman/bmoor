bMoor.define('bmoor.flow.Regulator', 
	[ 'bmoor.flow.Timeout',
	function( Timeout ){
		'use strict';
		
		return function regulator( min, max, func, context ){
			var args,
				timeout,
				setTime,
				nextTime,
				limitTime;

			function callback(){
				var now = setTime + min;

				if ( now >= limitTime || nextTime <= now ){
					limitTime = null;
					func.apply(context, args);
				}else{
					setTime = now;
					timeout = Timeout.set(callback, min);
				}
			}

			function doIt(){
				var now = +(new Date());

				args = arguments;
				nextTime = now + min;
				
				if ( !limitTime ){
					setTime = now;
					limitTime = now+max;
					timeout = Timeout.set(callback, min);
				}
			}

			doIt.clear = function(){
				Timeout.clear( timeout );
				timeout = null;
				limitTime = null;
			};

			doIt.flush = function(){
				limitTime = 0;
				callback();
				this.clear();
			};

			doIt.shift = function( diff ){
				nextTime += diff;
			};

			return doIt;
		};
	}]
);