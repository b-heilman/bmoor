const {Config} = require('./config.js');
const {stringify} = require('./error.js');

const silent = Symbol('isSilent');
const error = Symbol('isError');
const warn = Symbol('isWarning');
const info = Symbol('isInfo');
const verbose = Symbol('isVerbose');

const levels = {
	[silent]: {
		name: 'silent',
		rank: 4
	},
	[error]: {
		name: 'error',
		rank: 3
	},
	[warn]: {
		name: 'warn',
		rank: 2
	},
	[info]: {
		name: 'info',
		rank: 1
	},
	[verbose]: {
		name: 'verbose',
		rank: 0
	}
};

function writeHeading(dump) {
	console.log(
		`--- ${dump.type} : ${dump.timestamp} ${
			dump.header ? `: ${dump.header} ` : ''
		}---`
	);
}

const config = new Config({
	log: function (dump) {
		writeHeading(dump);

		if (dump.error) {
			dump.message = dump.error.message;
			dump.stack = dump.error.stack;
		}

		console.log(stringify(dump));
	},
	comment: function (dump, message) {
		writeHeading(dump);

		console.log('> comment :', message);
	},
	level: error
});

function logFormat(content) {
	const dump = {};

	if (typeof content === 'string') {
		content = {
			type: 'debug',
			level: 'debug',
			message: content
		};
	}

	if (!content.type) {
		console.trace('!!!missing type');
	}

	dump.level = content.level;
	dump.type = content.type;

	if (content.header) {
		if (!content.message) {
			dump.message = content.header;
		} else {
			dump.header = content.header;
		}
	}

	dump.timestamp = new Date();

	if (content.message) {
		dump.message = content.message;
	}

	if (content.ref) {
		dump.ref = content.ref;
	}

	if (content.status) {
		dump.status = content.status;
	}

	if (content.code) {
		dump.code = content.code;
	}

	if (content.stack) {
		dump.stack = content.stack;
	}

	if (content instanceof Error) {
		dump.error = {
			message: content.message,
			stack: content.stack
		};
	} else if (content.error) {
		dump.error = {
			message: content.error.message,
			stack: content.error.stack
		};
	} else if (content.error !== null) {
		dump.error = {
			message: 'no error supplied',
			stack: new Error('need stack').stack
		};
	}

	if (content.context) {
		dump.context = content.context;
	}

	if (content.trace) {
		dump.trace = content.trace;
	}

	return dump;
}

async function log(onLevel, header, content = {}) {
	const level = levels[onLevel];

	if (levels[config.get('level')].rank <= level.rank) {
		if (typeof content === 'string') {
			content = {
				message: content
			};
		}

		const wrap = Object.create(content);

		wrap.header = header;
		wrap.type = level.name;
		wrap.level = onLevel;

		return config.get('log')(logFormat(wrap));
	}
}

async function comment(onLevel, header, comment) {
	const level = levels[onLevel];

	if (levels[config.get('level')].rank <= level.rank) {
		const ctx = {
			header,
			type: level.name,
			level: onLevel,
			timestamp: new Date()
		};

		return config.get('comment')(ctx, comment);
	}
}

function logFactory(onLevel) {
	return async function (header, content = {}) {
		return log(onLevel, header, content);
	};
}

function commentFactory(onLevel) {
	return async function (header, content) {
		return comment(onLevel, header, content);
	};
}

module.exports = {
	config,
	levels: {
		silent: silent,
		error: error,
		warn: warn,
		info: info,
		verbose: verbose
	},
	log,
	comment,
	error: logFactory(error),
	warn: logFactory(warn),
	warnComment: commentFactory(warn),
	info: logFactory(info),
	infoComment: commentFactory(info),
	verbose: logFactory(verbose),
	verboseComment: commentFactory(verbose)
};
