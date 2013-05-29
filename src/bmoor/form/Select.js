;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Select',
	namespace : ['bmoor','form'],
	construct: function( element ){
		this.element = element;
	},
	properties: {
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
			
			if ( this.element.length ){
				for( var i = 0, c = this.element.length; i < c; i++ ){
					// TODO : can I limit this to one call for radio?
					this.element[i].onchange = function(){
						cb( dis.val() );
					};
				}
			}else{
				this.element.onchange = function(){
					cb( dis.val() );
				};
			}
		}
	}
});

}( jQuery, this ));