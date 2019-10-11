class MyComponent{
    transformation;
    materials;
    texture;
    children;
    loaded;
    scene;

    constructor(isLoaded, transformation, materials, texture, children, scene) {
        this.transformation = transformation;
        this.materials = materials;
        this.texture = texture;
        this.children = children;
        this.loaded = isLoaded;
        this.scene = scene;

    }

    initialize(transformation, materials, texture, children, scene) {
        this.transformation = transformation;
        this.materials = materials;
        this.texture = texture;
        this.children = children;
        this.loaded = true;
        this.scene = scene;
    }

    display(fatherMat, fatherTex, fatherLs, fatherLt) {
        if(!this.loaded) return;
        this.scene.multMatrix(this.transformation);
        let mat = this.materials.materials[this.materials.current]; //applying the current material
        let tex = this.texture.texture;
        if(mat == "inherit") {
            mat = fatherMat;
        }
        if(tex == "inherit") {
            tex = fatherTex;
        }
        else if(tex != null) {
            fatherLs = this.texture.length_s;
            fatherLt = this.texture.length_t;
        }

        mat.setTexture(tex);
        mat.apply();

        for(let i = 0; i < this.children.length; i++) {
            this.scene.pushMatrix();
            let child = this.children[i];
            if(child.children == undefined) { //if the next one is a primitive
                let coords = this.children[i].texCoords;
            }
            this.children[i].display(mat, tex, fatherLs, fatherLt);
            this.scene.popMatrix();
        }
    }

    isLoaded() {
        return this.loaded;
    }
}