class Generator {

    static WIDTH_RATIO = 2; //The unit width of the game-world, render bounds, and display canvas

    static HEIGHT_RATIO = 1; //The unit height of the game-world, render bounds, and display canvas

    static RENDER_SCALE = 30 * GameObjects.BLOCK_SIZE; //The dimension scale for the render bounds

    static WORLD_SCALE = 30 * GameObjects.BLOCK_SIZE; //The dimension scale for the game-world

    static FLOOR_HEIGHT = Generator.HEIGHT_RATIO * Generator.WORLD_SCALE - 2 * GameObjects.BLOCK_SIZE;

    static STRUCT_SIZE = GameObjects.BLOCK_SIZE * 5;

    static arch(x = 0, y = 0, texture = "glass") {
        let comp = Matter.Composite.create({ level: "bottom", label: "Structure", width: 1, height: 1 });
        let stack = Matter.Composites.stack(0, GameObjects.BLOCK_SIZE, 2, 2, 3 * GameObjects.BLOCK_SIZE, 0, (x, y) => {
            return GameObjects.rect(x, y, 1, 2, texture);
        });
        Matter.Composite.move(stack, Matter.Composite.allBodies(stack), comp);
        Matter.Composite.add(comp, GameObjects.rect(5 * GameObjects.BLOCK_SIZE / 2, GameObjects.BLOCK_SIZE / 2, 5, 1, texture))
        Matter.Composite.translate(comp, { x: x, y: y })
        return comp
    }

    static doubleArch(x = 0, y = 0, texture = "glass") {
        let comp = Matter.Composite.create({ level: "bottom", label: "Structure", width: 1, height: 1 });

        let top = Matter.Composites.stack(0, 0, 1, 1, GameObjects.BLOCK_SIZE, 0, (x, y) => {
            return GameObjects.rect(x, y, 5, 2, texture);
        });
        let pillars = Matter.Composites.stack(0, 2 * GameObjects.BLOCK_SIZE, 3, 1, GameObjects.BLOCK_SIZE, 0, (x, y) => {
            return GameObjects.rect(x, y, 1, 3, texture);
        });
        Matter.Composite.move(top, Matter.Composite.allBodies(top), comp);
        Matter.Composite.move(pillars, Matter.Composite.allBodies(pillars), comp);
        Matter.Composite.translate(comp, { x: x, y: y })
        return comp
    }

    static box(x = 0, y = 0, texture = "glass") {
        let comp = Matter.Composite.create({ level: "bottom", label: "Structure", width: 1, height: 1 });
        let vertical = Matter.Composites.stack(0, GameObjects.BLOCK_SIZE, 2, 1, 3 * GameObjects.BLOCK_SIZE, 0, (x, y) => {
            return GameObjects.rect(x, y, 1, 3, texture);
        });
        let horizontal = Matter.Composites.stack(0, 0, 1, 2, 0, 3 * GameObjects.BLOCK_SIZE, (x, y) => {
            return GameObjects.rect(x, y, 5, 1, texture);
        }); //5 * GameObjects.BLOCK_SIZE / 2
        Matter.Composite.move(vertical, Matter.Composite.allBodies(vertical), comp);
        Matter.Composite.move(horizontal, Matter.Composite.allBodies(horizontal), comp);
        Matter.Composite.translate(comp, { x: x, y: y })
        return comp
    }

    static dualpillars(x = 0, y = 0, texture = "glass") {
        let comp = Matter.Composite.create({ level: "bottom", label: "Structure", width: 1, height: 1 });
        let vertical = Matter.Composites.stack(GameObjects.BLOCK_SIZE, 0, 2, 1, GameObjects.BLOCK_SIZE, 0, (x, y) => {
            return GameObjects.rect(x, y, 1, 5, texture);
        });
        Matter.Composite.move(vertical, Matter.Composite.allBodies(vertical), comp);
        Matter.Composite.translate(comp, { x: x, y: y })
        return comp
    }

    static tripillars(x = 0, y = 0, texture = "glass") {
        let comp = Matter.Composite.create({ level: "bottom", label: "Structure", width: 1, height: 1 });
        let vertical = Matter.Composites.stack(0, 0, 3, 1, GameObjects.BLOCK_SIZE, 0, (x, y) => {
            return GameObjects.rect(x, y, 1, 5, texture);
        });
        Matter.Composite.move(vertical, Matter.Composite.allBodies(vertical), comp);
        Matter.Composite.translate(comp, { x: x, y: y })
        return comp
    }

    static stackStructures(xx, yy, layout) {
        let stack = Matter.Composite.create(),
            x = xx,
            y = yy

        for (let column = 0; column < layout.length; column++) {
            for (let row = 0; row < layout[row].length; row++) {
                if (layout[column][row]) {
                    console.log(layout[column][row]);
                    let comp = layout[column][row][0](x, y,layout[column][row][1]);

                    if (comp) {
                        Matter.Composite.add(stack, comp);
                    }
                }
                y += Generator.STRUCT_SIZE;
            }

            x += Generator.STRUCT_SIZE;
            y = yy;
        }
        return stack;
    }

    constructor() {
        this._seed = 20;
        this.level = 0;
    }

    #next() {
        this._seed = (this._seed * 9301 + 49297) % 233280;
        return this._seed / 233280;
    }

    #nextHeight(level) {
        let relProbs = [0.3203721498 * (0.9732828871 ** level),
        0.4558289778 * (0.9671918346 ** level),
        0.8129098918 * (0.9315958228 ** level) + 0.2,
        1.0220777158 * (0.9648486413 ** level) + 0.25,
        1.4297765062 * (0.9465508207 ** level) + 0.5]
        for (let i = 0; i < relProbs.length; i++) {
            if (this.#next() < relProbs[i]) {
                return i;
            }
        }
        return 5;
    }

    nextLevel() {
        let struct = [];
        for (let i = 0; i < 6; i++) {
            let col = [];
            let rows = this.#nextHeight(this.level);
            for (let j = 0; j < 5 - rows; j++) {
                col.push(undefined);
            }
            for (let j = 0; j < rows; j++) {
                let structs = [Generator.box, Generator.arch, Generator.doubleArch, Generator.doubleArch, Generator.tripillars];
                let rand1 = Math.floor(this.#next() * structs.length);

                let textures = ["glass","wood","stone","metal"];
                let rand2 = Math.floor(this.#next() * textures.length);
                col.push([structs[rand1],textures[rand2]]);
            }
            struct.push(col);
        }
        let comp = Generator.stackStructures(0, 0, struct, Generator.box);
        let diff = { x: Generator.WIDTH_RATIO * Generator.WORLD_SCALE / 2 - Generator.STRUCT_SIZE, y: Generator.FLOOR_HEIGHT - 5 * Generator.STRUCT_SIZE }
        Matter.Composite.translate(comp, diff, true);

        this.level++;
        return comp;
    }

}