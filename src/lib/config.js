const {implode} = require('../object.js');

class ConfigObject extends Object {
	constructor(settings) {
		super();

		if (settings) {
			Object.assign(this, settings);
		}
	}
}

class Config extends ConfigObject {
	constructor(settings = {}, subs = {}) {
		super({
			settings: implode(settings, {instanceOf: ConfigObject}),
			subs: implode(subs, {instanceOf: Config})
		});
	}

	set(path, value) {
		return (this.settings[path] = value);
	}

	get(path) {
		return this.settings[path];
	}

	keys(){
		return Object.keys(this.settings);
	}

	getSub(sub) {
		return this.subs[sub];
	}

	override(settings) {
		return new Config(Object.assign({}, this.settings, implode(settings)));
	}
}

module.exports = {
	Config,
	ConfigObject
};
