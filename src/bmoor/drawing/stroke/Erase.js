;(function( global, undefined ){
	bMoor.constructor.define({
		name : 'Erase',
		namespace : ['bmoor','drawing','stroke'],
		construct : function( ctx, settings ){
			this.ctx = ctx;
			this.width = settings.width;
			this.offset = this.width / 2;
			
			// ctx.globalCompositeOperation = 'destination-out';
		},
		properties : {
			start : function( x, y ){
				this._clear( x, y );
			},
			move : function( x, y ){
				this._clear( x, y );
			},
			end : function( x, y ){
				this._clear( x, y );
			},
			_clear : function( x, y ){
				this.ctx.clearRect( x - this.offset, y - this.offset, this.width, this.width );
			}
		}
	});
}( this ));