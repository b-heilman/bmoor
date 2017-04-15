var master = {};

class Memory{
	constructor( title ){
		var index = {};

		this.register = function( name, obj ){
			if ( index[name] ){
				throw new Error('Memory - '+title+' already has '+name);
			}else{
				index[name] = obj;
			}
		};

		this.check = function( name ){
			return index[name];
		};
	}
}

module.exports = {
	Memory: Memory,
	use: function( title ){
		var rtn = master[title];

		if ( rtn ){
			throw new Error('Memory already exists '+title);
		}else{
			rtn = master[title] = new Memory(title);
		}

		return rtn;
	}
};