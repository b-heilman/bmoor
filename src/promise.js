export function always( promise, func ){
	promise.then(func, func);
	return promise;
}