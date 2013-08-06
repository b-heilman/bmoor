;(function( $, global, undefined ){

var nodesCount = 0;

bMoor.constructor.define({
	name : 'Switch',
	namespace : ['bmoor','snap'],
	parent : ['bmoor','snap','Node'],
	properties : {
		_template : function(){
			var 
				template,
				model;

			if ( this.observer ){
				model = this.observer.model;
				template = this._unwrapVar( model, this._getAttribute('template') );
				
				if ( !template ){
					template = this._getAttribute('defaultTemplate');
				}
					
				if ( template ){
					this.prepared = bMoor.module.Templator.prepare( template );
				} else this.prepared = null;
			}
		},
		_prep : function( data, alterations ){
			var value = data;
			
			if ( this.variable ){
				value = data[this.variable];

				if ( typeof(value) == 'function' ){ 
					value = data[this.variable](); 
				}
			}

			this._template(); // every time the model changed, switch the template

			this._make( value, alterations );
		},
		_needUpdate : function( alterations ){
			return alterations.modelSwitch || this.__Node._needUpdate.call( this, alterations);
		},
		_binding : function(){
			var dis = this;
			
			this.binded = true;

			this.observer.bind( function( alterations ){
				if ( dis._needUpdate(alterations) ) {
					dis._prep( this.model, alterations );
				}
			});
		}
	}
});

}( jQuery, this ));