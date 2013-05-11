// I should use this as an excuse to write a singleton pattern
;(function( global, undefined ){
	bMoor.constructor.singleton({
		name : 'MouseTracker',
		namespace : ['bmoor', 'lib'],
		onReady : function( obj ){
			$(document.body).on('mousemove', function( event ){
				obj.x = event.pageX;
				obj.y = event.pageY;
			});
		}
	});
}( this ));