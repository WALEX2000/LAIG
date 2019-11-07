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

        function getMatrix(transObj) {
            let transfMatrix = mat4.create();

            let translate = transObj.translate;
            transfMatrix = mat4.translate(transfMatrix, transfMatrix, [translate.x, translate.y, translate.z]);

            let scale = transObj.scale;
            transfMatrix = mat4.scale(transfMatrix, transfMatrix, [scale.x, scale.y, scale.z]);

            let rotation = transObj.rotate;
            transfMatrix = mat4.rotateX(transfMatrix, transfMatrix, rotation.x*DEGREE_TO_RAD);
            transfMatrix = mat4.rotateY(transfMatrix, transfMatrix, rotation.y*DEGREE_TO_RAD);
            transfMatrix = mat4.rotateZ(transfMatrix, transfMatrix, rotation.z*DEGREE_TO_RAD);

            return transfMatrix;
        }

        //Everywhere where matrices are being used I needs to replace it with a function that calculates a matrix based on the transformation values
        //on the lerp I need to first lerp the transformation values and then calculate the matrix

        if(nextKeyFrame == null) { //if animation has already ended
            let animationKeyframe = animation.keyframes[animation.keyframes.length - 1];
            this.scene.multMatrix(getMatrix(animationKeyframe.transforms));
            return;
        }

        let defTranslate = {x: 0, y: 0, z: 0};
        let defScale = {x: 1, y: 1, z: 1};
        let defRotate = {x: 0, y: 0, z: 0};
        let defaultTransform = {translate: defTranslate, scale: defScale, rotate: defRotate};
        let transObj1 = (prevKeyFrame == null) ? defaultTransform : prevKeyFrame.transforms;
        let transObj2 = nextKeyFrame.transforms;
        let ammountOfLerp = (currentTime - prevKeyFrameStartTime) / (nextKeyFrame.instant - prevKeyFrameStartTime);

        //interpolate between the 2 according to the current time
        function lerpTransforms(transObj1, transObj2, ammountOfLerp) {
            let newTransObj = {};

            //Lerp translates
            let translateX = (1 - ammountOfLerp) * transObj1.translate.x + ammountOfLerp * transObj2.translate.x;
            let translateY = (1 - ammountOfLerp) * transObj1.translate.y + ammountOfLerp * transObj2.translate.y;
            let translateZ = (1 - ammountOfLerp) * transObj1.translate.z + ammountOfLerp * transObj2.translate.z;
            newTransObj.translate = {x: translateX, y: translateY, z: translateZ};

            //Lerp Scale
            let scaleX = (1 - ammountOfLerp) * transObj1.scale.x + ammountOfLerp * transObj2.scale.x;
            let scaleY = (1 - ammountOfLerp) * transObj1.scale.y + ammountOfLerp * transObj2.scale.y;
            let scaleZ = (1 - ammountOfLerp) * transObj1.scale.z + ammountOfLerp * transObj2.scale.z;
            newTransObj.scale = {x: scaleX, y: scaleY, z: scaleZ};

            //Lerp Rotate
            let rotateX = (1 - ammountOfLerp) * transObj1.rotate.x + ammountOfLerp * transObj2.rotate.x;
            let rotateY = (1 - ammountOfLerp) * transObj1.rotate.y + ammountOfLerp * transObj2.rotate.y;
            let rotateZ = (1 - ammountOfLerp) * transObj1.rotate.z + ammountOfLerp * transObj2.rotate.z;
            newTransObj.rotate = {x: rotateX, y: rotateY, z: rotateZ};

            return getMatrix(newTransObj);
        }
        let transfMatrix = lerpTransforms(transObj1, transObj2, ammountOfLerp);

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