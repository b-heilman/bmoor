;(function( $, global, undefined ){

bMoor.constructor.decorator({
	name : 'Disabled',
	namespace : ['bmoor','snap','form'],
	properties : {
		_make : function( model ){
			if ( this.model.$isValid !== undefined ){
				this.element.disabled = !this.model.$isValid;
			}
		},
	}
});

}( jQuery, this ));