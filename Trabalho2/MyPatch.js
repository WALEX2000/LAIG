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
        this.makeSurface();
    }

    makeSurface() {
        this.texCoords = [];
        let planeSurface = new CGFnurbsSurface(this.npointsU-1, this.npointsV-1, this.controlPoints);
        this.surface = new CGFnurbsObject(this.scene, this.npartsU, this.npartsV, planeSurface);
    }

    display() {
        this.surface.display();
    }
}
