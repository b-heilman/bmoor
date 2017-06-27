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
				clear();
				cb.apply( this, arguments );
			};

		clear = this.on( event, fn );

		return clear;
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
			this._listeners[event].slice(0).forEach( ( cb ) => {
				cb.apply( this, args );
			});
		}
	}

	hasWaiting( event ){
		return !!this._listeners[event];
	}
}

module.exports = Eventing;
