/***********************************************

* JavaScript Image Clock- by JavaScript Kit (www.javascriptkit.com)
* This notice must stay intact for usage
* Visit JavaScript Kit at http://www.javascriptkit.com/ for this script and 100s more

***********************************************/

var imageclock=new Object()
    //Enter path to clock digit images here, in order of 0-9, then "am/pm", then colon image:
    imageclock.digits=["img/c0.gif", "img/c1.gif", "img/c2.gif", "img/c3.gif", "img/c4.gif", "img/c5.gif", "img/c6.gif", "img/c7.gif", "img/c8.gif", "img/c9.gif", "img/cam.gif", "img/cpm.gif", "img/colon.gif"]
    imageclock.instances=0
    var preloadimages=[]
    for (var i=0; i<imageclock.digits.length; i++){ //preload images
        preloadimages[i]=new Image()
        preloadimages[i].src=imageclock.digits[i]
    }

    imageclock.imageHTML=function(timestring){ //return timestring (ie: 1:56:38) into string of images instead
        var sections=timestring.split(":")
        if (sections[0]=="0") //If hour field is 0 (aka 12 AM)
            sections[0]="12"
        else if (sections[0]>=13)
            sections[0]=sections[0]-12+""
        for (var i=0; i<sections.length; i++){
            if (sections[i].length==1)
                sections[i]='<img src="'+imageclock.digits[0]+'" />'+'<img src="'+imageclock.digits[parseInt(sections[i])]+'" />'
            else
                sections[i]='<img src="'+imageclock.digits[parseInt(sections[i].charAt(0))]+'" />'+'<img src="'+imageclock.digits[parseInt(sections[i].charAt(1))]+'" />'
        }
        return sections[0]+'<img src="'+imageclock.digits[12]+'" />'+sections[1]+'<img src="'+imageclock.digits[12]+'" />'+sections[2]
    }

    imageclock.display=function(){
        var clockinstance=this
        this.spanid="clockspan"+(imageclock.instances++)
        document.write('<span id="'+this.spanid+'"></span>')
        this.update()
        setInterval(function(){clockinstance.update()}, 1000)
    }

    imageclock.display.prototype.update=function(){
        var dateobj=new Date()
        var currenttime=dateobj.getHours()+":"+dateobj.getMinutes()+":"+dateobj.getSeconds() //create time string
        var currenttimeHTML=imageclock.imageHTML(currenttime)+'<img src="'+((dateobj.getHours()>=12)? imageclock.digits[11] : imageclock.digits[10])+'" />'
        document.getElementById(this.spanid).innerHTML=currenttimeHTML

    }
