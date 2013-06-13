;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'Node',
	namespace : ['bmoor','snap'],
	require : [ ['bmoor','lib','Bootstrap'] ],
	construct: function( element, template, data, attributes ){
		this._attributes = attributes;
		this._element( element );
		this._template( template );
		this._data( data );
	
		if ( !this.prepared ){
			this._finalize();
		}else{
			this._makeContent();
		}
		
		this._binding();
	},
	properties: {
		baseClass : 'snap-node',
		_element : function( element ){
			this.$ = $( element );
			this.element = element;
			this.$.data( 'node', this );
			
			this.variable = this._getAttribute( 'variable', null );
			
			element.className += ' '+this.baseClass;
		},
		_data : function( data ){
			this.data = data;
		},
		_template : function( template ){
			this.prepared = template 
				? bMoor.template.getDefaultTemplator().prepare( bMoor.resource.loadTemplate(template,null) )
				: null;
		},
		_binding : function(){
			var dis = this;
			
			if ( this.data && this.data._bind ){
				this.data._bind( function(){
					dis._mapUpdate( this );
				});
			}
		},
		_makeContent : function(){
			this._setContent( bMoor.template.getDefaultTemplator().run(this.prepared,this.data) );
			bmoor.lib.Bootstrap.setContext( this.element, this.data );
			this._finalize();
			
		},
		_setContent : function( content ){
			this.element.innerHTML = content;
		},
		_mapUpdate : function( map ){
			if ( this.prepared ){
				this._makeContent();
			}else if ( this.variable ){
				this._setContent( this.data[this.variable] );
			}
		},
		_finalize : function(){},
		_getAttribute : function( attribute, otherwise, adjustment ){
			var attr;
			
			if ( this._attributes && this._attributes[attribute] ){
				attr = this._attributes[attribute];
			}else{
				attribute = 'snap-'+attribute;
				
				if ( this.element.hasAttribute(attribute) ){
					attr = this.element.getAttribute( attribute );
				}else return otherwise;
			}
			
			return adjustment ? adjustment( attr ) : attr;
		},
		// TODO : this should be renamed
		_getVariable : function( variable ){
			return eval( 'global.' + variable );
		}
	}
});

}( jQuery, this ));