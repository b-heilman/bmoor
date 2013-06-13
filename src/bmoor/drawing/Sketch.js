;(function( $, global, undefined ){

var lastPosition;

bMoor.constructor.define({
	name : 'Sketch',
	namespace : ['bmoor','drawing'],
	parent : ['bmoor','snap','Node'],
	require: [ 
		['bmoor','lib','MouseTracker'],
		['bmoor','model','Map'],
		['bmoor','drawing','Context']
	],
	onReady : function(){
		lastPosition = bmoor.lib.MouseTracker;
				
		$( document.body ).on('mousedown', '.drawing-sketch', function (event) {
			var 
				$this = $(this),
				offset = $this.offset(),
				node = $this.data('node'),
				onMove = function( event ){
					node._continueStroke( event.pageX - offset.left, event.pageY - offset.top );
				},
				onUp = function(){
					node._endStroke( lastPosition.x - offset.left, lastPosition.y - offset.top );
					onOut();
				},
				onOut = function(){
					$(document.body).unbind( 'mousemove', onMove );
					$(document.body).unbind( 'mouseup', onUp );
					$(document.body).unbind( 'mouseout', onOut );
				};
			
			node._startStroke( lastPosition.x - offset.left, lastPosition.y - offset.top );
			
			$(document.body).bind( 'mousemove', onMove );
			$(document.body).bind( 'mouseup', onUp );
			$(document.body).bind( 'mouseout', onOut );
		});
	},
	properties : {
		baseClass : 'drawing-sketch',
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
		},
		_data : function( settings ){
			if ( !settings ){
				settings = new bmoor.model.Map();
			}else if( !settings._bind ){
				settings = new bmoor.model.Map( map );
			}
			
			if ( !settings.color ){
				settings.color = 'black';
			}
			
			if ( !settings.width ){
				settings.width = 1;
			}
			
			this.__Node._data.call( this, settings );
		},
		_startStroke: function( x, y ){
			this.ctx.strokeStyle( this.data.color );
			this.ctx.lineWidth( this.data.width );
			
			this.ctx.moveTo( x, y );
			this.ctx.beginPath();
		},
		_continueStroke: function( x, y ){
			this.ctx.lineTo( x, y );
			this.ctx.stroke();
		},
		_endStroke: function( x, y ){
			this.ctx.lineTo( x, y );
			this.ctx.stroke();
			
			this.ctx.closePath();
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