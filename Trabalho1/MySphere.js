/**
 * MySphere
 * @constructor
 * @param scene - Reference to MyScene object
 */
class MySphere extends CGFobject {
	constructor(scene, id, radius, slices, stacks) {
	    super(scene);
		this.id = id;
		this.radius = radius;
		this.slices = slices;
		this.stacks = stacks;
		this.type = "sphere";

		this.initBuffers();
	}

	initBuffers() {
		this.vertices = [];
		this.indices = [];
		this.normals = [];
		this.texCoords = [];

		//Angle variation between slices
		let sliceStep = 2 * Math.PI / this.slices;
		//Angle variation between stacks
		let stackStep = Math.PI / (2*this.stacks);

		for(let i = 0, stackAngle = Math.PI/2; i <= 2*this.stacks; i++, stackAngle -= stackStep)
		{
			for(let j = 0, sectorAngle = 0; j <= this.slices; j++, sectorAngle += sliceStep)
			{
				this.vertices.push(this.radius*Math.cos(stackAngle) * Math.cos(sectorAngle), this.radius*Math.cos(stackAngle) * Math.sin(sectorAngle), this.radius*Math.sin(stackAngle));
				let normal = normalizeVector(Math.cos(stackAngle) * Math.cos(sectorAngle), Math.cos(stackAngle) * Math.sin(sectorAngle), Math.sin(stackAngle));
				this.normals.push(...normal);
				this.texCoords.push(j/this.slices, 1-i/(2*this.stacks));
			}
		}

		for(let i = 0; i < 2*this.stacks; ++i)
		{
			for(let j = 0; j < this.slices; j++)
			{
				if(i > 0)
				{
					this.indices.push(i * (this.slices + 1) + 1 + j,          			//  [x] [ ]
									  i * (this.slices + 1) + j,                 		//
									  i * (this.slices + 1) + this.slices + 1 + j);		//  [x] [x]
				}
				
				if(i < 2*this.stacks-1)
				{
					this.indices.push(i * (this.slices + 1) + this.slices + j + 2,		//	[x] [x]
					 				  i * (this.slices + 1) + j + 1,					//
					 				  i * (this.slices + 1) + this.slices + j + 1);		//	[ ] [x]
				}
			}
		}
		
		this.primitiveType = this.scene.gl.TRIANGLES;
        this.initGLBuffers();
	}
}
