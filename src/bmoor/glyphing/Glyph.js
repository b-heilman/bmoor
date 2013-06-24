;(function( $, global, undefined ){
bMoor.constructor.define({
	name : 'Glyph',
	namespace : ['bmoor','glyphing'],
	require: {
		references : { 'jQuery.fn.jqote' : ['jquery','jqote2'] },
		classes : [ ['bmoor','model','Map'] ]
	},
	parent : ['bmoor','snap','Node'],
	node : {
		className : 'glyphing-glyph',
		actions : {
			'mouseenter' : function( event, node ){
				node.$.addClass('glyph-active');
			},
			'mouseleave' : function( event, node ){
				node.$.removeClass('glyph-active');
			}
		}
	},
	statics : {
		minWidth  : 0,
		minHeight : 0
	},
	properties : {
		// glyphing setters
		_element : function( element ){
			this.__Node._element.call( this, element );
			
			this.active = false;
			this.limits = this._getVariable( this._getAttribute('limits') );
			this.minWidth = parseInt( this._getAttribute('minWidth', this.__static.minWidth) );
			this.minHeight = parseInt( this._getAttribute('minHeight', this.__static.minHeight) );
			
			element.style.position = 'absolute';
			
			if ( !element.parentNode ){
				this.__warn( 'element has no parent, it really should' );
			}
		},
		_data : function( data ){
			var dis = this;
			
			if ( data._bind ){
				this.data = data;
			}else{
				this.data = this._makeMap( data );
			}
			
			this.setModelValues( this.makeModelValues(data) );
			
			this.data.gap = {
				left : parseInt( this.$.css('padding-left') ) + parseInt( this.$.css('border-left-width') ),
				top  : parseInt( this.$.css('padding-top') ) + parseInt( this.$.css('border-top-width') )
			};
		},
		_makeMap : function( data ){
			return new bmoor.model.Map( data );
		},
		_mapUpdate : function( data ){
			if ( data.remove ){
				this.$.remove();
			}else if ( this.active !== data.active ){
				if ( data.active ){
					this.$.addClass('active-glyph');
				}else{
					this.$.removeClass('active-glyph');
				}
					
				this.active = data.active;
			}
				
			this.draw();
		},
		makeModelCleanses : function(){
			return {
				top    : parseInt,
				left   : parseInt,
				width  : parseInt,
				height : parseInt
			};
		},
		makeModelValues : function( settings ){
			if ( settings.centerTop ){
				if ( settings.height ){
					settings.top = settings.centerTop 
						- settings.height / 2;
				}else{
					settings.top = settings.centerTop 
						- this.minHeight / 2;
				}
			}
			
			if ( settings.centerLeft ){
				if ( settings.height ){
					settings.left = settings.centerLeft	- settings.width / 2;
				}else{
					settings.left = settings.centerLeft - this.minWidth / 2;
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
				width   : this.minWidth,
				height  : this.minHeight,
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
						this.data[dex] = cleanses[dex]( values[dex] );
					}else{
						this.data[dex] = values[dex];
					}
					
					delete defaults[dex];
				}
			}
			
			for( var dex in defaults ){
				if ( cleanses[dex] ){
					this.data[dex] = cleanses[dex]( defaults[dex] );
				}else{
					this.data[dex] = defaults[dex];
				}
			}
		},
		setCenter : function( x, y ){
			this.data.left = ( x - this.data.width / 2 );
			this.data.top = ( y - this.data.height / 2 );
			
			return this;
		},
		// glyph info
		isGlyph : true,
		// TODO : need to fix this
		getTemplate : function(){
			if ( this.template ){
				return $( '#'+this.template.id ).jqote( this.template.settings );
			}else return '';
		},
		draw : function(){
			var
				rotate = 'rotate('+this.data.angle+'deg)';
				
			this.$.css( {
				top     : (this.data.top - this.data.gap.top)+'px',
				left    : (this.data.left - this.data.gap.left)+'px',
				width   : this.data.width+'px',
				height  : this.data.height+'px',
				opacity : this.data.opacity,
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
				top     : this.data.top,
				left    : this.data.left,
				height  : this.data.height,
				width   : this.data.width,
				opacity : this.data.opacity,
				angle   : this.data.angle
			};
		}
	}
});
}( jQuery, this ));