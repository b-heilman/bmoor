;(function( $, global, undefined ){

bMoor.constructor.decorator({
	name : 'Disabled',
	namespace : ['bmoor','snap','form'],
	properties : {
		_needUpdate : function( alterations ){
			return alterations.$isValid || this._wrapped( alterations );
		},
		// TODO : make shouldn't need to be called
		_make : function(){
			var data = this.root.observer.model;
			
			if ( data.$isValid !== undefined ){
				this.element.disabled = !data.$isValid;
			}
		},
	}
});

}( jQuery, this ));