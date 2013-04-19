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
		
		this.glyphs = new bmoor.Collection();
		this.glyphs._bind( this )._start();
		this.locked = true;
		this.$ = $this;
		this.$el = $el;
		this.controller = null;
		
		left = dis.$.offset().left;
		top  = dis.$.offset().top;
		
		this.$.data( 'self', this );
		this.$.addClass( 'glyphing-container' );
		$this.insertBefore( $el ).append( $el ); // for trigger reference
		
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
		var 
			lastPosition = {},
			activeModel;
				
		$(document.body).on( 'keydown', function(event){
			if( !$(event.target).is(':input') ){
				console.log( event );
			}
		});
		
		$(document.body).on( 'mousedown', '.glyphing-container .glyphing-glyph', function( event ){
			var
				$this = $(this),
				dis = $this.closest('.glyphing-container').data( 'self' );
			
			dis.setActive( $this.data('self') );
			
			event.stopPropagation();
			event.preventDefault();
		});
			
		function creationDrag(){
			var 
				limits = null;
				startPos = lastPosition,
				onStart = {
					width  : activeModel.width,
					height : activeModel.height,
					top    : activeModel.top,
					left   : activeModel.left
				},
				onMove = null,
				onMouseup = null;
					
			onMouseup = function(){
				$(document.body).unbind( 'mousemove', onMove );
				$(document.body).unbind( 'mouseup', onMouseup );
			};
			
			onMove = function( event ){
				var
					xDiff = Math.abs( startPos.x - event.pageX ),
					yDiff = Math.abs( startPos.y - event.pageY );
				
				activeModel.width = onStart.width + xDiff + xDiff;
				activeModel.height = onStart.height + yDiff + yDiff;
				activeModel.top = onStart.top - yDiff;
				activeModel.left = onStart.left - xDiff;
			};
				
			$(document.body).mouseup( onMouseup );
			$(document.body).mousemove( onMove );
		}
		// mouse down is triggering the creation of a glyph to be added
		$(document.body).on('mousedown', '.glyphing-container', function( event ){
			var container = $(this).data( 'self' );
			
			if ( !container.isLocked() ){
				activeModel = container.addGlyph({
					left : lastPosition.x - container.$.offset().left,
					top  : lastPosition.y - container.$.offset().top
				}).getModel();
			
				event.stopPropagation();
				event.preventDefault();
				
				creationDrag();
			}
		});
		
		// Make this something better... reusable module
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
		unlock : function(){
			this.locked = false
			
			return this;
		},
		isLocked : function(){
			return this.locked;
		},
		getCollection : function(){
			return this.glyphs;
		},
		setGlyphClass : function( className ){
			this.settings.glyphClass = className;
		},
		setGlyphSettings : function( settings ){
			this.settings.glyphSettings = $.extend( true, this.settings.glyphSettings, settings );
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
		setActive : function( glyph ){
			// TODO : check to see if the glyph is in the container... ideally
			
			if ( activeGlyph ){	
				var	t = activeGlyph.getModel();
				t.active = false;
				t._stop();
			}
			
			activeGlyph = glyph;
			
			activeGlyph.getModel()._start().active = true;
		},
		addGlyph : function( info ){
			if ( info.isGlyph ){
				this.setActive( info );

				this.glyphs.push( activeGlyph );
				this.$el.trigger( 'new-glyph', [activeGlyph] );
				
				return activeGlyph;
			} else{
				return this.addGlyph( new this.settings.glyphClass($.extend(true, {}, this.settings.glyphSettings, info), this.box, this.$) );
			}
		},
		collectionUpdate : function(){
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