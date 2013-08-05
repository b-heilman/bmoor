;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Sketch',
	namespace : ['bmoor','drawing'],
	parent : ['bmoor','snap','Node'],
	require: [
		['bmoor','lib','MouseTracker'],
		['bmoor','drawing','Context'],
		['bmoor','drawing','stroke','Brush']
	],
	node : {
		className : 'drawing-sketch',
		helpers : {
			lastPosition : bmoor.lib.MouseTracker
		},
		actions : {
			'mousedown' : function ( event, node, helpers ) {
				var 
					lastPosition = helpers.lastPosition,
					offset = node.$.offset(),
					stroke = new (bMoor.get( node.model.stroke ))( node.ctx, node.model ),
					onMove = function( event ){
						stroke.move( event.pageX - offset.left, event.pageY - offset.top );
					},
					onUp = function(){
						onOut();
					},
					onOut = function(){
						stroke.end( lastPosition.x - offset.left, lastPosition.y - offset.top );
						
						$(document.body).unbind( 'mousemove', onMove );
						$(document.body).unbind( 'mouseup', onUp );
						$(document.body).unbind( 'mouseout', onOut );
					};
				
				stroke.start( lastPosition.x - offset.left, lastPosition.y - offset.top );
				
				$(document.body).bind( 'mousemove', onMove );
				$(document.body).bind( 'mouseup', onUp );
				$(document.body).bind( 'mouseout', onOut );
				
				return false;
			}
		}
	},
	properties : {
		_element : function( element ){
			if ( element.nodeName != 'CANVAS' ){
				var canvas = document.createElement('canvas');
				
				element.style.position = 'relative';
				canvas.style.position = 'absolute';
				canvas.style.left = '0px';
				canvas.style.top = '0px';
				canvas.style.width = '100%';
				canvas.style.height = '100%';
				
				element.appendChild( canvas );
				element = canvas;
			}
			
			this.__Node._element.call( this, element );
			
			this.ctx = new bmoor.drawing.Context( this.element, 3 );
			
			element.style.cssText += '-moz-user-select: none; -khtml-user-select: none; -webkit-user-select: none; user-select: none;';
			element.setAttribute('unselectable', 'on');
			element.onselectstart = function() { if (dragging) return false; };
		},
		_model : function(){
			this.__Node._model.call( this );

			if ( !this.model.color ){
				this.model.color = 'black';
			}
			
			if ( !this.model.width ){
				this.model.width = 1;
			}
			
			if ( !this.model.stroke ){
				this.model.stroke = 'bmoor.drawing.stroke.Brush';
			}
		},
		save : function(){
			return this.ctx.toDataURL();
		},
		load : function( dataURL, cb ){
			var 
				ctx = this.ctx,
				img = new Image();
			
			img.onload = function(){
				ctx.clear();
				ctx.drawImage(this, 0, 0);
				
				if ( cb ){
					cb();
				}
			};
			
			img.src = dataURL;
		},
		resize : function(){
			this.ctx.calcSize();
		},
		locked : true,
		lock : function(){
			this.$.removeClass( 'unlocked' );
			this.locked = true;
			
			return this;
		},
		unlock : function(){
			this.$.addClass( 'unlocked' );
			this.locked = false
			
			return this;
		}
	}
});
}( jQuery, this ));