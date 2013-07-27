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
				
				this._listen();
			}
		},
		_listen : function(){
			var 
				dis = this,
				element = this.element.length ? this.element : [ this.element ];
			
			for( var i = 0, c = element.length; i < c; i++ ){
				element[i].onclick = function(){
					var r = dis._onChange();
					return r === undefined ? false : r;
				};
			}
		},
		_onChange : function(){
			var value = this.val();

			if ( this._isValid(value) ){
				this._onAlter( value );
				return true;
			}else return false;
		},
		_isValid : function( value ){
			return true;
		},
		_onAlter : function( value ){
			this.scope[ this.element.name ] = value
		},
		val : function( value ){
			if ( value ){
			}else{
				return this.element.value;
			}
		}
	}
});

}( jQuery, this ));