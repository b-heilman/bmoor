;(function( $, global, undefined ){
bMoor.constructor.define({
	name : 'Glyph',
	namespace : ['bmoor','glyphing'],
	require: [
		['jquery','jqote2'] // TODO : this is not technically the namespace...
	],
	construct : function( settings, limits, $root ){
		var
			style = null,
			$glyph;
		
		this.settings = this.parseSettings( settings );
		style = $.extend( {},this.__static.settings.style, this.settings.style );
		$glyph = this.makeNode( style );
		
		this.$ = $glyph;
		this.stats = {};
		this.setStats( style );
		this.limits = limits;
		this.shiftOn = false;
		
		if ( $root ){
			$root.append( $glyph );
		}else if ( this.__static.settings.root ){
			$( this.__static.settings.root ).append( $glyph );
		}else{
			$( document.body ).append( $glyph );
		}
		
		this.stats.gap = {
			left : parseInt( $glyph.css('padding-left') ) + parseInt( $glyph.css('border-left-width') ),
			top  : parseInt( $glyph.css('padding-top') ) + parseInt( $glyph.css('border-top-width') )
		};
			
		// we need to adjust the positioning of the node now that we know the gaps
		
		this.redraw();
		
		$glyph.data( 'self', this );
	},
	onReady : function(){
		$(document.body).on('mouseenter','.glyphing-glyph', function( event ){
			$(this).addClass('glyph-active');
		});
		
		$(document.body).on('mouseleave','.glyphing-glyph', function( event ){
			$(this).removeClass('glyph-active').find(':input').blur();
		});
	},
	statics : {
		settings : {
			template : {
				id : '',
				settings : {}
			},
			style : {
				width     : '0px',
				height    : '0px',
				top       : '-999999px',
				left      : '-999999px',
				position  : 'absolute',
				border    : '1px solid black',
				rotation  : 0,
				opacity   : 1
			},
			minimums : {
				width : 5,
				height : 5
			}
		}
	},
	publics : {
		// glyphing setters
		parseSettings : function( settings ){
			if ( !settings.style ){
				settings.style = {};
			}
			
			// allow for settings to be the base style
			if ( settings.top && !settings.style.top ){
				settings.style.top = settings.top;
				delete settings.top;
			}
			
			if ( settings.left && !settings.style.left ){
				settings.style.left = settings.left;
				delete settings.left;
			}
			
			if ( settings.width && !settings.style.width ){
				settings.style.width = settings.width;
				delete settings.width;
			}
			
			if ( settings.height && !settings.style.height ){
				settings.style.height = settings.height;
				delete settings.height;
			}
			
			if ( settings.opacity && !settings.style.opacity ){
				settings.style.opacity = settings.opacity;
				delete settings.opacity;
			}
			
			if ( settings.angle && !settings.style.angle ){
				settings.style.angle = settings.angle;
				delete settings.angle;
			}
			
			return settings;
		},
		setStats : function( stats ){
			if ( stats.top ){
				this.setTop( stats.top );
			}else if ( this.stats.top == undefined ){
				this.setTop( this.$.position().top );
			}
			
			if ( stats.left ){
				this.setLeft( stats.left );
			}else if ( this.stats.left == undefined ){
				this.setLeft( this.$.position().left );
			}
			
			if ( stats.width ){
				this.setWidth( stats.width );
			}else if ( this.stats.width == undefined ){
				this.setWidth( this.$.width() );
			}
			
			if ( stats.height ){
				this.setHeight( stats.height );
			}else if ( this.stats.height == undefined ){
				this.setHeight( this.$.height() );
			}
			
			if ( stats.opacity ){
				this.setOpacity( stats.opacity );
			}else if ( this.stats.opacity == undefined ){
				this.setOpacity( 100 );
			}
			
			if ( stats.angle ){
				this.setAngle( stats.angle );
			}else if ( this.stats.angle == undefined ){
				this.setAngle( 0 );
			}
		},
		setCenter : function( x, y ){
			this.setLeft( x - this.stats.width / 2 );
			this.setTop( y - this.stats.height / 2 );
			return this;
		},
		setLeft : function ( left ){
			this.stats.left = parseInt(left);
			return this;
		},
		setTop : function( top ){
			this.stats.top = parseInt(top);
			return this;
		},
		setWidth : function ( width ){
			this.stats.width = parseInt(width);
			return this;
		},
		setHeight : function ( height ){
			this.stats.height = parseInt(height);
			return this;
		},
		setOpacity : function ( opacity ){
			this.stats.opacity = opacity;
			return this;
		},
		setAngle : function ( angle ){
			this.stats.angle = angle;
			return this;
		},
		redraw : function(){
			var
				rotate = 'rotate('+this.stats.angle+'deg)';
			
			this.$.css( {
				top     : this.stats.top - this.stats.gap.top,
				left    : this.stats.left - this.stats.gap.left,
				width   : this.stats.width,
				height  : this.stats.height,
				opacity : this.stats.opacity,
				'-webkit-transform' : rotate,
				'-moz-transform'    : rotate,
				'-ms-transform'     : rotate,
				'trasnform'         : rotate
			});
			
			return this;
		},
		// glyph info
		isGlyph : true,
		getClass : function(){
			return 'glyphing-glyph';
		},
		makeStyle : function( style ){
			return 'position:absolute; border:'+ style.border+';';
		},
		makeNode : function( style ){
			return $( '<div class="'+this.getClass()+'" style="' + this.makeStyle( style ) + '"/>' ).append( this.getTemplate() );
		},
		getTemplate : function(){
			return $( '#'+this.settings.template.id ).jqote( this.settings.template.settings );
		},
		startTrace : function( startPos ){
			var 
				dis = this,
				onStart = {
					width  : this.$.width(),
					height : this.$.height(),
					top    : this.$.position().top,
					left   : this.$.position().left
				},
				onMove = null,
				onMouseup = null;
				
			onMouseup = function(){
				if ( parseInt(dis.stats.width) <= dis.__static.settings.minimums.width
					|| parseInt(dis.stats.height) <= dis.__static.settings.minimums.height ){
					dis.$.trigger('note-undersized', [dis]);
				}
				
				$(document.body).unbind( 'mousemove', onMove );
				$(document.body).unbind( 'mouseup', onMouseup );
			};
			
			onMove = function( event ){
				var
					xDiff = Math.abs( startPos.x - event.pageX ),
					yDiff = Math.abs( startPos.y - event.pageY ),
					stats = {
						left     : onStart.left - xDiff,
						top      : onStart.top - yDiff,
						width    : onStart.width + xDiff + xDiff,
						height   : onStart.height + yDiff + yDiff,
					};
					
				if ( !dis.limits
					|| (dis.limits.left < stats.left 
						&& dis.limits.top < stats.top
						&& dis.limits.right > stats.left + stats.width
						&& dis.limits.bottom > stats.top + stats.height) ){
					dis.setWidth( stats.width );
					dis.setHeight( stats.height );
					dis.setTop( stats.top );
					dis.setLeft( stats.left );
					
					dis.redraw();
				}
			};
			
			$(document.body).mouseup( onMouseup );
			$(document.body).mousemove( onMove );
		},
		_toJson : function( obj ){
			console.log( obj );
			return 'top:'   + obj.top
				+ ',left:'    + obj.left
				+ ',height:'  + obj.height
				+ ',width:'   + obj.width,
				+ ',opacity:' + obj.opacity,
				+ ',angle:'   + obj.angle;
		},
		toJson : function(){
			return '{' + this._toJson( this.toObject() ) + '}';
		},
		toObject : function(){
			return {
				top     : parseInt(this.stats.top) + this.stats.gap.top,
				left    : parseInt(this.stats.left) + this.stats.gap.left,
				height  : parseInt(this.stats.height),
				width   : parseInt(this.stats.width),
				opacity : this.stats.opacity,
				angle   : this.stats.angle
			};
		}
	}
});
}( jQuery, this ));