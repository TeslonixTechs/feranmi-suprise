// Personalize these values to make the surprise your own.
const CONFIG = {
  birthdayName: "Feranmi",
  birthdayMessage:
    "Wishing you a day filled with laughter, little joys, and everything that makes you happiest. May the year ahead bring you many beautiful moments.",
  picturePath: "assets/Snapchat-2022891378.jpg",
  musicPath: "assets/lorenzobuczek-korean-love-dream-172770.mp3",
  videoPath: "assets/Snapchat-435131853.mp4",
  cubeCount: 12,
  initialFloatDuration: 2300,
  collisionDuration: 820,
  revealDuration: 900,
  impactSoundPath: ""
};

const experience = document.querySelector("#experience");
const cubeStage = document.querySelector("#cube-stage");
const particleField = document.querySelector("#particle-field");
const beginButton = document.querySelector("#begin-button");
const replayButton = document.querySelector("#replay-button");
const reveal = document.querySelector("#reveal");
const birthdayTitle = document.querySelector("#birthday-title");
const birthdayMessage = document.querySelector("#birthday-message");
const birthdayPhoto = document.querySelector("#birthday-photo");
const photoFallback = document.querySelector("#photo-fallback");
const birthdayVideo = document.querySelector("#birthday-video");
const videoFallback = document.querySelector("#video-fallback");
const birthdayAudio = document.querySelector("#birthday-audio");
const impactAudio = document.querySelector("#impact-audio");
const musicPanel = document.querySelector("#music-panel");
const musicStatus = document.querySelector("#music-status");
const musicStart = document.querySelector("#music-start");
const musicToggle = document.querySelector("#music-toggle");
const musicToggleLabel = document.querySelector("#music-toggle-label");
const musicVolume = document.querySelector("#music-volume");

const timers = new Set();
const cubeOrbits = [];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const smallOrLowPower =
  window.matchMedia("(max-width: 600px)").matches ||
  (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4);
const activeCubeCount = Math.max(5, CONFIG.cubeCount - (smallOrLowPower ? 5 : 0));

let sequenceRunning = false;
let musicAttempted = false;

function schedule(callback, delay) {
  const timer = window.setTimeout(() => {
    timers.delete(timer);
    callback();
  }, delay);
  timers.add(timer);
  return timer;
}

function clearSequenceTimers() {
  timers.forEach(window.clearTimeout);
  timers.clear();
}

function createCube(index) {
  const orbit = document.createElement("div");
  const cube = document.createElement("div");
  const size = 20 + Math.random() * (smallOrLowPower ? 25 : 42);
  const faces = ["front", "back", "right", "left", "top", "bottom"];

  orbit.className = "cube-orbit";
  orbit.style.setProperty("--size", `${size}px`);
  orbit.style.setProperty("--left", `${8 + Math.random() * 84}%`);
  orbit.style.setProperty("--top", `${9 + Math.random() * 82}%`);
  cube.className = "cube";
  const floatDuration = 3.4 + Math.random() * 4.6;
  cube.style.setProperty("--duration", `${floatDuration}s`);
  cube.style.setProperty("--reveal-duration", `${floatDuration * 1.8}s`);
  cube.style.setProperty("--delay", `${-Math.random() * 4}s`);
  const floatDistance = smallOrLowPower ? 34 : 72;
  cube.style.setProperty("--float-x", `${-floatDistance + Math.random() * floatDistance * 2}px`);
  cube.style.setProperty("--float-y", `${-floatDistance + Math.random() * floatDistance * 2}px`);
  cube.style.setProperty("--rotate-x", `${Math.random() * 180}deg`);
  cube.style.setProperty("--rotate-y", `${Math.random() * 180}deg`);
  cube.style.setProperty("--rotate-z", `${Math.random() * 180}deg`);
  cube.style.setProperty("--cube-index", index);

  for (const faceName of faces) {
    const face = document.createElement("span");
    face.className = `cube-face ${faceName}`;
    cube.append(face);
  }

  orbit.append(cube);
  cubeStage.append(orbit);
  cubeOrbits.push(orbit);
}

function createCubes() {
  for (let index = 0; index < activeCubeCount; index += 1) {
    createCube(index);
  }
}

function moveCubesToCenter() {
  const stageBounds = cubeStage.getBoundingClientRect();
  const centerX = stageBounds.width / 2;
  const centerY = stageBounds.height / 2;
  const duration = reducedMotion.matches ? 100 : CONFIG.collisionDuration;

  cubeOrbits.forEach((orbit, index) => {
    const bounds = orbit.getBoundingClientRect();
    const currentX = bounds.left + bounds.width / 2 - stageBounds.left;
    const currentY = bounds.top + bounds.height / 2 - stageBounds.top;
    const delay = reducedMotion.matches ? 0 : (index % 5) * 34;
    orbit.dataset.originX = String(currentX);
    orbit.dataset.originY = String(currentY);
    orbit.style.transitionDuration = `${duration}ms`;
    orbit.style.transitionDelay = `${delay}ms`;
    orbit.style.transform =
      `translate(calc(-50% + ${centerX - currentX}px), ` +
      `calc(-50% + ${centerY - currentY}px))`;
  });
}

function scatterCubes() {
  const stageBounds = cubeStage.getBoundingClientRect();
  const centerX = stageBounds.width / 2;
  const centerY = stageBounds.height / 2;

  cubeOrbits.forEach((orbit, index) => {
    const bounds = orbit.getBoundingClientRect();
    const angle = (index / cubeOrbits.length) * Math.PI * 2 + Math.random() * 0.4;
    const distance = Math.max(stageBounds.width, stageBounds.height) * (0.45 + Math.random() * 0.3);
    const originX = Number(orbit.dataset.originX);
    const originY = Number(orbit.dataset.originY);
    const targetX = centerX + Math.cos(angle) * distance;
    const targetY = centerY + Math.sin(angle) * distance;

    orbit.style.transitionDuration = "760ms";
    orbit.style.transitionDelay = `${Math.random() * 100}ms`;
    orbit.style.transform =
      `translate(calc(-50% + ${targetX - originX}px), ` +
      `calc(-50% + ${targetY - originY}px)) scale(0.12)`;
  });
}

function createParticles() {
  particleField.replaceChildren();
  const count = smallOrLowPower ? 18 : 30;

  for (let index = 0; index < count; index += 1) {
    const particle = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const distance = 65 + Math.random() * Math.min(window.innerWidth * 0.42, 300);
    particle.className = "particle";
    particle.style.setProperty("--particle-size", `${2 + Math.random() * 4}px`);
    particle.style.setProperty("--particle-x", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--particle-y", `${Math.sin(angle) * distance}px`);
    particle.style.setProperty("--particle-duration", `${650 + Math.random() * 500}ms`);
    particle.style.setProperty("--particle-delay", `${Math.random() * 100}ms`);
    particleField.append(particle);
  }
}

function playImpactSound() {
  if (!CONFIG.impactSoundPath) return;

  impactAudio.src = CONFIG.impactSoundPath;
  impactAudio.currentTime = 0;
  impactAudio.play().catch((error) => {
    console.warn("The optional impact sound could not be played.", error);
  });
}

function setMusicStatus(message) {
  musicStatus.textContent = message;
}

function showMusicFallback(message) {
  setMusicStatus(message);
  musicStart.hidden = false;
  musicToggle.hidden = false;
  musicToggleLabel.textContent = "Play";
  musicToggle.setAttribute("aria-label", "Play birthday music");
}

function attemptMusicPlayback() {
  if (!CONFIG.musicPath) {
    showMusicFallback("Add a music file path in the CONFIG section of script.js.");
    return;
  }

  birthdayAudio.play().then(() => {
    musicStart.hidden = true;
    setMusicStatus("A little music for your special day");
  }).catch((error) => {
    if (error.name === "NotAllowedError") {
      showMusicFallback("Tap below to play your birthday music.");
      return;
    }
    showMusicFallback("Birthday music could not be played. Check the configured music path.");
    console.warn("Birthday music playback failed.", error);
  });
}

function prepareReveal() {
  experience.classList.remove("is-accelerating", "is-colliding", "is-impact", "is-scattered");
  cubeOrbits.forEach((orbit) => {
    orbit.style.transition = "none";
    orbit.style.transitionDelay = "0ms";
    orbit.style.transform = "translate(-50%, -50%)";
  });
  void cubeStage.offsetWidth;
  experience.classList.add("is-revealed");
  reveal.hidden = false;
  musicPanel.hidden = false;
  sequenceRunning = false;

  birthdayVideo.play().catch((error) => {
    console.warn("Birthday video autoplay was unavailable; use the video controls to play it.", error);
  });

  if (!musicAttempted) {
    musicAttempted = true;
    attemptMusicPlayback();
  }
}

function beginSequence() {
  if (sequenceRunning) return;

  sequenceRunning = true;
  clearSequenceTimers();
  experience.classList.remove("is-revealed", "is-impact", "is-scattered", "is-colliding", "is-accelerating");
  reveal.hidden = true;
  musicPanel.hidden = true;
  particleField.replaceChildren();
  cubeOrbits.forEach((orbit) => {
    orbit.style.transition = "none";
    orbit.style.transitionDelay = "0ms";
    orbit.style.transform = "translate(-50%, -50%)";
  });
  void cubeStage.offsetWidth;
  experience.classList.add("has-started");

  if (reducedMotion.matches) {
    experience.classList.add("is-impact");
    schedule(() => {
      createParticles();
      experience.classList.add("is-scattered");
      schedule(prepareReveal, 180);
    }, 100);
    return;
  }

  schedule(() => {
    experience.classList.add("is-accelerating");
    schedule(() => {
      experience.classList.remove("is-accelerating");
      experience.classList.add("is-colliding");
      moveCubesToCenter();
      schedule(() => {
        experience.classList.add("is-impact");
        createParticles();
        playImpactSound();
        schedule(() => {
          experience.classList.add("is-scattered");
          scatterCubes();
          schedule(prepareReveal, CONFIG.revealDuration);
        }, 330);
      }, CONFIG.collisionDuration + 170);
    }, 1100);
  }, CONFIG.initialFloatDuration);
}

function resetCubesForReplay() {
  experience.classList.remove("is-accelerating", "is-colliding", "is-impact", "is-scattered");
  particleField.replaceChildren();
  cubeOrbits.forEach((orbit) => {
    orbit.style.transition = "none";
    orbit.style.transitionDelay = "0ms";
    orbit.style.transform = "translate(-50%, -50%)";
  });
  void cubeStage.offsetWidth;
}

birthdayTitle.textContent = `Happy Birthday, ${CONFIG.birthdayName}! 🎂❤️`;
birthdayMessage.textContent = CONFIG.birthdayMessage;
musicPanel.hidden = true;
musicToggle.hidden = false;
birthdayAudio.volume = Number(musicVolume.value);

if (CONFIG.picturePath) {
  birthdayPhoto.src = CONFIG.picturePath;
  birthdayPhoto.addEventListener("error", () => {
    birthdayPhoto.hidden = true;
    photoFallback.hidden = false;
  }, { once: true });
} else {
  birthdayPhoto.hidden = true;
  photoFallback.hidden = false;
}

if (CONFIG.videoPath) {
  birthdayVideo.src = CONFIG.videoPath;
  if (CONFIG.picturePath) birthdayVideo.poster = CONFIG.picturePath;
  birthdayVideo.addEventListener("error", () => {
    birthdayVideo.hidden = true;
    videoFallback.hidden = false;
    console.warn("Birthday video could not be loaded. Check the configured video path.");
  });
} else {
  birthdayVideo.hidden = true;
  videoFallback.hidden = false;
}

if (CONFIG.musicPath) {
  birthdayAudio.src = CONFIG.musicPath;
  birthdayAudio.addEventListener("error", () => {
    showMusicFallback("Music file unavailable. Check the configured path in script.js.");
    musicStart.hidden = true;
    musicToggle.hidden = true;
  });
} else {
  musicToggle.hidden = true;
}

createCubes();

beginButton.addEventListener("click", beginSequence);
replayButton.addEventListener("click", () => {
  if (sequenceRunning) return;
  clearSequenceTimers();
  resetCubesForReplay();
  beginSequence();
});

musicStart.addEventListener("click", () => {
  birthdayAudio.play().catch((error) => {
    showMusicFallback("Music could not be started. Check the configured music path.");
    console.warn("Birthday music playback failed.", error);
  });
});

musicToggle.addEventListener("click", () => {
  if (birthdayAudio.paused) {
    birthdayAudio.play().catch((error) => {
      showMusicFallback("Music could not be started. Check the configured music path.");
      console.warn("Birthday music playback failed.", error);
    });
  } else {
    birthdayAudio.pause();
  }
});

musicVolume.addEventListener("input", () => {
  birthdayAudio.volume = Number(musicVolume.value);
});

birthdayAudio.addEventListener("play", () => {
  musicToggleLabel.textContent = "Pause";
  musicToggle.setAttribute("aria-label", "Pause birthday music");
  musicStart.hidden = true;
  setMusicStatus("A little music for your special day");
});

birthdayAudio.addEventListener("pause", () => {
  musicToggleLabel.textContent = "Play";
  musicToggle.setAttribute("aria-label", "Play birthday music");
});

birthdayAudio.addEventListener("error", () => {
  if (musicPanel.hidden) return;
  showMusicFallback("Music file unavailable. Check the configured path in script.js.");
  musicStart.hidden = true;
  musicToggle.hidden = true;
});
