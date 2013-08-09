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
			var mount = this._getAttribute('mount');

			if ( !this.mountPoint && mount ){
				this.mountPoint = this.$.find('[mount]')[0];
			}

			return this.__View._makeTemplate.call( this );
		},
		_needUpdate : function( alterations ){
			// TODO : isn't this repetitive?
			return alterations.binding 
				|| ( alterations.addition && alterations.additions.length )
				|| ( alterations.removals && alterations.removals.length )
				|| !$.isEmptyObject( alterations.moves );
		},
		_makeContent : function( data, alterations ){
			var
				i,
				c,
				row,
				rows,
				additions,
				removals,
				changes,
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
								
								if ( this.mountPoint == row ){
									this.mountPoint =  row.previousSibling;
								}

								if ( row.parentNode ){
									row.parentNode.removeChild( row );
								}
							}
						}
					}
				}

				additions = alterations.additions;
				if ( additions ){
					for( i = 0, c = additions.length; i < c; i++ ){
						// TODO : put them in the right place
						this.append( additions[i], template );
					}
				}
			}else{
				// otherwise I assume this is an array, and I just completely rewrite it every time
				this.$.empty();
				for( i = 0, c = data.length; i < c; i++ ){
					// TODO : put them in the right place
					this.append( data[i], template );
				}
			}
		},
		_makeChildren : function( model, template ){
			var element = document.createElement( this.isTable ? 'table' : 'div' );
			element.innerHTML = bMoor.module.Templator.run( template, model );
					
			return element;
		},
		add : function( data ){
			this.observer.model.push( data );
		},
		// TODO : I would somehow like to use set content...
		append : function( model, template ){
			var 
				node,
				next,
				observer = model._;
				el = this._makeChildren( model, template );

			if ( this.isTable ){
				el = el.getElementsByTagName( 'tbody' )[0];
			}

			if ( observer ){
				observer.rows = [];
			}

			element = el.firstChild;
			while( element ){
				next = element.nextSibling;

				this._append( element );
				this._pushObserver( element, observer );

				if ( observer ){
					observer.rows.push( element );
				}

				this._finalizeElement( element );
				
				element = next;
			}

			return el;
		},
		_append : function( element ){
			if ( element.nodeType != 3 ){
				if ( this.mountPoint && this.mountPoint.parentNode ){
					if ( this.mountPoint.nextSibling ){
						this.mountPoint.parentNode.insertBefore( element, this.mountPoint.nextSibling );
					}else{
						this.mountPoint.parentNode.appendChild( element );
					}

					this.mountPoint = element;
				}else{
					this.$.append( element );
					this.mountPoint = element;
				}
			}
		}
	}
});

}( jQuery, this ));