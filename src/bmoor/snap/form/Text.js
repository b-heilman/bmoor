;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Text',
	namespace : ['bmoor','snap','form'],
	parent : ['bmoor','snap','Node'],
	properties: {
		_setContent : function( content ){
			this.element.value = content;
		},
		_binding : function(){
			var dis = this;
			
			if ( this.data && this.data._bind && this.variable ){
				this.data._bind(function(){
					dis._mapUpdate( this );
				});
				
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