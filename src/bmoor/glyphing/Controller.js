;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Controller',
	namespace : ['bmoor','glyphing'],
	require: [
		['bmoor','glyphing','Glyph']
	],
	construct: function( el, settings ){
		var 
			$el = $(el),
			dis = this;
		
		this.$ = $el;
		settings = this.settings = $.extend( true, {}, this.__static.settings, settings );
		
		this.glyph = null;
		
		this.$top = $el.find('.top');
		this.$left = $el.find('.left');
		this.$angle = $el.find('.angle');
		this.$width = $el.find('.width');
		this.$height = $el.find('.height');
		this.$opacity = $el.find('.opacity');
		
		onAlter( this.$top, function(){
			dis.glyph.setTop( dis.$top.val() );
		});
		
		onAlter( this.$left, function(){
			dis.glyph.setLeft( dis.$left.val() );
		});
		
		onAlter( this.$width, function(){
			dis.glyph.setWidth( dis.$width.val() );
		});
		
		onAlter( this.$height, function(){
			dis.glyph.setHeight( dis.$height.val() );
		});
		
		onAlter( this.$opacity, function(){
			dis.glyph.setOpacity( dis.$opacity.val() );
		});
		
		onAlter( this.$angle, function(){
			dis.glyph.setAngle( dis.$angle.val() );
		});
		
		function onAlter( $el, callback ){
			var
				wait = null;
			
			$el.keydown(function(){
				if ( wait ){
					clearTimeout( wait );
				}
				
				wait = setTimeout( function(){ $el.blur(); }, 500 );
			});
			
			$el.blur( function(){
				if ( dis.glyph != null ){
					callback(); 
					dis.glyph.redraw();
				}
			});
		}
	},
	statics : {
		settings : {
		}
	},
	publics : {
		setGlyph: function( glyph ){
			this.glyph = glyph;
			
			this.updateInfo();
		},
		updateInfo : function(){
			var
				data = this.glyph.toObject();
			
			this.$height.val( data.height );
			this.$width.val( data.width );
			this.$top.val( data.top );
			this.$left.val( data.left );
			this.$opacity.val( data.opacity );
			this.$angle.val( data.angle );
		},
		clearGlyph : function( ){
			this.glyph = null;
			
			this.$height.val('');
			this.$width.val('');
			this.$top.val('');
			this.$left.val('');
			this.$opacity.val('');
			this.$angle.val('');
		}
	}
});
}( jQuery, this ));