
const core = require('./core.js');
const flowWindow = require('./flow/window.js');
const Eventing = require('./Eventing.js');

class Observable extends Eventing {
	constructor(settings = {}){
		super();

		// I need both hot and currentValue because currentValue
		// could really be anything, I suppose I could do in, but 
		// that seems more annoying, less performant?
		this.hot = false;
		this.settings = settings;

		this._next = flowWindow(() => {
			this.trigger('next', this.currentValue);
		}, settings.windowMin||0, settings.windowMax||30);

		this.next = function(val = this){
			this.hot = true;
			this.currentValue = val;

			this._next();
		};
	}

	subscribe(onNext, onError, onComplete){
		let config = null;

		if (core.isFunction(onNext)){
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

		if (this.hot && config.next){
			// make it act like a hot observable
			config.next(this.currentValue);
		}

		return super.subscribe(config);
	}

	// return back a promise that is active on the 'next'
	promise(){
		if (!this.hot || this._next.active()){
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
			return Promise.resolve(this.currentValue);
		}
	}

	destroy(){
		this.hot = false;

		this.trigger('complete');
	}
}

module.exports = Observable;

