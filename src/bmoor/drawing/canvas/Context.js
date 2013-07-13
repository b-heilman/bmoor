;(function( $, global, undefined ){

bMoor.constructor.define({
	name      : 'Context',
	namespace : ['bmoor','drawing','canvas'],
	construct: function Context( canvas, ratio ){
		if ( typeof(canvas) != 'object' ){
			console.trace();
		}
		
		if ( !ratio ){
			ratio = 1;
		}
		
		if ( canvas == undefined ){
			console.trace();
		}else if ( canvas[0] != undefined ){
			canvas = canvas[0];
		}
		
		this.element = canvas;
		this.$ = $(canvas);
		this.ctx = canvas.getContext('2d');
		this.ratio = ratio;
		this.size = {};
		this.offset = 0;
		
		this.resetMargin();
		
		this.calcSize();
	},
	properties : {
		/**
		 * Clear the entire canvas
		 *
		 * @this {estenda.graphing.Context}
		 * @access public
		 */
		clear : function(){
			this.ctx.clearRect( 0, 0, this.element.width * this.ratio, this.element.height * this.ratio );
		},
		clearRect : function( x0, y0, width, height ){
			x0 *= this.ratio;
			y0 *= this.ratio;
			width *= this.ratio;
			height *= this.ratio;
			
			if ( this.offset ){
				x0 += this.offset;
				y0 += this.offset;
			}
			
			this.ctx.clearRect( x0, y0, width, height );
		},
		/**
		 * Set the margin of the canvas object, an offset for all elements drawn
		 *
		 * @this {estenda.graphing.Context}
		 * @access public
		 *
		 * @param {number} left The left margin
		 * @param {number} top The top margin
		 */
		setMargin : function( left, top ){
			this.margin = { top : top, left : left };
		},
		
		resetMargin : function(){
			this.margin = false;
		},
		
		calcSize : function(){
			this.size.width = this.$.width();
			this.element.width = this.size.width * this.ratio;
			
			this.size.height = this.$.height();
			this.element.height = this.size.height * this.ratio;
		},

		getContext : function(){
			return this.ctx;
		},

		lineWidth : function( width ){
			if ( width ){
				this.ctx.lineWidth = width * this.ratio;
				
				if ( width > 1 ){
					this.offset = Math.floor(width/2) + 0;
				}else{
					this.offset = 0;
				}
				
				return this;
			}else{
				return this.ctx.lineWidth;
			}
		},

		strokeStyle : function( color ){
			if ( color ){
				this.ctx.strokeStyle = color;
				return this;
			}else{
				return this.ctx.strokeStyle;
			}
		},

		font : function( font ){
			if ( font ){
				this.ctx.font = font;
				return this;
			}else{
				return this.ctx.font;
			}
		},
		
		fillStyle : function( color ){
			if ( color ){
				this.ctx.fillStyle = color;
				return this;
			}else{
				return this.ctx.fillStyle;
			}
		},

		globalAlpha : function( alpha ){
			if ( alpha ){
				this.ctx.globalAlpha = alpha;
				return this;
			}else{
				return this.ctx.globalAlpha;
			}
		},
		
		moveTo : function( x0, y0 ){
			x0 *= this.ratio;
			y0 *= this.ratio;
			
			if ( this.offset ){
				x0 += this.offset;
				y0 += this.offset;
			}
				
			if ( this.margin ){
				x0 += this.margin.left;
				y0 += this.margin.top;
			}
				
			this.ctx.moveTo( x0, y0 );
			
			return this;
		},

		lineTo : function( x0, y0 ){
			x0 *= this.ratio;
			y0 *= this.ratio;
				
			if ( this.offset ){
				x0 += this.offset;
				y0 += this.offset;
			}
			
			if ( this.margin ){
				x0 += this.margin.left;
				y0 += this.margin.top;
			}
			
			this.ctx.lineTo( x0, y0 );
			
			return this;
		},

		createLinearGradient : function( x0, y0, x1, y1 ){
			x0 *= this.ratio;
			y0 *= this.ratio;
			x1 *= this.ratio;
			y1 *= this.ratio;
			
			if ( this.margin ){
				x0 += this.margin.left;
				y0 += this.margin.top;
				x1 += this.margin.left;
				y1 += this.margin.top;
			}
			
			return this.ctx.createLinearGradient( x0, y0, x1, y1 );
		},
		
		fillRect : function( x0, y0, width, height ){
			x0 *= this.ratio;
			y0 *= this.ratio;
			width *= this.ratio;
			height *= this.ratio;
			
			if ( this.margin ){
				x0 += this.margin.left;
				y0 += this.margin.top;
			}
			
			this.ctx.fillRect( x0, y0, width, height );
			
			return this;
		},

		fillRectCoord : function( x0, y0, x1, y1 ){
			this.fillRect( x0, y0, x1 - x0, y1 - y0 );
			
			return this;
		},
		
		fillRectPercent : function( leftPercent, topPercent, widthPercent, heightPercent ){
			if ( this.margin ){
				this.fillRect(
					(this.size.width - this.margin.left) * leftPercent, 
					(this.size.height - this.margin.top) * topPercent,
					(this.size.width - this.margin.left) * widthPercent, 
					(this.size.height - this.margin.top) * heightPercent
				);
			}else{
				this.fillRect(
					this.size.width * leftPercent, 
					this.size.height * topPercent,
					this.size.width * widthPercent, 
					this.size.height * heightPercent
				);
			}
			
			return this;
		},
		
		strokeRect : function( x0, y0, width, height ){
			x0 *= this.ratio;
			y0 *= this.ratio;
			width *= this.ratio;
			height *= this.ratio;
			
			if ( this.offset ){
				x0 += this.offset;
				y0 += this.offset;
			}
			
			if ( this.margin ){
				x0 += this.margin.left;
				y0 += this.margin.top;
			}
			
			this.ctx.strokeRect( x0, y0, width, height );
			
			return this;
		},

		strokeRectCoord : function( x0, y0, x1, y1 ){
			this.ctx.strokeRect(
				x0, 
				y0,
				x1 - x0, 
				y1 - y0
			);
			
			return this;
		},
		
		fillStrokePercent : function( leftPercent, topPercent, widthPercent, heightPercent ){
			if ( this.margin ){
				this.strokeRect(
					(this.size.width - this.margin.left) * leftPercent, 
					(this.size.height - this.margin.top) * topPercent,
					(this.size.width - this.margin.left) * widthPercent, 
					(this.size.height - this.margin.top) * heightPercent
				);
			}else{
				this.strokeRect(
					this.size.width * leftPercent, 
					this.size.height * topPercent,
					this.size.width * widthPercent, 
					this.size.height * heightPercent
				);
			}
			
			return this;
		},
		
		arc : function( x0, y0, radius, startAngle, endAngle, antiClockwise ){
			x0 *= this.ratio;
			y0 *= this.ratio;
			
			if ( this.offset ){
				x0 += this.offset;
				y0 += this.offset;
			}
			
			if ( this.margin ){
				x0 += this.margin.left;
				y0 += this.margin.top;
			}
			
			this.ctx.arc( 
				x0, 
				y0, 
				radius * this.ratio, 
				startAngle, 
				endAngle, 
				antiClockwise 
			);
			
			return this;
		},
		
		createRadialGradient : function( x0, y0, r0, x1, y1, r1 ){
			var 
				offset = Math.floor( this.ratio/2 ),
				center = offset + .5;
			
			x0 *= this.ratio + center; 
			y0 *= this.ratio + center; 
			r0 *= this.ratio + offset; 
			x1 *= this.ratio + center; 
			y1 *= this.ratio + center; 
			r1 *= this.ratio + offset;
				
			x0 += center; 
			y0 += center; 
			x1 += center; 
			y1 += center; 
			
			if ( this.margin ){
				x0 += this.margin.left; 
				y0 += this.margin.top; 
				x1 += this.margin.left; 
				y1 += this.margin.top; 
			}
			
			return this.ctx.createRadialGradient( x0, y0, r0, x1, y1, r1 );
		},
		
		bezierCurveTo : function( bx0, by0, bx1, by1, x1, y1 ){
			bx0 *= this.ratio; 
			by0 *= this.ratio; 
			bx1 *= this.ratio; 
			by1 *= this.ratio; 
			x1 *= this.ratio; 
			y1 *= this.ratio;
				
			if ( this.margin ){
				bx0 += this.margin.left; 
				by0 += this.margin.top; 
				bx1 += this.margin.left; 
				by1 += this.margin.top; 
				x1  += this.margin.left; 
				y1  += this.margin.top;
			}
				
			return this.ctx.bezierCurveTo( bx0, by0, bx1, by1, x1, y1 );
		},
		
		quadraticCurveTo : function( cx0, cy0, x1, y1 ){
			cx0 *= this.ratio; 
			cy0 *= this.ratio; 
			x1 *= this.ratio; 
			y1 *= this.ratio;
				
			if ( this.margin ){
				cx0 += this.margin.left; 
				cy0 += this.margin.top; 
				x1  += this.margin.left; 
				y1  += this.margin.top;
			}
			
			return this.ctx.quadraticCurveTo( cx0, cy0, x1, y1 );
		},
		
		stroke : function(){
			this.ctx.stroke();
			return this;
		},
		
		fill : function(){
			this.ctx.fill();
			return this;
		},
		
		beginPath : function(){
			this.ctx.beginPath();
			return this;
		},
		
		closePath : function(){
			this.ctx.closePath();
			return this;
		},
		
		lineCap : function( cap ){
			this.ctx.lineCap = cap;
			return this;
		},
		
		drawImage : function( image, x0, y0, width, height ){
			x0 *= this.ratio;
			y0 *= this.ratio;
					
			if ( this.margin ){
				x0 += this.margin.left;
				y0 += this.margin.top;
			}
			
			if ( width ){
				this.ctx.drawImage( image, x0, y0, width, height );
			}else{
				this.ctx.drawImage( image, x0, y0 );
			}
			return this;
		},
		
		toDataURL : function(){
			return this.element.toDataURL();
		},
		
		measureText : function( text ){
			return this.ctx.measureText(text);
		},
		
		strokeText : function( text, x, y, width ){
			if ( width ){
				this.ctx.strokeText( text, x, y );
			}else{
				this.ctx.strokeText( text, x, y );
			}
			
			return this;
		}
	}
});

}( jQuery,this) );