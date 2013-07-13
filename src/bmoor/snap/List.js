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
		},
		_template : function(){
			var mount = this._getAttribute('mount');

			if ( mount ){
				this.mountPoint = this.$.find('[mount]')[0];
			}

			this.__Node._template.call( this );
		},
		_make : function( data, alterations ){
			var
				additions,
				changes,
				row;

			if ( alterations ){
				additions = alterations.additions;
				changes = alterations.changes;

				for( var i = 0, c = additions.length; i < c; i++ ){
					this.append( data[ additions[i] ] );
				}

				for( var i = 0, c = changes.length; i < c; i++ ){
					row = changes[ i ];
					
					if ( typeof(row) == 'object' ){
						// this means it was removed, otherwise it would be a number
						row = row._row; // reference the row element

						if ( this.mountPoint == row ){
							this.mountPoint =  row.previousSibling;
						}

						if ( row.parentNode ){
							row.parentNode.removeChild( row );
						}
					}else{
						// TODO : we change positions
					}
				}
			} else if ( data ){
				for( var i = 0, c = data.length; i < c; i++ ){
					this.append( data[i] );
				}
			}
		},
		_wrapData : function( data ){
			return new bmoor.model.Collection( data );
		},
		_binding : function(){
			var dis = this;
			
			if ( this.data._bind ){
				this.binded = true;
				this.data._bind( function( alterations ){
					dis._make( this, alterations );
				});
			}
		},
		_makeChild : function( data, tag, attributes, asString ){
			if ( asString ){
				var attrs = '';
					
				for( var attr in attributes ){
					attrs += attr+'="'+attributes[attr]+'" ';
				}
					
				if ( this.prepared ){
					return '<'+tag+' class="'+this.childClass+'" '+attrs+'>'
						+ bMoor.module.Templator.run( this.prepared, data )
						+ '</'+tag+'>';
				}else return '<'+tag+' class="'+this.childClass+'" '+attrs+'>'+ '</'+tag+'>';
			}else{
				if ( this.prepared ){
					var 
						template = bMoor.module.Templator.run( this.prepared, data ),
						element = document.createElement( tag );
						
					element.innerHTML = template;
					element.className = this.childClass;
					
					for( var attr in attributes ){
						element.setAttribute( attr, attributes[attr] );
					}
					
					bMoor.module.Bootstrap.setContext( element, data );
					
					return element;
				}else{
					return document.createElement( tag );
				}
			}
		},
		append : function( data ){
			var el = this._makeChild( data,this.childTag );

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
			
			data._row = el;

			return el;
		},
		childTag : 'li',
		childClass : 'snap-li'
	}
});

}( jQuery, this ));