class Animation { //abstract class
    constructor(scene) {
        this.animationMartix = mat4.create();
        this.scene = scene;
    }

    update(){}
    apply(){}
}


class KeyframeAnimation extends Animation {

    constructor(scene, keyframeAnimation) {
        super(scene);
        this.keyframes =  keyframeAnimation.keyframes;
        this.id = keyframeAnimation.id;

        if(this.keyframes[0].instant > 0) {
            this.currentKeyframeIndex = -1;
            this.nextKeyframeIndex = 0;
        }
        else {
            this.currentKeyframeIndex = 0;
            this.nextKeyframeIndex = 1;
        }
    }

    getID() {
        return this.id;
    }

    apply() {
        this.scene.multMatrix(this.animationMartix);
    }


    update() {
        //get current time
        let currTimeStamp = performance.now();
        let currentTime = (currTimeStamp - this.scene.time0)*0.001;

        //determine the next and previous keyframe
        if(this.nextKeyframeIndex === this.keyframes.length) { //if animation has already ended
            let animationKeyframe = this.keyframes[this.keyframes.length - 1];
            this.animationMartix = getMatrix(animationKeyframe.transforms);
            return;
        }

        if(currentTime > this.keyframes[this.nextKeyframeIndex].instant) {
            this.currentKeyframeIndex++;
            this.nextKeyframeIndex++;
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
        let prevKeyFrameStartTime;
        let prevKeyFrame;
        if(this.currentKeyframeIndex === -1) {
            prevKeyFrame = null;
            prevKeyFrameStartTime = 0;
        }
        else {
            prevKeyFrame = this.keyframes[this.currentKeyframeIndex];
            prevKeyFrameStartTime = this.keyframes[this.currentKeyframeIndex].instant;
        }
        let nextKeyFrame = this.keyframes[this.nextKeyframeIndex];

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
        //apply new matrix
        this.animationMartix = lerpTransforms(transObj1, transObj2, ammountOfLerp);
    }
}