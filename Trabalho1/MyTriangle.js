/**
 * MyTriangle
 * @constructor
 * @param scene - Reference to MyScene object
 */
class MyTriangle extends CGFobject {
	constructor(scene, id, p1, p2, p3) {
	    super(scene);
		this.id = id;
		this.p1 = p1;
		this.p2 = p2;
		this.p3 = p3;

		this.initBuffers();
	}

	initBuffers() {
		this.vertices = [];
		this.indices = [];
		this.normals = [];
		this.texCoords = [];

        this.vertices.push(...this.p1, ...this.p2, ...this.p3);
        this.vertices.push(...this.p1, ...this.p2, ...this.p3);
        
		let v1 = subtractVector(this.p3, this.p1);
		let v2 = subtractVector(this.p2, this.p1);
		let normal1 = crossProduct(v1,v2);
		let normal2 = reverseVector(normal1);

		this.normals.push(...normal1, ...normal1, ...normal1);
		this.normals.push(...normal2, ...normal2, ...normal2);

        this.indices.push(0, 1, 2);
        this.indices.push(3, 5, 4);

		this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
	}
}
