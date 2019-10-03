class MyComponent{
    transformation;
    materials;
    texture;
    children;
    loaded;

    constructor(isLoaded, transformation, materials, texture, children) {
        this.transformation = transformation;
        this.materials = materials;
        this.texture = texture;
        this.children = children;
        this.loaded = isLoaded;
    }

    initialize(transformation, materials, texture, children) {
        this.transformation = transformation;
        this.materials = materials;
        this.texture = texture;
        this.children = children;
        this.loaded = true;
    }

    display(scene) {
        if(!this.loaded) return;
        scene.multMatrix(this.transformation);
        for(let i = 0; i < this.children.length; i++) {
            scene.pushMatrix();
            this.children[i].display();
            scene.popMatrix();
        }
    }

    isLoaded() {
        return this.loaded;
    }
}