/***
 * @class GameObjects
 * @author Tristan Gaeta
 * 
 * @description The GameObjects class contains static methods for creating game objects.
 * 
 */
class GameObjects {
    static _PRE_SHOT_COLLISION_FILTER = { 'group': 1, 'category': 0b0010, 'mask': 0b0000 }

    static _POST_SHOT_COLLISION_FILTER = { 'group': 0, 'category': 0b0010, 'mask': -1 }

    static BLOCK_SIZE = 64;

    static SLING_SHOT_LENGTH = 4 * GameObjects.BLOCK_SIZE;

    static projectile(x, y) {
        let txt = Matter.Common.choose(["images/balls/Color Ball.png", "images/balls/Gradient-ball.png"])
        let body = Matter.Bodies.circle(x, y, GameObjects.BLOCK_SIZE / 2, {
            render: { sprite: { texture: txt, xScale: GameObjects.BLOCK_SIZE / 64, yScale: GameObjects.BLOCK_SIZE / 64 } },
            restitution: 0.8,
            collisionFilter: GameObjects._PRE_SHOT_COLLISION_FILTER,
            label: "Projectile",
            powerActivated: false,
            launched: false,
            activatePower: undefined,
            frictionAir: 0.005,
            sleepThreshold: 1500 / 16.666,
            density: 0.007
        });

        return body
    }

    static rect(x, y, width, height, material) {
        let hp;
        switch (material){
            case ('glass'):
                hp = 2000;
                break;
            case ('wood'):
                hp = 5000;
                break;
            case ('stone'):
                hp = 7000;
                break;
            case ('metal'):
                hp = 9000;
                break;
            default:
                throw "Invalid block material"
        }
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
                render = { sprite: { texture: `images/Material Texture/${material}/${texture}.png`, xScale: GameObjects.BLOCK_SIZE / 64, yScale: GameObjects.BLOCK_SIZE / 64 } }
                if(material == "glass"){
                    render.opacity = 0.75
                }
            }
            return Matter.Bodies.rectangle(x, y, GameObjects.BLOCK_SIZE, GameObjects.BLOCK_SIZE, { render: render});
        })
        let body = Matter.Body.create({ label: "Block", hp: hp, parts: comp.bodies, shockAbsorbed: 0, sleepThreshold: 1, frictionAir: 0.9, mass: 1})
        Matter.Body.setPosition(body, { x: x, y: y })
        Matter.Events.on(body,"sleepStart", (event)=>{
            Matter.Body.setDensity(event.source,0.001)
            event.source.frictionAir = 0.01
        })
        Matter.Events.on(body, "sleepEnd", (event) => {
            event.source.sleepThreshold = Infinity
        })
        return body;
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
        let scale = { x: Generator.WIDTH_RATIO * Generator.RENDER_SCALE / game.renderer.canvas.width, y: Generator.HEIGHT_RATIO * Generator.RENDER_SCALE / game.renderer.canvas.height }
        Matter.Mouse.setScale(mouseConstraint.mouse, scale)
        return mouseConstraint;
    }

    static slingShot(game, x, y) {
        let constraint = Matter.Constraint.create({
            label: "Sling Shot",
            pointA: { x: x, y: y },
            bodyB: GameObjects.projectile(x, y),
            length: 0,
            stiffness: 0.005,
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
                Matter.Body.setAngularVelocity(constraint.bodyB, 0)
            }
            //check for launch
            if (constraint.bodyB.launched) {
                let dist = Matter.Vector.magnitude(Matter.Vector.sub(constraint.bodyB.position, constraint.pointA))
                let prevDist = Matter.Vector.magnitude(Matter.Vector.sub(constraint.bodyB.positionPrev, constraint.pointA))
                if (dist < constraint.bodyB.circleRadius && prevDist > constraint.bodyB.circleRadius) {
                    constraint.bodyB.collisionFilter = GameObjects._POST_SHOT_COLLISION_FILTER;
                    constraint.bodyB = GameObjects.projectile(constraint.pointA.x, constraint.pointA.y)
                }
            }

        })
        return constraint
    }


}