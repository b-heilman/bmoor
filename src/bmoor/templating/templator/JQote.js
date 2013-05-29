;(function( $, global, undefined ){

bMoor.constructor.singleton({
	name : 'JQote',
	namespace : ['bmoor','templating','templator'],
	require: {
		references : { 'jQuery.fn.jqote' : ['jquery','jqote2'] }
	},
	construct: function(){
		$.jqotetag( bMoor.settings.templatorTag );
	},
	properties: {
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
});

}( jQuery, this ));