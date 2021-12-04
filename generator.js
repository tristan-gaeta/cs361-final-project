// const { Composite } = require("matter-js");
// const GameObjects = require("gameObjects");

class Generator {

    SEED;

    static WIDTH_RATIO = 2; //The unit width of the game-world, render bounds, and display canvas

    static HEIGHT_RATIO = 1; //The unit height of the game-world, render bounds, and display canvas

    static RENDER_SCALE = 960 * 2; //The dimension scale for the render bounds

    static WORLD_SCALE = 960 * 2; //The dimension scale for the game-world

    static FLOOR_HEIGHT = Generator.HEIGHT_RATIO * Generator.WORLD_SCALE - 2 * GameObjects.BLOCK_SIZE;

    static STRUCT_SIZE = GameObjects.BLOCK_SIZE * 5;

    static arch(x = 0, y = 0) {
        let texture = Matter.Common.choose(["Glass/", "Metal/", "Stone/", "Wood/"]);
        let comp = Matter.Composite.create({ level: "bottom", label: "Structure" , width: 1, height: 1 });
        let stack = Matter.Composites.stack(0, GameObjects.BLOCK_SIZE, 2, 2, 3 * GameObjects.BLOCK_SIZE, 0, (x, y) => {
            return GameObjects.rect(x, y, 1, 2, `images/Material Texture/${texture}`);
        });
        Matter.Composite.move(stack, Matter.Composite.allBodies(stack), comp);
        Matter.Composite.add(comp, GameObjects.rect(5 * GameObjects.BLOCK_SIZE / 2, GameObjects.BLOCK_SIZE / 2, 5, 1, `images/Material Texture/${texture}`))
        Matter.Composite.translate(comp, { x: x, y: y })
        return comp
    }

    static doubleArch(x = 0, y = 0) {
        let texture = Matter.Common.choose(["Glass/", "Metal/", "Stone/", "Wood/"]);
        let comp = Matter.Composite.create({ level: "bottom", label: "Structure" , width: 1, height: 1 });
        
        let top = Matter.Composites.stack(0, 0, 1, 1, GameObjects.BLOCK_SIZE, 0, (x, y) => {
            return GameObjects.rect(x, y, 5, 2, `images/Material Texture/${texture}`);
        });
        let pillars = Matter.Composites.stack(0, 2 * GameObjects.BLOCK_SIZE, 3, 1, GameObjects.BLOCK_SIZE, 0, (x, y) => {
            return GameObjects.rect(x, y, 1, 3, `images/Material Texture/${texture}`);
        });
        Matter.Composite.move(top, Matter.Composite.allBodies(top), comp);
        Matter.Composite.move(pillars, Matter.Composite.allBodies(pillars), comp);
        Matter.Composite.translate(comp, { x: x, y: y })
        return comp
    }

    static box(x = 0, y = 0) {
        let texture = Matter.Common.choose(["Glass/", "Metal/", "Stone/", "Wood/"]);
        let comp = Matter.Composite.create({ level: "bottom", label: "Structure" , width: 1, height: 1 });
        let vertical = Matter.Composites.stack(0, GameObjects.BLOCK_SIZE, 2, 1, 3 * GameObjects.BLOCK_SIZE, 0, (x, y) => {
            return GameObjects.rect(x, y, 1, 3, `images/Material Texture/${texture}`);
        });
        let horizontal = Matter.Composites.stack(0, 0, 1, 2, 0, 3 * GameObjects.BLOCK_SIZE, (x, y) => {
            return GameObjects.rect(x, y, 5, 1, `images/Material Texture/${texture}`);
        }); //5 * GameObjects.BLOCK_SIZE / 2
        Matter.Composite.move(vertical, Matter.Composite.allBodies(vertical), comp);
        Matter.Composite.move(horizontal, Matter.Composite.allBodies(horizontal), comp);
        Matter.Composite.translate(comp, { x: x, y: y })
        return comp
    }

    static dualpillars(x = 0, y = 0) {
        let texture = Matter.Common.choose(["Glass/", "Metal/", "Stone/", "Wood/"]);
        let comp = Matter.Composite.create({ level: "bottom", label: "Structure" , width: 1, height: 1 });
        let vertical = Matter.Composites.stack(GameObjects.BLOCK_SIZE, 0, 2, 1, GameObjects.BLOCK_SIZE, 0, (x, y) => {
            return GameObjects.rect(x, y, 1, 5, `images/Material Texture/${texture}`);
        });
        Matter.Composite.move(vertical, Matter.Composite.allBodies(vertical), comp);
        Matter.Composite.translate(comp, { x: x, y: y })
        return comp
    }

    static tripillars(x = 0, y = 0) { 
        let texture = Matter.Common.choose(["Glass/", "Metal/", "Stone/", "Wood/"]);
        let comp = Matter.Composite.create({ level: "bottom", label: "Structure" , width: 1, height: 1 });
        let vertical = Matter.Composites.stack(0, 0, 3, 1, GameObjects.BLOCK_SIZE, 0, (x, y) => {
            return GameObjects.rect(x, y, 1, 5, `images/Material Texture/${texture}`);
        });
        Matter.Composite.move(vertical, Matter.Composite.allBodies(vertical), comp);
        Matter.Composite.translate(comp, { x: x, y: y })
        return comp
    }

    constructor() {
            this.seed = 1;
        } 


    //creates world - test dummy at the moment
    getWorld() {
        var world = Matter.Composite.create();


        var dpillars = Generator.dualpillars();
        var arch = Generator.arch(0, -Generator.STRUCT_SIZE);
        var tpillars = Generator.tripillars(Generator.STRUCT_SIZE);
        var box = Generator.box(Generator.STRUCT_SIZE, -Generator.STRUCT_SIZE);
        var darch = Generator.doubleArch(Generator.STRUCT_SIZE, -2 * Generator.STRUCT_SIZE);


        Matter.Composite.add(world, [arch, dpillars, tpillars, box, darch]);

        this.translateGround(world);


        console.dir(world);

        return world;
    }

    //translate an input composite to the ground reference
    translateGround(composite) {
        let ref = { "x": Generator.WIDTH_RATIO * Generator.WORLD_SCALE * 0.5, "y": Generator.FLOOR_HEIGHT };

        let bound = Matter.Composite.bounds(composite).max;
        bound.x = 0;

        let spawn = Matter.Vector.sub(ref, bound);

        Matter.Composite.translate(composite, spawn, true);

        return composite;
    }






}