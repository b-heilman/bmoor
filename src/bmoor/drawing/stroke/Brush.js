;(function( global, undefined ){
	bMoor.constructor.define({
		name : 'Brush',
		namespace : ['bmoor','drawing','stroke'],
		construct : function( ctx, settings ){
			this.ctx = ctx;
			
			ctx.lineCap( 'round' );
			ctx.strokeStyle( settings.color );
			ctx.lineWidth( settings.width );
		},
		properties : {
			start : function( x, y ){
				this.ctx.moveTo( x, y );
				this.ctx.beginPath();
			},
			move : function( x, y ){
				this.ctx.lineTo( x, y );
				this.ctx.stroke();
			},
			end : function( x, y ){
				this.ctx.lineTo( x, y );
				this.ctx.stroke();
			
				this.ctx.closePath();
			}
		}
	});
}( this ));