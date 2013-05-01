;(function( $, global, undefined ){
bMoor.constructor.define({
	name : 'Glyph',
	namespace : ['bmoor','glyphing'],
	require: {
		references : { 'jQuery.fn.jqote' : ['jquery','jqote2'] },
		classes : [ ['bmoor','Model'] ]
	},
	construct : function( settings, limits, $root ){
		var
			style = null,
			$glyph;
		
		this.limits = limits;
		this.active = false;
		this.settings = this.parseSettings( settings );
		this.template = this.settings.template;
		
		delete this.settings.template;
		
		style = $.extend( {},this.__static.settings.style, this.settings.style );
		$glyph = this.makeNode( style );
		
		this.$ = $glyph;
		this.model = new bmoor.Model();
		this.setModelValues( this.makeModelValues(style, settings, this.template) );
		
		if ( $root ){
			$root.append( $glyph );
		}else if ( this.__static.settings.root ){
			$( this.__static.settings.root ).append( $glyph );
		}else{
			$( document.body ).append( $glyph );
		}
		
		this.model.gap = {
			left : parseInt( $glyph.css('padding-left') ) + parseInt( $glyph.css('border-left-width') ),
			top  : parseInt( $glyph.css('padding-top') ) + parseInt( $glyph.css('border-top-width') )
		};
			
		this.model._bind( this );
		
		$glyph.data( 'self', this );
	},
	onReady : function(){
		$(document.body)
			.on('mouseenter','.glyphing-glyph', function( event ){
				$(this).addClass('glyph-active');
			})
			.on('mouseleave','.glyphing-glyph', function( event ){
				$(this).removeClass('glyph-active');
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
				rotation  : 0,
				opacity   : 1
			}
		}
	},
	publics : {
		// glyphing setters
		makeModelCleanses : function(){
			return {
				top : parseInt,
				left : parseInt,
				width: parseInt,
				height : parseInt
			}
		},
		makeModelValues : function( style, settings, template ){
			return {
				width   : style.width,
				height  : style.height,
				top     : style.top,
				left    : style.left,
				opacity : style.opacity,
				angle   : style.angle
			};
		},
		makeModelDefaults : function(){
			return {
				top     : this.$.position().top,
				left    : this.$.position().left,
				width   : this.$.width(),
				height  : this.$.height(),
				opacity : 1,
				angle   : 0
			}
		},
		setModelValues : function( values ){
			var 
				defaults = this.makeModelDefaults(),
				cleanses = this.makeModelCleanses();
			
			for( var dex in values ){
				if ( values[dex] !== undefined && values[dex] !== null ){
					if ( cleanses[dex] ){
						this.model[dex] = cleanses[dex]( values[dex] );
					}else{
						this.model[dex] = values[dex];
					}
					
					delete defaults[dex];
				}
			}
			
			for( var dex in defaults ){
				if ( cleanses[dex] ){
					this.model[dex] = cleanses[dex]( defaults[dex] );
				}else{
					this.model[dex] = defaults[dex];
				}
			}
		},
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
		setCenter : function( x, y ){
			this.model.left = ( x - this.model.width / 2 );
			this.model.top = ( y - this.model.height / 2 );
			
			return this;
		},
		// glyph info
		isGlyph : true,
		getModel : function(){
			return this.model;
		},
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
			return $( '#'+this.template.id ).jqote( this.template.settings );
		},
		redraw : function(){
			var
				rotate = 'rotate('+this.model.angle+'deg)';
				
			this.$.css( {
				top     : (this.model.top - this.model.gap.top)+'px',
				left    : (this.model.left - this.model.gap.left)+'px',
				width   : this.model.width+'px',
				height  : this.model.height+'px',
				opacity : this.model.opacity,
				'-webkit-transform' : rotate,
				'-moz-transform'    : rotate,
				'-ms-transform'     : rotate,
				'trasnform'         : rotate
			});
			
			return this;
		},
		modelUpdate : function(){
			if ( this.model.remove ){
				this.$.remove();
			}else if ( this.active !== this.model.active ){
				if ( this.model.active ){
					this.$.addClass('active-glyph');
				}else{
					this.$.removeClass('active-glyph');
				}
				
				this.active = this.model.active;
			}
			
			this.redraw();
		},
		_toJson : function( obj ){
			return 'top:'   + obj.top
				+ ',left:'    + obj.left
				+ ',height:'  + obj.height
				+ ',width:'   + obj.width
				+ ',opacity:' + obj.opacity
				+ ',angle:'   + obj.angle;
		},
		toJson : function(){
			return '{' + this._toJson( this.toObject() ) + '}';
		},
		toObject : function(){
			return {
				top     : this.model.top,
				left    : this.model.left,
				height  : this.model.height,
				width   : this.model.width,
				opacity : this.model.opacity,
				angle   : this.model.angle
			};
		}
	}
});
}( jQuery, this ));