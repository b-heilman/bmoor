var master = {};

class Memory{
	constructor(){
		var index = {};

		this.get = function( name ){
			return index[name];
		};

		this.check = function( name ){
			console.log( 'Memory::check will soon removed');
			return index[name];
		};

		this.isSet = function( name ){
			return !!index[name];
		};

		this.register = function( name, obj ){
			index[name] = obj;
		};

		this.clear = function( name ){
			if ( name in index ){
				delete index[name];
			}
		};

		this.keys = function(){
			return Object.keys(index);
		};
	}

	import( json ){
		Object.keys( json ).forEach( ( key ) => {
			this.register( key, json[key] );
		});
	}

	export(){
		return this.keys().reduce( ( rtn, key ) =>{
			rtn[key] = this.get( key );

			return rtn;
		},{});
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
