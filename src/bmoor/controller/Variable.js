;(function( $, global, undefined ){

bMoor.constructor.singleton({
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
		own : function( element ){ 
			var data = global[ arguments[1] ];

			if ( !data._bind ){
				if ( data.length ){
					data = new bmoor.model.Collection( data );
				}else{
					data = new bmoor.model.Map( data );
				}

				// now make sure, all instances become tied together
				global[ arguments[1] ] = data; 
			} 

			this._element( element, data );
		}
	}
});

}( jQuery, this ));