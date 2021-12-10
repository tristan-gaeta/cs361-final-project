var game = new Game();
addEventListener("keypress", (event) => {
    if (event.key == " " && !game.slingShot.bodyB.velocityPrev) {
        let equation = Equations.createProblem(game.difficulty);
        let ans = window.prompt(`${equation.string.substring(1, equation.string.length - 1)} = `);
        if (ans == equation.value) {
            Matter.Composite.add(game.engine.world, game.slingShot.bodyB);
            game.streaks++;
            game.difficulty += Math.round(game.streaks/2);
        } else {
            let diff = 1 - 1 / (game.streaks + 2);
            game.difficulty *= diff;
            game.difficulty = Math.floor(game.difficulty)
            game.streaks = 0;
        }
    }
})
