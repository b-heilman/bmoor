const core = require('../core.js');
const {implode} = require('../object.js');
const {Broadcast} = require('../eventing/broadcast.js');

// this doesn't do a deep copy, I'm fine with that
class Config extends Broadcast {
	constructor(defaults = {}) {
		super();

		this.settings = defaults;
	}

	async set(path, value) {
		core.set(this.settings, path, value);

		return this.trigger(path, value);
	}

	async assign(properties) {
		const settings = implode(properties, {skipArray: true});

		return Promise.all(
			Object.keys(settings).map((key) => this.set(key, settings[key]))
		);
	}

	get(path) {
		const rtn = core.get(this.settings, path);

		if (core.isArray(rtn)) {
			return rtn.slice(0);
		} else {
			return rtn;
		}
	}

	keys() {
		return Object.keys(this.settings);
	}

	sub(path) {
		let rtn = core.get(this.settings, path);

		if (!rtn) {
			rtn = {};
			this.set(path, rtn);
		}

		return new Config(rtn);
	}

	extend(settings) {
		const child = new Config(Object.create(this.settings));

		// maybe put this logic in object?
		Object.keys(this.settings).forEach((k) => {
			const value = this.settings[k];
			if (core.isObject(value)) {
				child.settings[k] = Object.create(value);
			}
		});

		if (settings) {
			child.assign(settings);
		}

		return child;
	}
}

module.exports = {
	Config
};
