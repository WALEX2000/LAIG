/**
 * MyCylinder2
 * @constructor
 * @param scene - Reference to MyScene object
 */

class MyCylinder2 extends CGFobject {
	constructor(scene, id, base, top, height, slices, stacks) {
	    super(scene);
		this.id = id;
		this.base = base;
		this.top = top;
		this.height = height;
		this.slices = slices;
		this.stacks = stacks;
		this.type = "cylinder2";

		this.makeSurface();
    }
    
    makeSurface() {
        let controlCoords1 =
        [
            [
                [-this.base, 0, 0, 1],
                [-this.base, this.base*4/3, 0, 1],
                [this.base, this.base*4/3, 0, 1],
                [this.base, 0, 0, 1]
            ],
            [
                [-this.top, 0, this.height, 1],
                [-this.top, this.top*4/3, this.height, 1],
                [this.top, this.top*4/3, this.height, 1],
                [this.top, 0, this.height, 1]
            ]
        ];

        let controlCoords2 =
        [
            [
                [this.base, 0, 0, 1],
                [this.base, -this.base*4/3, 0, 1],
                [-this.base, -this.base*4/3, 0, 1],
                [-this.base, 0, 0, 1]
            ],
            [
                [this.top, 0, this.height, 1],
                [this.top, -this.top*4/3, this.height, 1],
                [-this.top, -this.top*4/3, this.height, 1],
                [-this.top, 0, this.height, 1]
            ]
        ];
        
        this.texCoords=[];
        this.patch1 = new MyPatch(this.scene,this.id,2,4,this.slices/2,this.stacks,controlCoords1);
        this.patch2 = new MyPatch(this.scene,this.id,2,4,this.slices/2,this.stacks,controlCoords2);
    }

	display() {
        this.patch1.display();
        this.patch2.display();
    }
}
