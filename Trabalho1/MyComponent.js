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
        //scene.multmatrix(this.transformation);
        for(let i = 0; i < this.children.length; i++) {
                this.children[i].object.display();
            }
    }

    isLoaded() {
        return this.loaded;
    }
}