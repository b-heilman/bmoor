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
		this.model = null;
		
		this.$top = $el.find('.top');
		this.$left = $el.find('.left');
		this.$angle = $el.find('.angle');
		this.$width = $el.find('.width');
		this.$height = $el.find('.height');
		this.$opacity = $el.find('.opacity');
		
		onAlter( this.$top, function(){
			dis.model.top = dis.$top.val();
		});
		
		onAlter( this.$left, function(){
			dis.model.left = dis.$left.val();
		});
		
		onAlter( this.$width, function(){
			dis.model.width = dis.$width.val();
		});
		
		onAlter( this.$height, function(){
			dis.model.height = dis.$height.val();
		});
		
		onAlter( this.$opacity, function(){
			dis.model.opacity = dis.$opacity.val();
		});
		
		onAlter( this.$angle, function(){
			dis.model.angle = dis.$angle.val();
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
			if ( this.model ){
				this.model._stop();
			}
			
			this.glyph = glyph;
			this.model = this.glyph.getModel()._bind( this )._start();
		},
		modelUpdate : function(){
			this.$height.val( this.model.height );
			this.$width.val( this.model.width );
			this.$top.val( this.model.top );
			this.$left.val( this.model.left );
			this.$opacity.val( this.model.opacity );
			this.$angle.val( this.model.angle );
		},
		clearGlyph : function( ){
			if ( this.model ){
				this.model._stop();
			}
			
			this.model = null;
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