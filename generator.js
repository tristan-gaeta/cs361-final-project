// const { Composite } = require("matter-js");
// const GameObjects = require("gameObjects");

class Generator {

    static SEED = 1;
    
    static WIDTH_RATIO = 2; //The unit width of the game-world, render bounds, and display canvas

    static HEIGHT_RATIO = 1; //The unit height of the game-world, render bounds, and display canvas

    static RENDER_SCALE = 960 * 2; //The dimension scale for the render bounds

    static WORLD_SCALE = 960 * 2; //The dimension scale for the game-world

    static FLOOR_HEIGHT = Generator.HEIGHT_RATIO * Generator.WORLD_SCALE - 2 * GameObjects.BLOCK_SIZE;

    constructor() {
            this.skeleton = Matter.Composite.create();
            this.world = Matter.Composite.create();
            this.ground = Matter.Bodies.rectangle(Generator.WIDTH_RATIO * Generator.WORLD_SCALE / 2, Generator.FLOOR_HEIGHT + 250, Generator.WIDTH_RATIO * Generator.WORLD_SCALE, 500, { isStatic: true, label: "Ground", friction: 1, render: { opacity: 0.5 } });
            this.origin = { "x": 0, "y": 0 };
            this.ref = { "x": 500, "y": Generator.FLOOR_HEIGHT };
        } //WIDTH_RATIO * WORLD_SCALE * 0.5


    getSkeleton(){
        Matter.Composite.add(this.skeleton, [this.ground]);
        return this.skeleton;
    }
        
    //creates world - test dummy at the moment
    getWorld() {

        var box = this.arch();

        this.translateGround(box);

        Matter.Composite.add(this.world, box);

        console.dir(this.world);

        return this.world;
    }

    //translate an input composite to the ground reference
    translateGround(composite) {

        let bound = Matter.Composite.bounds(composite).max;
        bound.x = 0;

        let spawn = Matter.Vector.sub(this.ref, bound);

        Matter.Composite.translate(composite, spawn, true);

        return composite;
    }


    arch(x = 0, y = 0) {
        let texture = Matter.Common.choose(["Glass/", "Metal/", "Stone/", "Wood/"]);
        let comp = Matter.Composite.create();
        let stack = Matter.Composites.stack(0, GameObjects.BLOCK_SIZE, 2, 2, 3 * GameObjects.BLOCK_SIZE, 0, (x, y) => {
            return GameObjects.rect(x, y, 1, 2, `images/Material Texture/${texture}`);
        })
        Matter.Composite.move(stack, Matter.Composite.allBodies(stack), comp);
        Matter.Composite.add(comp, GameObjects.rect(5 * GameObjects.BLOCK_SIZE / 2, GameObjects.BLOCK_SIZE / 2, 5, 1, `images/Material Texture/${texture}`))
        Matter.Composite.translate(comp, { x: x, y: y })
        return comp
    }



}