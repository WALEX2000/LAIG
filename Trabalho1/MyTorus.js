/**
 * MyTorus
 * @constructor
 * @param scene - Reference to MyScene object
 */
class MyTorus extends CGFobject {
	constructor(scene, id, inner, outter, slices, loops) {
	    super(scene);
		this.id = id;
		this.inner = inner;
		this.outter = outter;
		this.slices = slices;
		this.loops = loops;

		this.initBuffers();
	}

	initBuffers() {
		this.vertices = [];
		this.indices = [];
		this.normals = [];
		this.texCoords = [];

		let outterDiff = 2*Math.PI/this.slices;
		let innerDiff = 2*Math.PI/this.loops;

		for(let i = 0, outterAngle = 0; i <= this.slices; i++, outterAngle += outterDiff) {
			for (let j = 0, innerAngle = 0; j <= this.loops; j++, innerAngle += innerDiff) {
				this.vertices.push((this.inner+this.outter*Math.cos(outterAngle))*Math.sin(innerAngle),
								   (this.inner+this.outter*Math.cos(outterAngle))*Math.cos(innerAngle),
								   this.outter*Math.sin(outterAngle));
				this.normals.push(Math.cos(outterAngle)*Math.sin(innerAngle),
								  Math.cos(outterAngle)*Math.cos(innerAngle),
								  Math.sin(outterAngle));
			}
		}

		for (let i = 0; i < this.slices; i++) {
			for (let j = 0; j < this.loops; j++) {
				this.indices.push(i*(this.slices+1)+j+1, i*(this.slices+1)+j, (i+1)*(this.slices+1)+j);
				this.indices.push((i+1)*(this.slices+1)+j+1, i*(this.slices+1)+j+1, (i+1)*(this.slices+1)+j);
			}
		}
		
		this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
	}
}
