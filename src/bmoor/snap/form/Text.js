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
				this._listen();
			}
		},
		// TODO : make alter protected for the rest
		_listen : function(){
			var 
				dis = this,
				el = this.element;
			
			el.onkeyup = function(){ dis._onChange(); };
			el.onchange = function(){ dis._onChange(); };
		},
		_onChange : function(){
			var value = this.val();

			if ( this._isValid(value) ){
				this._onAlter( value );
			}
		},
		_isValid : function( value ){
			return true;
		},
		_onAlter : function( value ){
			this.scope[ this.element.name ] = value
		},
		val : function( value ){
			if ( arguments.length ){
				this._setContent( value );
			}else{
				return this.element.value;
			}
		},
		
	}
});

}( jQuery, this ));