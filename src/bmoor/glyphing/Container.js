;(function( $, global, undefined ){

var 
	activeGlyph = null;	
	
bMoor.constructor.define({
	name : 'Container',
	namespace : ['bmoor','glyphing'],
	require: [
		['bmoor','glyphing','Glyph'],
		['bmoor','Collection']
	],
	construct: function( el, settings ){
		var 
			$el = $(el),
			$this = this.makeNode( $el ),
			dis = this;
		
		settings = this.settings = $.extend( true, {}, this.__static.settings, settings );
		
		$el.data( 'self', this );  // for external reference
		$this.data( 'self', this ).insertBefore( $el ).append( $el ); // for trigger reference
		
		this.glyphs = new bmoor.Collection();
		console.log( this.glyphs );
		this.locked = false;
		this.$ = $this;
		this.$el = $el;
		this.controller = null;
		
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
				dis = $(this).data('self');
				
			for( var i = 0; i < dis.glyphs.length; i++ ){
				if ( dis.glyphs[i] == glyph ){
					glyph.$.remove();
					dis.glyphs.splice( i, 1 );
				}
			}
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
		isLocked : function(){
			return this.locked;
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
		collectionUpdate : function(){
			console.log( 'yay' );
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