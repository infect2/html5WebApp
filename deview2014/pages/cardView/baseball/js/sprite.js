(function (window) {

     function sprite(src, width,height, offsetX, offsetY, frames, duration,zoomlevel)
     {
         this.spritesheet = null;
         this.offsetX = 0;
         this.offsetY = 0;
         this.width = width;
         this.height = height;
         this.frames = 1;
         this.currentFrame = 0;
         this.firstOffsetX = offsetX;
         this.duration = 1;
         this.posX = 0;
         this.posY = 0;
         this.posZ = 0;
         this.shown = true;
         this.zoomLevel = zoomlevel;
         this.shadow = null;
         this.curPos = 0;
         this.setSpritesheet(src);
         this.setOffset(offsetX, offsetY);
         this.setFrames(frames);
         this.setDuration(duration);
         this.playerPos3 = [0,77,74,74,68,0];
         this.playerXP3 = [0,77,70,60,115,0];
         this.playerPos4 = [0,79,70,68,112,100,80,80,0];
         this.playerXP4 = [0,60,70,112,112,75,70,112,0];

         var d = new Date();
         if (this.duration > 0 && this.frames > 0) {
             this.ftime = d.getTime() + (this.duration / this.frames);
         } else {
             this.ftime = 0;
         }
     }

     sprite.prototype={

          setSpritesheet:function(src) {
                   if (src instanceof Image) {
                       this.spritesheet = src;
                   } else {
                       this.spritesheet = new Image();
                       this.spritesheet.src = src;
                   }
                   console.log("inner setCharacter");
          },
          setPosition:function(x, y) {
                   this.posX = x;
                   this.posY = y;
                   // this.posZ = z;

          },
          setOffset:function(x, y) {
                   this.offsetX = x;
                   this.offsetY = y;
          },
          setFrames:function(fcount) {
                   this.currentFrame = 0;
                   this.frames = fcount;
          },
          setDuration:function(duration) {
                   this.duration = duration;
          },
          animate:function(c, t,cWidth,cOffsetX) {
                   if (t.getMilliseconds() > this.ftime) {
                       this.nextFrame (cWidth,cOffsetX);

                   }
          },
          nextFrame:function(cWidth,cOffsetX) {
                   if (this.duration > 0) {
                       var d = new Date();
                       if (this.duration > 0 && this.frames > 0) {
                           this.ftime = d.getTime() + (this.duration / this.frames);
                       } else {
                           this.ftime = 0;
                       }
                    }
                    this.offsetX = cOffsetX + cWidth;
                    if (this.currentFrame === (this.frames - 1)) {
                           this.currentFrame = 0;
                           this.curPos = 0;
                    }else {
                           this.currentFrame++;
                    }
          },
          draw:function(c,cWidth,cHeight,cOffsetX,cOffsetY,drawShadow) {
                   if (this.shown) {
                       if (drawShadow !== undefined && drawShadow) {
                           if (this.shadow === null) { // Shadow not created yet
                               var sCnv = document.createElement("canvas");
                               var sCtx = sCnv.getContext("2d");

                               sCnv.width = cWidth;
                               sCnv.height = cHeight;

                               sCtx.drawImage(this.spritesheet,
                                   this.offsetX,
                                   this.offsetY,
                                   cWidth,
                                   cHeight,
                                   0,
                                   0,
                                   cWidth * this.zoomLevel,
                                   cHeight * this.zoomLevel);

                               var idata = sCtx.getImageData(0, 0, sCnv.width, sCnv.height);

                               for (var i = 0, len = idata.data.length; i < len; i += 4) {
                                   idata.data[i] = 0; // R
                                   idata.data[i + 1] = 0; // G
                                   idata.data[i + 2] = 0; // B
                               }

                               sCtx.clearRect(0, 0, sCnv.width, sCnv.height);
                               sCtx.putImageData(idata, 0, 0);

                               this.shadow = sCtx;

                           }

                           c.save();
                           c.globalAlpha = 0.1;
                           var sw = cWidth * this.zoomLevel;
                           var sh = cHeight * this.zoomLevel;
                           c.drawImage(this.shadow.canvas, this.posX, this.posY - sh, sw, sh * 2);
                           c.restore();
                       }
                       c.drawImage(this.spritesheet,
                                   cOffsetX,
                                   cOffsetY,
                                   cWidth,
                                   cHeight,
                                   this.posX,
                                   this.posY,
                                   cWidth * this.zoomLevel,
                                   cHeight * this.zoomLevel);
                   }
               }
     };

     window.sprite = sprite;

}(window));
