var game = new Game();
addEventListener("keypress", (event) => {
    if (event.key == " " && !game.slingShot.bodyB.velocityPrev) {
        let equation = Equations.createProblem(10);
        let ans = window.prompt(`${equation.string.substring(1, equation.string.length - 1)} = `);
        if (ans == equation.value) {
            Matter.Composite.add(game.engine.world, game.slingShot.bodyB);
        }
    }
})

let statsCanvas = document.createElement("canvas");
statsCanvas.width = game.renderer.canvas.width;
statsCanvas.height = game.renderer.canvas.height/2;
let ctx = statsCanvas.getContext("2d")
ctx.textAlign ="center"
ctx.font = `${statsCanvas.width/60}px arial`
ctx.fillText("Press SPACE for a ball.",statsCanvas.width/6, statsCanvas.height/8)
statsCanvas.style = "position: absolute; left: 8px; top: 8px; z-index: 1;"

console.log(document.body.appendChild(statsCanvas))