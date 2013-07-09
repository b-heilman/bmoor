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
		get : function( content, data ){
			return this.run( this.prepare(content), data );
		},
		prepare : function( content ){
			return $.jqotec( content );
		},
		run : function( prepared, data ){
			return $.jqote( prepared, data );
		}
	}
}, true);

}( jQuery, this ));