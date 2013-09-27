// I should use this as an excuse to write a singleton pattern
;(function( global, undefined ){
	bMoor.constructor.singleton({
		name : 'KeyboardTracker',
		namespace : ['bmoor','lib'],
		onReady : function( self ){
			$(document.body).on('keydown', function( event ){
				self.activeKeys[ event.which ] = true;
			});

			$(document.body).on('keyup', function( event ){
				delete self.activeKeys[ event.which ];
			});
		},
		properties : {
			activeKeys : {},
			isDown : function( key ){
				return this.activeKeys[ key ];
			}
		}
	});
}( this ));