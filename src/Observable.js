
const core = require('./core.js');
const flowWindow = require('./flow/window.js');
const Eventing = require('./Eventing.js');

class Observable extends Eventing {
	constructor(settings = {}){
		super();

		this.settings = settings;

		this._next = flowWindow(() => {
			const args = this.currentArgs;
			this.trigger('next', ...args);
		}, settings.windowMin||0, settings.windowMax||30);

		this.next = function(...args){
			if (!args.length){
				args = [this];
			}

			this.currentArgs = args;

			this._next();
		};
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

		if (this.currentArgs && config.next){
			let fn = null;

			// make it act like a hot observable
			const args = this.currentArgs;
			const cb = config.next;

			if (core.isArray(cb)){
				if (cb.length){
					fn = cb.shift();
				}
			} else {
				fn = cb;
			}

			fn(...args);
		}

		return super.subscribe(config);
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
