class Eventing {

	constructor(){
		this._listeners = {};
	}

	on( event, cb ){
		var listeners;

		if ( !this._listeners[event] ){
			this._listeners[event] = [];
		}

		listeners = this._listeners[event];

		listeners.push( cb );

		return function clear$on(){
			listeners.splice( listeners.indexOf(cb), 1 );
		};
	}

	once( event, cb ){
		var clear,
			fn = function(){
				cb.apply( this, arguments );
				clear();
			};

		clear = this.on( event, fn );

		return clear;
	}

	next( event, cb ){
		if ( this._triggering && this._triggering[event] ){
			this.once( event, cb );
		}else{
			cb();
		}
	}

	subscribe( subscriptions ){
		var dis = this,
			kills = [],
			events =  Object.keys(subscriptions);

		events.forEach(function( event ){
			var action = subscriptions[event];

			kills.push( dis.on(event,action) );
		});

		return function killAll(){
			kills.forEach(function( kill ){
				kill();
			});
		};
	}

	trigger( event ){
		var args = Array.prototype.slice.call(arguments,1);

		if ( this.hasWaiting(event) ){
			if ( !this._triggering ){
				this._triggering = {};
				
				// I want to do this to enforce more async / promise style
				setTimeout(() => {
					var events = this._triggering;

					this._triggering = null;
					
					Object.keys(events).forEach( ( event ) => {
						var vars = events[event];

						this._listeners[event].slice(0).forEach( ( cb ) => {
							cb.apply( this, vars );
						});
					});
				},0);
			}

			this._triggering[ event ] = args;
		}
	}

	hasWaiting( event ){
		return !!this._listeners[event];
	}
}

module.exports = Eventing;
