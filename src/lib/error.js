const uuid = require('uuid/v1');

function addStatus(err, ctx = {}) {
	if (!err.ref) {
		err.ref = uuid();
	}

	if (ctx.status) {
		err.status = ctx.status;
		err.type = ctx.type;
	}

	return err;
}

function setContext(err, ctx = {}) {
	if (ctx.context) {
		if (err.context) {
			Object.assign(err.context, ctx.context);
		} else {
			err.context = ctx.context;
		}
	}

	if (ctx.protected) {
		if (err.protected) {
			Object.assign(err.protected, ctx.protected);
		} else {
			err.protected = ctx.protected;
		}
	}

	return err;
}

function addTrace(err, ctx = {}) {
	if (ctx.code) {
		if (err.code) {
			if (!err.trace) {
				err.trace = [];
			}

			err.trace.unshift({
				code: err.code,
				context: err.context,
				protected: err.protected
			});
		}

		err.code = ctx.code;
		err.context = {};
		err.protected = {};
	}

	return setContext(err, ctx);
}

function addResponse(err, ctx) {
	if (ctx.response) {
		err.response = ctx.response;
		err.payload = ctx.payload || {};
	}

	return err;
}

function apply(err, ctx) {
	addStatus(err, ctx);

	addTrace(err, ctx);

	return addResponse(err, ctx);
}

function create(msg, ctx) {
	const err = new Error(msg);

	return apply(err, ctx);
}

function stringify(err) {
	const builder = [];
	if (err.ref || err.message || err.code) {
		builder.push(
			'> info: ' +
				JSON.stringify(
					{
						ref: err.ref,
						status: err.status,
						code: err.code
					},
					null,
					'\t'
				)
		);
	}

	if (err.message) {
		builder.push(`> error: ${err.message}`);
	}

	if (err.stack) {
		builder.push('> stack: ' + err.stack.toString());
	}

	if (err.context) {
		builder.push('> context: ' + JSON.stringify(err.context, null, '\t'));
	}

	if (err.trace) {
		builder.push('> context trace');
		err.trace.forEach((row) => {
			builder.push(
				'\t> ' + row.code + ': ',
				JSON.stringify(row.context, null, '\t\t')
			);
		});
	}

	return builder.join('\n');
}

module.exports = {
	addStatus,

	setContext,

	addTrace,

	addResponse,

	apply,

	create,

	stringify
};
