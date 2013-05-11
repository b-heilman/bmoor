;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Controller',
	namespace : ['bmoor','glyphing'],
	require: [
		['bmoor','glyphing','Glyph']
	],
	construct: function( el, container, fields ){
		var 
			$el = $(el),
			dis = this;
		
		this.$ = $el;
		
		this.glyph = null;
		this.model = null;
		this.fields = fields;
		
		this.collection = container.getCollection();
		this.collection._bind(this);
		
		for( var k in fields ){
			(function( field ){
				var 
					$input = $el.find('.'+field);
				
				dis['$'+field] = $input;
				onAlter( $input, function(){
					dis.model[field] = $input.val();
				});
			}( fields[k] ));
		}
		/*
		this.$top = $el.find('.top');
		this.$left = $el.find('.left');
		this.$angle = $el.find('.angle');
		this.$width = $el.find('.width');
		this.$height = $el.find('.height');
		this.$opacity = $el.find('.opacity');
		*/
		function onAlter( $el, callback ){
			var
				wait = null;
			
			if ( $el.is('button') ){
				var t = $el.attr('value');
				$el.on('click', function(){
					if ( dis.model != null ){
						$el.val( t ); // make sure to reset it
						callback();
					}
				});
			}else{
				$el.keydown(function(){
					if ( wait ){
						clearTimeout( wait );
					}
					
					wait = setTimeout( function(){ $el.change(); }, 500 );
				});
				
				$el.on('change', function(){
					if ( dis.model != null ){
						callback();
					}
				});
			}
		}
	},
	properties : { 
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
			for( var k in this.fields ){
				var 
					field = this.fields[k];
				
				this['$'+field].val( this.model[field] );
			}
		},
		clearGlyph : function( ){
			if ( this.model ){
				this.model._stop();
			}
			
			this.model = null;
			this.glyph = null;
			
			for( var k in this.fields ){
				var 
					field = this.fields[k];
				
				this['$'+field].val( '' );
			}
		}
	}
});
}( jQuery, this ));