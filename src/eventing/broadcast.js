
const core = require('../core.js');
const array = require('../array.js');

class Broadcast {

	constructor(){
		this._listeners = {};
		this._routers = [];
	}

	on(event, cb){
		if (typeof(event) === 'string'){
			let listeners = null;

			if ( !this._listeners[event] ){
				this._listeners[event] = [];
			}

			listeners = this._listeners[event];

			listeners.push( cb );

			return function clear$Listener(){
				listeners.splice(listeners.indexOf(cb), 1);
			};
		} else if (event){
			const routers = this._routers;

			let fn = null;

			if (event.test){
				fn = function(type, ...args){
					if (event.test(type)){
						return cb(type, ...args);
					}
				};
			} else if (typeof(event) === 'function'){
				fn = function(type, ...args){
					if (event(type)){
						return cb(type, ...args);
					}
				};
			}

			routers.push(fn);

			return function clear$Router(){
				routers.splice(routers.indexOf(fn), 1);
			};
		} 
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

	// a wrapper around once that returns a promise
	promised(event, cb){
		return new Promise((resolve, reject) => {
			this.once(event,  function(...args){
				try {
					resolve(cb(...args));
				} catch(ex){
					reject(ex);
				}
			});
		});
	}

	subscribe(subscriptions){
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

	hasWaiting( event ){
		return !!this._listeners[event];
	}

	async trigger(event, ...args){
		let proms = [];

		if (this.hasWaiting(event)){
			// slice and deep copy in case someone gets cute and unregisters
			try {
				const callbacks = this._listeners[event];

				proms = callbacks.slice(0).map(cb => {
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
					
				});
			} catch(ex) {
				proms.push(Promise.reject(ex));
			}
		}

		const routers = this._routers;
		if (routers.length){
			try {
				proms = proms.concat(
					routers.slice(0).map(cb => cb(event, ...args))
				);
			} catch(ex) {
				proms.push(Promise.reject(ex));
			}
		}

		return Promise.all(proms);
	}

	destroy(){
		Object.keys(this._listeners).forEach(key => {
			delete this._listeners[key];
		});

		this._listeners = null;
		this._routers = null;
	}
}

module.exports = {
	Broadcast
};
