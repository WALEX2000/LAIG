/**
 * MyMaterial
 * @constructor
 * @param scene - Reference to MyScene object
 */
class MyMaterial extends CGFappearance {
    constructor(scene, shine, emission, ambient, diffuse, specular) {
        super(scene);

        if(shine === undefined) return;

        this.setShininess(shine);
        this.setEmission(...emission);

        this.setAmbient(...ambient);
        this.setDiffuse(...diffuse);
        this.setSpecular(...specular);
    }
}

class MyMaterialInherit extends MyMaterial {
    constructor(scene) {
        super(scene);
    }

    apply() {
        //do Nothing
    }
}