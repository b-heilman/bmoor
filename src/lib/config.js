
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
		).then(() => Object.assign({}, this.settings));
	}

	mask(override){
		return Object.assign(Object.create(this.settings), override);
	}

	clone(override){
		return Object.assign({}, this.settings, override);
	}

	get(path){
		const rtn = core.get(this.settings, path);
		
		if (core.isArray(rtn)){
			return rtn.slice(0);
		} else {
			return rtn;
		}
	}

	keys(){
		return Object.keys(this.settings);
	}

	sub(path, assign = null){
		let rtn = core.get(this.settings, path);

		if (!rtn){
			rtn = assign || {};
			this.set(path, rtn);
		} else if (assign){
			Object.assign(rtn, assign);
		}

		return new Config(rtn);
	}
}

module.exports = {
	Config
};
