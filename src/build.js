var bmoor = require('./core.js'),
	mixin = require('./build/mixin.js'),
	plugin = require('./build/plugin.js'),
	decorate = require('./build/decorate.js');

function proc( action, proto, def ){
	var i, c;

	if ( bmoor.isArray(def) ){
		for( i = 0, c = def.length; i < c; i++ ){
			action( proto, def[i] );
		}
	}else{
		action( proto, def );
	}
}

function maker( root, config, base ){
	if ( !base ){
		base = function BmoorPrototype(){};

		if ( config ){
			if ( bmoor.isFunction(root) ){
				base = function BmoorPrototype(){
					root.apply( this, arguments );
				};

				base.prototype = Object.create( root.prototype );
			}else{
				base.prototype = Object.create( root );
			}
		}else{
			config = root;
		}
	}

	if ( config.mixin ){
		proc( mixin, base.prototype, config.mixin );
	}

	if ( config.decorate ){
		proc( decorate, base.prototype, config.decorate );
	}

	if ( config.plugin ){
		proc( plugin, base.prototype, config.plugin );
	}

	return base;
}

maker.mixin = mixin;
maker.decorate = decorate;
maker.plugin = plugin;

module.exports = maker;