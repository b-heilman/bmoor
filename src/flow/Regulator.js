function __now(){
	return +(new Date());
}

module.exports = class Regulator {
	constructor( func, min, max, context ){
		var dis = this;

		this._callback = function (){
			var now = dis.setTime + dis.min;

			if ( now >= dis.limitTime || now >= dis.nextTime ){
				dis.limitTime = null;
				func.apply(context, dis.args);
			}else{
				dis.setTime = now;
				dis.timeout = setTimeout(dis._callback, dis.min);
			}
		};
	}

	getRequestor(){
		var dis = this;

		return function doIt(){
			var now = __now();

			dis.args = arguments;
			dis.nextTime = now + dis.min;
			
			if ( !dis.limitTime ){
				dis.setTime = now;
				dis.limitTime = now+dis.max;
				dis.timeout = setTimeout(dis._callback, dis.min);
			}
		};
	}

	clear (){
		clearTimeout( this.timeout );
		this.timeout = null;
		this.limitTime = null;
	}

	flush (){
		this.limitTime = 0;
		this._callback();
		this.clear();
	}

	shift ( diff ){
		this.nextTime += diff;
	}
};
