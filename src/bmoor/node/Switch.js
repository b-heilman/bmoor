;(function( $, global, undefined ){

var nodesCount = 0;

bMoor.constructor.define({
	name : 'Switch',
	namespace : ['bmoor','node'],
	parent : ['bmoor','node','View'],
	properties : {
		_makeTemplate : function( model ){
			var 
				dis = this,
				template;

			if ( model ){
				template = this._unwrapVar( model, this._getAttribute('template') );
				if ( !template ){
					template = this._getAttribute('defaultTemplate');
				}else{
					this.watchTemplateVar = this._getAttribute('template');
				}
				
				if ( template ){
					return bMoor.module.Templator.prepare( template );
				}
			}

			return null;
		},
		_needUpdate : function( alterations ){
			return alterations.modelSwitch 
				|| this.__View._needUpdate.call( this, alterations);
		}
	}
});

}( jQuery, this ));