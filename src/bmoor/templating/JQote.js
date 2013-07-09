;(function( $, global, undefined ){

bMoor.constructor.mutate({
	name : 'JQote',
	namespace : ['bmoor','templating'],
	require : {
		references : { 'jQuery.fn.jqote' : ['jquery','jqote2'] }
	},
	module : 'Templator',
	decorators : [
		[ 'bmoor','templating','Decorator' ]
	],
	construct : function(){
		$.jqotetag( bMoor.settings.templatorTag );
	},
	properties : {
		get : function( template, data, node ){
			return this.run( this.prepare(template), data, node );
		},
		prepare : function( content ){
			return $.jqotec( content );
		},
		run : function( prepared, data, node ){
			return $.jqote( prepared, data );
		}
	}
}, true);

}( jQuery, this ));