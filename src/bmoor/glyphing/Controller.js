;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Controller',
	namespace : ['bmoor','glyphing'],
	require: [
		['bmoor','glyphing','Glyph']
	],
	construct: function( el, container ){
		var 
			$el = $(el),
			dis = this;
		
		this.$ = $el;
		
		this.glyph = null;
		this.model = null;
		
		this.collection = container.getCollection();
		this.collection._bind(this);
		
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
	publics : { 
		addGlyph: function( glyph ){
			var 
				dis = this,
				model = glyph.getModel();
			
			model._bind( function(){
				if ( model.active ){
					dis.model = model;
					dis.update( model );
				}
			});
		},
		collectionUpdate : function( changes ){
			var
				collection = this.collection;
				
			if ( changes == null ){
				for( var i = 0, c = collection.length; i < c; i++ ){
					this.addGlyph( collection[i] );
				}
			}else{
				if ( changes.additions ){
					for( var i = 0, c = changes.additions.length; i < c; i++ ){
						this.addGlyph( collection[changes.additions[i]] );
					}
				}
			}
		},
		update : function( model ){
			this.$height.val( model.height );
			this.$width.val( model.width );
			this.$top.val( model.top );
			this.$left.val( model.left );
			this.$opacity.val( model.opacity );
			this.$angle.val( model.angle );
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