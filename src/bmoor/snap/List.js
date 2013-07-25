;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'List',
	namespace : ['bmoor','snap'],
	parent : ['bmoor','snap','Node'],
	require : [
		['bmoor','model','Collection']
	],
	node : {
		className : 'snap-list'
	},
	properties: {
		_element : function( element ){
			this.__Node._element.call( this, element );
			this.childTag = this._getAttribute( 'child', this.childTag );
			this.childClass = this._getAttribute( 'childClass', this.childClass );
			this.mountPoint = null;
			this.origin = null;
		},
		_template : function(){
			var mount = this._getAttribute('mount');

			if ( mount ){
				this.mountPoint = this.$.find('[mount]')[0];
			}

			this.__Node._template.call( this );
		},
		_binding : function(){
			var dis = this;
			
			if ( this.model._bind ){
				this.binded = true;
				this.model._bind( function( alterations ){
					dis._make( this, alterations );
				});
			}
		},
		_make : function( data, alterations ){
			var
				additions,
				removals,
				changes,
				row;

			additions = alterations.additions;
			removals = alterations.removals;

			for( var i in removals ){
				row = removals[ i ];
				
				if ( typeof(row) == 'object' ){
					// this means it was removed, otherwise it would be a number
					row = row._.row; // reference the row element

					if ( this.mountPoint == row ){
						this.mountPoint =  row.previousSibling;
					}

					if ( row.parentNode ){
						row.parentNode.removeChild( row );
					}
				}
			}

			for( var i in additions ){
				// TODO : put them in the right place
				this.append( additions[i] );
			}
		},
		_makeChild : function( model, tag, attributes, asString ){
			if ( asString ){
				var attrs = '';
					
				for( var attr in attributes ){
					attrs += attr+'="'+attributes[attr]+'" ';
				}
					
				if ( this.prepared ){
					return '<'+tag+' class="'+this.childClass+'" '+attrs+'>'
						+ bMoor.module.Templator.run( this.prepared, model )
						+ '</'+tag+'>';
				}else return '<'+tag+' class="'+this.childClass+'" '+attrs+'>'+ '</'+tag+'>';
			}else{
				if ( this.prepared ){
					var 
						template = bMoor.module.Templator.run( this.prepared, model ),
						element = document.createElement( tag );
						
					element.innerHTML = template;
					element.className = this.childClass;
					
					for( var attr in attributes ){
						element.setAttribute( attr, attributes[attr] );
					}
					
					this._pushContext( element, model );
					
					return element;
				}else{
					return document.createElement( tag );
				}
			}
		},
		add : function( data ){
			this.model.push( data );
		},
		append : function( model ){
			var el = this._makeChild( model, this.childTag );

			if ( this.mountPoint ){
				if ( this.mountPoint.nextSibling ){
					this.mountPoint.parentNode.insertBefore( el, this.mountPoint.nextSibling );
				}else{
					this.mountPoint.parentNode.appendChild( el );
				}

				this.mountPoint = el;
			}else{
				this.$.append( el );
				this.mountPoint = el;
			}
			
			model._.row = el;

			return el;
		},
		childTag : 'li',
		childClass : 'snap-li'
	}
});

}( jQuery, this ));