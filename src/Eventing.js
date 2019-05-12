
const core = require('./core.js');
const array = require('./array.js');

class Eventing {

	constructor(){
		this._listeners = {};
	}

	on(event, cb){
		let listeners = null;

		if ( !this._listeners[event] ){
			this._listeners[event] = [];
		}

		listeners = this._listeners[event];

		listeners.push( cb );

		return function clear$on(){
			listeners.splice(listeners.indexOf(cb), 1);
		};
	}

	once(event, cb){
		let clear = null;
		const fn = function(...args){
			clear();
			cb(...args);
		};

		clear = this.on(event, fn);

		return clear;
	}

	subscribe( subscriptions ){
		const dis = this;
		const kills = [];
		const events =  Object.keys(subscriptions);

		events.forEach(function( event ){
			var action = subscriptions[event];

			kills.push(dis.on(event, action));
		});

		return function killAll(){
			kills.forEach(function( kill ){
				kill();
			});
		};
	}

	trigger(event, ...args){
		if (this.hasWaiting(event)){
			// slice and deep copy in case someone gets cute and unregisters
			try {
				const callbacks = this._listeners[event];
				return Promise.all(callbacks.slice(0).map(cb => {
					let fn = null;

					if (core.isArray(cb)){
						if (cb.length){
							fn = cb.shift();
						}
						
						if (!cb.length){
							array.remove(callbacks, cb);
						}
					} else {
						fn = cb;
					}

					if (fn){
						return fn(...args);
					} else {
						return;
					}
					
				}));
			} catch(ex) {
				return Promise.reject(ex);
			}
		} else {
			return Promise.resolve([]);
		}
	}

	hasWaiting( event ){
		return !!this._listeners[event];
	}
}

module.exports = Eventing;
