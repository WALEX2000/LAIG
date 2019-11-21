/**
* MyInterface class, creating a GUI interface.
*/
class MyInterface extends CGFinterface {
    /**
     * @constructor
     */
    constructor() {
        super();
    }

    /**
     * Initializes the interface.
     * @param {CGFapplication} application
     */
    init(application) {
        super.init(application);
        // init GUI. For more information on the methods, check:
        //  http://workshop.chromeexperiments.com/examples/gui

        this.gui = new dat.GUI();

        // add a group of controls (and open/expand by defult)

        this.initKeys();

        return true;
    }

    /**
     * initKeys
     */
    initKeys() {
        this.scene.gui=this;
        this.processKeyboard=function(){};
        this.activeKeys={};

        this.Mpress = false;
    }

    processKeyDown(event) {
        this.activeKeys[event.code]=true;
    };

    processKeyUp(event) {
        this.activeKeys[event.code]=false;
    };

    isKeyPressed(keyCode) {
        return this.activeKeys[keyCode] || false;
    }

    createCameraDropdown() {
        this.gui.add(this.scene, 'selectedViewIndex', this.scene.viewIds).onChange(this.scene.onSelectedViewChanged.bind(this.scene)).name('View');
    }

    createSecurityDropdown() {
        this.gui.add(this.scene, 'securityViewIndex', this.scene.viewIds).onChange(this.scene.onSecurityViewChanged.bind(this.scene)).name('Security Camera');
    }

    createLightsDropdown() {
        let lightsDropdownFolder = this.gui.addFolder("Lights");
        for (let key in this.scene.graph.lights) {
            lightsDropdownFolder.add(this.scene.graph.lights[key], '0').name(key);
        }
    }

    update() {
        if(!this.pressM && this.isKeyPressed('KeyM')) {
            this.scene.nextMaterial();
            this.pressM = true;
        }
        else if(!this.isKeyPressed('KeyM'))
            this.pressM = false;
    }
}