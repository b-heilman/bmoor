const core = require('../core.js');
const {Broadcast} = require('../eventing/broadcast.js');

// this doesn't do a deep copy, I'm fine with that
class Registry extends Broadcast {
	constructor(defaults = {}) {
		super();

		this.settings = defaults;
	}

	async set(path, value) {
		core.set(this.settings, path, value);

		return this.trigger(path, value);
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
}

module.exports = {
	Registry
};
