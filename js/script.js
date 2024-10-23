console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs;
let currFolder;

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

async function getSongs(folder) {
  currFolder = folder;

  try {
    let response = await fetch(`/${folder}/`);
    let htmlText = await response.text();
    let div = document.createElement("div");
    div.innerHTML = htmlText;
    let anchors = div.getElementsByTagName("a");
    songs = [];

    for (let index = 0; index < anchors.length; index++) {
      const anchor = anchors[index];
      // Check if the anchor points to an mp3 file
      if (anchor.href.endsWith(".mp3")) {
        let songName = decodeURIComponent(anchor.href.split(`/${folder}/`)[1]);
        songs.push(songName);
      }
    }

    // Display songs in the song list
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = ""; // Clear existing song list

    for (let song of songs) {
      songUL.innerHTML += `<li>
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

    // Add click listeners to play each song when clicked
    Array.from(document.querySelectorAll(".songList li")).forEach(
      (li, index) => {
        li.addEventListener("click", () => {
          playMusic(songs[index]); // Play the selected song
        });
      }
    );

    return songs;
  } catch (error) {
    console.error(`Error fetching songs for folder: ${folder}`, error);
    return [];
  }
}



const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + encodeURIComponent(track); // Encode the song URL correctly
  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURIComponent(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};


async function displayAlbums() {
  console.log("displaying albums");

  try {
    let response = await fetch(`/songs/`); // Fetch the songs directory
    let htmlText = await response.text(); // Parse it as text

    let div = document.createElement("div");
    div.innerHTML = htmlText;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    // Clear the card container before displaying new albums
    cardContainer.innerHTML = "";

    for (let index = 0; index < anchors.length; index++) {
      const anchor = anchors[index];

      // Make sure it's a valid folder, not a file or root reference
      if (
        anchor.href.includes("/songs/") &&
        !anchor.href.includes(".htaccess")
      ) {
        let folder = anchor.href.split("/").filter(Boolean).slice(-1)[0]; // Extract correct folder name

        if (!folder) {
          console.error("Invalid folder path:", anchor.href);
          continue; // Skip if folder is invalid
        }

        // Try to fetch the album's metadata from info.json
        try {
          let albumInfo = await fetch(`./songs/${folder}/info.json`);
          if (!albumInfo.ok)
            throw new Error(`Error fetching info.json for folder: ${folder}`);

          let albumData = await albumInfo.json();

          // Create album card with metadata
          cardContainer.innerHTML += `
                    <div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                    stroke-linejoin="round" />
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

    // Add click event listeners to each card to load the playlist
    Array.from(document.getElementsByClassName("card")).forEach((card) => {
      card.addEventListener("click", async (event) => {
        let folderName = `songs/${event.currentTarget.dataset.folder}`;
        let songs = await getSongs(folderName);
        playMusic(songs[0]); // Play the first song when an album is clicked
      });
    });
  } catch (error) {
    console.error("Error displaying albums:", error);
  }
}



async function main() {
  // Display all albums on page load
  await displayAlbums();

  // Attach event listener to play/pause button
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  // Time update for the song progress
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Event listener for seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Event listener for volume control
  document.querySelector(".range input").addEventListener("change", (e) => {
    let volume = parseInt(e.target.value) / 100;
    currentSong.volume = volume;
    document.querySelector(".volume img").src =
      volume > 0 ? "img/volume.svg" : "img/mute.svg";
  });

  // Event listener for mute/unmute
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
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index > 0) {
      playMusic(songs[index - 1]);
    }
  });

  next.addEventListener("click", () => {
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index < songs.length - 1) {
      playMusic(songs[index + 1]);
    }
  });
}

main();
