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
        this.graphs = [];
        this.loadedGraphs = 0;
        this.selectedGraphName = 'Desert';
        this.selectedGraph = 1;
        this.interface = myinterface;
        this.board;
    }

    /**
     * Initializes the scene, setting some WebGL defaults, initializing the camera and the axis.
     * @param {CGFApplication} application
     */
    init(application) {
        super.init(application);

        this.sceneInited = false;
        this.enableTextures(true);
        this.setPickEnabled(true);

        this.gl.clearDepth(100.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.depthFunc(this.gl.LEQUAL);
        
        this.setUpdatePeriod(100);
    }

    update(t) {

    }

    /**
     * Initializes the scene cameras.
     */
    initCameras() {
        //Choose the camera with the appropriate default ID in case it exists.
        this.viewIds = [];
        this.cameras = [];
        for(let viewNode in this.graphs[this.selectedGraph].views) {
            let view = this.graphs[this.selectedGraph].views[viewNode];
            if(view.type == "perspective"){
                this.cameras[view.id] = new CGFcamera(DEGREE_TO_RAD*view.angle, view.near, view.far, view.from, view.to);
            } else if(view.type == "ortho"){
                this.cameras[view.id] = new CGFcameraOrtho(view.left, view.right, view.bottom, view.top, view.near, view.far, view.from, view.to, view.up);
            }
            this.viewIds.push(viewNode);
            if(view.id == this.graphs[this.selectedGraph].defaultView) {
                this.selectedViewIndex = view.id;
            }
        }
        //In case there's an error with the camera do nothing.
        if(this.selectedViewIndex == null) return null;
        this.camera = this.cameras[this.selectedViewIndex];
        this.interface.setActiveCamera(this.camera);
    }
    /**
     * Initializes the scene lights with the values read from the XML file.
     */
    initLights() {
        var i = 0;
        // Lights index.

        // Reads the lights from the scene graph.
        for (var key in this.graphs[this.selectedGraph].lights) {
            if (i >= 8)
                break;              // Only eight lights allowed by WebGL.

            if (this.graphs[this.selectedGraph].lights.hasOwnProperty(key)) {
                var light = this.graphs[this.selectedGraph].lights[key];

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

        for(let j = i; j < 8; j++) {
            this.lights[j].disable();
            this.lights[j].update();
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
        this.loadedGraphs++;
        if(this.loadedGraphs != 2)
            return;
        console.log(this.graphs[this.selectedGraph].whiteTile);
        this.board = new MyBoard(this, this.graphs[this.selectedGraph].whiteTile, this.graphs[this.selectedGraph].blackTile, this.graphs[this.selectedGraph].whitePiece, this.graphs[this.selectedGraph].blackPiece, this.graphs[this.selectedGraph].divider, this.graphs[this.selectedGraph].indicator, this.graphs[this.selectedGraph].boardTable);
        this.gl.clearColor(this.graphs[this.selectedGraph].background[0], this.graphs[this.selectedGraph].background[1], this.graphs[this.selectedGraph].background[2], this.graphs[this.selectedGraph].background[3]);
        this.setGlobalAmbientLight(this.graphs[this.selectedGraph].ambient[0], this.graphs[this.selectedGraph].ambient[1], this.graphs[this.selectedGraph].ambient[2], this.graphs[this.selectedGraph].ambient[3]);

        this.interface.createGraphDropdown();

        this.initCameras();
        this.interface.createCameraDropdown(this.graphs[this.selectedGraph].views);

        this.initLights();
        this.interface.createLightsDropdown(this.graphs[this.selectedGraph].lights);

        this.interface.createGameInterface();

        this.sceneInited = true;

        this.time0 = performance.now();
        this.axis = new CGFaxis(this);
    }

    //function triggered by changing view in interface
    onSelectedViewChanged() {
        this.camera = this.cameras[this.selectedViewIndex];
        this.interface.setActiveCamera(this.camera);
    }

    nextMaterial() { //function called upon pressing M (to change material in all componenets)
        for(let comp in this.graphs[this.selectedGraph].allComponents) this.graphs[this.selectedGraph].nextMat(this.graphs[this.selectedGraph].allComponents[comp]);
    }

    /**
     * Displays the scene.
     */

    display() {
        if(!this.sceneInited)
            return;

        this.render(this.camera);
    }

    render(camera) {
        // ---- BEGIN Background, camera and axis setup

        // Clear image and depth buffer everytime we update the scene
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // Initialize Model-View matrix as identity (no transformation
        this.updateProjectionMatrix();
        this.loadIdentity();

        // Apply transformations corresponding to the camera position relative to the origin
        this.applyViewMatrix();

        this.pushMatrix();
        this.translate(0,5,0);
        this.axis.display();
        this.popMatrix();

        this.pushMatrix();

        let i = 0;
        for(let key in this.graphs[this.selectedGraph].lights) {
            let light = this.graphs[this.selectedGraph].lights[key];
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
            this.graphs[this.selectedGraph].displayScene();
            this.pushMatrix();
            this.translate(0,5,0);
            this.board.display();
            this.popMatrix();
        }

        this.board.checkPicking();

        this.popMatrix();
        // ---- END Background, camera and axis setup
    }

    changeSelectedGraph() {
        switch(this.selectedGraphName) {
            case 'Desert':
                this.selectedGraph = 0;
                break;
            case 'Restaurant':
                this.selectedGraph = 1;
                break;
        }
        this.board = new MyBoard(this, this.graphs[this.selectedGraph].whiteTile, this.graphs[this.selectedGraph].blackTile, this.graphs[this.selectedGraph].whitePiece, this.graphs[this.selectedGraph].blackPiece, this.graphs[this.selectedGraph].divider, this.graphs[this.selectedGraph].indicator, this.graphs[this.selectedGraph].boardTable);
        this.initCameras();
        this.initLights();
        this.interface.resetInterface();
        console.log(this.lights.length);
    }
}