;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Button',
	namespace : ['bmoor','snap','form'],
	parent : ['bmoor','snap','Node'],
	properties: {
		_setContent : function( content ){
			if ( this.element.value == content ){
				this.$.addClass('active');
			}else{
				this.$.removeClass('active');
			}
		},
		_binding : function(){
			var dis = this;
			
			if ( this.model && this.variable ){
				this.model._bind(function(){
					dis._make( this );
				});
				
				this.alter(function( value ){
					console.log( dis.scope, dis.element.name );
					dis.scope[ dis.element.name ] = value;
				});
			}
		},
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
					var r = cb( this.value );
					return r === undefined ? false : r;
				};
			}
		}
	}
});

}( jQuery, this ));