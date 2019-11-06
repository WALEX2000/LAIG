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

    playAnimation(animation) {
        //get current time
        let currTimeStamp = performance.now();
        let currentTime = (currTimeStamp - this.scene.time0)*0.001;

        //determine the next and previous keyframe
        let prevKeyFrameStartTime = 0;
        let prevKeyFrame = null;
        let nextKeyFrame = null;
        for(let i = 0; i < animation.keyframes.length; i++) {
            let keyframe = animation.keyframes[i];
            if(keyframe.instant < currentTime) {
                prevKeyFrame = keyframe;
                prevKeyFrameStartTime = keyframe.instant;
            }
            else {
                nextKeyFrame = keyframe;
                break;
            }
        }

        if(nextKeyFrame == null) {
            this.scene.multMatrix(animation.keyframes[animation.keyframes.length - 1].matrix);
            return; //if animation has ended, but can't just return has to mulMatrix the last keyframe
        }

        let matrix1 = (prevKeyFrame == null) ? mat4.create() : prevKeyFrame.matrix;
        let matrix2 = nextKeyFrame.matrix;
        let ammountOfLerp = (currentTime - prevKeyFrameStartTime) / (nextKeyFrame.instant - prevKeyFrameStartTime);

        //interpolate between the 2 according to the current time
        function lerpMatrix(matrix1, matrix2, ammountOfLerp) {
            let newMatrix = mat4.create();
            for(let i = 0; i < 16; i++) {
                newMatrix[i] = (1 - ammountOfLerp) * matrix1[i] + ammountOfLerp * matrix2[i];
            }
            return newMatrix;
        }
        let transfMatrix = lerpMatrix(matrix1, matrix2, ammountOfLerp);

        //apply new matrix
        this.scene.multMatrix(transfMatrix);
    }

    display(fatherMat, fatherTex, fatherLs, fatherLt) { //Recursive display loop
        if(!this.loaded) return; //In case there was some kind of error in the XML

        this.scene.multMatrix(this.transformation); //apply transformations
        if(this.animation != null) this.playAnimation(this.animation); //apply animation transformation

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