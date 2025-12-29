document.addEventListener('DOMContentLoaded', () => {
    // Current Scene Tracker
    let currentSceneId = 'page-welcome';
    const finalDate = new Date('January 1, 2026 00:00:00').getTime();

    // Generic Transition
    window.transitionToScene = (sceneId) => {
        const currentFunc = document.getElementById(currentSceneId);
        const nextFunc = document.getElementById(sceneId);

        if (!currentFunc || !nextFunc) return;

        // Current: Fade Out
        currentFunc.classList.remove('opacity-100', 'pointer-events-auto');
        currentFunc.classList.add('opacity-0', 'pointer-events-none');

        // Wait for fade out partially or just start fading in next?
        // Let's do a crossfade overlap or sequential.
        // Tailwind 'hidden' removal first, then opacity.

        nextFunc.classList.remove('hidden');

        // Timeout to allow display:block to apply
        setTimeout(() => {
            nextFunc.classList.remove('opacity-0', 'pointer-events-none');
            nextFunc.classList.add('opacity-100', 'pointer-events-auto');
        }, 50);

        // Hide the old one via display:none after transition
        setTimeout(() => {
            currentFunc.classList.add('hidden');
        }, 1000);

        currentSceneId = sceneId;
    };

    // --- Page 1: Welcome ---
    const welcomeScene = document.getElementById('page-welcome');
    welcomeScene.addEventListener('click', () => {
        const bgMusic = document.getElementById('bg-music');
        if (bgMusic && bgMusic.paused) {
            bgMusic.volume = 0.5;
            bgMusic.play().catch(e => console.log("Audio play failed:", e));
        }

        transitionToScene('page-countdown');
        startCountdown();
    });

    // --- Page 2: Countdown ---
    function startCountdown() {
        const display = document.getElementById('countdown-display');
        let interval = null;

        const updateTimer = () => {
            if (currentSceneId !== 'page-countdown') {
                if (interval) clearInterval(interval);
                return;
            }

            const now = new Date().getTime();
            const distance = finalDate - now;

            if (distance < 0) {
                clearInterval(interval);
                display.textContent = "00d 00h 00m 00s";
                transitionToScene('page-fireworks');
                playFireworks();
                return;
            }

            // Calculate days, hours, minutes, seconds
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Format with leading zeros and unit labels
            const pad = (num) => String(num).padStart(2, '0');

            // Display with units: DDd HHh MMm SSs
            display.textContent = `${pad(days)}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
        };

        updateTimer();
        interval = setInterval(updateTimer, 1000);
    }

    // New Continue Button Logic
    const btnCountdownContinue = document.getElementById('btn-countdown-continue');
    if (btnCountdownContinue) {
        btnCountdownContinue.onclick = () => {
            transitionToScene('page-fireworks');
            playFireworks();
        };
    }

    // --- Page 3: Fireworks ---
    function playFireworks() {
        const video = document.getElementById('fireworks-video');
        const hnyText = document.getElementById('happy-new-year');

        // Force reload the video to prevent freezing
        video.load();

        // Reset to beginning
        video.currentTime = 0;
        video.muted = false; // Unmute for effect if desired, or keep muted

        // Wait for video to be ready before playing
        const playVideo = () => {
            video.play().catch(e => {
                console.error("Video play failed", e);
                // If video fails, still show text and continue
                hnyText.classList.remove('hidden');
                setTimeout(() => {
                    if (currentSceneId === 'page-fireworks') {
                        transitionToScene('page-question');
                    }
                }, 3000);
            });
        };

        // Check if video is ready
        if (video.readyState >= 3) {
            // Video is ready to play
            playVideo();
        } else {
            // Wait for video to load
            video.addEventListener('canplay', playVideo, { once: true });
        }

        // Show Text after a moment
        setTimeout(() => {
            hnyText.classList.remove('hidden');
        }, 1000);

        // Transition to next page after video ends or after 15 seconds
        video.onended = () => {
            transitionToScene('page-question');
        };

        // Fallback if video loops or is long
        setTimeout(() => {
            if (currentSceneId === 'page-fireworks') {
                transitionToScene('page-question');
            }
        }, 15000);
    }

    // --- Page 4: Question ---
    const btnShowMemories = document.getElementById('btn-show-memories');
    if (btnShowMemories) {
        btnShowMemories.onclick = () => {
            transitionToScene('page-gallery');
        };
    }

    // --- Page 5: Gallery ---
    const btnNextCake = document.getElementById('btn-next-cake');
    if (btnNextCake) {
        btnNextCake.onclick = () => {
            transitionToScene('page-cake');
        };
    }

    // --- Page 6: Cake & Goals ---
    const goalInput = document.getElementById('goal-input');
    const addGoalBtn = document.getElementById('add-goal-btn');
    const candlesContainer = document.getElementById('candles-container');
    const btnFinishGoals = document.getElementById('btn-finish-goals');

    // Track candle positions to avoid overlap
    const candlePositions = [];

    function addCandle() {
        const text = goalInput.value.trim();
        if (!text) return;

        const candle = document.createElement('div');

        // Responsive sizing based on screen width
        const isMobile = window.innerWidth < 640; // sm breakpoint
        const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024;

        // Adjust candle size based on device
        let candleWidth = isMobile ? 'w-2' : isTablet ? 'w-2.5' : 'w-3';
        let candleHeight = isMobile ? 'h-8' : isTablet ? 'h-10' : 'h-12';

        candle.className = `candle absolute ${candleWidth} ${candleHeight} rounded-sm shadow-lg origin-bottom animate-[growIn_0.5s_ease-out] z-20`;
        candle.style.background = 'linear-gradient(to bottom, #fefCE8, #fcd34d)';

        // Find a position that doesn't overlap with existing candles
        let randomLeft, randomTop;
        let attempts = 0;
        const maxAttempts = 50;

        // Adjust minimum distance based on screen size
        const minDistance = isMobile ? 12 : isTablet ? 15 : 20;

        do {
            // Keep candles within the cake shape boundaries
            // Adjust positioning range based on screen size
            if (isMobile) {
                randomLeft = Math.floor(Math.random() * 50) + 25;  // 25% to 75% (tighter on mobile)
                randomTop = Math.floor(Math.random() * 45) + 20;   // 20% to 65%
            } else {
                randomLeft = Math.floor(Math.random() * 60) + 20;  // 20% to 80%
                randomTop = Math.floor(Math.random() * 50) + 15;   // 15% to 65%
            }

            attempts++;

            // Check if this position is too close to existing candles
            const tooClose = candlePositions.some(pos => {
                const distance = Math.sqrt(
                    Math.pow(pos.left - randomLeft, 2) +
                    Math.pow(pos.top - randomTop, 2)
                );
                return distance < minDistance;
            });

            if (!tooClose || attempts >= maxAttempts) {
                break;
            }
        } while (true);

        // Store this position
        candlePositions.push({ left: randomLeft, top: randomTop });

        candle.style.left = randomLeft + '%';
        candle.style.top = randomTop + '%';

        // Flame - responsive sizing
        const flame = document.createElement('div');
        const flameSize = isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2';
        const flameTop = isMobile ? '-top-2' : '-top-3';
        flame.className = `flame absolute ${flameTop} left-1/2 -translate-x-1/2 ${flameSize} bg-red-500 rounded-full shadow-[0_0_10px_#f59e0b] animate-[flicker_0.1s_infinite_alternate]`;

        // Text Label - responsive sizing and better visibility
        const label = document.createElement('div');
        const labelSize = isMobile ? 'text-[10px] px-1.5 py-0.5 mb-0.5' : isTablet ? 'text-xs px-2 py-1 mb-1' : 'text-xs px-2 py-1 mb-1';
        label.className = `absolute bottom-full left-1/2 -translate-x-1/2 ${labelSize} bg-black/90 rounded whitespace-nowrap text-white pointer-events-auto shadow-lg`;
        label.textContent = text;

        candle.appendChild(flame);
        candle.appendChild(label);
        candlesContainer.appendChild(candle);

        goalInput.value = '';

        // Haptic feedback on mobile (if supported)
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }

    if (addGoalBtn && goalInput) {
        addGoalBtn.onclick = addCandle;
        goalInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addCandle(); });
    }

    if (btnFinishGoals) {
        btnFinishGoals.onclick = () => {
            transitionToScene('page-final');
        };
    }

    // --- Page 7: Final ---
    // Just static text

    // Handle window resize for better responsiveness
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Update any dynamic elements if needed
            // This helps with orientation changes
            const isMobile = window.innerWidth < 640;
            const isTablet = window.innerWidth >= 640 && window.innerWidth < 1024;

            // Update body class for orientation
            if (window.innerHeight > window.innerWidth) {
                document.body.classList.add('portrait');
                document.body.classList.remove('landscape');
            } else {
                document.body.classList.add('landscape');
                document.body.classList.remove('portrait');
            }
        }, 250);
    });

    // Set initial orientation class
    if (window.innerHeight > window.innerWidth) {
        document.body.classList.add('portrait');
    } else {
        document.body.classList.add('landscape');
    }
});
