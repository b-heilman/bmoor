;(function( $, global, undefined ){

var // statics
	// rads = 2 * Math.PI,
	activeGlyph = null,
	lastPosition = null;	
	
bMoor.constructor.define({
	name : 'Container',
	namespace : ['bmoor','glyphing'],
	require: [
		['bmoor','glyphing','Glyph']
	],
	construct: function( el, settings ){
		var 
			$el = $(el),
			$this = this.makeNode( $el ),
			dis = this;
		
		settings = this.settings = $.extend( true, {}, this.__static.defaultSettings, settings );
		
		$el.addClass( 'glyphing-container' ).data( 'container', this );          // for external reference
		$this.data( 'container', this ).insertBefore( $el ).append( $el ); // for trigger reference
		
		this.glyphs = [];
		this.locked = false;
		this.$ = $this;
		this.$el = $el;
		
		left = dis.$.offset().left;
		top  = dis.$.offset().top;
		
		if ( settings.keepBoxed ){
			this.box = {
				top    : 0,
				right  : $this.width(),
				bottom : $this.height(),
				left   : 0
			};
		}else{
			this.box = null;
		}
	},
	statics : {
		settings : {
			glyphClass : bmoor.glyphing.Glyph,
			keepBoxed : true,
			glyphSettings : {}
		}
	},
	onReady : function(){
		// listen for a request to delete a glyph.  Glyphs generate these themselves, container has to put them out of their misery
		$(document.body).on('glyph-undersized delete-request', '.glyphing-container', function( event, glyph ){
			var 
				dis = $(this).data('container');
				
			for( var i = 0; i < dis.glyphs.length; i++ ){
				if ( dis.glyphs[i] == glyph ){
					glyph.$.remove();
					dis.glyphs.splice( i, 1 );
				}
			}
		});
	
		// mouse down is triggering the creation of a glyph to be added
		$(document.body).on('mousedown', '.glyphing-container', function( event ){
			var 
				dis = $(this).data('container');
			
			if ( !dis.locked ){
				dis.addGlyph({
					left : lastPosition.x - dis.$.offset().left,
					top  : lastPosition.y - dis.$.offset().top
				}).startTrace( lastPosition );
			
				event.stopPropagation();
				event.preventDefault();
			}
		});
		
		// track the mouse position, may be not be neccisary?
		$(document.body).on('mousemove', function( event ){
			lastPosition = {
				x : event.pageX,
				y : event.pageY
			};
		});
	},
	onDefine : function( inst ){
		$.fn.glyphing = function( settings ){
			this.each(function(){
				new inst( this, settings );
			});
			
			return this;
		};
	},
	publics : {
		lock : function(){
			this.locked = true;
			
			return this;
		},
		setGlyphClass : function( className ){
			this.settings.glyphClass = className;
		},
		setGlyphSettings : function( settings ){
			this.settings.glyphSettings = $.extend( this.settings.glyphSettings, settings );
		},
		getClass : function(){
			return 'glyphing-container';
		},
		makeStyle : function( $el ){
			return 'position: relative; width:'+$el.innerWidth()+'px; height:'+$el.innerHeight()+'px';
		},
		makeNode : function( $el ){
			return $( '<div  class="'+this.getClass()+'" style="'+this.makeStyle($el)+'" />' );
		},
		addGlyph : function( info ){
			if ( info.isGlyph ){
				activeGlyph = info;

				this.glyphs.push( activeGlyph );
				this.$el.trigger( 'new-glyph', [activeGlyph] );
				
				return activeGlyph;
			} else{
				return this.addGlyph( new this.settings.glyphClass($.extend(true, {}, this.settings.glyphSettings, info), this.box, this.$) );
			}
		},
		toJson : function(){
			var
				temp = [];
				
			for( var i = 0; i < this.glyphs.length; i++ ){
				temp[i] = this.glyphs[i].toJson();
			}
			
			return '['+temp.join(',')+']';
		},
		toObject : function(){
			var
				temp = [];
				
			for( var i = 0; i < this.glyphs.length; i++ ){
				temp[i] = this.glyphs[i].toObject();
			}
			
			return temp;
		}
	}
});
}( jQuery, this ));