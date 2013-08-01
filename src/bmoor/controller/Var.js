;(function( $, global, undefined ){

bMoor.constructor.decorator({
	name : 'Var',
	namespace : ['bmoor','controller'],
	// override the existing model
	construct : function(){ 
		var 
			variable = this.args[0],
			data = global[ this.args[0] ];
		
		if ( !data._bind ){
			if ( data.length ){
				data = new bmoor.model.Collection( data );
			}else{
				data = new bmoor.model.Map( data );
			}

			// now make sure, all instances become tied together
			global[ variable ] = data; 
		} 

		this.model = data;
		this._pushModel( this.element, this.model );
	}
});

}( jQuery, this ));