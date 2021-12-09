
var audio = new Audio("sounds/Cloud Armada-TestSong.mp3");
var counter = 0;
//var button = document.getElementById("pop")
function playMusic() {
    //console.log(button);
    if (counter % 2 == 0) {
        audio.play()
        //button.innerHTML() = "⏸"
    } else {
        audio.pause()
       // button.innerHTML() = "▶"
    }
    counter++
}