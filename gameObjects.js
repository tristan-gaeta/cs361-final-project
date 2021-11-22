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

    static SLING_SHOT_LENGTH = 150

    static projectile(x, y) {
        let txt = Matter.Common.choose(["images/disguised-face_1f978.png", "images/face-with-head-bandage_1f915.png", "images/face-with-medical-mask_1f637.png", "images/face-with-raised-eyebrow_1f928.png"])
        let body = Matter.Bodies.circle(x, y, 32, {
            render: { sprite: { texture: txt, xScale: 64 / 130, yScale: 64 / 130 } },
            restitution: 0.8,
            collisionFilter: GameObjects._PRE_SHOT_COLLISION_FILTER,
            label: "Projectile",
            powerActivated: false,
            launched: false,
            activatePower: undefined,
            sleepThreshold: 3000/16.666
        });
            
        return body
    }

    static mouseConstraint(game){
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