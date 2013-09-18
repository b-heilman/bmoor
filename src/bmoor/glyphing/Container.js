;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Container',
	namespace : ['bmoor','glyphing'],
	parent : ['bmoor','node','View'],
	require: [
		['bmoor','lib','MouseTracker'],
		['bmoor','glyphing','Glyph'],
		['bmoor','observer','Collection']
	],
	statics : {
		settings : {
			glyphClass : bmoor.glyphing.Glyph,
			keepBoxed : true,
			glyphSettings : {}
		}
	},
	node : {
		className : 'glyphing-container',
		helpers : {
			lastPosition : bmoor.lib.MouseTracker,
			activeModel : null,
			creationDrag : function( glyph ){
				var 
					activeModel = this.activeModel,
					startPos = {
						x : this.lastPosition.x,
						y : this.lastPosition.y
					},
					onStart = {
						width  : activeModel.width,
						height : activeModel.height,
						top    : activeModel.top,
						left   : activeModel.left
					},
					onMove = null,
					onMouseup = null,
					onMouseout = null;
						
				onMouseup = function(){
					$(document.body).unbind( 'mousemove', onMove );
					$(document.body).unbind( 'mouseup', onMouseup );
					$(document.body).unbind( 'mouseout', onMouseout );
				};
				
				onMouseout = function( event ){
					if ( event.relatedTarget == null || event.relatedTarget.tagName.toUpperCase() == 'HTML' ){
						onMouseup();
					}
				};
				
				onMove = function( event ){
					var
						xDiff = Math.abs( startPos.x - event.pageX ),
						yDiff = Math.abs( startPos.y - event.pageY ),
						width = onStart.width + xDiff + xDiff,
						height = onStart.height + yDiff + yDiff;
					
					if ( width > glyph.minWidth ){
						activeModel.width = width;
						activeModel.left = onStart.left - xDiff;
					}
					
					if ( height > glyph.minHeight ){
						activeModel.height = height;
						activeModel.top = onStart.top - yDiff;
					}
				};
					
				$(document.body).mousemove( onMove );
				$(document.body).mouseup( onMouseup );
				$(document.body).mouseout( onMouseout );
			}
		},
		globals : {
			'keydown' : function( event, $instances, helpers ){
				if( !($(event.target).is(':input') ) ){
					if ( (event.keyCode == 8 || event.keyCode == 46) ){
						$instances.each(function(){
							var dis = $(this).data('node');
							
							if ( !dis.locked && dis.activeGlyph ){
								dis.activeGlyph.getModel().remove = true;
							}
						});
						
						event.stopPropagation();
						event.preventDefault();
					}else if ( event.keyCode == 16 ){
						$instances.each(function(){
							var dis = $(this).data('node');
							
							if ( dis.activeGlyph ){
								var pos = dis.glyphs.find( dis.activeGlyph );
								
								if ( pos == -1 || pos == dis.glyphs.length - 1 ){
									dis.setActive( dis.glyphs[0] );
								}else{
									dis.setActive( dis.glyphs[pos + 1] );
								}
							}else{
								dis.setActive( dis.glyphs[0] );
							}
						});
						
						event.stopPropagation();
						event.preventDefault();
					}else if ( event.keyCode == 27 ){
						$instances.each(function(){
							$(this).data('node').setActive( null );
						});
						
						event.stopPropagation();
						event.preventDefault();
					}
				}
			}
		},
		actions : {
			'mousedown' : {
				'.glyphing-glyph' : function( event, node ){
					var $this = $(this);
					
					node.setActive( $this.data('node') );
				
					event.stopPropagation();
					event.preventDefault();
				},
				'' : function( event, node, helpers ){
					var glyph;
					
					if ( !node.locked ){
						glyph = node.addGlyph({
							centerLeft : helpers.lastPosition.x - node.$.offset().left,
							centerTop  : helpers.lastPosition.y - node.$.offset().top
						});
						helpers.activeModel = glyph.getModel();
					
						event.stopPropagation();
						event.preventDefault();
						
						helpers.creationDrag( glyph );
					}
				}
			}
		}
	},
	properties : {
		_element : function( element ){
			var 
				$this = $( element ),
				$img = $this.find('img'),
				dis = this,
				baseSettings = {};
			
			this.__Node._element.call( this, element );
			
			this.activeGlyph = null;
			this.glyphs = new bmoor.observer.Collection();
			this.glyphs._start();
			this.controller = null;
			
			this.settings = $.extend( true, {}, this.__static.settings, 
				this._getAttribute(
					'settings', {}, function(val){ return dis._decode(val); }
				)
			);
				
			this.lock();
			
			this.$.css({
				position : 'relative',
				width    : $img.innerWidth(),
				height   : $img.innerHeight()
			});
			
			if ( this.settings.keepBoxed ){
				var offset = $this.offset();
				
				this.box = {
					top    : offset.top,
					right  : offset.left + $this.width(),
					bottom : offset.top + $this.height(),
					left   : offset.left
				};
			}else{
				this.box = null;
			};
		},
		_template : function( template ){
			this.settings.template = template;
		},
		locked : true,
		lock : function(){
			this.$.removeClass( 'unlocked' );
			this.locked = true;
			
			return this;
		},
		unlock : function(){
			this.$.addClass( 'unlocked' );
			this.locked = false
			
			return this;
		},
		getCollection : function(){
			return this.glyphs;
		},
		setGlyphClass : function( className ){
			this.settings.glyphClass = className;
		},
		setGlyphSettings : function( settings ){
			this.settings.glyphSettings = settings;
		},
		setActive : function( glyph ){
			if ( this.activeGlyph != glyph ){
				if ( this.activeGlyph ){	
					var	t = this.activeGlyph.getModel();
					t.active = false;
					t._stop();
					t._flush();
				}
				
				if ( glyph ){
					this.activeGlyph = glyph;
					this.activeGlyph.getModel()._start().active = true;
				}else{
					this.activeGlyph = null;
				}
				
				return true;
			}else return false;
		},
		addGlyph : function( info ){
			var el;
			
			// TODO : should become a instanceof
			if ( info.isGlyph ){
				var 
					model = info.getModel(),
					dis = this;
				
				this.setActive( info );

				this.glyphs.push( info );
				
				model._bind(function(){
					dis.glyphValidation( info );
				});
				
				return info;
			} else{
				el = document.createElement('div');
				this.element.appendChild( el );
				
				return this.addGlyph( 
					new this.settings.glyphClass(
						el, 
						this.settings.template,
						$.extend(true, {}, this.settings.glyphSettings, info), 
						{
							limits : this.box
						}
					)
				);
			}
		},
		addGlyphs : function( glyphs ){
			glyphs.sort( function( a, b ){
				return a.index - b.index;
			});
			
			for( var i = 0, c = glyphs.length; i < c; i++ ){
				this.addGlyph( glyphs[i] );
			}
			
			this.setActive(null);
		},
		glyphValidation : function( info ){
			if ( info.getModel().remove ){
				info.getModel()._stop();
				
				if ( this.activeGlyph == info ){
					this.setActive( null );
				}
				
				this.glyphs.remove( info );
			}
		},
		toJson : function(){
			return JSON.stringify( this.toObject() );
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