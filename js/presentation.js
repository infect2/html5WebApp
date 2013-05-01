var activePageId; 
$(document).on("impress:stepenter", function(){
    console.log("impress:stepenter:" + window.location.hash);
    activePageId = window.location.hash.replace("#/","");
    executePageHandler( activePageId );
})
$(document).on("impress:stepleave", function(){
    console.log("impress:stepleave:" + +window.location.hash);
})

var pageAnimationHandler = {
    title1: function( pageId ){},
    title2: function( pageId ){},
    tstore30: function( pageId ){},
    xray: function( pageId ){}
}