/**
 * MyTorus
 * @constructor
 * @param scene - Reference to MyScene object
 */
class MyTorus extends CGFobject {
	constructor(scene, id, inner, outer, slices, loops) {
	    super(scene);
		this.id = id;
		this.inner = inner;
		this.outer = outer;
		this.slices = slices;
		this.loops = loops;
		this.type = "torus";

		this.initBuffers();
	}

	initBuffers() {
		this.vertices = [];
		this.indices = [];
		this.normals = [];
		this.texCoords = [];

		let outerDiff = 2*Math.PI/this.slices;
		let innerDiff = 2*Math.PI/this.loops;

		for(let i = 0, outerAngle = 0; i <= this.slices; i++, outerAngle += outerDiff) {
			for (let j = 0, innerAngle = 0; j <= this.loops; j++, innerAngle += innerDiff) {
				this.vertices.push((this.outer+this.inner*Math.cos(outerAngle))*Math.sin(innerAngle),
								   (this.outer+this.inner*Math.cos(outerAngle))*Math.cos(innerAngle),
								   this.inner*Math.sin(outerAngle));
				this.normals.push(Math.cos(outerAngle)*Math.sin(innerAngle),
								  Math.cos(outerAngle)*Math.cos(innerAngle),
								  Math.sin(outerAngle));
				this.texCoords.push(i/this.slices, j/this.loops);
			}
		}

		for (let i = 0; i < this.slices; i++) {
			for (let j = 0; j < this.loops; j++) {
				this.indices.push(i*(this.loops+1)+j+1, i*(this.loops+1)+j, (i+1)*(this.loops+1)+j);
				this.indices.push((i+1)*(this.loops+1)+j+1, i*(this.loops+1)+j+1, (i+1)*(this.loops+1)+j);
			}
		}
		
		this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
	}
}
