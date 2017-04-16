class Eventing {

	constructor(){
		this._listeners = {};
	}

	on( event, cb ){
		var dis = this;

		if ( !this._listeners[event] ){
			this._listeners[event] = [];
		}

		this._listeners[event].push( cb );

		return function clear$on(){
			dis._listeners[event].splice(
				dis._listeners[event].indexOf( cb ),
				1
			);
		};
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

		if ( this._listeners && this._listeners[event] ){
			if ( !this._triggering ){
				this._triggering = {};
				// I want to do this to enforce more async / promise style
				setTimeout(() => {
					Object.keys(this._triggering).forEach( ( event ) => {
						var vars = this._triggering[event];

						this._listeners[event].forEach( ( cb ) => {
							cb.apply( this, vars );
						});
					});

					if ( this._listeners.stable ){
						this._listeners.stable.forEach( ( cb ) => {
							cb.apply( this );
						});
					}
				},0);
			}

			this._triggering[ event ] = args;
		}
	}
}

module.exports = Eventing;
