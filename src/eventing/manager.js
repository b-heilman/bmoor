
const {Config} = require('../lib/config.js');

const config = new Config({
	timeout: 5
});

class Manager {
	constructor(broadcast, conf=config){
		this.cache = {};
		this.config = conf;
		this.broadcast = broadcast;
	}

	async trigger(event, key, args){
		let issued = this.cache[event];

		if (!issued){
			issued = {};

			this.cache[event] = issued;
		}

		let instance = issued[key];
		if (!instance){
			instance = {
				prom: new Promise(
					(resolve, reject) => setTimeout(
						async () => {
							issued[key] = null;

							try {
								const rtn = await this.broadcast.trigger(
									event, 
									...instance.args
								);

								resolve(rtn);
							} catch (ex){
								reject(ex);
							}
						}, 
						this.config.timeout
					)
				)
			};
			
			issued[key] = instance;	
		}

		instance.args = args;

		return instance.prom;
	}
}

module.exports = {
	config,
	Manager
};
