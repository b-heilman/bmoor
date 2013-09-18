;(function( $, global, undefined ){
bMoor.constructor.define({
	name : 'Glyph',
	namespace : ['bmoor','glyphing'],
	parent : ['bmoor','node','View'],
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
			this.limits = this._decode( this._getAttribute('limits') );
			this.minWidth = parseInt( this._getAttribute('minWidth', this.__static.minWidth) );
			this.minHeight = parseInt( this._getAttribute('minHeight', this.__static.minHeight) );
			
			element.style.position = 'absolute';
			
			if ( !element.parentNode ){
				this.__warn( 'element has no parent, it really should' );
			}
		},
		_model : function(){
			this.__Node._model.call( this );
			
			this.setModelValues( this.makeModelValues(this.model) );
			
			this.model.gap = {
				left : parseInt( this.$.css('padding-left') ) + parseInt( this.$.css('border-left-width') ),
				top  : parseInt( this.$.css('padding-top') ) + parseInt( this.$.css('border-top-width') )
			};
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
						this.model[dex] = cleanses[dex]( values[dex] );
					}else{
						this.model[dex] = values[dex];
					}
					
					delete defaults[dex];
				}
			}
			
			for( var dex in defaults ){
				if ( cleanses[dex] ){
					this.model[dex] = cleanses[dex]( defaults[dex] );
				}else{
					this.model[dex] = defaults[dex];
				}
			}
		},
		setCenter : function( x, y ){
			this.model.left = ( x - this.model.width / 2 );
			this.model.top = ( y - this.model.height / 2 );
			
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
				rotate = 'rotate('+this.model.angle+'deg)';
				
			this.$.css( {
				top     : (this.model.top - this.model.gap.top)+'px',
				left    : (this.model.left - this.model.gap.left)+'px',
				width   : this.model.width+'px',
				height  : this.model.height+'px',
				opacity : this.model.opacity,
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
				top     : this.model.top,
				left    : this.model.left,
				height  : this.model.height,
				width   : this.model.width,
				opacity : this.model.opacity,
				angle   : this.model.angle
			};
		}
	}
});
}( jQuery, this ));