/**
 * @class Game 
 * @author Tristan Gaeta
 * 
 * @description Instances of a Game object contain a matter.js physics engine and renderer, which are run when
 * the game object is created. All of the items in a game's engine-world are created through static methods 
 * within the GameObjects class.
 */
class Game {

    /**
     * @constructor creates new instances of a Game object. The display canvas for
     * this game object is appended to the current document-body and both the engine 
     * and renderer are run on creation.
     */
    constructor() {
        this.engine = Matter.Engine.create({ enableSleeping: true });

        this.renderer = this.createRenderer();

        this.generator = new Generator();

        this.mouseConstraint = GameObjects.mouseConstraint(this);

        this.slingShot = GameObjects.slingShot(this, Generator.WIDTH_RATIO * Generator.WORLD_SCALE / 8, Generator.HEIGHT_RATIO * Generator.WORLD_SCALE / 3);

        //We save the previous velocity for every body within the game-world,
        //and remove all projectiles on sleep.
        Matter.Events.on(this.engine, 'beforeUpdate', (event) => {
            let bodies = Matter.Composite.allBodies(event.source.world)
            for (let body of bodies) {
                for (let part of body.parts) {
                    if (part.label == "Projectile" && part.isSleeping) {
                        Matter.Composite.remove(this.engine.world, part, true)
                    } else {
                        part.velocityPrev = part.velocity;
                    }
                }
            }
        })

        Matter.Events.on(this.engine, "afterUpdate", (event) => {
            let bodies = Matter.Composite.allBodies(event.source.world)
            for (let body of bodies) {
                if (body.parts.length > 1) {
                    for (let part of body.parts) {
                        part.angle = body.angle;
                    }
                }
                if (body.label == "Block") {
                    if (body.shockAbsorbed > 500) {
                        Matter.Composite.remove(event.source.world, body, true)
                    }
                }
            }
        })

        //We update the 'shockAbsorbed' by each body on impact. This value is calculated 
        //pair-wise by the difference in linear momentum of the two objects before impact.
        Matter.Events.on(this.engine, "collisionStart", (event) => {
            for (let pair of event.pairs) {
                let momentumA = Matter.Vector.mult(pair.bodyA.velocityPrev, pair.bodyA.isStatic ? 0 : pair.bodyA.mass);
                let momentumB = Matter.Vector.mult(pair.bodyB.velocityPrev, pair.bodyB.isStatic ? 0 : pair.bodyB.mass);
                let mag = Matter.Vector.magnitude(Matter.Vector.sub(momentumA, momentumB));
                pair.bodyA.shockAbsorbed = pair.bodyA.shockAbsorbed || 0;
                pair.bodyA.shockAbsorbed += Math.floor(mag);
                pair.bodyA.parent.shockAbsorbed = pair.bodyA.parent.shockAbsorbed || 0;
                pair.bodyA.parent.shockAbsorbed += pair.bodyA.shockAbsorbed;

                pair.bodyB.shockAbsorbed = pair.bodyB.shockAbsorbed || 0;
                pair.bodyB.shockAbsorbed += Math.floor(mag);
                pair.bodyB.parent.shockAbsorbed = pair.bodyB.parent.shockAbsorbed || 0;
                pair.bodyB.parent.shockAbsorbed += pair.bodyB.shockAbsorbed;
            }
        })


        Matter.Composite.add(this.engine.world, [this.generator.getSkeleton(), this.generator.getWorld(), this.mouseConstraint, this.slingShot, this.slingShot.bodyB])
        Matter.Render.run(this.renderer);
        Matter.Runner.run(this.engine);
    }

    /**
     * @description this method creates a renderer object and maximizes the canvas
     * size.
     * 
     * @returns a matter.js render object
     */
    createRenderer() {
        let pageWidth = document.body.clientWidth;
        let pageHeight = window.innerHeight - 16;
        if (pageWidth / pageHeight > Generator.WIDTH_RATIO / Generator.HEIGHT_RATIO) {
            pageWidth = Generator.WIDTH_RATIO * pageHeight / Generator.HEIGHT_RATIO
        } else {
            pageHeight = Generator.HEIGHT_RATIO * pageWidth / Generator.WIDTH_RATIO
        }

        let render = Matter.Render.create({
            element: document.body,
            engine: this.engine,
            bounds: Matter.Bounds.create([{ x: 0, y: 0 }, { x: Generator.WIDTH_RATIO * Generator.RENDER_SCALE, y: 0 }, { x: Generator.WIDTH_RATIO * Generator.RENDER_SCALE, y: Generator.HEIGHT_RATIO * Generator.RENDER_SCALE }, { x: 0, y: Generator.HEIGHT_RATIO * Generator.RENDER_SCALE }]),
            hasBounds: true,
            options: {
                background: "images/background.png",
                showDebug: true,
                showSleeping: false,
                width: pageWidth,
                height: pageHeight,
                wireframes: false,
                wireframeBackground: false,
            },
        });
        return render;
    }
}