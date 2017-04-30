var master = {};

class Memory{
	constructor(){
		var index = {};

		this.check = function( name ){
			return index[name];
		};

		this.register = function( name, obj ){
			index[name] = obj;
		};

		this.clear = function( name ){
			if ( name in index ){
				delete index[name];
			}
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