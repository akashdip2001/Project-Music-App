## Music app

![Screenshot (15)](https://github.com/user-attachments/assets/d32e8354-694e-4917-b5fb-31561761f6c4)

## File Stracture 

```go
/Melotune-Music-App
│
├── /css
│   ├── styles.css
│   └── utility.css
│
├── /img
│   └── logo.png
│
├── /js
│   └── script.js  # Main JavaScript logic for the app
│
├── /songs          # Directory for all songs and metadata
│   ├── /Aesthetic  # Aesthetic playlist
│   │   ├── Celestia(chosic.com).mp3
│   │   ├── Devyzed-Downtown-Glow(chosic.com).mp3
│   │   ├── cover.jpg
│   │   └── info.json  # JSON file with song/playlist details
│   │
│   ├── /Chill      # Chill playlist
│   │   ├── Ambarsariya 128 Kbps.mp3
│   │   ├── Barbaadiyan - Shiddat 128 Kbps.mp3
│   │   ├── cover.jpg
│   │   └── info.json  # JSON file for chill playlist metadata
│   │
│   ├── /Happy      # Happy playlist
│   │   ├── Cooking-Long-Version(chosic.com).mp3
│   │   ├── Journey(chosic.com).mp3
│   │   ├── cover.jpg
│   │   └── info.json  # JSON file with happy playlist details
│   │
│   └── /[Other Playlist Categories]
│
├── index.html     # Login 
├── ad.html        # Main HTML file for the homepage or music player UI
└── README.md      # Project documentation or instructions

```

## js/script.js

```js
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
          let albumInfo = await fetch(`/songs/${folder}/info.json`);
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

```

![image](https://github.com/user-attachments/assets/76d4e756-e3c8-401d-81a0-c92dcc6f880b)


`In local development (especially when using tools like Live Server), the server environment handles requests differently compared to static hosting platforms like GitHub Pages or Netlify. Here's why:`

`Local Server (like Live Server) handles relative and absolute paths more flexibly.
Static Hosts (GitHub Pages/Netlify) require more precision in paths and file structures.
The 404 errors you're seeing when you upload to GitHub or Netlify indicate that the app cannot find the songs/ directory or its files (info.json, cover.jpg, etc.).`

### Problems : Deploys

| [GitHub pg](https://akashdip2001.github.io/Project-Music-App/) | [netlify.app](https://project-music-app.netlify.app/ad.html) | [vercel.com](https://vercel.com/api/toolbar/link/project-music-jm6djeg3g-akashdip-mahapatras-projects.vercel.app?via=deployment-visit-button&p=1&page=/) |
| --- | --- | --- |

### Solution : Some changes in `js/script.js`

---

### CORS (Cross-Origin Resource Sharing) policies.

SomeTime error encountering is related to **CORS (Cross-Origin Resource Sharing)** policies. Specifically, it indicates that your browser is blocking the request to load resources from the `songs` directory hosted on your InfinityFree server because no `Access-Control-Allow-Origin` header is present in the response. This is a common issue when you're making requests between different domains or even within subdomains that are treated differently by the browser.

### Key Issues:
1. **CORS Policy Error**: The server hosting your site (`http://music-app-project.kesug.com`) is not configured to allow cross-origin requests from your frontend. This typically happens when trying to fetch resources from a server that is either blocking such requests or is not set up to explicitly allow them.

2. **403 Error (Forbidden)**: This indicates that the server is actively refusing the request, possibly because of permissions settings on the server, incorrect paths, or other security configurations that prevent fetching resources.

### Possible Solutions:

#### 1. **Update Server CORS Policy**:
If you have access to server configurations (like `.htaccess` in Apache, or if you're able to modify server headers), you can explicitly allow cross-origin requests by adding the following to your `.htaccess` file or server config:

```apache
# Allow cross-origin requests from any origin (for development only)
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>

# Handle Options preflight requests for CORS
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_METHOD} OPTIONS
    RewriteRule ^(.*)$ $1 [R=200,L]
</IfModule>
```

This will allow all origins (`*`) to make requests to your server. However, this is not ideal for security, so you may want to restrict it to specific origins.

#### 2. **Use `no-cors` Mode in Fetch Requests**:
You can bypass the CORS policy by setting the `mode: 'no-cors'` in your `fetch` requests. However, this mode limits the types of requests you can make and doesn't allow access to the response data (you get an "opaque" response).

Update your `fetch` calls like this:

```javascript
let response = await fetch(`/songs/`, {
    mode: 'no-cors'
});
```

However, this might not work as expected, especially if you're fetching dynamic content like JSON or HTML, because the response data will be blocked.

#### 3. **Ensure Correct File Permissions**:
Make sure that the files and directories you're trying to access on your InfinityFree server have the correct permissions. A `403 Forbidden` error can also happen if the server denies access due to incorrect file permissions.

On InfinityFree, ensure:
- **File permissions**: Ensure your directories and files are accessible. Typically, directories should have `755` permissions and files should have `644` permissions.
  
#### 4. **Check Server Path or URL Issues**:
The error indicates that it's trying to fetch `http://music-app-project.kesug.com/songs/`, which returns a `403`. Ensure that:
- The path `/songs/` is correct and publicly accessible.
- You have correctly uploaded your files to the right location on the server.

#### 5. **Test with a Local Server**:
Before deploying on InfinityFree, you can test your app locally using a simple HTTP server. For example, you can run:
```bash
npx serve .
```
This will serve your static files and ensure that paths and requests are functioning properly without CORS issues.

### Conclusion:
The CORS issue you're facing stems from server-side restrictions. If you can modify server settings, you should allow CORS requests by updating the `.htaccess` file or configuring the server. If that's not possible on InfinityFree, you may need to look for a hosting service that allows better control over CORS headers.

### If CORS Issue Persists:
If adding the `.htaccess` file doesn’t resolve the issue, InfinityFree might not allow users to set custom headers like `Access-Control-Allow-Origin`. In that case, you might need to switch to a different hosting provider that offers more flexibility, such as:
- **Vercel** (for serverless hosting)
- **Netlify** (for static sites)
- **Heroku** (for dynamic applications)

These platforms are better equipped for handling modern web app needs, including proper CORS handling.
