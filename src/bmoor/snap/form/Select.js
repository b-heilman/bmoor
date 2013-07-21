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
				this.alter(function( value ){
					dis.scope[ dis.element.name ] = value;
				});
			}
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
		},
		alter : function( cb ){
			var dis = this;
			
			if ( this.element.nodeName ){
				this.element.onchange = function(){
					cb( dis.val() );
				};
			}else{
				// otherwise I assume it's a set
				for( var i = 0, c = this.element.length; i < c; i++ ){
					// TODO : can I limit this to one call for radio?
					this.element[i].onchange = function(){
						cb( dis.val() );
					};
				}
			}
		}
	}
});

}( jQuery, this ));