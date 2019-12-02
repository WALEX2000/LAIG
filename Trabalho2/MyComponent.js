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
            //this.playAnimation(this.animation);
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
        
        mat.apply();

        for(let i = 0; i < this.children.length; i++) {
            this.scene.pushMatrix();
            let child = this.children[i];
            if(child.children == undefined) { //if the next one is a primitive
                let oldCoords = [...child.texCoords];
                switch(child.type) { //Change the texCoords in accordance to the length_s and length_t attributes in rectangle and triangles
                    case "rectangle":
                        let coords = child.texCoords;
                        coords[0] = coords[0]/fatherLs;
                        coords[2] = coords[2]/fatherLs;
                        coords[4] = coords[4]/fatherLs;
                        coords[6] = coords[6]/fatherLs;

                        coords[1] = coords[1]/fatherLt;
                        coords[3] = coords[3]/fatherLt;
                        coords[5] = coords[5]/fatherLt;
                        coords[7] = coords[7]/fatherLt; 
                        child.updateTexCoords(coords);
                    break;
                    case "triangle":
                        let triangleCoords = child.texCoords;

                        triangleCoords[0] = triangleCoords[0]/fatherLs;
                        triangleCoords[2] = triangleCoords[2]/fatherLs;
                        triangleCoords[4] = triangleCoords[4]/fatherLs;
                        triangleCoords[6] = triangleCoords[6]/fatherLs;
                        triangleCoords[8] = triangleCoords[8]/fatherLs;
                        triangleCoords[10] = triangleCoords[10]/fatherLs;

                        triangleCoords[1] = triangleCoords[1]/fatherLt;
                        triangleCoords[3] = triangleCoords[3]/fatherLt;
                        triangleCoords[5] = triangleCoords[5]/fatherLt;
                        triangleCoords[7] = triangleCoords[7]/fatherLt;
                        triangleCoords[9] = triangleCoords[9]/fatherLt;
                        triangleCoords[11] = triangleCoords[11]/fatherLt;

                        child.updateTexCoords(triangleCoords);
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