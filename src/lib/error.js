
const uuid = require('uuid/v1');
const {levels} = require('./logger.js');

function addStatus(err, ctx =  {}){
	if (!err.ref){
		err.ref = uuid();
	}

	if (ctx.status){
		err.status = ctx.status;
		err.type = ctx.type || levels.error;
	}

	return err;
}

function addTrace(err, ctx = {}){
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
}

function addResponse(err, ctx){
	if (ctx.response){
		err.response = ctx.response;
		err.payload = ctx.payload || {};
	}

	return err;
}

function apply(err, ctx){
	addStatus(err, ctx);
	
	addTrace(err, ctx);

	return addResponse(err, ctx);
}

function create(msg, ctx){
	const err = new Error(msg);

	return apply(err, ctx);
}

module.exports = {
	addStatus,

	addTrace,

	addResponse,

	apply,

	create
};
