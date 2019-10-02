/**
 * MyCylinder
 * @constructor
 * @param scene - Reference to MyScene object
 */
class MyCylinder extends CGFobject {
	constructor(scene, id, base, top, height, slices, stacks) {
	    super(scene);
		this.id = id;
		this.base = base;
		this.top = top;
		this.height = height;
		this.slices = slices;
		this.stacks = stacks;

		this.initBuffers();
	}

	initBuffers() {
		this.vertices = [];
		this.indices = [];
		this.normals = [];
		this.texCoords = [];

        let heightInterval = this.height/this.stacks;
        let angleStep = 2*Math.PI/this.slices;

		for(let i = 0, currHeight = 0; i < this.stacks; i++, currHeight += heightInterval) {
			let currRadius = i*(this.base-this.top)/this.slices;
            for(let j = 0, currAngle = 0; j <= this.slices; j++, currAngle += angleStep) {
                this.vertices.push(currRadius*Math.cos(currAngle), currRadius*Math.sin(currAngle), currHeight);
                this.normals.push(currRadius*Math.cos(currAngle), currRadius*Math.sin(currAngle), this.height*(this.base-this.top));
            }
		}
		
		for(let i = 0; i < this.stacks-1; ++i) {
			for(let j = 0; j < this.slices; j++) {
				this.indices.push(i*(this.slices+1)+j, i*(this.slices+1)+j+1, (i+1)*(this.slices+1)+j);
                this.indices.push(i*(this.slices+1)+j+1, (i+1)*(this.slices+1)+j+1, (i+1)*(this.slices+1)+j);
			}
		}
		
		this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
	}
}
