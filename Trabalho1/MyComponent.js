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

    display() {
        if(!this.loaded) return;
        this.scene.multMatrix(this.transformation);
        let mat = this.materials.materials[this.materials.current]; //applying the current material
        mat.setTexture(this.texture.texture);
        mat.apply();
        for(let i = 0; i < this.children.length; i++) {
            this.scene.pushMatrix();
            this.children[i].display();
            this.scene.popMatrix();
        }
    }

    isLoaded() {
        return this.loaded;
    }
}