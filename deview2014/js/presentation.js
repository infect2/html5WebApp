$(document).on("impress:stepenter", function(){
    var activePageId;

    console.log("impress:stepenter:" + window.location.hash);
    activePageId = window.location.hash.replace("#/","");
    executePageHandler( activePageId );
})

$(document).on("impress:stepleave", function(){
    var activePageId;

    console.log("impress:stepleave:" + +window.location.hash);
    activePageId = window.location.hash.replace("#/","");
    executePageExitHandler( activePageId );
})

function executePageHandler( pageName ){
    var handler = pageAnimationHandler.getHandler( pageName );
    if( typeof handler === "function" ){
        handler();
    }
}

function executePageExitHandler( pageName ){
    var handler = pageExitAnimationHandler.getHandler( pageName );
    if( typeof handler === "function" ){
        handler();
    }
}

//page animation handler를 관리하는 object
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

//page 별 animation hanlder를 기술 후 일괄 등록
pageAnimationHandler.init({
    cover: function(){
        $('#canvasLogo')[0].classList.add("ing");
    },
    question3: function(){
        $('#question3 iframe').each( function( index, elem ){
            var that = this;
            setTimeout( function(){
                $(that).attr( "src", $( that ).attr( 'data-src') );
            }, 1000);
        });
    }
});

//page animation handler를 관리하는 object
var pageExitAnimationHandler = {
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

//page 별 animation hanlder를 기술 후 일괄 등록
pageExitAnimationHandler.init({
    cover: function(){
        $('#canvasLogo')[0].classList.remove("ing");
    },
    question3: function(){
        $('#question3 iframe').each( function( index, elem ){
            $(this).attr( "src", "" );
        });
    }
});
//display clock
// new imageclock.display()