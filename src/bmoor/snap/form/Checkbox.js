;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Checkbox',
	namespace : ['bmoor','snap','form'],
	parent : ['bmoor','snap','form','Input'],
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