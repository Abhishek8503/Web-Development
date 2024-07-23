console.log("Let'start the JavaScript")
let currentSong = new Audio
let songs;
let currfolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSong(folder) {
    currfolder = folder
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".m4a") || element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]) 
            // console.log(element.href.split("/songs/")[1])

        }
    }

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    // console.log(songs);
    songUL.innerHTML = ""
    
    for (const song of songs) {
        let songName = song.replaceAll("%20", " ")
        // song = String(song)
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="music.svg" alt="">
                            <div class="info">
                                <div>${songName}</div>

                            </div>
                            <div class="playnow"> 
                                <span>Play Now</span>
                                <img class="invert" src="play.svg" alt="">
                            </div></li>`
    }

    //Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click", element=>{
            // console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })     
    // return songs
}

const playMusic = (track, pause = false)=>{
    // let audio = new Audio("/songs/" + track)
    currentSong.src = `/${currfolder}/` + track 
    if(!pause){
        currentSong.play()
        play.src = "pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums(){
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")    
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        
    
        if(e.href.includes("/songs")){
            let folder = e.href.split("/").slice(-2)[0]
            //Get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
            let response = await a.json()
            // console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="50" cy="50" r="40" fill="#1DB954" />
                                <polygon points="40,35 40,65 70,50" fill="#000000" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h3>${response.title}</h3>
                        <p>${response.description}</p>
                    </div>`
        }
        
    }
        //Load the playlist whenever card is clicked
        Array.from(document.getElementsByClassName("card")).forEach(e=>{
            e.addEventListener("click", async item=>{
                songs = await getSong(`songs/${item.currentTarget.dataset.folder}`)
                // console.log(e)
                // playMusic(songs[0])
            })
        })
}

async function main() {    
    currentSong.volume = 0.06;
    document.querySelector(".range input").value = 6;

    await getSong("songs/MHA")
    // console.log(songs)
    playMusic(songs[0], true) 
    //Display all the albums on the page
    await displayAlbums()

    //Attach an event listener to play, next and previous 

    play.addEventListener("click", ()=>{
        if(currentSong.paused){
            currentSong.play()
            play.src = "pause.svg"
        }
        else{
            currentSong.pause()
            play.src = "play.svg"
        }
    })

    //Listen for timeupdate event
    currentSong.addEventListener("timeupdate", ()=>{
        // console.log(currentSong.currentTime, currentSong.duration)
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}` 
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + '%'
    })

    //Add an eventListener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + '%'
        currentSong.currentTime = ((currentSong.duration) * percent )/100
    })

    //Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0"
    })

    //Closing of hamburger
    document.querySelector(".close").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-100%"
    })

    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause()
        console.log("Previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    // Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Next clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })

    //Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
        console.log("Setting volume to ", e.target.value, " / 100");    
        currentSong.volume = parseInt(e.target.value)/100        
        if(currentSong.volume > 0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })

    //Add an event listener to mute
    document.querySelector(".volume>img").addEventListener("click", e=>{
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }

        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = 0.1
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })


}

document.addEventListener("DOMContentLoaded", () => {
    main();
});


// console.log("Let's start the JavaScript");
// let currentSong = new Audio();
// let songs = [];
// let currfolder;

// function secondsToMinutesSeconds(seconds) {
//     if (isNaN(seconds) || seconds < 0) {
//         return "00:00";
//     }

//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = Math.floor(seconds % 60);

//     const formattedMinutes = String(minutes).padStart(2, '0');
//     const formattedSeconds = String(remainingSeconds).padStart(2, '0');

//     return `${formattedMinutes}:${formattedSeconds}`;
// }

// async function getSong(folder) {
//     currfolder = folder;
//     let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
//     let response = await a.text();
//     let div = document.createElement("div");
//     div.innerHTML = response;
//     let as = div.getElementsByTagName("a");
//     songs = [];
//     for (let index = 0; index < as.length; index++) {
//         const element = as[index];
//         if (element.href.endsWith(".m4a") || element.href.endsWith(".mp3")) {
//             songs.push(element.href.split(`/${folder}/`)[1]);
//         }
//     }

//     let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
//     songUL.innerHTML = "";

//     for (const song of songs) {
//         let songName = song.replaceAll("%20", " ");
//         songUL.innerHTML += `<li><img class="invert" src="music.svg" alt="">
//                             <div class="info">
//                                 <div>${songName}</div>
//                             </div>
//                             <div class="playnow"> 
//                                 <span>Play Now</span>
//                                 <img class="invert" src="play.svg" alt="">
//                             </div></li>`;
//     }

//     Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
//         e.addEventListener("click", element => {
//             playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
//         });
//     });
// }

// const playMusic = (track, pause = false) => {
//     currentSong.src = `/${currfolder}/` + track;
//     if (!pause) {
//         currentSong.play();
//         document.getElementById("play").src = "pause.svg";
//     }
//     document.querySelector(".songinfo").innerHTML = decodeURI(track);
//     document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
// };

// async function displayAlbums() {
//     let a = await fetch(`http://127.0.0.1:3000/songs/`);
//     let response = await a.text();
//     let div = document.createElement("div");
//     div.innerHTML = response;
//     let anchors = div.getElementsByTagName("a");
//     let cardContainer = document.querySelector(".cardContainer");
//     let array = Array.from(anchors);
//     for (let index = 0; index < array.length; index++) {
//         const e = array[index];

//         if (e.href.includes("/songs")) {
//             let folder = e.href.split("/").slice(-2)[0];
//             let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
//             let response = await a.json();
//             cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
//                         <div class="play">
//                             <svg width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
//                                 <circle cx="50" cy="50" r="40" fill="#1DB954" />
//                                 <polygon points="40,35 40,65 70,50" fill="#000000" />
//                             </svg>
//                         </div>
//                         <img src="/songs/${folder}/cover.jpg" alt="">
//                         <h3>${response.title}</h3>
//                         <p>${response.description}</p>
//                     </div>`;
//         }
//     }

//     Array.from(document.getElementsByClassName("card")).forEach(e => {
//         e.addEventListener("click", async item => {
//             await getSong(`songs/${item.currentTarget.dataset.folder}`);
//             playMusic(songs[0], true);
//         });
//     });
// }

// async function main() {
//     await getSong("songs/MHA");
//     playMusic(songs[0], true);
//     await displayAlbums();

//     document.getElementById("play").addEventListener("click", () => {
//         if (currentSong.paused) {
//             currentSong.play();
//             document.getElementById("play").src = "pause.svg";
//         } else {
//             currentSong.pause();
//             document.getElementById("play").src = "play.svg";
//         }
//     });

//     currentSong.addEventListener("timeupdate", () => {
//         document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
//         document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + '%';
//     });

//     document.querySelector(".seekbar").addEventListener("click", e => {
//         let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
//         document.querySelector(".circle").style.left = percent + '%';
//         currentSong.currentTime = ((currentSong.duration) * percent) / 100;
//     });

//     document.querySelector(".hamburger").addEventListener("click", () => {
//         document.querySelector(".left").style.left = "0";
//     });

//     document.querySelector(".close").addEventListener("click", () => {
//         document.querySelector(".left").style.left = "-100%";
//     });

//     document.getElementById("previous").addEventListener("click", () => {
//         currentSong.pause();
//         console.log("Previous clicked");
//         let index = songs.indexOf(currentSong.src.split("/").pop());
//         if ((index - 1) >= 0) {
//             playMusic(songs[index - 1]);
//         }
//     });

//     document.getElementById("next").addEventListener("click", () => {
//         currentSong.pause();
//         console.log("Next clicked");
//         let index = songs.indexOf(currentSong.src.split("/").pop());
//         if ((index + 1) < songs.length) {
//             playMusic(songs[index + 1]);
//         }
//     });

//     document.querySelector(".range input").addEventListener("change", (e) => {
//         console.log("Setting volume to ", e.target.value, " / 100");
//         currentSong.volume = parseInt(e.target.value) / 100;
//         if (currentSong.volume > 0) {
//             document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg");
//         }
//     });

//     document.querySelector(".volume>img").addEventListener("click", e => {
//         if (e.target.src.includes("volume.svg")) {
//             e.target.src = e.target.src.replace("volume.svg", "mute.svg");
//             currentSong.volume = 0;
//             document.querySelector(".range input").value = 0;
//         } else {
//             e.target.src = e.target.src.replace("mute.svg", "volume.svg");
//             currentSong.volume = 0.1;
//             document.querySelector(".range input").value = 10;
//         }
//     });
// }

// document.addEventListener("DOMContentLoaded", () => {
//     main();
// });
