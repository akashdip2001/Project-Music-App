console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs = [];
let currFolder = "";

// Convert seconds to minutes and seconds
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Fetch songs from a folder
async function getSongs(folder) {
    currFolder = folder;
    try {
        const response = await fetch(`/${folder}/`);
        const htmlText = await response.text();
        const div = document.createElement("div");
        div.innerHTML = htmlText;

        const anchors = div.getElementsByTagName("a");
        songs = [];

        // Fetch mp3 files from the folder
        for (let anchor of anchors) {
            if (anchor.href.endsWith(".mp3")) {
                let songName = decodeURIComponent(anchor.href.split(`/${folder}/`)[1]);
                songs.push(songName);
            }
        }

        // Display the songs
        let songUL = document.querySelector(".songList ul");
        songUL.innerHTML = ""; // Clear song list

        for (let song of songs) {
            songUL.innerHTML += `
                <li>
                    <img class="invert" width="34" src="img/music.svg" alt="">
                    <div class="info">
                        <div>${song.replaceAll("%20", " ")}</div>
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                        <img class="invert" src="img/play.svg" alt="">
                    </div>
                </li>`;
        }

        // Add event listeners to each song
        Array.from(document.querySelectorAll(".songList li")).forEach((li, index) => {
            li.addEventListener("click", () => {
                playMusic(songs[index]);
            });
        });
    } catch (error) {
        console.error(`Error fetching songs for folder: ${folder}`, error);
    }
}

// Play a selected song
const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + encodeURIComponent(track); 
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURIComponent(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

// Display albums on the page
async function displayAlbums() {
    console.log("Displaying albums");
    try {
        const response = await fetch(`/songs/`); 
        const htmlText = await response.text(); 
        const div = document.createElement("div");
        div.innerHTML = htmlText;

        const anchors = div.getElementsByTagName("a");
        let cardContainer = document.querySelector(".cardContainer");
        cardContainer.innerHTML = ""; // Clear existing albums

        for (let anchor of anchors) {
            if (anchor.href.includes("/songs/") && !anchor.href.includes(".htaccess")) {
                let folder = anchor.href.split("/").filter(Boolean).pop();
                try {
                    let albumInfo = await fetch(`/songs/${folder}/info.json`);
                    if (!albumInfo.ok) throw new Error(`Error fetching info.json for ${folder}`);

                    let albumData = await albumInfo.json();

                    // Add album card to the DOM
                    cardContainer.innerHTML += `
                        <div data-folder="${folder}" class="card">
                            <div class="play">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
                                </svg>
                            </div>
                            <img src="/songs/${folder}/cover.jpg" alt="Album cover">
                            <h2>${albumData.title}</h2>
                            <p>${albumData.description}</p>
                        </div>`;
                } catch (err) {
                    console.error("Error fetching album info:", err);
                }
            }
        }

        // Event listeners for clicking on albums
        Array.from(document.getElementsByClassName("card")).forEach(card => {
            card.addEventListener("click", async (event) => {
                let folderName = `songs/${event.currentTarget.dataset.folder}`;
                let songs = await getSongs(folderName);
                playMusic(songs[0]); // Play the first song
            });
        });
    } catch (error) {
        console.error("Error displaying albums:", error);
    }
}

// Main initialization function
async function main() {
    await displayAlbums(); // Display albums on page load

    // Play/pause toggle
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    // Update song time
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Seekbar control
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Volume control
    document.querySelector(".range input").addEventListener("change", (e) => {
        let volume = parseInt(e.target.value) / 100;
        currentSong.volume = volume;
        document.querySelector(".volume img").src = volume > 0 ? "img/volume.svg" : "img/mute.svg";
    });

    // Mute/unmute control
    document.querySelector(".volume img").addEventListener("click", (e) => {
        if (currentSong.volume > 0) {
            currentSong.volume = 0;
            e.target.src = "img/mute.svg";
            document.querySelector(".range input").value = 0;
        } else {
            currentSong.volume = 0.1;
            e.target.src = "img/volume.svg";
            document.querySelector(".range input").value = 10;
        }
    });

    // Previous and Next buttons
    previous.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index < songs.length - 1) {
            playMusic(songs[index + 1]);
        }
    });
}

main(); // Initialize the app
