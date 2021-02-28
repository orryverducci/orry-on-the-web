THREE.EffectComposer = function (renderer, renderTarget) {
    this.renderer = renderer;
    if (renderTarget === undefined) {
        var parameters = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            stencilBuffer: false
        };
        var size = renderer.getDrawingBufferSize();
        renderTarget = new THREE.WebGLRenderTarget(size.width, size.height, parameters);
        renderTarget.texture.name = "EffectComposer.rt1";
    }
    this.renderTarget1 = renderTarget;
    this.renderTarget2 = renderTarget.clone();
    this.renderTarget2.texture.name = "EffectComposer.rt2";
    this.writeBuffer = this.renderTarget1;
    this.readBuffer = this.renderTarget2;
    this.passes = [];
    if (THREE.CopyShader === undefined) {
        console.error("THREE.EffectComposer relies on THREE.CopyShader");
    }
    if (THREE.ShaderPass === undefined) {
        console.error("THREE.EffectComposer relies on THREE.ShaderPass");
    }
    this.copyPass = new THREE.ShaderPass(THREE.CopyShader);
};

Object.assign(THREE.EffectComposer.prototype, {
    swapBuffers: function() {
        var tmp = this.readBuffer;
        this.readBuffer = this.writeBuffer;
        this.writeBuffer = tmp;
    },
    
    addPass: function (pass) {
        this.passes.push(pass);
        var size = this.renderer.getDrawingBufferSize();
        pass.setSize(size.width, size.height);
    },
    
    insertPass: function (pass, index) {
        this.passes.splice(index, 0, pass);
    },
    
    render: function (delta) {
        var maskActive = false;
        var pass, i, il = this.passes.length;
        for (i = 0; i < il; i++) {
            pass = this.passes[i];
            if (pass.enabled === false) continue;
            pass.render(this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive);
            if (pass.needsSwap) {
                if (maskActive) {
                    var context = this.renderer.context;
                    context.stencilFunc(context.NOTEQUAL, 1, 0xffffffff);
                    this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, delta);
                    context.stencilFunc(context.EQUAL, 1, 0xffffffff);
                }
                this.swapBuffers();
            }
            if (THREE.MaskPass !== undefined) {
                if (pass instanceof THREE.MaskPass) {
                    maskActive = true;
                } else if (pass instanceof THREE.ClearMaskPass) {
                    maskActive = false;
                }
            }
        }
    },
    
    reset: function (renderTarget) {
        if (renderTarget === undefined) {
            var size = this.renderer.getDrawingBufferSize();
            renderTarget = this.renderTarget1.clone();
            renderTarget.setSize(size.width, size.height);
        }
        this.renderTarget1.dispose();
        this.renderTarget2.dispose();
        this.renderTarget1 = renderTarget;
        this.renderTarget2 = renderTarget.clone();
        this.writeBuffer = this.renderTarget1;
        this.readBuffer = this.renderTarget2;
    },
    
    setSize: function (width, height) {
        this.renderTarget1.setSize(width, height);
        this.renderTarget2.setSize(width, height);
        for (var i = 0; i < this.passes.length; i++) {
            this.passes[i].setSize(width, height);
        }
    }
});

THREE.Pass = function () {
    this.enabled = true;
    this.needsSwap = true;
    this.clear = false;
    this.renderToScreen = false;
};

Object.assign(THREE.Pass.prototype, {
    setSize: function (width, height) {},
    
    render: function (renderer, writeBuffer, readBuffer, delta, maskActive) {
        console.error( 'THREE.Pass: .render() must be implemented in derived pass.' );
    }
});

THREE.ShaderPass = function (shader, textureID) {
    THREE.Pass.call(this);
    this.textureID = (textureID !== undefined) ? textureID : "tDiffuse";
    if (shader instanceof THREE.ShaderMaterial) {
        this.uniforms = shader.uniforms;
        this.material = shader;
    } else if (shader) {
        this.uniforms = THREE.UniformsUtils.clone(shader.uniforms);
        this.material = new THREE.ShaderMaterial({
            defines: Object.assign({}, shader.defines),
            uniforms: this.uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader
        });
    }
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.scene = new THREE.Scene();
    this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
    this.quad.frustumCulled = false;
    this.scene.add(this.quad);
};

THREE.ShaderPass.prototype = Object.assign( Object.create(THREE.Pass.prototype), {
    constructor: THREE.ShaderPass,
    render: function(renderer, writeBuffer, readBuffer, delta, maskActive) {
        if (this.uniforms[this.textureID]) {
            this.uniforms[ this.textureID ].value = readBuffer.texture;
        }
        this.quad.material = this.material;
        if (this.renderToScreen) {
            renderer.render(this.scene, this.camera);
        } else {
            renderer.render(this.scene, this.camera, writeBuffer, this.clear);
        }
    }
});

THREE.RenderPass = function (scene, camera, overrideMaterial, clearColor, clearAlpha) {
    THREE.Pass.call(this);
    this.scene = scene;
    this.camera = camera;
    this.overrideMaterial = overrideMaterial;
    this.clearColor = clearColor;
    this.clearAlpha = (clearAlpha !== undefined) ? clearAlpha : 0;
    this.clear = true;
    this.clearDepth = false;
    this.needsSwap = false;
};

THREE.RenderPass.prototype = Object.assign(Object.create(THREE.Pass.prototype), {
    constructor: THREE.RenderPass,
    
    render: function (renderer, writeBuffer, readBuffer, delta, maskActive) {
        var oldAutoClear = renderer.autoClear;
        renderer.autoClear = false;
        this.scene.overrideMaterial = this.overrideMaterial;
        var oldClearColor, oldClearAlpha;
        if (this.clearColor) {
            oldClearColor = renderer.getClearColor().getHex();
            oldClearAlpha = renderer.getClearAlpha();
            renderer.setClearColor(this.clearColor, this.clearAlpha);
        }
        if (this.clearDepth) {
            renderer.clearDepth();
        }
        renderer.render(this.scene, this.camera, this.renderToScreen ? null : readBuffer, this.clear);
        if (this.clearColor) {
            renderer.setClearColor(oldClearColor, oldClearAlpha);
        }
        this.scene.overrideMaterial = null;
        renderer.autoClear = oldAutoClear;
    }
});

THREE.CopyShader = {
    uniforms: {
        "tDiffuse": { value: null },
        "opacity":  { value: 1.0 }
    },
    
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
    `,
    
    fragmentShader: `
        uniform float opacity;
        uniform sampler2D tDiffuse;
        varying vec2 vUv;
        void main() {
            vec4 texel = texture2D( tDiffuse, vUv );
            gl_FragColor = opacity * texel;
        }
    `
};

function ColourBarsAnimation() {
    this.initialise = function() {
        this.shaderTime = 0;
        if (typeof document.fonts !== "undefined") {
            document.fonts.load("bold 16pt 'Animal Crossing'").then(this.setup.bind(this));
        } else {
            this.setup();
        }
    };
    
    this.setup = function() {
        // Create renderer
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.domElement.id = "animation";
        $("main").append(this.renderer.domElement);
        // Create scene
        this.scene = new THREE.Scene();
        // Add camera to the scene
        this.camera = new THREE.OrthographicCamera($("#animation").width() / -2, $("#animation").width() / 2, $("#animation").height() / 2, $("#animation").height() / -2, 0, 30);
	    this.camera.lookAt(this.scene.position);
	    // Setup colour bars canvas texture
	    this.bars = new ColourBarsCanvas();
        this.bars.initialise();
        this.texture = new THREE.Texture(this.bars.canvas);
	    // Create geometry
	    let geometry = new THREE.PlaneGeometry($("#animation").width(), $("#animation").height());
	    let material = new THREE.MeshBasicMaterial({ map: this.texture });
        let plane = new THREE.Mesh(geometry, material);
        this.scene.add(plane);
        // Add post processing effects
        this.composer = new THREE.EffectComposer(this.renderer);
        let renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        this.staticPass = new THREE.ShaderPass(this.staticShader);
        this.staticPass.uniforms["amount"].value = 0.1;
        this.staticPass.uniforms["size"].value = 4;
        this.composer.addPass(this.staticPass);
        this.badTVPass = new THREE.ShaderPass(this.badTVShader);
        this.badTVPass.uniforms["distortion2"].value = 0.5;
	    this.badTVPass.uniforms["speed"].value = 0.5;
        this.composer.addPass(this.badTVPass);
        let copyPass = new THREE.ShaderPass(THREE.CopyShader);
        this.composer.addPass(copyPass);
		copyPass.renderToScreen = true;
        // Resize
        this.resize();
        // Start animation
        this.animationLoop();
    };
    
    this.staticShader = {
    	uniforms: {
    		"tDiffuse": { type: "t", value: null },
    		"time": { type: "f", value: 0.0 },
    		"amount": { type: "f", value: 0.5 },
    		"size": { type: "f", value: 4.0 }
    	},
    
    	vertexShader: `
        	varying vec2 vUv;
        	void main() {
        		vUv = uv;
        		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        	}
    	`,
    
    	fragmentShader: `
        	uniform sampler2D tDiffuse;
        	uniform float time;
        	uniform float amount;
        	uniform float size;
        	varying vec2 vUv;
        	float rand(vec2 co) {
        		return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
        	}
        	void main() {
        		vec2 p = vUv;
        		vec4 color = texture2D(tDiffuse, p);
        		float xs = floor(gl_FragCoord.x / size);
        		float ys = floor(gl_FragCoord.y / size);
        		vec4 snow = vec4(rand(vec2(xs * time,ys * time)) * amount);
        		gl_FragColor = color + snow;
        	}
    	`
    };
    
    this.badTVShader = {
        uniforms: {
            "tDiffuse": { type: "t", value: null },
            "time": { type: "f", value: 0.0 },
            "distortion": { type: "f", value: 0.0 },
            "distortion2": { type: "f", value: 5.0 },
            "speed": { type: "f", value: 0.2 },
            "rollSpeed": { type: "f", value: 0.0 },
        },
        
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        
        fragmentShader: `
            uniform sampler2D tDiffuse;
            uniform float time;
            uniform float distortion;
            uniform float distortion2;
            uniform float speed;
            uniform float rollSpeed;
            varying vec2 vUv;
            vec3 mod289(vec3 x) {
                return x - floor(x * (1.0 / 289.0)) * 289.0;
            }
            vec2 mod289(vec2 x) {
                return x - floor(x * (1.0 / 289.0)) * 289.0;
            }
            vec3 permute(vec3 x) {
                return mod289(((x * 34.0) + 1.0) * x);
            }
            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
                vec2 i = floor(v + dot(v, C.yy));
                vec2 x0 = v - i + dot(i, C.xx);
                vec2 i1;
                i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod289(i);
                vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
                m = m*m;
                m = m*m;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
                vec3 g;
                g.x = a0.x * x0.x + h.x * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }
            void main() {
            	vec2 p = vUv;
            	float ty = time * speed;
            	float yt = p.y - ty;
            	float offset = snoise(vec2(yt * 3.0, 0.0)) * 0.2;
            	offset = offset * distortion * offset * distortion * offset;
            	offset += snoise(vec2(yt * 50.0, 0.0)) * distortion2 * 0.001;
            	gl_FragColor = texture2D(tDiffuse, vec2(fract(p.x + offset), fract(p.y - time * rollSpeed)));
            }
        `
    };
    
    this.resize = function() {
        this.renderer.setSize($("#animation").width(), $("#animation").height(), false);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.camera.updateProjectionMatrix();
        let scale = window.devicePixelRatio || 1;
        this.composer.setSize($("#animation").width() * scale, $("#animation").height() * scale);
        this.bars.setSize($("#animation").width(), $("#animation").height(), scale);
        this.bars.draw();
        this.texture.needsUpdate = true;
    };
    
    this.animationLoop = function() {
        this.shaderTime += 0.1;
        this.staticPass.uniforms["time"].value = this.shaderTime;
        this.badTVPass.uniforms["time"].value = this.shaderTime;
        this.composer.render(0.1);
        window.requestAnimationFrame(this.animationLoop.bind(this));
    };
}






function WebGLAvailable() {
    let canvas = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
}

function ColourBars() {
    this.initialise = function() {
        this.canvas = document.createElement("canvas");
        this.context = this.canvas.getContext("2d");
        this.barsCanvas = document.createElement("canvas");
        this.bars = ["#dddddd", "#e0e000", "#00e0d0", "#00e000", "#e000e0", null, "#0000e0", "#000000"]
        this.textYPosition = [70, 84];
        this.imagesLoaded = 0;
        this.images = [];
        this.images[0] = new Image();
        this.images[0].onload = this.imageLoaded.bind(this);
        this.images[0].src = "https://new.orryverducci.co.uk/themes/orry-web/assets/images/error-404.png";
        this.images[1] = new Image();
        this.images[1].onload = this.imageLoaded.bind(this);
        this.images[1].src = "https://new.orryverducci.co.uk/themes/orry-web/assets/images/page-not-found.png";
    };
    
    this.imageLoaded = function() {
        this.imagesLoaded++;
        if (this.imagesLoaded == 2) {
            this.resizeText();
            this.draw();
        }
    };
    
    this.resize = function(width, height, dpi) {
        this.canvas.width = width * dpi;
        this.canvas.height = height * dpi;
        this.context.imageSmoothingEnabled = false;
        if (this.canvas.width > this.canvas.height) {
            this.smallDisplay = false;
        } else {
            this.smallDisplay = true;
        }
        this.barsCanvas.width = width * dpi;
        this.barsCanvas.height = height * dpi;
        this.drawBarsCanvas(width);
        this.resizeText();
    };
    
    this.resizeText = function() {
        let textScale = 10;
        if (this.smallDisplay) {
            textScale = 20;
        }
        this.textSize = [
            {
                width: (this.canvas.height / textScale) * (this.images[0].width / this.images[0].height),
                height: this.canvas.height / textScale
            },
            {
                width: (this.canvas.height / textScale) * (this.images[1].width / this.images[1].height),
                height: this.canvas.height / textScale
            }
        ];
        this.textXPosition = [
            (this.canvas.width / 2) - (this.textSize[0].width / 2),
            (this.canvas.width / 2) - (this.textSize[1].width / 2)
        ]
    };
    
    this.drawBarsCanvas = function(width) {
        let context = this.barsCanvas.getContext("2d");
        context.imageSmoothingEnabled = false;
        context.beginPath();
        context.rect(0, 0, this.canvas.width, (this.canvas.height / 100) * 66);
        context.fillStyle = "#e00000";
        context.fill();
        context.closePath();
        context.beginPath();
        context.rect(0, (this.canvas.height / 100) * 84, this.canvas.width, (this.canvas.height / 100) * 16);
        context.fillStyle = "#e00000";
        context.fill();
        context.closePath();
        let offset, length;
        if (!this.smallDisplay) {
            offset = 0;
            length = this.bars.length;
        } else {
            offset = 1;
            length = this.bars.length - 2;
        }
        for (i = 0; i < length; i++) {
            if (this.bars[i + offset] === null) {
                continue;
            }
            context.beginPath();
            context.rect((this.canvas.width / length) * i, 0, this.canvas.width / length, (this.canvas.height / 10) * 6);
            context.fillStyle = this.bars[i + offset];
            context.fill();
            context.closePath();
        }
    };
    
    this.draw = function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let line1YPosition = Math.round((this.canvas.height / 100) * this.textYPosition[0]);
        let line2YPosition = Math.round((this.canvas.height / 100) * this.textYPosition[1]);
        this.context.drawImage(this.images[0], this.textXPosition[0], line1YPosition, this.textSize[0].width, this.textSize[0].height);
        this.context.drawImage(this.images[1], this.textXPosition[1], line2YPosition, this.textSize[1].width, this.textSize[1].height);
        this.context.drawImage(this.barsCanvas, 0, 0, this.canvas.width, this.canvas.height);
        this.textYPosition[0] = this.textYPosition[0] - 0.15;
        if (this.textYPosition[0] <= 56) {
            this.textYPosition[0] = 84;
        }
        this.textYPosition[1] = this.textYPosition[1] - 0.15;
        if (this.textYPosition[1] <= 56) {
            this.textYPosition[1] = 84;
        }
        requestAnimationFrame(this.draw.bind(this));
    };
}

function BasicAnimation() {
    this.initialise = function() {
        this.bars = new ColourBars();
        this.bars.initialise();
        $(this.bars.canvas).attr("id", "animation");
        $("main").append(this.bars.canvas);
        this.resize();
    };
    
    this.resize = function() {
        this.bars.resize($("#animation").width(), $("#animation").height(), window.devicePixelRatio || 1);
    };
}

let animation;

$(function() {
    if (WebGLAvailable()) {
        animation = new BasicAnimation();
    } else {
        animation = new BasicAnimation();
    }
    animation.initialise();
    window.addEventListener("resize", animation.resize.bind(animation));
});
