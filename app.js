var game = new Game();

window.alert(`Press [SPACE] or the "Next Ball!" Button to Launch a ball at the structures!`);
        
addEventListener("keypress", (event) => {
    if(event.key == " "){
        ballPrompt();
    }
});

function ballPrompt() {
    if (!game.slingShot.bodyB.velocityPrev) {
        let equation = Equations.createProblem(game.difficulty);
        let ans = window.prompt(`${equation.string.substring(1, equation.string.length - 1)} = `);
        if (ans == equation.value) {
            Matter.Composite.add(game.engine.world.composites[0], game.slingShot.bodyB);
            game.streaks++;
            game.difficulty += Math.round(game.streaks / 5);
        } else {
            let diff = 1 - 1 / (game.streaks + 2);
            game.difficulty *= diff;
            game.difficulty = Math.floor(game.difficulty)
            game.streaks = 0;
            game.updateScore(-1);
        }
        game.updateStreak(game.streaks);
    }
}


const songs = ["sounds/A Good Bass for Gambling.mp3","sounds/Hold on a Sec.mp3"];
var song = 0;
var audio = new Audio(songs[song]);
var button = document.querySelector("#musicButton");
function playMusic() {
    if (audio.paused) {
        audio.play();
        button.innerHTML = "II";
    } else {
        audio.pause();
        button.innerHTML = "▶";
    }
}
audio.addEventListener("ended",()=>{
    song = (song + 1) % songs.length;
    audio.src = songs[song];
    audio.play();
});