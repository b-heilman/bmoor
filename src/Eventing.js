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
		var i, c,
			listeners,
			args = Array.prototype.slice.call(arguments,1);

		if ( this._listeners ){
			listeners = this._listeners[event];

			if ( listeners ){
				listeners = listeners.slice(0);
				for( i = 0, c = listeners.length; i < c; i++ ){
					listeners[i].apply( this, args );
				}
			}
		}
	}
}

module.exports = Eventing;
