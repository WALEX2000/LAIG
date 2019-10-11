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
		let normal2 = crossProduct(v1,v2);
		let normal1 = reverseVector(normal2);

		this.normals.push(...normal1, ...normal1, ...normal1);
		this.normals.push(...normal2, ...normal2, ...normal2);

		let a = Math.sqrt(Math.pow(this.p2[0]-this.p1[0], 2) + Math.pow(this.p2[1]-this.p1[1], 2) + Math.pow(this.p2[2]-this.p1[2], 2));
		let b = Math.sqrt(Math.pow(this.p2[0]-this.p3[0], 2) + Math.pow(this.p2[1]-this.p3[1], 2) + Math.pow(this.p2[2]-this.p3[2], 2));
		let c = Math.sqrt(Math.pow(this.p1[0]-this.p3[0], 2) + Math.pow(this.p1[1]-this.p3[1], 2) + Math.pow(this.p1[2]-this.p3[2], 2));
		
		let cosine = ((a*a) - (b*b) + (c*c)) / (2*a*c);
		let sine = Math.sqrt(1-cosine*cosine);

		let len = Math.max(a, c*cosine, c*sine);
		this.texCoords.push(
			0, 0,
			a/len, 0,
			c*cosine/len, c*sine/len,
			0, 0,
			a/len, 0,
			c*cosine/len, c*sine/len,
		);

        this.indices.push(0, 1, 2);
        this.indices.push(3, 5, 4);
        
		this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
	}
}
