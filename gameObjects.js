/***
 * @class GameObjects
 * @author Tristan Gaeta
 * 
 * @description The GameObjects class contains static methods for creating game objects.
 * 
 */
class GameObjects {
    static _PRE_SHOT_COLLISION_FILTER = { 'group': 2, 'category': 0b0000, 'mask': 0b0000 }

    static _POST_SHOT_COLLISION_FILTER = { 'group': 1, 'category': 0b0001, 'mask': -1 }

    static BLOCK_SIZE = 64;

    static SLING_SHOT_LENGTH = 2.5 * GameObjects.BLOCK_SIZE;

    static arch(x = 0, y = 0) {
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


    static rect(x, y, width, height, material) {
        let comp = Matter.Composites.stack(0, 0, width, height, 0, 0, (x, y, cols, rows) => {
            let texture = ""
            if (rows == 0) {
                texture += "t";
            }
            if (rows == height - 1) {
                texture += "b";
            }
            if (cols == 0) {
                texture += "l"
            }
            if (cols == width - 1) {
                texture += "r"
            }
            let render;
            if (texture == "") {
                render = { visible: false }
            } else {
                render = { sprite: { texture: material + texture + ".png", xScale: GameObjects.BLOCK_SIZE / 64, yScale: GameObjects.BLOCK_SIZE / 64 } }
            }
            return Matter.Bodies.rectangle(x, y, GameObjects.BLOCK_SIZE, GameObjects.BLOCK_SIZE, { render: render });
        })
        let body = Matter.Body.create({ parts: comp.bodies, isSleeping: true })
        Matter.Body.setPosition(body, { x: x, y: y })
        return body;
    }

    static projectile(x, y) {
        let txt = Matter.Common.choose(["images/disguised-face_1f978.png", "images/face-with-head-bandage_1f915.png", "images/face-with-medical-mask_1f637.png", "images/face-with-raised-eyebrow_1f928.png"])
        let body = Matter.Bodies.circle(x, y, GameObjects.BLOCK_SIZE / 2, {
            render: { sprite: { texture: txt, xScale: GameObjects.BLOCK_SIZE / 130, yScale: GameObjects.BLOCK_SIZE / 130 } },
            restitution: 0.8,
            collisionFilter: GameObjects._PRE_SHOT_COLLISION_FILTER,
            label: "Projectile",
            powerActivated: false,
            launched: false,
            activatePower: undefined,
            sleepThreshold: 3000 / 16.666
        });

        return body
    }

    static mouseConstraint(game) {
        let gameMouse = Matter.Mouse.create(game.renderer.canvas,);
        let mouseConstraint = Matter.MouseConstraint.create(game.engine, {
            mouse: gameMouse,
            collisionFilter: GameObjects._PRE_SHOT_COLLISION_FILTER,
            constraint: {
                stiffness: 1,
                render: {
                    visible: false
                }
            }
        });
        let scale = { x: Game.WIDTH_RATIO * Game.RENDER_SCALE / game.renderer.canvas.width, y: Game.HEIGHT_RATIO * Game.RENDER_SCALE / game.renderer.canvas.height }
        Matter.Mouse.setScale(mouseConstraint.mouse, scale)
        return mouseConstraint;
    }

    static slingShot(game, x, y) {
        let constraint = Matter.Constraint.create({
            label: "Sling Shot",
            pointA: { x: x, y: y },
            bodyB: GameObjects.projectile(x, y),
            length: 0,
            stiffness: 0.02,
            render: {
                type: "line",
                anchors: false,
            }
        })
        Matter.Events.on(game.mouseConstraint, "mouseup", () => {
            let dist = Matter.Vector.magnitude(Matter.Vector.sub(constraint.bodyB.position, constraint.pointA))
            if (dist > constraint.bodyB.circleRadius) {
                constraint.bodyB.launched = true;
                Matter.Body.setVelocity(constraint.bodyB, { x: 0, y: 0 })
            }
        })
        Matter.Events.on(game.engine, "afterUpdate", () => {
            //limit length
            let diff = Matter.Vector.sub(constraint.bodyB.position, constraint.pointA);
            let mag = Matter.Vector.magnitude(diff);
            if (mag > GameObjects.SLING_SHOT_LENGTH) {
                let offset = Matter.Vector.mult(diff, 1 - GameObjects.SLING_SHOT_LENGTH / mag);
                let newPos = Matter.Vector.sub(constraint.bodyB.position, offset);
                Matter.Body.setPosition(constraint.bodyB, newPos);
            }
            //check for launch
            if (constraint.bodyB.launched) {
                let dist = Matter.Vector.magnitude(Matter.Vector.sub(constraint.bodyB.position, constraint.pointA))
                let prevDist = Matter.Vector.magnitude(Matter.Vector.sub(constraint.bodyB.positionPrev, constraint.pointA))
                if (dist < constraint.bodyB.circleRadius && prevDist > constraint.bodyB.circleRadius) {
                    constraint.bodyB.collisionFilter = GameObjects._POST_SHOT_COLLISION_FILTER;
                    constraint.bodyB = GameObjects.projectile(constraint.pointA.x, constraint.pointA.y)
                    setTimeout(() => {
                        Matter.Composite.add(game.engine.world, constraint.bodyB)
                    }, 500);
                }
            }

        })
        return constraint
    }


}