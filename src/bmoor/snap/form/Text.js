;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Text',
	namespace : ['bmoor','snap','form'],
	parent : ['bmoor','snap','Node'],
	properties: {
		_element : function( element ){
			this.__Node._element.call( this, element );

			if ( !this.variable ){
				this.variable = this.element.name;
			}
		},
		// gets called by the data bind
		_setContent : function( content ){
			this.element.value = content;
		},
		_binding : function(){
			var dis = this;
			
			this.__Node._binding.call( this );
			
			if ( this.data && this.variable ){
				this.alter(function( value ){
					if ( dis.data ){
						dis.data[ dis.variable ] = value;
					}
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