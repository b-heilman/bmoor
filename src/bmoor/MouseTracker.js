// I should use this as an excuse to write a singleton pattern
;(function( global, undefined ){
	bMoor.constructor.define({
		name : 'MouseTracker',
		namespace : ['bmoor'],
		onDefine : function( inst ){
			var
				lastPosition = {};
				
			$(document.body).on('mousemove', function( event ){
				lastPosition.x = event.pageX;
				lastPosition.y = event.pageY;
			});
			
			bmoor.MouseTracker = lastPosition;
		}
	});
}( this ));