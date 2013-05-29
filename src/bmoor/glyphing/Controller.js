;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Controller',
	namespace : ['bmoor','glyphing'],
	require: [
		['bmoor','glyphing','Glyph']
	],
	parent : ['bmoor','snap','Form'],
	properties : { 
		_data : function( data ){
			this.collection = data.getCollection();
			this.data = null;
		},
		_binding : function(){
			var dis = this;
			
			this.collection._bind(function( changes ){
				var collection = dis.collection;
					
				if ( changes == null ){
					for( var i = 0, c = collection.length; i < c; i++ ){
						dis.addGlyph( collection[i] );
					}
				}else{
					if ( changes.additions ){
						for( var i = 0, c = changes.additions.length; i < c; i++ ){
							dis.addGlyph( collection[changes.additions[i]] );
						}
					}
				}
			});
		},
		addGlyph: function( glyph ){
			var 
				dis = this,
				model = glyph.getModel();
			
			model._bind(function(){
				if ( model.active ){
					dis.data = model;
					dis._mapUpdate( this );
				}
			});
		},
		clearGlyph : function( ){
			if ( this.model ){
				this.model._stop();
			}
			
			this.model = null;
			this.glyph = null;
			
			for( var k in this.fields ){
				var field = this.fields[k];
				
				this['$'+field].val( '' );
			}
		}
	}
});
}( jQuery, this ));