module.exports = {
	on: function ( event, cb ){
		var dis = this;

		if ( !this._$listeners ){
			this._$listeners = {};
		}

		if ( !this._$listeners[event] ){
			this._$listeners[event] = [];
		}

		this._$listeners[event].push( cb );

		return function clear$on(){
			dis._$listeners[event].splice(
				dis._$listeners[event].indexOf( cb ),
				1
			);
		};
	},
	subscribe: function( subscriptions ){
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
	},
	trigger: function( event ){
		var listeners,
			i, c,
			args = Array.prototype.slice.call(arguments,1);

		if ( this._$listeners ){
			listeners = this._$listeners[event];

			if ( listeners ){
				listeners = listeners.slice(0);
				for( i = 0, c = listeners.length; i < c; i++ ){
					listeners[i].apply( this, args );
				}
			}
		}
	}
};
