;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Select',
	namespace : ['bmoor','snap','form'],
	parent : ['bmoor','snap','Node'],
	properties: {
		// gets called by the data bind
		_setContent : function( content ){
			this.val( content );
		},
		_binding : function(){
			var dis = this;
			
			this.__Node._binding.call( this );
			
			if ( this.model && this.variable ){
				this._listen();
			}
		},
		_listen : function( cb ){
			var dis = this;
			
			if ( this.element.nodeName ){
				this.element.onchange = function(){ dis._onChange(); };
			}else{
				// otherwise I assume it's a set
				for( var i = 0, c = this.element.length; i < c; i++ ){
					// TODO : can I limit this to one call for radio?
					this.element[i].onchange = function(){ dis._onChange(); };
				}
			}
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
			if ( value ){
				var dex;
				
				for( var options = this.element.options, i = 0, c = options.length; i < c; i++ ){
					if ( options[i].value == value ){
						dex = i;
						i = c;
					}
				}
				
				if ( !dex ){
					dex = 0;
				}
				
				this.element.selectedIndex = dex;
			}else{
				return this.element.options[this.element.selectedIndex].value;
			}
		}
	}
});

}( jQuery, this ));