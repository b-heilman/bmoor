;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Text',
	namespace : ['bmoor','form'],
	construct: function( element ){
		this.element = element;
	},
	properties: {
		val : function( value ){
			if ( arguments.length ){
				this.element.value = value;
			}else{
				return this.element.value;
			}
		},
		alter : function( cb ){
			var el = this.element;
			
			el.onkeyup = function(){
				el.onchange();
			};
			
			el.onchange = function(){
				cb( el.value );
			};
		}
	}
});

}( jQuery, this ));