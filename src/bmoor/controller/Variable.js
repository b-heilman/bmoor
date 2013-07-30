;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Variable',
	namespace : ['bmoor','controller'],
	parent : ['bmoor','controller','Abstract'],
	require : {
		classes : [ 
			['bmoor','model','Map'],
			['bmoor','model','Collection']
		]
	},
	properties : {
		_arguments : function( variable ){ 
			var data = global[ variable ];
			
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
		},
		_model : function(){
			return; // this is taken care of by the argument
		}
	}
});

}( jQuery, this ));