;(function( $, global, undefined ){
bMoor.constructor.define({
	name : 'Glyph',
	namespace : ['bmoor','glyphing'],
	require: [ ['bmoor','drawing','Sketch'] ],
	construct : function( settings, limits, $root ){
		var
			dis = this,
			$glyph;
		
		this.limits = limits;
		this.active = false;
		this.settings = $.extend( true, {}, this.__static.settings, settings );
		this.template = this.settings.template;
		this.style = this.settings.style;
		
		delete this.settings.template;
		delete this.settings.style;

		$glyph = this.makeNode( this.settings );
		
		this.$ = $glyph;
		this.model = this.makeModel();
		this.setModelValues( this.makeModelValues(this.settings, this.template) );
		
		if ( $root ){
			$root.append( $glyph );
		}else if ( this.__static.root ){
			$( this.__static.root ).append( $glyph );
		}else{
			$( document.body ).append( $glyph );
		}
		
		this.model.gap = {
			left : parseInt( $glyph.css('padding-left') ) + parseInt( $glyph.css('border-left-width') ),
			top  : parseInt( $glyph.css('padding-top') ) + parseInt( $glyph.css('border-top-width') )
		};
			
		this.model._bind(function(){
			if ( this.remove ){
				dis.$.remove();
			}else if ( dis.active !== this.active ){
				if ( this.active ){
					dis.$.addClass('active-glyph');
				}else{
					dis.$.removeClass('active-glyph');
				}
				
				dis.active = this.active;
			}
			
			dis.draw();
		});
		
		$glyph.data( 'node', this );
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
			minWidth  : 0,
			minHeight : 0,
			style : {
				position  : 'absolute',
				rotation  : 0,
				opacity   : 1
			}
		}
	},
	properties : {
		// glyphing setters
		makeModel : function(){
			return new bmoor.observer.Map({});
		},
		makeModelCleanses : function(){
			return {
				top    : parseInt,
				left   : parseInt,
				width  : parseInt,
				height : parseInt
			};
		},
		makeModelValues : function( settings, template ){
			if ( settings.centerTop ){
				if ( settings.height ){
					settings.top = settings.centerTop 
						- settings.height / 2;
				}else{
					settings.top = settings.centerTop 
						- this.settings.minHeight / 2;
				}
			}
			
			if ( settings.centerLeft ){
				if ( settings.height ){
					settings.left = settings.centerLeft 
						- settings.width / 2;
				}else{
					settings.left = settings.centerLeft
						- this.settings.minWidth / 2;
				}
			}
			
			return {
				width   : settings.width,
				height  : settings.height,
				top     : settings.top,
				left    : settings.left,
				opacity : settings.opacity,
				angle   : settings.angle
			};
		},
		makeModelDefaults : function(){
			return {
				top     : this.$.position().top,
				left    : this.$.position().left,
				width   : this.settings.minWidth,
				height  : this.settings.minHeight,
				opacity : 1,
				angle   : 0
			};
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
		// TODO : need to fix this
		getTemplate : function(){
			if ( this.template ){
				return $( '#'+this.template.id ).jqote( this.template.settings );
			}else return '';
		},
		draw : function(){
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
		toJson : function(){
			return JSON.stringify( this.toObject() );
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