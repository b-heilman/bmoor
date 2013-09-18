;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Button',
	namespace : ['bmoor','node','input'],
	parent : ['bmoor','node','input','Basic'],
	properties: {
		_listen : function(){
			var 
				dis = this,
				el = this.element;
			
			el.onclick = function(){ dis._onChange(); };
		},
		val : function( value ){
			if ( value ){
				if ( this.element.value == value ){
					this.$.addClass('active');
				}else{
					this.$.removeClass('active');
				}
			}else{
				return this.element.value;
			}
		}
	}
});

}( jQuery, this ));