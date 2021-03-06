var DEGREE_TO_RAD = Math.PI / 180;

/**
 * XMLscene class, representing the scene that is to be rendered.
 */
class XMLscene extends CGFscene {
    /**
     * @constructor
     * @param {MyInterface} myinterface 
     */
    constructor(myinterface) {
        super();

        this.interface = myinterface;
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        this.sceneInited = false;

        this.textureRTT = new CGFtextureRTT(this, this.gl.canvas.width*2, this.gl.canvas.height*2);
        this.securityCamera = new MySecurityCamera(this, this.textureRTT);

        this.enableTextures(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);
        
        this.setUpdatePeriod(100);
    }

    update(t) {
        this.securityCamera.updateTimeFactor(t / 200 % 1000);
    }

    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        //Choose the camera with the appropriate default ID in case it exists.
        this.viewIds = [];
        this.cameras = [];
        for(let viewNode in this.graph.views) {
            let view = this.graph.views[viewNode];
            if(view.type == "perspective"){
                this.cameras[view.id] = new CGFcamera(DEGREE_TO_RAD*view.angle, view.near, view.far, view.from, view.to);
            } else if(view.type == "ortho"){
                this.cameras[view.id] = new CGFcameraOrtho(view.left, view.right, view.bottom, view.top, view.near, view.far, view.from, view.to, view.up);
            }
            this.viewIds.push(viewNode);
            if(view.id == this.graph.defaultView) {
                this.selectedViewIndex = view.id;
                this.securityViewIndex = view.id;
            }
        }
        //In case there's an error with the camera do nothing.
        if(this.selectedViewIndex == null) return null;
        this.camera = this.cameras[this.selectedViewIndex];
        this.security = this.cameras[this.securityViewIndex];
        this.interface.setActiveCamera(this.camera);
    }
    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {
        var i = 0;
        // Lights index.

        // Reads the lights from the scene graph.
        for (var key in this.graph.lights) {
            if (i >= 8)
                break;              // Only eight lights allowed by WebGL.

            if (this.graph.lights.hasOwnProperty(key)) {
                var light = this.graph.lights[key];

                this.lights[i].setPosition(light[2][0], light[2][1], light[2][2], light[2][3]);
                this.lights[i].setAmbient(light[3][0], light[3][1], light[3][2], light[3][3]);
                this.lights[i].setDiffuse(light[4][0], light[4][1], light[4][2], light[4][3]);
                this.lights[i].setSpecular(light[5][0], light[5][1], light[5][2], light[5][3]);

                if (light[1] == "spot") {
                    this.lights[i].setSpotCutOff(light[6]);
                    this.lights[i].setSpotExponent(light[7]);
                    this.lights[i].setSpotDirection(light[8][0], light[8][1], light[8][2]);
                }

                this.lights[i].setVisible(false);
                if (light[0])
                    this.lights[i].enable();
                else
                    this.lights[i].disable();

                this.lights[i].update();

                i++;
            }
        }
    }

    setDefaultAppearance() {
        this.setAmbient(0.2, 0.4, 0.8, 1.0);
        this.setDiffuse(0.2, 0.4, 0.8, 1.0);
        this.setSpecular(0.2, 0.4, 0.8, 1.0);
        this.setShininess(10.0);
    }
    /** Handler called when the graph is finally loaded. 
     * As loading is asynchronous, this may be called already after the application has started the run loop
     */
    onGraphLoaded() {
        this.gl.clearColor(this.graph.background[0], this.graph.background[1], this.graph.background[2], this.graph.background[3]);
        this.setGlobalAmbientLight(this.graph.ambient[0], this.graph.ambient[1], this.graph.ambient[2], this.graph.ambient[3]);

        this.initCameras();
        this.interface.createCameraDropdown(this.graph.views);
        this.interface.createSecurityDropdown(this.graph.views);

        this.initLights();
        this.interface.createLightsDropdown(this.graph.lights);

        this.sceneInited = true;

        this.time0 = performance.now();
    }

    //function triggered by changing view in interface
    onSelectedViewChanged() {
        this.camera = this.cameras[this.selectedViewIndex];
        this.interface.setActiveCamera(this.camera);
    }
    
    onSecurityViewChanged() {
        this.security = this.cameras[this.securityViewIndex];
    }

    nextMaterial() { //function called upon pressing M (to change material in all componenets)
        for(let comp in this.graph.allComponents) this.graph.nextMat(this.graph.allComponents[comp]);
    }

    /**
     * Displays the scene.
     */

    display() {
        if(!this.sceneInited)
            return;

        this.textureRTT.attachToFrameBuffer();    
        this.render(this.cameras[this.securityViewIndex]);
        this.textureRTT.detachFromFrameBuffer();
        this.render(this.cameras[this.selectedViewIndex]);

        this.gl.disable(this.gl.DEPTH_TEST);
        this.securityCamera.display();
        this.gl.enable(this.gl.DEPTH_TEST);
    }

    render(camera) {
        // ---- BEGIN Background, camera and axis setup

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.camera = camera;
        this.interface.setActiveCamera(camera);

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        this.pushMatrix();

        let i = 0;
        for(let key in this.graph.lights) {
            let light = this.graph.lights[key];
            if(light[0])
                this.lights[i].enable();
            else
                this.lights[i].disable();
                
            this.lights[i].update();

            i++;
        }

        if (this.sceneInited) {
            // Draw axis
            this.setDefaultAppearance();
            // Displays the scene (MySceneGraph function).
            this.graph.displayScene();
        }

        this.popMatrix();
        // ---- END Background, camera and axis setup
    }
}