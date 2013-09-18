;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Checkbox',
	namespace : ['bmoor','node','input'],
	parent : ['bmoor','node','input','Basic'],
	properties: {
		val : function( value ){
			var element = this.element;
			
			if ( value ){
				if ( element.value == value ){
					element.checked = true;
				}else{
					element.checked = false;
				}
			}else{
				if ( element.checked ){
					return element.value;
				}else{
					return null;
				}
			}
		},
		lockValue : function(){
			if ( this.element.checked ){
				this.element.setAttribute( 'checked', true );
			}else{
				this.element.removeAttribute( 'checked' );
			}
		}
	}
});

}( jQuery, this ));