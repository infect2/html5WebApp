var activePageId; 

$(document).on("impress:stepenter", function(){
    console.log("impress:stepenter:" + window.location.hash);
    activePageId = window.location.hash.replace("#/","");
    executePageHandler( activePageId );
})

$(document).on("impress:stepleave", function(){
    console.log("impress:stepleave:" + +window.location.hash);
})

function executePageHandler( pageName ){
    var handler = pageAnimationHandler.getHandler( pageName );
    if( typeof handler === "function" ){
        handler();
    }
}

var pageAnimationHandler = {
    handlers: [],
    getHandler: function( name ){
        return this.handlers[ name ];
    },
    setHandler: function( name, handler ){
        this.handlers[ name ] = handler;
    },
    init: function( handlerObj ){
        for( a in handlerObj ){
            this.handlers[ a ] = handlerObj[a];
        }
    }
}

pageAnimationHandler.init({
    tstore30: function(){
        $('#tstore30 iframe').each( function( index, elem ){
            $(this).attr( "src", $( this ).attr( 'data-src') );
        });
    },
    linkedinIssue: function(){
        $('#linkedinIssue img').on('click', function(){
            alert("제대로 된 Tool이 없어요!");
        });
    }
});