/**
 * MyMaterial
 * @constructor
 * @param scene - Reference to MyScene object
 */
class MyMaterial {
    constructor(shine, emission, ambient, diffuse, specular) {
        this.shine = shine;
        this.emission = emission;

        this.ambient = ambient;
        this.diffuse = diffuse;
        this.specular = specular;
    }

    apply(appearence) {
        appearence.setAmbient(...this.ambient);
        appearence.setDiffuse(...this.diffuse);
        appearence.setSpecular(...this.specular);
        appearence.setShininess(this.shine);
        appearence.setEmission(...this.emission);
    }
}

class MyMaterialInherit extends MyMaterial {
    apply(appearence) {
        //do Nothing
    }
}