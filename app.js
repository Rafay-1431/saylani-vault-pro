// Selectors
const adminBtn = document.getElementById("adminBtn");
const playlistItems = document.getElementById("playlistItems");
const mainPlayer = document.getElementById("mainPlayer");
const playingCat = document.getElementById("playingCat");
const playingTitle = document.getElementById("playingTitle");
const vidCountSpan = document.getElementById("vidCount");
const lectureSearch = document.getElementById("lectureSearch");

// Modals
const loginModal = document.getElementById('loginModal');
const addVideoModal = document.getElementById('addVideoModal');
const loginSubmitBtn = document.getElementById('loginSubmitBtn');

// --- 1. Real-time Video Load from Firestore ---
db.collection("videos").orderBy("createdAt", "desc").onSnapshot((snapshot) => {
    let videos = [];
    snapshot.forEach((doc) => {
        videos.push({ id: doc.id, ...doc.data() });
    });
    renderPlaylist(videos);
});

function renderPlaylist(data) {
    playlistItems.innerHTML = '';
    vidCountSpan.innerText = `${data.length} videos`;

    data.forEach(video => {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.innerHTML = `
            <div class="thumb">
                <img src="https://img.youtube.com/vi/${video.vidID}/mqdefault.jpg" alt="thumbnail">
                <span class="badge-time">${video.time}</span>
            </div>
            <div class="card-content">
                <h4>${video.title}</h4>
                <span>${video.cat}</span>
            </div>
        `;
        card.onclick = () => playVideo(video);
        playlistItems.appendChild(card);
    });
}

function playVideo(video) {
    mainPlayer.src = `https://www.youtube.com/embed/${video.vidID}?autoplay=1`;
    playingTitle.innerText = video.title;
    playingCat.innerText = video.cat;
}

// --- 2. Admin Login (Firebase Auth) ---
loginSubmitBtn.addEventListener('click', () => {
    const email = document.getElementById('adminEmail').value;
    const pass = document.getElementById('adminPassword').value;

    auth.signInWithEmailAndPassword(email, pass)
        .then(() => {
            alert("Welcome Admin!");
            loginModal.style.display = 'none';
            addVideoModal.style.display = 'flex';
        })
        .catch((error) => alert("Login Failed: " + error.message));
});

// --- 3. Add Video to Firestore ---
document.getElementById('saveVideoBtn').addEventListener('click', () => {
    const title = document.getElementById('newTitle').value;
    const vidID = document.getElementById('newVidID').value;
    const cat = document.getElementById('newCat').value;
    const time = document.getElementById('newTime').value;

    if (!title || !vidID) return alert("Fill all fields!");

    db.collection("videos").add({
        title, vidID, cat, time: time || "00:00",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        alert("Video Uploaded!");
        addVideoModal.style.display = 'none';
    });
});

// Modal Toggles
adminBtn.onclick = () => loginModal.style.display = 'flex';
document.getElementById('closeLoginBtn').onclick = () => loginModal.style.display = 'none';
document.getElementById('closeAddBtn').onclick = () => addVideoModal.style.display = 'none';



// rules_version = '2';

// service cloud.firestore {
//   match /databases/{database}/documents {
    
//     // Hamare portal ka main path jahan videos save hongi
//     match /artifacts/saylani-vault-v1/public/data/videos/{videoId} {
      
//       // Har student video dekh sakega
//       allow read: if true;
      
//       // Sirf aap (Rafay Bhai) hi video add ya delete kar sakenge
//       // Yahan maine aapka email 'muhammadrafay1431@gmail.com' set kar diya hai
//       allow write: if request.auth != null && request.auth.token.email == "muhammadrafay1431@gmail.com";
//     }
    
//     // Baqi poora database locked rahay ga security ke liye
//     match /{document=**} {
//       allow read, write: if false;
//     }
//   }
// }