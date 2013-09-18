;(function( $, global, undefined ){

bMoor.constructor.decorator({
	name : 'Disabled',
	namespace : ['bmoor','node','input'],
	properties : {
		_needUpdate : function( alterations ){
			return alterations.$isValid || this._wrapped( alterations );
		},
		// TODO : make shouldn't need to be called
		_makeContent : function( content ){
			var data = this.root.observer.model;
			
			this._wrapped( content );
			
			if ( data.$isValid !== undefined ){
				this.element.disabled = !data.$isValid;
			}
		},
	}
});

}( jQuery, this ));