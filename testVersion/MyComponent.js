class MyComponent{
    transformation;
    materials;
    texture;
    children;
    loaded;
    scene;

    constructor(isLoaded, transformation, materials, texture, children, scene, animation) {
        this.transformation = transformation;
        this.materials = materials;
        this.texture = texture;
        this.children = children;
        this.loaded = isLoaded;
        this.scene = scene;
        this.animation = animation;
    }

    initialize(transformation, materials, texture, children, scene, animation) {
        this.transformation = transformation;
        this.materials = materials;
        this.texture = texture;
        this.children = children;
        this.loaded = true;
        this.scene = scene;
        this.animation = animation;
    }

    //get ID and associate the animation to this component (ideally when display I'll just need to call animation.play())
    //A função animation.play vai pegar na animação, ver o tempo em que está e interpolar entre o keyframe anterior e o proximo

    display(fatherMat, fatherTex, fatherLs, fatherLt) { //Recursive display loop
        if(!this.loaded) return; //In case there was some kind of error in the XML

        this.scene.multMatrix(this.transformation); //apply transformations
        if(this.animation != null) {
            this.animation.update();
            this.animation.apply();
        } //apply animation transformation

        let mat = this.materials.materials[this.materials.current]; //applying the current material
        let tex = this.texture.texture;
        if(mat == "inherit") {
            mat = fatherMat;
        }
        if(tex == "inherit") {
            tex = fatherTex;
        }
        else if(tex != null) { //pass on the length_S and length_t attributes
            fatherLs = this.texture.length_s;
            fatherLt = this.texture.length_t;
        }

        mat.setTexture(tex); //apply texture to material
        mat.setTextureWrap('REPEAT','REPEAT');

        for(let i = 0; i < this.children.length; i++) {
            mat.setTexture(tex); //apply texture to material
            mat.setTextureWrap('REPEAT','REPEAT');
            mat.apply();
            this.scene.pushMatrix();
            let child = this.children[i];
            if(child.children == undefined) { //if the next one is a primitive
                let oldCoords = [...child.texCoords];


                let coords = child.texCoords;
                for(let i = 0; i < coords.length; i++) {
                    if(i%2 === 0) {
                        coords[i] = coords[i]/fatherLs;
                    }
                    else {
                        coords[i] = coords[i]/fatherLt;
                    }
                }               
                switch(child.type) { //Change the texCoords in accordance to the length_s and length_t attributes in rectangle and triangles
                    case "rectangle":
                    case "triangle":
                        child.updateTexCoords(coords);
                        break;
                    default:
                    break;
                }
                child.display();
                child.texCoords = oldCoords;
            }
            else { //if next object is not a primitive go deeper into the graph
                child.display(mat, tex, fatherLs, fatherLt);   
            }
            this.scene.popMatrix();
        }
    }

    isLoaded() {
        return this.loaded;
    }
}