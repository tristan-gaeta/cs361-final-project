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
        this.engine = Matter.Engine.create({ enableSleeping: true, velocityIterations: 10, positionIterations: 10 });

        this.renderer = this.createRenderer();

        this.generator = new Generator();

        this.mouseConstraint = GameObjects.mouseConstraint(this);

        this.slingShot = GameObjects.slingShot(this, Generator.WIDTH_RATIO * Generator.WORLD_SCALE / 8, Generator.HEIGHT_RATIO * 3 * Generator.WORLD_SCALE / 4);

        this.leftWall = Matter.Bodies.rectangle(-2 * GameObjects.BLOCK_SIZE, Generator.HEIGHT_RATIO * Generator.WORLD_SCALE / 2, 4 * GameObjects.BLOCK_SIZE, 2 * Generator.HEIGHT_RATIO * Generator.WORLD_SCALE,
            { isStatic: true, label: "Wall", friction: 1, render: { visible: false }, collisionFilter: { 'group': 1, 'category': 0b0010, 'mask': 4294967293 } });

        this.rightWall = Matter.Bodies.rectangle(Generator.WIDTH_RATIO * Generator.WORLD_SCALE + 2 * GameObjects.BLOCK_SIZE, Generator.HEIGHT_RATIO * Generator.WORLD_SCALE / 2, 4 * GameObjects.BLOCK_SIZE, 2 * Generator.HEIGHT_RATIO * Generator.WORLD_SCALE,
            { isStatic: true, label: "Wall", friction: 1, render: { visible: false }, collisionFilter: { 'group': 1, 'category': 0b0010, 'mask': 4294967293 } });

        this.ground = Matter.Bodies.rectangle(Generator.WIDTH_RATIO * Generator.WORLD_SCALE / 2, Generator.FLOOR_HEIGHT + 2 * GameObjects.BLOCK_SIZE, Generator.WIDTH_RATIO * Generator.WORLD_SCALE, 4 * GameObjects.BLOCK_SIZE,
            { isStatic: true, label: "Ground", friction: 1, render: { sprite: { texture: "images/Backgrounds/Grass_Long.png", xScale: GameObjects.BLOCK_SIZE / 32, yScale: GameObjects.BLOCK_SIZE / 32 } } });

        this.streaks = 0;

        this.difficulty = 0;

        //We save the previous velocity for every body within the game-world,
        //and remove all projectiles on sleep.
        Matter.Events.on(this.engine, 'beforeUpdate', (event) => {
            let bodies = Matter.Composite.allBodies(event.source.world)
            for (let body of bodies) {
                for (let part of body.parts) {
                    if (part.label == "Projectile" && part.isSleeping) {
                        new Audio(`sounds/sfx-pop${Matter.Common.choose(["", 3, 4, 5, 6])}.mp3`).play()
                        Matter.Composite.remove(this.engine.world, part, true)
                    } else {
                        part.velocityPrev = part.velocity;
                    }
                }
            }
        })

        Matter.Events.on(this.engine, "afterUpdate", (event) => {
            let bodies = Matter.Composite.allBodies(event.source.world)
            let levelOver = true;
            for (let body of bodies) {
                if (body.parts.length > 1) {
                    for (let part of body.parts) {
                        part.angle = body.angle;
                    }
                }
                if (body.label == "Block") {
                    levelOver = false;
                    if (body.shockAbsorbed > body.hp) {
                        new Audio(`sounds/sfx-pop${Matter.Common.choose(["", 3, 4, 5, 6])}.mp3`).play()
                        Matter.Composite.remove(event.source.world, body, true)
                        game.updateDamage(body.hp / 1000);
                    }
                } else if (body.label == "Projectile") {
                    if (body.bounds.min.y > Generator.HEIGHT_RATIO * Generator.WORLD_SCALE || body.bounds.min.x > Generator.WIDTH_RATIO * Generator.WORLD_SCALE || body.bounds.max.x < 0) {
                        Matter.Composite.remove(event.source.world, body, true)
                    }
                }
            }

            if (levelOver) {
                this.skipRound();
            }
        })

        //We update the 'shockAbsorbed' by each body on impact. This value is calculated 
        //pair-wise by the difference in linear momentum of the two objects before impact.
        Matter.Events.on(this.engine, "collisionStart", (event) => {
            for (let pair of event.pairs) {
                let momentumA = Matter.Vector.mult(pair.bodyA.parent.velocityPrev, pair.bodyA.isStatic ? 0 : pair.bodyA.mass);
                let momentumB = Matter.Vector.mult(pair.bodyB.parent.velocityPrev, pair.bodyB.isStatic ? 0 : pair.bodyB.mass);
                let mag = Matter.Vector.magnitude(Matter.Vector.sub(momentumA, momentumB));
                if (pair.bodyA.parent.label != "Projectile" && pair.bodyB.parent.label != "Projectile") {
                    if (pair.bodyA.parent.label == "Ground" || pair.bodyB.parent.label == "Ground") {
                        mag *= 15;
                    }
                }

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


        Matter.Composite.add(this.engine.world, [this.generator.nextLevel(), this.ground, this.leftWall, this.rightWall, this.mouseConstraint, this.slingShot])
        Matter.Render.run(this.renderer);
        Matter.Runner.run(this.engine);
    }

    skipRound() {
        Matter.Composite.remove(this.engine.world, this.engine.world.composites, true);
        let comp = this.generator.nextLevel();
        Matter.Composite.add(this.engine.world, comp);
        this.ground.render.sprite.texture = comp.ground;
        this.renderer.options.background = comp.background;
        this.clearDamage();
    }

    updateStreak(s) {
        let streak = document.getElementById("streak");
        streak.innerHTML = s;
    }

    updateScore(s) {
        let score = document.getElementById("score");
        let temp = Number(score.innerHTML);
        score.innerHTML = s + temp;
    }

    updateDamage(s) {
        let damage = document.getElementById("damage");
        let temp = Number(damage.innerHTML);
        damage.innerHTML = s + temp;
        this.updateScore(s);
    }

    clearDamage() {
        let damage = document.getElementById("damage");
        damage.innerHTML = 0;
    }


    /**
     * @description this method creates a renderer object and maximizes the canvas
     * size.
     * 
     * @returns a matter.js render object
     */
    createRenderer() {

        let render = Matter.Render.create({
            element: document.body,
            engine: this.engine,
            bounds: Matter.Bounds.create([{ x: 0, y: 0 }, { x: Generator.WIDTH_RATIO * Generator.RENDER_SCALE, y: 0 }, { x: Generator.WIDTH_RATIO * Generator.RENDER_SCALE, y: Generator.HEIGHT_RATIO * Generator.RENDER_SCALE }, { x: 0, y: Generator.HEIGHT_RATIO * Generator.RENDER_SCALE }]),
            hasBounds: true,
            options: {
                background: "images/Backgrounds/Forest-Background.png",
                //showDebug: true,
                showSleeping: false,
                width: Generator.WIDTH_RATIO * Generator.RENDER_SCALE,
                height: Generator.HEIGHT_RATIO * Generator.RENDER_SCALE,
                wireframes: false,
                wireframeBackground: false,
            },
        });
        return render;
    }
}