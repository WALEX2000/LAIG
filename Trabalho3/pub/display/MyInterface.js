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

    resetInterface() {
        this.gui.destroy();
        this.gui = new dat.GUI();
        this.createGraphDropdown();
        this.createCameraDropdown();
        this.createLightsDropdown();
        this.createGameInterface();
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

    createGraphDropdown() {
        this.gui.add(this.scene, 'selectedGraphName', ['Desert', 'Restaurant']).onChange(this.scene.changeSelectedGraph.bind(this.scene)).name("Scene");
    }

    createCameraDropdown() {
        this.gui.add(this.scene, 'selectedViewIndex', this.scene.viewIds).onChange(this.scene.onSelectedViewChanged.bind(this.scene)).name('View');
    }

    createLightsDropdown() {
        let lightsDropdownFolder = this.gui.addFolder("Lights");
        for (let key in this.scene.graphs[this.scene.selectedGraph].lights) {
            lightsDropdownFolder.add(this.scene.graphs[this.scene.selectedGraph].lights[key], '0').name(key);
        }
    }

    createGameInterface() {
        let settingsFolder = this.gui.addFolder("Settings");
        settingsFolder.add(this.scene.board, 'gamemode', ['PvP', 'PvM', 'MvM']).onChange(this.scene.board.checkGamemodeChange.bind(this.scene.board)).name('Gamemode');
        settingsFolder.add(this.scene.board, 'difficulty', [0,1]).name('Difficulty');
        settingsFolder.add(this.scene.board, 'boardSize', [3,4,5,6]).name('Board Size').onChange(this.scene.board.updateBoardSize.bind(this.scene.board));
        settingsFolder.add(this.scene.board.timer, 'maxTime', [15, 30, 45]).name('Timeout').onChange(this.scene.board.timer.resetCount.bind(this.scene.board.timer));
        this.gui.add(this.scene.board, 'initGame').name('Start game');
        this.gui.add(this.scene.board, 'resetGame').name('Reset game');
        this.gui.add(this.scene.board, 'replayGame').name('Replay game');
        this.gui.add(this.scene.board, 'undoMove').name('Undo move');
        this.gui.add(this.scene.board, 'gameCameraActive').onChange(this.scene.board.toggleGameCamera.bind(this.scene.board)).name('Game Camera');
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