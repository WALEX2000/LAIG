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

        /*for(let i = 0; i < npartsU; i++) {
            v_list = [];
            for (let j = 0; j < npartsV; j++) {
                v_list.push([-0.5+i/npartsU, -0.5+j/npartsV, 0.0]);
            }
            controlPoints.push(v_list);
        }*/

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
