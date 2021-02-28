var canvasSize = {
    height: 0,
    width: 0,
    pixelDensity: 1
};
var bgEffect;

function SetCanvasSize() {
    canvasSize.height = $("#home-bg").height();// * window.devicePixelRatio;
    canvasSize.width = $("#home-bg").width();// * window.devicePixelRatio;
    //canvasSize.pixelDensity = window.devicePixelRatio;
    $("#home-bg").attr("height", canvasSize.height);
    $("#home-bg").attr("width", canvasSize.width);
}

// V 1.0.1
// released under MIT license by MBMedia.cc
// documentation found at http://mbmedia.cc/stuff/bokeh-background/

///////////////// bokeh/particle effects //////////////////////
function BokehBackground(c, b, p)
{
	this.effectStage = null;
	this.effectCanvas = null;
	
	this.stageWidth = 0;
	this.stageHeight = 0;
	
	this.initialize = function(canvas, bCount, pCount)
	{
		this.effectCanvas = canvas;
		this.effectStage = new createjs.Stage(canvas);
		this.updateStageDimensions();
		
		// make the stage keep updating itself
		createjs.Ticker.setFPS(30);
		createjs.Ticker.addEventListener("tick", this.effectStage);
		
		var countToUse = bCount || 35;
		var i, ii = countToUse, p;
		for (i = 0; i < ii; i++)
		{
			p = new createjs.Shape();
			var pAlpha = Math.random()*0.1;
			p.graphics.beginStroke('rgba(255,255,255,'+(pAlpha)+')').setStrokeStyle(Math.random()*4);
			p.graphics.beginFill('rgba(255,255,255,'+(pAlpha*0.7)+')');
			p.graphics.drawCircle(0,0,Math.random()*20+7);
			p.x = Math.random() * this.stageWidth;
			p.y = Math.random() * this.stageHeight;
			this.effectStage.addChild(p);
			p.alpha = 0;
			
			this.doBokehTween(p);
		}

		countToUse = pCount || 100;
		i, ii = countToUse, p;
		for (i = 0; i < ii; i++)
		{
			p = new createjs.Shape();
			p.graphics.beginFill('rgba(255,255,255,'+(Math.random()*0.25)+')');
			p.graphics.drawCircle(0,0,Math.random()*2+1);
			p.x = Math.random() * this.stageWidth;
			p.y = Math.random() * this.stageHeight;
			this.effectStage.addChild(p);
			p.alpha = 0;
			
			this.doParticleTween(p);
		}
	};
	
	// needs to be called any time you may resize the canvas
	this.updateStageDimensions = function()
	{
		this.stageWidth = this.effectCanvas.width;
		this.stageHeight = this.effectCanvas.height;
	};
	
	this.doParticleTween = function(p)
	{
		if (p instanceof Array)
			p = p[0];
			
		// restart it by giving a new position and move direction
		p.x = this.stageWidth  * Math.random();
		p.y = this.stageHeight * Math.random();
		p.xSpeed = Math.random()*200 - 100;
		p.ySpeed = Math.random()*200 - 100;
		var tweenTime = (Math.random()*6000)+3000;
		
		createjs.Tween.get(p).wait(Math.random()*3000)
			.to({alpha:1, x:p.x+p.xSpeed, y:p.y+p.ySpeed}, tweenTime)
			.to({alpha:0, x:p.x+p.xSpeed+p.xSpeed, y:p.y+p.ySpeed+p.ySpeed}, tweenTime)
			.call(this.doParticleTween, [p], this);
	};
	
	// handles the looping of bokeh tweens
	this.doBokehTween = function(p)
	{
		if (p instanceof Array)
			p = p[0];
		
		// irestart it by giving a new position and move direction
		p.x = this.stageWidth  * Math.random();
		p.y = this.stageHeight * Math.random();
		p.xSpeed = Math.random()*200 - 100;
		p.ySpeed = Math.random()*200 - 100;
		var tweenTime = (Math.random()*6000)+2000;
		
		createjs.Tween.get(p).wait(Math.random()*3000)
			.to({alpha:1, x:p.x+p.xSpeed, y:p.y+p.ySpeed}, tweenTime)
			.to({alpha:0, x:p.x+p.xSpeed+p.xSpeed, y:p.y+p.ySpeed+p.ySpeed}, tweenTime)
			.call(this.doBokehTween, [p], this);
	};
	
	if (c !== undefined)
		this.initialize(c, b, p);
}

function SnowBackground() {
    this.Initialise = function() {
        this.canvasContext = $('#home-bg')[0].getContext('2d')
        this.snowParticles = [];
        this.snowAngle = 0;
        this.previousFrame = Date.now();
        this.interval = 1000/30; // 30fps
        this.delta;
        for(var i = 0; i < 25; i++) {
    	    this.snowParticles.push({
    		    x: Math.random() * canvasSize.width,
    		    y: Math.random() * canvasSize.height,
    		    radius: (Math.random() * 4 + 1),
    		    density: Math.random() * 25
    	    });
        }
        this.RequestFrame();
    };
    
    this.RequestFrame = function() {
        let now = Date.now();
        this.delta = now - this.previousFrame;
        if (this.delta > this.interval) {
            this.previousFrame = now - (this.delta % this.interval);
            this.Draw();
        }
        window.requestAnimationFrame(this.RequestFrame.bind(this));
    }
    
    this.Draw = function() {
        this.canvasContext.clearRect(0, 0, canvasSize.width, canvasSize.height);
        this.canvasContext.fillStyle = "rgba(255, 255, 255, 0.8)";
        this.canvasContext.beginPath();
        for(var i = 0; i < this.snowParticles.length; i++) {
            var particle = this.snowParticles[i];
            this.canvasContext.moveTo(particle.x, particle.y);
            this.canvasContext.arc(particle.x, particle.y, particle.radius, 0, Math.PI*2, true);
            particle.y += Math.cos(this.snowAngle + particle.density) + 1 + particle.radius / 2;
    		particle.x += Math.sin(this.snowAngle) * 2;
            if (particle.x > canvasSize.width + 5 || particle.x < -5 || particle.y > canvasSize.height) {
    			if(i%3 > 0) {
    				this.snowParticles[i] = {
              			x: Math.random() * canvasSize.width,
              			y: -10,
              			radius: particle.radius, 
              			density: particle.density
            		};
    			}
    			else {
    				if(Math.sin(this.snowAngle) > 0) {
    					this.snowParticles[i] = {
                			x: -5,
                			y: Math.random() * canvasSize.height,
                			radius: particle.radius,
                			density: particle.density
              			};
    				}
    				else {
    					this.snowParticles[i] = {
                			x: canvasSize.width + 5,
                			y: Math.random() * canvasSize.height,
                			radius: particle.radius,
                			density: particle.density
              			};
    				}
    			}
    		}
        }
        this.canvasContext.fill();
        this.snowAngle += 0.01;
    };
    
    this.Initialise();
}

$(function() {
    SetCanvasSize();
    window.addEventListener("resize", () => {
        SetCanvasSize();
    });
    var date = new Date();
    var month = date.getMonth();
    if (month != 11) {
        bgEffect = new BokehBackground($('#home-bg')[0], 20, 70);
    } else {
        bgEffect = new SnowBackground();
    }
});
