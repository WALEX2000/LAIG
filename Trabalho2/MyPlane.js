/**
 * MyPlane
 * @constructor
 * @param scene - Reference to MyScene object
 */
class MyPlane extends CGFobject {
    constructor(scene, id, npartsU, npartsV) {
        super(scene);
        this.id = id;
        this.npartsU = npartsU;
        this.npartsV = npartsV;
        this.type = "plane";

        let controlPoints = [
                            [
                                [-0.5, 0.0, 0.5, 1],
                                [-0.5, 0.0, -0.5, 1]
                            ],
                            [
                                [0.5, 0.0, 0.5, 1],
                                [0.5, 0.0, -0.5, 1]
                            ]
                        ];

        /*for(let i = 0; i < npartsU; i++) {
            v_list = [];
            for (let j = 0; j < npartsV; j++) {
                v_list.push([-0.5+i/npartsU, -0.5+j/npartsV, 0.0]);
            }
            controlPoints.push(v_list);
        }*/

        this.makeSurface(npartsU, npartsV, controlPoints);
    }

    makeSurface(npartsU, npartsV, controlPoints) {
        let planeSurface = new CGFnurbsSurface(1, 1, controlPoints);
        this.surface = new CGFnurbsObject(this.scene, npartsU, npartsV, planeSurface);
        this.texCoords = this.surface.texCoords;
    }

    display() {
        this.surface.display();
    }
}
