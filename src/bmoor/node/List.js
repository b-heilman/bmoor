;(function( $, global, undefined ){

bMoor.constructor.define({
	name : 'List',
	namespace : ['bmoor','node'],
	parent : ['bmoor','node','View'],
	require : [
		['bmoor','observer','Collection']
	],
	node : {
		className : 'node-list'
	},
	properties: {
		_initElement : function( element ){
			this.__View._initElement.call( this, element );
			
			this.isTable = ( this.element.tagName == 'TABLE' );
			
			this.mountPoint = null;
		},
		_makeTemplate : function(){
			var 
				mount = this._getAttribute('mount'),
				element;

			if ( !this.mountPoint && mount ){
				element = this.$.find('[mount]')[0];
			}

			this.mountPoint = {
				mount : element,
				last  : element
			};

			return this.__View._makeTemplate.call( this );
		},
		_needUpdate : function( alterations ){
			// TODO : isn't this repetitive?
			return alterations.binding 
				|| ( alterations.removals && alterations.removals.length )
				|| !$.isEmptyObject( alterations.moves );
		},
		_makeContent : function( data, alterations ){
			var
				i,
				c,
				row,
				rows,
				moves,
				removals,
				template = this._makeTemplate( data );
			
			if ( data._ instanceof bmoor.observer.Collection ){
				removals = alterations.removals;
				if ( removals ){
					for( var i in removals ){
						row = removals[ i ];
						
						if ( typeof(row) == 'object' ){
							// this means it was removed, otherwise it would be a number
							rows = row._.rows; // reference the row element

							for( i = 0, c = rows.length; i < c; i++ ){
								row = rows[i];
								
								if ( row.parentNode ){
									row.parentNode.removeChild( row );
								}
							}
						}
					}
				}
				
				moves = alterations.moves;
				for( i = 0, c = data.length; i < c; i++ ){
					if ( moves[i] ){
						this.insert( moves[i], template, data[i-1] );
					}
				}
			}else{
				// otherwise I assume this is an array, and I just completely rewrite it every time
				this.$.empty();
				for( i = 0, c = data.length; i < c; i++ ){
					// TODO : put them in the right place
					this.append( data[i], template, null );
				}
			}
		},
		_makeChildren : function( model, template ){
			var element = document.createElement( this.isTable ? 'table' : 'div' );
			element.innerHTML = bMoor.module.Templator.run( template, model );
					
			return this.isTable ? element.getElementsByTagName( 'tbody' )[0] : element;
		},
		add : function( data ){
			this.observer.model.push( data );
		},
		append : function( model, template ){
			var 
				els = this._makeChildren( model, template ),
				next,
				element;

			element = els.firstChild;

			while( element ){
				next = element.nextSibling;

				this._append( element );
				
				this._finalizeElement( element );
				
				element = next;
			}

			return els;
		},
		_append : function( element ){
			var mount = this.mountPoint.last;

			if ( element.nodeType != 3 ){
				if ( mount.nextSibling ){
					mount.parentNode.insertBefore( element, mount.nextSibling );
				}else{
					mount.parentNode.appendChild( element );
				}

				this.mountPoint.last = element;
			}
		},
		// TODO : I would somehow like to use set content...
		insert : function( model, template, previous ){
			var 
				i,
				c,
				nodes,
				node,
				next,
				observer = model._,
				els,
				element;

			// TODO : rows -> nodes
			if ( previous && previous._.rows ){
				previous = previous._.rows[ previous._.rows.length - 1 ]
			}else{
				previous = this.mountPoint.mount;
			}

			if ( !observer.rows ){
				els = this._makeChildren( model, template );

				observer.rows = [];

				element = els.firstChild;

				while( element ){
					this._pushObserver( element, observer );
					observer.rows.push( element );
					
					element = element.nextSibling;
				}
			}

			for( i = 0, nodes = observer.rows, c = nodes.length; i < c; i++ ){
				element = nodes[i];

				this._insert( element, previous );
				this._finalizeElement( element );

				previous = element;
			}

			return els;
		},
		_insert : function( element, mount ){
			if ( element.nodeType != 3 ){
				if ( mount ){
					if ( mount.nextSibling ){
						mount.parentNode.insertBefore( element, mount.nextSibling );
					}else{
						mount.parentNode.appendChild( element );
					}

					if ( mount == this.mountPoint.last ){
						this.mountPoint.last = element;
					}
				}else{
					// this means there is nothing else...
					this.element.appendChild( element );
					
					this.mountPoint.last = element;
				}
			}
		}
	}
});

}( jQuery, this ));