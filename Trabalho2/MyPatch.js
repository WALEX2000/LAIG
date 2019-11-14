/**
 * MyPatch
 * @constructor
 * @param scene - Reference to MyScene object
 */
class MyPatch extends CGFobject {
    constructor(scene, id, npointsU, npointsV, npartsU, npartsV, controlPoints) {
        super(scene);
        this.id = id;
        this.npointsU = npointsU;
        this.npointsV = npointsV;
        this.npartsU = npartsU;
        this.npartsV = npartsV;
        this.controlPoints = controlPoints;
        this.type = "patch";
        this.makeSurface(npointsU, npointsV, npartsU, npartsV, controlPoints);
    }

    makeSurface(npointsU, npointsV, npartsU, npartsV, controlPoints) {
        let planeSurface = new CGFnurbsSurface(npointsU-1, npointsV-1, controlPoints);
        this.surface = new CGFnurbsObject(this.scene, npartsU, npartsV, planeSurface);
        this.texCoords = this.surface.texCoords;
    }

    display() {
        this.surface.display();
    }
}
