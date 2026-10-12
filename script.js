// ======================================================
// MINECRAFT ULTIMATE — FIREBASE GOOGLE AUTHENTICATION
// ======================================================

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";

import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";


// ======================================================
// 1. FIREBASE CONFIGURATION
// ======================================================

const firebaseConfig = {
  apiKey: "AIzaSyBYkbRoKT5Dr1siHz8HjJIQRZwCB4dQbUU",
  authDomain: "minecraft-ultimate-4858c.firebaseapp.com",
  projectId: "minecraft-ultimate-4858c",
  storageBucket: "minecraft-ultimate-4858c.firebasestorage.app",
  messagingSenderId: "539279794580",
  appId: "1:539279794580:web:1fea548da0fb2ed767ef81",
  measurementId: "G-HVG0S8RQJ3"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: "select_account"
});


// ======================================================
// 2. AUTHENTICATION ELEMENTS
// ======================================================

const loginScreen = document.getElementById("loginScreen");
const appContent = document.getElementById("appContent");

const googleSignInButton =
    document.getElementById("googleSignInButton");

const loginMessage = document.getElementById("loginMessage");
const signOutButton = document.getElementById("signOutButton");


// ======================================================
// 3. HELPER FUNCTIONS
// ======================================================

function showLoginMessage(message) {
    loginMessage.textContent = message;
}

function setLoginLoading(isLoading) {
    googleSignInButton.disabled = isLoading;

    googleSignInButton.querySelector("span").textContent =
        isLoading
            ? "Connecting to Google..."
            : "Continue with Google";
}

function showDashboard() {
    loginScreen.hidden = true;
    appContent.hidden = false;
}

function showLoginScreen() {
    appContent.hidden = true;
    loginScreen.hidden = false;
}


// ======================================================
// 4. GOOGLE SIGN-IN
// ======================================================

googleSignInButton.addEventListener("click", async () => {
    setLoginLoading(true);
    showLoginMessage("");

    try {
        // Redirect is generally more suitable for mobile browsers.
        const isMobile = window.matchMedia(
            "(max-width: 760px)"
        ).matches;

        if (isMobile) {
            await signInWithRedirect(auth, googleProvider);
        } else {
            await signInWithPopup(auth, googleProvider);
        }

    } catch (error) {
        console.error("Google sign-in error:", error);

        showLoginMessage(getAuthErrorMessage(error));
        setLoginLoading(false);
    }
});


// ======================================================
// 5. FRIENDLY AUTHENTICATION ERRORS
// ======================================================

function getAuthErrorMessage(error) {
    switch (error.code) {
        case "auth/popup-closed-by-user":
            return "Sign-in was cancelled. Please try again.";

        case "auth/popup-blocked":
            return "Your browser blocked the sign-in window. Allow pop-ups and retry.";

        case "auth/unauthorized-domain":
            return "This website domain is not authorized in Firebase Authentication.";

        case "auth/operation-not-allowed":
            return "Google sign-in is disabled in Firebase Authentication.";

        case "auth/network-request-failed":
            return "Network error. Check your internet connection.";

        case "auth/cancelled-popup-request":
            return "A sign-in request is already running. Please wait.";

        default:
            return error.message
                ? `Sign-in failed: ${error.message}`
                : "Sign-in failed. Please try again.";
    }
}


// ======================================================
// 6. HANDLE GOOGLE REDIRECT RESULT
// ======================================================

getRedirectResult(auth).catch(error => {
    console.error("Google redirect error:", error);

    if (loginMessage) {
        showLoginMessage(getAuthErrorMessage(error));
    }

    setLoginLoading(false);
});


// ======================================================
// 7. SIGN-OUT
// ======================================================

signOutButton.addEventListener("click", async () => {
    signOutButton.disabled = true;
    signOutButton.textContent = "Signing out...";

    try {
        await signOut(auth);

    } catch (error) {
        console.error("Sign-out error:", error);
        alert("Unable to sign out. Please try again.");

    } finally {
        signOutButton.disabled = false;
        signOutButton.textContent = "Sign out";
    }
});


// ======================================================
// 8. SHOW THE SIGNED-IN USER'S PROFILE
// ======================================================

function setImage(element, photoURL) {
    if (!element) return;

    if (!photoURL) {
        element.hidden = true;
        element.removeAttribute("src");
        return;
    }

    element.onerror = () => {
        element.hidden = true;
    };

    element.onload = () => {
        element.hidden = false;
    };

    element.src = photoURL;
}

function updateUserInterface(user) {
    if (!user) {
        showLoginScreen();
        showLoginMessage("");
        setLoginLoading(false);
        return;
    }

    showDashboard();

    const displayName = user.displayName || "Minecraft Explorer";
    const email = user.email || "";
    const photoURL = user.photoURL || "";

    // Navbar
    document.getElementById("navbarName").textContent =
        displayName;

    setImage(
        document.getElementById("navbarAvatar"),
        photoURL
    );

    // Sidebar
    document.getElementById("sidebarPlayerName").textContent =
        displayName;

    setImage(
        document.getElementById("sidebarAvatar"),
        photoURL
    );

    document.getElementById("sidebarDefaultAvatar").hidden =
        Boolean(photoURL);

    // Profile section
    document.getElementById("profileName").textContent =
        displayName;

    document.getElementById("profileEmail").textContent =
        email;

    setImage(
        document.getElementById("profileAvatar"),
        photoURL
    );

    updateProfile();
}


// Firebase monitors whether the user is signed in.
onAuthStateChanged(auth, user => {
    updateUserInterface(user);
});


// ======================================================
// 9. MOBILE NAVIGATION
// ======================================================

const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");

menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
});

document.querySelectorAll(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
        document.querySelectorAll(".nav-link").forEach(item => {
            item.classList.remove("active");
        });

        link.classList.add("active");
        sidebar.classList.remove("open");
    });
});


// ======================================================
// 10. WEBSITE SEARCH
// ======================================================

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

function searchWebsite() {
    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
        searchInput.focus();
        return;
    }

    const searchableElements = [
        ...document.querySelectorAll(".feature-card"),
        ...document.querySelectorAll(".section")
    ];

    const match = searchableElements.find(element => {
        return element.innerText.toLowerCase().includes(query) ||
            (element.dataset.search || "").toLowerCase().includes(query);
    });

    if (match) {
        match.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        match.animate(
            [
                { outline: "2px solid transparent" },
                { outline: "2px solid #57f287" },
                { outline: "2px solid transparent" }
            ],
            { duration: 900 }
        );

    } else {
        alert("No matching content found. Try another search!");
    }
}

searchButton.addEventListener("click", searchWebsite);

searchInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
        searchWebsite();
    }
});


// ======================================================
// 11. MINECRAFT QUIZ
// ======================================================

const questions = [
    {
        question: "Which item is used to link a compass to a Lodestone?",
        answers: ["compass"],
        display: "Compass"
    },
    {
        question: "Which mob digs up Torchflower Seeds and Pitcher Pods?",
        answers: ["sniffer"],
        display: "Sniffer"
    },
    {
        question: "Which block is used to upgrade diamond equipment to Netherite?",
        answers: ["smithing table"],
        display: "Smithing Table"
    },
    {
        question: "Which item is needed to brew potions in a Brewing Stand?",
        answers: ["blaze powder"],
        display: "Blaze Powder"
    },
    {
        question: "Which enchantment allows a trident to propel its user through water?",
        answers: ["riptide"],
        display: "Riptide"
    }
];

const quizButton = document.getElementById("quizButton");
const quizArea = document.getElementById("quizArea");
const questionText = document.getElementById("questionText");
const quizForm = document.getElementById("quizForm");
const answerInput = document.getElementById("answerInput");
const quizFeedback = document.getElementById("quizFeedback");
const quizScore = document.getElementById("quizScore");

let questionIndex = 0;
let score = 0;
let answered = false;

function loadQuestion() {
    if (questionIndex >= questions.length) {
        questionText.textContent =
            `Quiz complete! Your final score is ${score}/${questions.length}.`;

        answerInput.hidden = true;
        quizForm.querySelector("button").hidden = true;

        quizFeedback.textContent = "Challenge completed!";
        quizScore.textContent = `Score: ${score}`;

        quizButton.hidden = false;
        quizButton.textContent = "PLAY AGAIN";

        return;
    }

    questionText.textContent =
        `Question ${questionIndex + 1}/${questions.length}: ` +
        questions[questionIndex].question;

    answerInput.value = "";
    answerInput.hidden = false;
    quizForm.querySelector("button").hidden = false;

    quizFeedback.textContent = "";
    quizScore.textContent = `Score: ${score}`;

    answered = false;
    answerInput.focus();
}

quizButton.addEventListener("click", () => {
    questionIndex = 0;
    score = 0;

    quizButton.hidden = true;
    quizArea.hidden = false;

    loadQuestion();
});

quizForm.addEventListener("submit", event => {
    event.preventDefault();

    if (answered || questionIndex >= questions.length) {
        return;
    }

    const userAnswer = answerInput.value
    .normalize("NFKC")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const currentQuestion = questions[questionIndex];

if (!userAnswer) return;

answered = true;

const acceptedAnswers = currentQuestion.answers.map(answer =>
    answer
        .normalize("NFKC")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase()
);

const isCorrect = acceptedAnswers.includes(userAnswer);

if (isCorrect) {
    score++;
    quizFeedback.textContent = "CORRECT! +XP";
} else {
    quizFeedback.textContent =
        `Incorrect! Answer: ${currentQuestion.display}`;
}

    quizScore.textContent = `Score: ${score}`;

    // Save the current quiz progress.
    localStorage.setItem("mcUltimateScore", String(score));

    // Award 10 XP for each correct answer.
    if (isCorrect){
        const oldXP =
            Number(localStorage.getItem("mcUltimateXP")) || 0;

        localStorage.setItem(
            "mcUltimateXP",
            String(oldXP + 10)
        );
    }

    updateProfile();

    questionIndex++;

    setTimeout(loadQuestion, 1200);
});


// ======================================================
// 12. PLAYER PROGRESS
// ======================================================

function getRank(xp) {
    if (xp >= 2000) return "Minecraft Legend";
    if (xp >= 1000) return "Ender Guardian";
    if (xp >= 600) return "Netherite Champion";
    if (xp >= 300) return "Diamond Knight";
    if (xp >= 100) return "Iron Warrior";

    return "Wooden Pickaxe";
}

function updateProfile() {
    const savedXP =
        Number(localStorage.getItem("mcUltimateXP")) || 0;

    const savedScore =
        Number(localStorage.getItem("mcUltimateScore")) || 0;

    document.getElementById("profileXP").textContent =
        savedXP;

    document.getElementById("profileScore").textContent =
        savedScore;

    document.getElementById("profileRank").textContent =
        getRank(savedXP);

    const level = Math.floor(savedXP / 100) + 1;

    document.getElementById("sidebarPlayerLevel").textContent =
        `Level ${level} Player`;
}


// ======================================================
// END OF MINECRAFT ULTIMATE
// ======================================================