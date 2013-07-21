;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Text',
	namespace : ['bmoor','snap','form'],
	parent : ['bmoor','snap','Node'],
	properties: {
		// gets called by the data bind
		_setContent : function( content ){
			this.element.value = content;
		},
		_binding : function(){
			var dis = this;
			
			this.__Node._binding.call( this );
			
			if ( this.model && this.variable ){
				this.alter(function( value ){
					dis.scope[ dis.element.name ] = value;
				});
			}
		},
		val : function( value ){
			if ( arguments.length ){
				this._setContent( value );
			}else{
				return this.element.value;
			}
		},
		alter : function( cb ){
			var 
				dis = this,
				el = this.element;
			
			el.onkeyup = function(){
				el.onchange();
			};
			
			el.onchange = function(){
				cb( dis.val() );
			};
		}
	}
});

}( jQuery, this ));