;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Select',
	namespace : ['bmoor','node','input'],
	parent : ['bmoor','node','input','Basic'],
	properties: {
		_element : function ( element ){
			var 
				selected,
				i,
				c;

			this['bmoor.node.input.Basic']._element.call( this, element );

			selected = this._select('[selected]');

			if ( selected.length ){
				for( i = 0, c = selected.length; i < c; i++ ){
					selected[i].removeAttribute('selected');
				}
				selected = selected[ selected.length-1 ];
			}else{
				selected = this.element.options[0];
			}

			this.val( selected.value );
		},
		lockValue : function(){
			if ( this.oldOption ){
				this.oldOption.removeAttribute( 'selected' );
			}

			this.oldOption = this.element.options[ this.element.selectedIndex ];
			this.oldOption.setAttribute( 'selected', true );
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