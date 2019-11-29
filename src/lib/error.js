
const uuid = require('uuid/v1');
const {levels} = require('./logger.js');

module.exports = {
	addStatus(err, ctx =  {}){
		if (!err.ref){
			err.ref = uuid();
		}

		if (ctx.status){
			err.status = ctx.status;
			err.type = ctx.type || levels.error;
		}

		return err;
	},

	addTrace(err, ctx = {}){
		const context = ctx.context || {};

		if (ctx.code){
			if (err.code){
				if (!err.trace){
					err.trace = [];
				}

				err.trace.unshift({
					code: err.code,
					context: err.context
				});
			}

			err.code = ctx.code;
			err.context = context;
		}

		return err;
	},

	addResponse(err, ctx){
		if (ctx.response){
			err.response = ctx.response;
			err.payload = ctx.payload || {};
		}

		return err;
	},

	apply(err, ctx){
		this.addStatus(err, ctx);
		
		this.addTrace(err, ctx);

		return this.addResponse(err, ctx);
	}
};
