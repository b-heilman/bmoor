;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Text',
	namespace : ['bmoor','snap','form'],
	parent : ['bmoor','snap','form','Input'],
	properties: {
		// gets called by the data bind
		_listen : function(){
			var 
				dis = this,
				el = this.element;
			
			el.onkeyup = function(){ dis._onChange(); };
			el.onchange = function(){ dis._onChange(); };
		},
		lockValue : function(){
			var value = this.val();

			this.lockedValue = value;
			this.element.setAttribute( 'value', this.val() );
		},
		val : function( value ){
			if ( arguments.length ){
				this.element.value = value;
			}else{
				return this.element.value;
			}
		}
	}
});

}( jQuery, this ));