
const core = require('../core.js');
const {implode} = require('../object.js');
const {Broadcast} = require('../eventing/broadcast.js');

// TODO : allow sub configs
class Config extends Broadcast {
	constructor(defaults){
		super();

		this.settings = {};

		if (defaults){
			Object.assign(this.settings, defaults);
		}
	}

	set(path, value){
		core.set(this.settings, path, value);

		return this.trigger(path, value);
	}

	assign(properties){
		const settings = implode(properties, {skipArray: true});

		return Promise.all(
			Object.keys(settings)
			.map(key => this.set(key, settings[key]))
		);
	}

	get(path){
		const rtn = core.get(this.settings, path);
		
		if (core.isArray(rtn)){
			return rtn.slice(0);
		} else if (core.isObject(rtn)){
			return Object.create(rtn);
		} else {
			return rtn;
		}
	}
}

module.exports = {
	Config
};
