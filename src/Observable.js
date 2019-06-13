
const core = require('./core.js');
const flowWindow = require('./flow/window.js');
const Eventing = require('./Eventing.js');
const {equals} = require('./array.js');

class Observable extends Eventing {
	constructor(settings = {}){
		super();

		this.settings = settings;

		this._next = flowWindow(() => {
			const args = this.currentArgs;
			
			this.trigger('next', ...args);
		}, settings.windowMin||0, settings.windowMax||30);
	}

	next(...args){
		if (!args.length){
			throw new Error('Observable::next, must be called with arguments');
		}

		this.currentArgs = args;

		this._next();
	}

	subscribe(onNext, onError, onComplete){
		let config = null;

		if (core.isFunction(onNext) || core.isArray(onNext)){
			config = {
				next: onNext,
				error: onError ? onError : function(){
					// anything for default?
				},
				complete: onComplete ? onComplete : () => {
					this.destroy();
				}
			};
		} else {
			config = onNext;
		}

		const disconnect = super.subscribe(config);

		if (this.currentArgs && config.next){
			let fn = null;

			// make it act like a hot observable
			const args = this.currentArgs;
			const cb = config.next;

			if (core.isArray(cb)){
				if (cb.length){
					if (this._next.active()){
						fn = cb[0];

						const myArgs = args;
						cb[0] = function(...params){
							if (equals(params, myArgs)){
								// stub it for when next fires
								// there's a possible race condition with this, that a second value comes in as
								// the window is active... the second value will get eaten, so the else
								// blow tries to help there
							} else {
								let f = cb.shift();
								f(...params);
							}
						};
					} else {
						fn = cb.shift();
					}
				}
			} else {
				fn = cb;
			}

			fn(...args);
		}

		return disconnect;
	}

	// return back a promise that is active on the 'next'
	promise(){
		if (!this.currentArgs || this._next.active()){
			if (!this._promise){
				this._promise = new Promise((resolve, reject) => {
					let next = null;
					let error = null;

					next = this.once('next', val => {
						this._promise = null;

						error();
						resolve(val);
					});

					error = this.once('error', ex => {
						this._promise = null;

						next();
						reject(ex);
					});
				});
			}

			return this._promise;
		} else {
			const args = this.currentArgs;

			return Promise.resolve(...args);
		}
	}

	destroy(){
		this.currentArgs = null;

		this.trigger('complete');
	}
}

module.exports = Observable;

