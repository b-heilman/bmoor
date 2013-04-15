;(function( $, global, undefined ){
bMoor.constructor.define({
	name : 'Glyph',
	namespace : ['bmoor','glyphing'],
	require: [
		['jquery','jqote2'] // TODO : this is not technically the namespace...
	],
	construct : function( settings, limits, $root ){
		var
			style = {},
			$glyph;
		
		this.settings = this.parseSettings( settings );
		
		$glyph = this.makeNode( $.extend({},this.__static.settings.style, settings.style) );
		
		this.$ = $glyph;
		this.stats = style;
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
		this.stats.top  = parseInt(this.stats.top) - this.stats.gap.top;
		this.stats.left = parseInt(this.stats.left) - this.stats.gap.left;
		
		this.redraw();
		
		$glyph.data( 'glyph', this );
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
		setCenter : function( x, y ){
			this.setLeft( x - this.stats.width / 2 );
			this.setTop( y - this.stats.height / 2 );
		},
		setLeft : function ( left ){
			this.stats.left = left;
		},
		setTop : function( top ){
			this.stats.top = top;
		},
		setWidth : function ( width ){
			this.stats.width = width;
		},
		setHeight : function ( height ){
			this.stats.height = height;
		},
		setOpacity : function ( opacity ){
			this.stats.opacity = opacity;
		},
		setAngle : function ( angle ){
			this.stats.angle = angle;
		},
		redraw : function(){
			this.$.css( {
				top     : this.stats.top - this.stats.gap.top,
				left    : this.stats.left - this.stats.gap.left,
				width   : this.stats.width,
				height  : this.stats.height,
				opacity : this.stats.opacity
			});
		},
		// glyph info
		isGlyph : true,
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
			
			return settings;
		},
		getClass : function(){
			return 'glyphing-glyph';
		},
		makeStyle : function( style ){
			return 'top:'+ parseInt(style.top) 
				+ 'px; left:' + parseInt(style.left) 
				+ 'px; width:' + parseInt(style.width)
				+ 'px; height:' + parseInt(style.height)
				+ 'px; position:absolute; border:'+ style.border+';';
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
						gap      : dis.stats.gap,
						opacity  : dis.stats.opacity,
						rotation : dis.stats.rotation
					};
					
				if ( !dis.limits
					|| (dis.limits.left < stats.left 
						&& dis.limits.top < stats.top
						&& dis.limits.right > stats.left + stats.width
						&& dis.limits.bottom > stats.top + stats.height) ){
					dis.stats = stats;
					dis.redraw();
				}
			};
			
			$(document.body).mouseup( onMouseup );
			$(document.body).mousemove( onMove );
		},
		_toJson : function( obj ){
			return 'top:'    + obj.top
				+ ',left:'   + obj.left
				+ ',height:' + obj.height
				+ ',width:'  + obj.width,
				+ ',opacity:'+ obj.opacity;
		},
		toJson : function(){
			var 
				obj = this.toObject();
				
			return '{' + this._toJson(obj) + '}';
		},
		toObject : function(){
			return {
				top     : parseInt(this.stats.top) + this.stats.gap.top,
				left    : parseInt(this.stats.left) + this.stats.gap.left,
				height  : parseInt(this.stats.height),
				width   : parseInt(this.stats.width),
				opacity : this.stats.opacity
			};
		}
	}
});
}( jQuery, this ));