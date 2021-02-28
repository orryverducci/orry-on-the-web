var background;

function WaveBackground() {
    this.initialise = function() {
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: "low-power"
        });
        this.renderer.domElement.id = "home-bg";
        $("main").append(this.renderer.domElement);
        // Create scene
        this.scene = new THREE.Scene();
        // Set uniforms
        this.uniforms = {
            u_time: {
                type: "f",
                value: 1.0
            },
            u_resolution: {
                type: "v2",
                value: new THREE.Vector2(1, 1)
            },
            u_mouse: {
                type: "v2",
                value: new THREE.Vector2(0, 0)
            }
        };
        // Create material and geometry
        let material = new THREE.MeshPhongMaterial({
            color: 0x9c27b0,
            shininess: 30,
            flatShading: true,
            vertexColors: THREE.FaceColors,
            side: THREE.DoubleSide
        });
        let geometry = new THREE.Geometry();
        // Set cell size
        let cellSize = 18;
        let ww = 100;
        let hh = 80;
        let waveNoise = 4;
        // Add vertices
        this.vertices = [];
        for (let i = 0; i <= ww; i++) {
            this.vertices[i] = [];
            for (let j = 0; j <= hh; j++) {
                let id = geometry.vertices.length;
                this.vertices[i][j] = id;
                let newVertex = new THREE.Vector3((i - (ww * 0.5)) * cellSize, (Math.random() * waveNoise) - 10, ((hh * 0.5) - j) * cellSize);
                geometry.vertices.push(newVertex);
            }
        }
        // Add faces
        for (let i = 1; i <= ww; i++) {
            for (let j = 1; j <= hh; j++) {
                let face1, face2;
                let d = this.vertices[i][j];
                let b = this.vertices[i][j - 1];
                let c = this.vertices[i - 1][j];
                let a = this.vertices[i - 1][j - 1];
                if (Math.floor(Math.random() * 2)) {
                    face1 = new THREE.Face3(a, b, c);
                    face2 = new THREE.Face3(b, c, d);
                } else {
                    face1 = new THREE.Face3(a, b, d);
                    face2 = new THREE.Face3(a, c, d);
                }
                geometry.faces.push(face1, face2);
            }
        }
        // Mesh the material and geometry, and add to the scene
        this.plane = new THREE.Mesh(geometry, material);
        this.scene.add(this.plane);
        // Add lights
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.9));
        let pointLight = new THREE.PointLight(0xffffff, 0.9);
        pointLight.position.set(-100,250,-100);
        this.scene.add(pointLight);
        // Add camera to the scene
        this.camera = new THREE.PerspectiveCamera(35, this.width / this.height, 50, 10000);
        let xOffset = -10;
        let zOffset = -10;
        this.cameraPosition = new THREE.Vector3(250 + xOffset, 200, 400 + zOffset);
        this.cameraTarget = new THREE.Vector3(150 + xOffset, -30, 200 + zOffset);
        this.camera.position.copy(this.cameraPosition);
        this.scene.add(this.camera);
        // Resize
        this.resize();
        // Start animation
        this.animationLoop();
    };
    
    this.resize = function() {
        this.renderer.setSize($("#home-bg").width(), $("#home-bg").height(), false);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.camera.aspect = $("#home-bg").width() / $("#home-bg").height();
        this.camera.updateProjectionMatrix();
    };
    
    this.animationLoop = function() {
        // Step time
        this.t || (this.t = 0);
        this.t += 1;
        // Uniform time
        this.t2 || (this.t2 = 0);
        this.t2 += 1;
        if (this.uniforms) {
            this.uniforms.u_time.value = this.t2 * 0.016667;
        }
        // Update animation
        this.updateAnimation();
        // Render scene
        if (this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
            this.renderer.setClearColor(0x000000, 0);
        }
        window.requestAnimationFrame(this.animationLoop.bind(this));
    };

    this.updateAnimation = function() {
        // Update options
        this.plane.material.color.set(0x570088);
        this.plane.material.shininess = 30;
        this.camera.ox = this.cameraPosition.x;
        this.camera.oy = this.cameraPosition.y;
        this.camera.oz = this.cameraPosition.z;
        // Set camera position
        let diff;
        if (Math.abs(this.camera.tx - this.camera.position.x) > 0.01) {
            diff = this.camera.tx - this.camera.position.x;
            this.camera.position.x += diff * 0.02;
        }
        if (Math.abs(this.camera.ty - this.camera.position.y) > 0.01) {
            diff = this.camera.ty - this.camera.position.y;
            this.camera.position.y += diff * 0.02;
        }
        if (Math.abs(this.camera.tz - this.camera.position.z) > 0.01) {
            diff = this.camera.tz - this.camera.position.z;
            this.camera.position.z += diff * 0.02;
        }
        this.camera.lookAt(this.cameraTarget);
        // Update waves
        for (let i = 0; i < this.plane.geometry.vertices.length; i++) {
            if (!this.plane.geometry.vertices[i].oy) { // Initialise
                this.plane.geometry.vertices[i].oy = this.plane.geometry.vertices[i].y;
            } else {
                let waveSpeed = 0.7;
                let waveHeight = 15;
                const crossChop = Math.sqrt(waveSpeed) * Math.cos(-this.plane.geometry.vertices[i].x - (this.plane.geometry.vertices[i].z * 0.7));
                const delta = Math.sin((((waveSpeed * this.t * 0.02) - (waveSpeed * this.plane.geometry.vertices[i].x * 0.025)) + (waveSpeed * this.plane.geometry.vertices[i].z * 0.015) + crossChop));
                const trochoidDelta = Math.pow(delta + 1, 2) / 4;
                this.plane.geometry.vertices[i].y = this.plane.geometry.vertices[i].oy + (trochoidDelta * waveHeight);
            }
        }
        // Set geometry settings
        this.plane.geometry.dynamic = true;
        this.plane.geometry.computeFaceNormals();
        this.plane.geometry.verticesNeedUpdate = true;
        this.plane.geometry.normalsNeedUpdate = true;
    };
}

function SnowBackground() {
    this.initialise = function() {
        // Set properties
        this.particleNum = 10000;
        this.range = 500;
        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true
        });
        this.renderer.domElement.id = "home-bg";
        $("main").append(this.renderer.domElement);
        // Create scene
        this.scene = new THREE.Scene();
        // Set scene fog
        this.scene.fog = new THREE.Fog(0x000000, 300, 600);
        // Add camera to the scene
        this.camera = new THREE.PerspectiveCamera(45, $("#home-bg").width() / $("#home-bg").height(), 1, 1200);
        this.camera.position.z = 250;
        this.camera.position.y = -250;
        this.camera.lookAt(this.scene.position);
        // Create material and geometry
        let texture = new THREE.TextureLoader().load("https://new.orryverducci.co.uk/themes/orry-web/assets/images/snowflake.png");
        let material = new THREE.PointsMaterial({
            //depthTest: false,
            map: texture,
            opacity: 0.5,
            size: 3,
            blending: THREE.AdditiveBlending,
            transparent: true
        });
        this.particles = new THREE.BufferGeometry();
        // Set initial particle positions
        this.particlePositions = new Float32Array(this.particleNum * 3);
        for (let i = 0; i < this.particleNum; i++) {
            let x = Math.random() * this.range - this.range / 2;
            let y = Math.random() * this.range - this.range / 2;
            let z = Math.random() * this.range - this.range / 2;
            this.particlePositions[i * 3] = x;
            this.particlePositions[i * 3 + 1] = y;
            this.particlePositions[i * 3 + 2] = z;
        }
        // Set particle properties
        this.particles.setDrawRange(0, this.particleNum);
        this.particles.addAttribute("position", new THREE.BufferAttribute(this.particlePositions, 3).setDynamic(true));
        // Create points with the material and add to the scene
        this.pointCloud = new THREE.Points(this.particles, material);
        this.scene.add(this.pointCloud);
        // Resize
        this.resize();
        // Start animation
        this.animationLoop();
    };
    
    this.resize = function() {
        this.renderer.setSize($("#home-bg").width(), $("#home-bg").height(), false);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.camera.aspect = $("#home-bg").width() / $("#home-bg").height();
        this.camera.updateProjectionMatrix();
    };
    
    this.animationLoop = function() {
        for (let i= 0; i < this.particleNum; i++) {
            this.particlePositions[i * 3 + 1] -= 0.5;
            if (this.particlePositions[i * 3 + 1] < -this.range / 2){
            	this.particlePositions[i * 3 + 1] = this.range / 2
            }
        }
        this.pointCloud.geometry.attributes.position.needsUpdate = true;
        this.renderer.render(this.scene, this.camera);
        window.requestAnimationFrame(this.animationLoop.bind(this));
    }
}

function WebGLAvailable() {
    let canvas = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
}

$(function() {
    if (WebGLAvailable()) {
        if ($("body").data("xmas") !== true) {
            background = new WaveBackground();
        } else {
            background = new SnowBackground();
        }
        background.initialise();
        window.addEventListener("resize", background.resize.bind(background));
    }
    $("#home-content").addClass("text-visible");
});
