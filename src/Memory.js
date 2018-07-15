var master = {};

class Memory{
	constructor( name ){
		var index = {};

		this.name = name;
		this.get = ( name ) => {
			return index[name];
		};

		this.check = ( name ) => {
			console.log( 'Memory::check will soon removed');
			return index[name];
		};

		this.isSet = ( name ) => {
			return !!index[name];
		};

		this.register = ( name, obj ) => {
			index[name] = obj;
		};

		this.clear = ( name ) => {
			if ( name in index ){
				delete index[name];
			}
		};

		this.keys = () => {
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
