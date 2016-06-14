function always( promise, func ){
	promise.then(func, func);
	return promise;
}

module.exports = {
	always: always
};