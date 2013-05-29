;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Button',
	namespace : ['bmoor','form'],
	construct: function( element ){
		this.element = element;
	},
	properties: {
		val : function( value ){
			if ( value ){
			}else{
				return null;
			}
		},
		alter : function( cb ){
			var element = this.element.length ? this.element : [ this.element ];
			for( var i = 0, c = element.length; i < c; i++ ){
				element[i].onclick = function(){
					var r = cb( element.value );
					return r === undefined ? false : r;
				};
			}
		}
	}
});

}( jQuery, this ));