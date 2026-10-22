// js/codex.js - Controlador de la Terminal del Codex

document.addEventListener('DOMContentLoaded', () => {
    // 1. OBTENCIÓN DEL IDENTIFICADOR DESDE LA URL
    const urlParams = new URLSearchParams(window.location.search);
    const gameKey = urlParams.get('id') || 'deathstranding';
    const selectedGame = codexDatabase[gameKey];

    // 2. ELEMENTOS DEL DOM
    const gameTitle = document.getElementById('game-title');
    const gameBadge = document.getElementById('game-badge');
    const gameImg = document.getElementById('game-img');
    const gamePlatforms = document.getElementById('game-platforms');
    const gameDifficulty = document.getElementById('game-difficulty');
    const gameCampaign = document.getElementById('game-campaign');
    const gamePlatinum = document.getElementById('game-platinum');
    const gameBuild = document.getElementById('game-build');
    const gameEngine = document.getElementById('game-engine');
    const gameLore = document.getElementById('game-lore');
    const gameTips = document.getElementById('game-tips');
    const gameArsenal = document.getElementById('game-arsenal');
    const gameThreats = document.getElementById('game-amenazas');
    const btnCodexFav = document.getElementById('btn-codex-fav');

    // 3. POBLACIÓN DEFENSIVA DE TELEMETRÍA
    if (selectedGame) {
        gameTitle.textContent = selectedGame.title;
        gameBadge.textContent = selectedGame.badge;
        gameImg.src = selectedGame.image;
        gamePlatforms.textContent = selectedGame.platforms;
        gameDifficulty.textContent = selectedGame.difficulty;
        document.title = `ODRADEK - ${selectedGame.title}`;

        gameCampaign.textContent = selectedGame.campaignTime || "EN ESCANEO...";
        gamePlatinum.textContent = selectedGame.platinumTime || "EN ESCANEO...";
        gameBuild.textContent = selectedGame.metaBuild || "CLASIFICADO";
        gameEngine.textContent = selectedGame.engine || "DESCONOCIDO";

        gameLore.innerHTML = selectedGame.lore || "Sin registros en la Red Quiral.";
        gameTips.innerHTML = selectedGame.tips || "Directivas de combate pendientes de sincronización.";
        gameArsenal.innerHTML = selectedGame.arsenal || "Armamento táctico en proceso de desencriptación.";
        gameThreats.innerHTML = selectedGame.threats || "Perfiles hostiles en análisis.";

        // 4. CONTROL DEL BOTÓN DE FAVORITO EN EL CODEX
        function updateFavButtonUI(isFav) {
            if (isFav) {
                btnCodexFav.classList.add('active');
                btnCodexFav.innerHTML = `<span class="fav-icon">★</span> <span class="fav-label">EXPEDIENTE FIJADO</span>`;
                btnCodexFav.setAttribute('title', 'Retirar expediente de favoritos');
            } else {
                btnCodexFav.classList.remove('active');
                btnCodexFav.innerHTML = `<span class="fav-icon">☆</span> <span class="fav-label">FIJAR EN FAVORITOS</span>`;
                btnCodexFav.setAttribute('title', 'Fijar expediente en memoria rápida');
            }
        }

        // Estado inicial según memoria
        updateFavButtonUI(isGameFavorite(gameKey));

        btnCodexFav.addEventListener('click', () => {
            const isNowFav = toggleFavoriteGame(gameKey);
            updateFavButtonUI(isNowFav);

            if (isNowFav) {
                playTechSound(950, 'sine', 0.1, 0.05);
                setTimeout(() => playTechSound(1400, 'sine', 0.12, 0.05), 60);
            } else {
                playTechSound(420, 'sawtooth', 0.15, 0.04);
            }
        });

    } else {
        // Estado 404: Expediente no localizado
        gameTitle.textContent = "ERROR 404 // REGISTRO NO ENCONTRADO";
        gameBadge.textContent = "ACCESO DENEGADO";
        gameLore.innerHTML = "El identificador solicitado no existe en la base de datos del Odradek.";
        gameImg.style.display = 'none';
        btnCodexFav.style.display = 'none';
    }

    // 5. NAVEGACIÓN ENTRE PESTAÑAS (TABS) - SIN DUPLICIDAD
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetContent = document.getElementById('tab-' + targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }

            playTechSound(900, 'sine', 0.08, 0.05);
        });
    });
});