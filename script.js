const herName = "Marry Grace P. Argawanon";

const MAX_PHOTOS = 30;
const PHOTO_SECONDS = 3;

const slides = document.querySelectorAll(".slide");
const dotsBox = document.getElementById("dots");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
const music = document.getElementById("music");
const musicBtn = document.getElementById("musicBtn");
const intro = document.getElementById("intro");
const envelope = document.getElementById("envelope");
const cake = document.getElementById("cake");
const wishText = document.getElementById("wishText");
const wishBtn = document.getElementById("wishBtn");

const GALLERY_SLIDE = Array.prototype.findIndex.call(slides, function (s) {
    return s.querySelector("#gallery") !== null;
});

let current = 0;
let started = false;
let opened = false;
let musicStarted = false;

document.querySelectorAll(".name").forEach(function (el) {
    el.textContent = herName;
});

slides.forEach(function () {
    dotsBox.appendChild(document.createElement("span"));
});
const dots = dotsBox.querySelectorAll("span");

document.querySelectorAll(".type").forEach(function (el) {
    el.dataset.full = el.textContent.replace(/\s+/g, " ").trim().replace(/\{name\}/g, herName);
    el.textContent = "";
    el.appendChild(document.createElement("span")).className = "t-on";
    el.appendChild(document.createElement("span")).className = "t-off";
});

function setTyped(el, i) {
    el.firstChild.textContent = el.dataset.full.slice(0, i);
    el.lastChild.textContent = el.dataset.full.slice(i);
}

let typeToken = 0;

function typeSlide(slide) {
    const token = ++typeToken;
    const els = Array.prototype.slice.call(slide.querySelectorAll(".type"));
    els.forEach(function (el) { setTyped(el, 0); });
    let idx = 0;

    function nextEl() {
        if (token !== typeToken || idx >= els.length) return;
        const el = els[idx++];
        const full = el.dataset.full;
        let i = 0;

        (function tick() {
            if (token !== typeToken) return;
            i++;
            setTyped(el, i);
            if (i < full.length) {
                setTimeout(tick, 26);
            } else {
                setTimeout(nextEl, 250);
            }
        })();
    }
    setTimeout(nextEl, 500);
}

function openEnvelope() {
    if (opened) return;
    opened = true;

    envelope.classList.add("open");

    music.play().then(function () {
        musicBtn.textContent = "Music: On";
    }).catch(function () {});
    musicStarted = true;

    const r = envelope.getBoundingClientRect();
    setTimeout(function () {
        burst(r.left + r.width / 2, r.top + r.height / 2);
    }, 700);

    setTimeout(function () {
        intro.classList.add("gone");
    }, 2400);

    setTimeout(function () {
        intro.style.display = "none";
        document.body.classList.add("started");
        started = true;
        showSlide(0);
    }, 3200);
}

function resetCake() {
    cake.classList.remove("out");
    wishText.textContent = "Close your eyes and make a wish.";
    wishBtn.disabled = false;
    wishBtn.textContent = "Blow the Candles";
}

function blowCandles() {
    if (cake.classList.contains("out")) return;
    cake.classList.add("out");
    wishText.textContent = "Your wish is on its way. Never stop believing in it.";
    wishBtn.disabled = true;
    wishBtn.textContent = "Wish sent";

    const r = cake.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + 20);
    setTimeout(function () {
        burst(r.left + r.width / 2, r.top + 20);
    }, 300);
}

function showSlide(n) {
    slides.forEach(function (s) { s.classList.remove("active"); });
    dots.forEach(function (d) { d.classList.remove("on"); });

    slides[n].classList.add("active");
    dots[n].classList.add("on");

    backBtn.style.visibility = (n === 0) ? "hidden" : "visible";
    nextBtn.textContent = (n === slides.length - 1) ? "Start Over" : "Next";

    resetCake();

    const last = (n === slides.length - 1);
    targetCount = last ? 80 : 35;
    heartRate = last ? 0.08 : 0.02;

    if (started) typeSlide(slides[n]);
}

function nextSlide() {
    if (!musicStarted) {
        music.play().then(function () {
            musicBtn.textContent = "Music: On";
        }).catch(function () {});
        musicStarted = true;
    }

    const r = nextBtn.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2);

    current = (current < slides.length - 1) ? current + 1 : 0;
    showSlide(current);
}

function prevSlide() {
    if (current > 0) {
        current--;
        showSlide(current);
    }
}

function toggleMusic() {
    if (music.paused) {
        music.play();
        musicBtn.textContent = "Music: On";
    } else {
        music.pause();
        musicBtn.textContent = "Music: Off";
    }
    musicStarted = true;
}

const photoView = document.getElementById("photoView");
const photoCount = document.getElementById("photoCount");
const gallery = document.getElementById("gallery");
const extensions = ["jpg", "jpeg", "png"];
const photoList = [];
let photoIndex = 0;

function findPhoto(n, e) {
    if (n > MAX_PHOTOS) {
        startGallery();
        return;
    }
    const img = new Image();
    img.onload = function () {
        photoList.push(img.src);
        findPhoto(n + 1, 0);
    };
    img.onerror = function () {
        if (e + 1 < extensions.length) {
            findPhoto(n, e + 1);
        } else {
            startGallery();
        }
    };
    img.src = "Photo " + n + "." + extensions[e];
}

function showPhoto(i) {
    photoView.style.opacity = 0;
    setTimeout(function () {
        photoView.src = photoList[i];
        photoView.style.transform = "rotate(" + (Math.random() * 6 - 3).toFixed(1) + "deg)";
        photoCount.textContent = (i + 1) + " / " + photoList.length;
        photoView.style.opacity = 1;
    }, 250);
}

function nextPhoto() {
    photoIndex = (photoIndex + 1) % photoList.length;
    showPhoto(photoIndex);
}

function startGallery() {
    if (photoList.length === 0) {
        gallery.style.display = "none";
        return;
    }
    photoView.src = photoList[0];
    photoView.style.transform = "rotate(-2deg)";
    photoCount.textContent = "1 / " + photoList.length;

    if (photoList.length > 1) {
        photoView.addEventListener("click", nextPhoto);
        setInterval(function () {
            if (started && current === GALLERY_SLIDE) {
                nextPhoto();
            }
        }, PHOTO_SECONDS * 1000);
    }
}

findPhoto(1, 0);

const canvas = document.getElementById("petals");
const ctx = canvas.getContext("2d");
const petalColors = ["#ff1744", "#d50000", "#b71c1c", "#ff5252", "#c62828", "#e53935", "#ff8a80"];
const heartColors = ["#ff1744", "#ff4d6d", "#ff8a95", "#ffb3bd"];
const fwColors = ["#ffe2b8", "#ff5252", "#ffd08a", "#ff8a95", "#ffffff", "#ffb74d"];

let particles = [];
let targetCount = 35;
let heartRate = 0.02;
let fallingCount = 0;

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

function rand(a, b) { return a + Math.random() * (b - a); }
function pick(list) { return list[Math.floor(Math.random() * list.length)]; }

function addPetal() {
    particles.push({
        type: "petal", burst: false,
        x: rand(0, canvas.width), y: -20,
        vx: 0, vy: rand(1, 3),
        size: rand(6, 14),
        angle: rand(0, 6), spin: rand(-0.03, 0.03),
        t: rand(0, 6), alpha: 0.9,
        color: pick(petalColors)
    });
}

function addHeart() {
    particles.push({
        type: "heart",
        x: rand(0, canvas.width), y: canvas.height + 20,
        vy: -rand(0.8, 2),
        size: rand(10, 22),
        t: rand(0, 6),
        color: pick(heartColors)
    });
}

function addSpark() {
    particles.push({
        type: "spark",
        x: rand(0, canvas.width), y: rand(0, canvas.height),
        size: rand(3, 8),
        life: 0, speed: rand(0.012, 0.025)
    });
}

function burst(x, y) {
    for (let i = 0; i < 28; i++) {
        const a = rand(0, Math.PI * 2);
        const s = rand(2, 7);
        particles.push({
            type: "petal", burst: true,
            x: x, y: y,
            vx: Math.cos(a) * s, vy: Math.sin(a) * s - 3,
            size: rand(5, 11),
            angle: rand(0, 6), spin: rand(-0.2, 0.2),
            t: 0, alpha: 1,
            color: pick(petalColors)
        });
    }
}

function firework(x, y) {
    const c = pick(fwColors);
    for (let i = 0; i < 36; i++) {
        const a = (i / 36) * Math.PI * 2 + rand(-0.1, 0.1);
        const s = rand(1.5, 4.5);
        particles.push({
            type: "fw",
            x: x, y: y,
            vx: Math.cos(a) * s, vy: Math.sin(a) * s,
            life: 1, color: c
        });
    }
}

function heartPath(s) {
    ctx.beginPath();
    ctx.moveTo(0, s / 4);
    ctx.bezierCurveTo(0, 0, -s / 2, 0, -s / 2, s / 4);
    ctx.bezierCurveTo(-s / 2, s / 2, 0, s * 0.7, 0, s * 0.9);
    ctx.bezierCurveTo(0, s * 0.7, s / 2, s / 2, s / 2, s / 4);
    ctx.bezierCurveTo(s / 2, 0, 0, 0, 0, s / 4);
    ctx.closePath();
}

function starPath(s) {
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.quadraticCurveTo(0, 0, s, 0);
    ctx.quadraticCurveTo(0, 0, 0, s);
    ctx.quadraticCurveTo(0, 0, -s, 0);
    ctx.quadraticCurveTo(0, 0, 0, -s);
    ctx.closePath();
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (fallingCount < targetCount && Math.random() < 0.5) addPetal();
    if (Math.random() < heartRate) addHeart();
    if (Math.random() < 0.06) addSpark();

    if (started && current === slides.length - 1 && Math.random() < 0.025) {
        firework(rand(canvas.width * 0.15, canvas.width * 0.85),
                 rand(canvas.height * 0.1, canvas.height * 0.5));
    }

    fallingCount = 0;

    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        let dead = false;

        ctx.save();

        if (p.type === "petal") {
            if (p.burst) {
                p.vy += 0.18;
                p.vx *= 0.985;
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= 0.012;
                if (p.alpha <= 0) dead = true;
            } else {
                fallingCount++;
                p.t += 0.03;
                p.y += p.vy;
                p.x += Math.sin(p.t) * 0.9;
            }
            if (p.y > canvas.height + 30) dead = true;
            p.angle += p.spin;

            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(p.alpha, 0);
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();

        } else if (p.type === "heart") {
            p.t += 0.03;
            p.y += p.vy;
            p.x += Math.sin(p.t) * 0.6;
            if (p.y < -30) dead = true;

            ctx.translate(p.x, p.y);
            ctx.translate(0, -p.size * 0.45);
            ctx.globalAlpha = Math.max(0, Math.min(0.85, p.y / (canvas.height * 0.35)));
            ctx.fillStyle = p.color;
            heartPath(p.size);
            ctx.fill();

        } else if (p.type === "spark") {
            p.life += p.speed;
            if (p.life >= 1) dead = true;

            ctx.translate(p.x, p.y);
            ctx.globalAlpha = Math.sin(Math.min(p.life, 1) * Math.PI);
            ctx.fillStyle = "#ffe2b8";
            starPath(p.size * (0.5 + p.life));
            ctx.fill();

        } else if (p.type === "fw") {
            p.vy += 0.04;
            p.vx *= 0.985;
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.015;
            if (p.life <= 0) dead = true;

            ctx.globalAlpha = Math.max(p.life, 0);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

        if (dead) particles.splice(i, 1);
    }

    requestAnimationFrame(animate);
}

showSlide(0);
animate();