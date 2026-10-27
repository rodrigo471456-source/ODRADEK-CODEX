// js/app.js - Orquestación del DOM, Navegación y Búsqueda

document.addEventListener('DOMContentLoaded', () => {

    // 1. SELECTORES DEL DOM
    const gridContainer = document.querySelector('.game-grid');
    const searchInput = document.querySelector('.search-input');
    const btnScan = document.querySelector('.btn-scan');
    const screenScanner = document.querySelector('.screen-scanner');
    const noResultsMsg = document.getElementById('no-results');
    const noFavoritesMsg = document.getElementById('no-favorites');
    const filterTags = document.querySelectorAll('.filter-tag');
    const btnLogin = document.getElementById('btn-login');
    const btnCatalogo = document.getElementById('btn-catalogo');
    const seccionCatalogo = document.getElementById('catalogo');
    const btnSugerencias = document.getElementById('btn-sugerencias');
    const searchConsole = document.querySelector('.search-console');
    let debounceTimer = null; // <-- CRONÓMETRO TÁCTICO

    // Función para actualizar la cifra numérica en el HUD de favoritos
    function updateFavoritesCounter() {
        const countSpan = document.getElementById('fav-count');
        if (!countSpan) return;

        const totalFavs = getStoredFavorites().length;
        countSpan.textContent = `[ ${totalFavs} ]`;
    }

function renderCatalog() {
        let cardsHTML = '';
        const currentFavorites = getStoredFavorites();

        for (const key in codexDatabase) {
            const game = codexDatabase[key];
            const isFav = currentFavorites.includes(key);
            const isRecommended = !!game.recommended;

            // Insignia del Mapache Táctico (solo si está recomendado)
            const mapacheBadgeHTML = isRecommended ? `
                <div class="badge-recommended" data-tooltip="[ APROBADO POR RODU // VERIFICADO ]" aria-label="Recomendado por Rodu">
                    <svg viewBox="0 0 24 24">
                        <polygon points="4,3 8,9 3,8" />
                        <polygon points="20,3 21,8 16,9" />
                        <polygon points="5,8 19,8 22,14 18,20 12,22 6,20 2,14" />
                        <path d="M 6,11 Q 9,13 12,12 Q 15,13 18,11 L 19,14 Q 15,16 12,14 Q 9,16 5,14 Z" fill="#0a0a0a" />
                        <circle cx="8.5" cy="12.5" r="1" fill="#00ff88" />
                        <circle cx="15.5" cy="12.5" r="1" fill="#00ff88" />
                        <polygon points="11,17 13,17 12,18.5" fill="#00ff88" />
                    </svg>
                </div>
            ` : '';

            // Generación de etiquetas de plataformas
            const tagsHTML = game.platforms.split('|').map(plat => {
                const p = plat.trim();
                const pLower = p.toLowerCase();
                let tagClass = 'tag';
                let label = p;

                if (pLower.includes('pc')) tagClass += ' tag-pc';
                else if (pLower.includes('playstation') || pLower.includes('ps')) tagClass += ' tag-ps';
                else if (pLower.includes('xbox')) tagClass += ' tag-xbox';
                else if (pLower.includes('switch') || pLower.includes('nintendo')) {
                    tagClass += ' tag-nintendo';
                    if (!pLower.includes('nintendo')) label = 'NINTENDO ' + p;
                }

                return `<span class="${tagClass}">${label}</span>`;
            }).join('');

            // Molde ÚNICO: incluye el atributo data-recommended, el mapache y todo el contenido
            cardsHTML += `
            <article class="game-card" style="display: flex;" data-id="${key}" data-keywords="${game.keywords || ''}" data-recommended="${isRecommended}">
                <div class="card-image">
                    <img src="${game.cardImage}" alt="${game.title}" width="300" loading="lazy">
                    <span class="game-badge">${game.badge.split('//')[0].trim()}</span>

                    ${mapacheBadgeHTML}

                    <button class="btn-fav ${isFav ? 'active' : ''}" data-id="${key}" title="${isFav ? 'Retirar de favoritos' : 'Fijar en favoritos'}" aria-label="Favorito">
                        <svg viewBox="0 0 24 24">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                    </button>
                </div>
                <div class="card-content">
                    <div class="card-tags">${tagsHTML}</div>
                    <h3>${game.title}</h3>
                    <p class="card-excerpt">${game.lore.replace(/<[^>]*>?/gm, '').substring(0, 110)}...</p>
                    <div class="card-footer">
                        <span class="card-metric">Dificultad <strong>${game.difficulty.split('//')[0]}</strong></span>
                        <a href="codex.html?id=${key}" class="btn-card">ACCEDER AL CODEX</a>
                    </div>
                </div>
            </article>
            `;
        }

        gridContainer.innerHTML = cardsHTML;
    }

    // Ejecuta la carga inicial de tarjetas y sincroniza el contador
    renderCatalog();
    updateFavoritesCounter();

// 3. FILTRADO CENTRAL (BUSCADOR + CATEGORÍAS)
    const gameCards = document.querySelectorAll('.game-card');

    function filterGames() {
        const query = searchInput.value.toLowerCase().trim();

        // Easter Egg: Protocolo Mapache
        if (query === "mapache" || query === "lyrod" || query === "rodu") {
            document.getElementById('mapache-protocol').style.display = 'flex';
            playTechSound(150, 'sawtooth', 0.8, 0.1);
            searchInput.value = '';
            return;
        }

        let cartasVisibles = 0;
        const activeFilter = document.querySelector('.filter-tag.active');
        const selectedPlatform = activeFilter ? activeFilter.getAttribute('data-platform') : 'all';
        const favoritesList = getStoredFavorites();

        gameCards.forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const platforms = card.querySelector('.card-tags').textContent.toLowerCase();
            const keywords = card.getAttribute('data-keywords').toLowerCase();
            const cardId = card.getAttribute('data-id');

            const matchesSearch = title.includes(query) || platforms.includes(query) || keywords.includes(query);

            // Evaluación de categoría (dentro del bucle donde sí existen card y cardId)
            let matchesCategory = false;
            if (selectedPlatform === 'all') {
                matchesCategory = true;
            } else if (selectedPlatform === 'favorites') {
                matchesCategory = favoritesList.includes(cardId);
            } else if (selectedPlatform === 'recommended') {
                matchesCategory = card.getAttribute('data-recommended') === 'true';
            } else {
                matchesCategory = platforms.includes(selectedPlatform);
            }

            if (matchesSearch && matchesCategory) {
                card.style.display = 'flex';
                cartasVisibles++;
            } else {
                card.style.display = 'none';
            }
        });

        // Manejo de pantallas de alerta
        if (cartasVisibles === 0) {
            if (selectedPlatform === 'favorites' && query === '') {
                noFavoritesMsg.style.display = 'block';
                noResultsMsg.style.display = 'none';
            } else {
                noResultsMsg.style.display = 'block';
                noFavoritesMsg.style.display = 'none';
                playTechSound(220, 'sawtooth', 0.2, 0.04);
            }
        } else {
            noResultsMsg.style.display = 'none';
            noFavoritesMsg.style.display = 'none';
        }
    }

    // Eventos de Búsqueda
searchInput.addEventListener('input', () => {
        // 1. Encendemos el HUD de escaneo en la barra de inmediato
        if (searchConsole) {
            searchConsole.classList.add('is-scanning');
        }

        // 2. Si el usuario sigue tecleando, reiniciamos la cuenta regresiva
        clearTimeout(debounceTimer);

        // 3. Esperamos 300ms de calma para disparar la búsqueda real
        debounceTimer = setTimeout(() => {
            filterGames();

            // 4. Apagamos la animación cuando la búsqueda termina
            if (searchConsole) {
                searchConsole.classList.remove('is-scanning');
            }
        }, 300);
    });

    // Eventos de Filtro de Plataforma
    filterTags.forEach(btn => {
        btn.addEventListener('mouseenter', () => playTechSound(1200, 'sine', 0.1, 0.03));
        btn.addEventListener('click', () => {
            filterTags.forEach(t => t.classList.remove('active'));
            btn.classList.add('active');
            playTechSound(1000, 'sine', 0.08, 0.04);
            filterGames();
        });
    });

    // 4. DELEGACIÓN DE EVENTOS: BOTÓN DE FAVORITO
   gridContainer.addEventListener('click', (e) => {
        const favBtn = e.target.closest('.btn-fav');
        if (!favBtn) return;

        e.preventDefault();
        e.stopPropagation();

        const gameId = favBtn.getAttribute('data-id');
        const isNowFav = toggleFavoriteGame(gameId);
        
        // 1. OBTENER INFORMACIÓN DEL JUEGO DESDE LA BASE DE DATOS
        const gameData = codexDatabase[gameId];
        const gameTitle = gameData ? gameData.title : 'EXPEDIENTE';

        // Actualización de estado y contador reactivo en el clic
        favBtn.classList.toggle('active', isNowFav);
        favBtn.setAttribute('title', isNowFav ? 'Retirar de favoritos' : 'Fijar en favoritos');
        updateFavoritesCounter();

        // 2. DISPARO DE SONIDO Y NOTIFICACIÓN TÁCTICA HUD
        if (isNowFav) {
            playTechSound(950, 'sine', 0.1, 0.05);
            setTimeout(() => playTechSound(1400, 'sine', 0.12, 0.05), 60);

            if (typeof HUDToast !== 'undefined') {
                HUDToast.show({
                    title: gameTitle,
                    message: "[ EXPEDIENTE VINCULADO AL CODEX ]",
                    type: "sync"
                });
            }
        } else {
            playTechSound(420, 'sawtooth', 0.15, 0.04);

            if (typeof HUDToast !== 'undefined') {
                HUDToast.show({
                    title: gameTitle,
                    message: "[ EXPEDIENTE DESVINCULADO ]",
                    type: "remove"
                });
            }
        }

        // Si estamos viendo solo favoritos y retiramos uno, ocultar la tarjeta en vivo
        const activeFilter = document.querySelector('.filter-tag.active');
        if (activeFilter && activeFilter.getAttribute('data-platform') === 'favorites') {
            const parentCard = favBtn.closest('.game-card');
            if (parentCard && !isNowFav) {
                parentCard.style.display = 'none';
                const visibles = Array.from(gameCards).filter(c => c.style.display !== 'none');
                noResultsMsg.style.display = visibles.length === 0 ? 'block' : 'none';
            }
        }
    });

    // 5. SESIÓN DE AGENTE (LOGIN)
    function updateLoginUI(agentName) {
        if (agentName) {
            btnLogin.textContent = `[ AGENTE: ${agentName.toUpperCase()} ]`;
            btnLogin.style.color = '#00c0ff';
            btnLogin.style.borderColor = '#00c0ff';
        } else {
            btnLogin.textContent = "INICIAR SESIÓN";
            btnLogin.style.color = "var(--neon-orange)";
            btnLogin.style.borderColor = "var(--neon-orange)";
        }
    }

    const savedAgent = getStoredAgent();
    if (savedAgent) updateLoginUI(savedAgent);

    btnLogin.addEventListener('click', (e) => {
        e.preventDefault();

        if (getStoredAgent()) {
            if (confirm("¿Deseas cerrar tu conexión actual con la Red Quiral?")) {
                clearAgentSession();
                updateLoginUI(null);
                playTechSound(300, 'sawtooth', 0.15, 0.05);
            }
        } else {
            const agentName = prompt("IDENTIFICACIÓN REQUERIDA // Ingresa tu alias de operador:");
            const saved = saveAgent(agentName);
            if (saved) {
                updateLoginUI(saved);
                playTechSound(1200, 'sine', 0.15, 0.05);
            }
        }
    });

    // 6. CONTROLADORES SECUNDARIOS (SCROLL, SUGERENCIAS, EASTER EGG)
    btnCatalogo.addEventListener('click', (e) => {
        e.preventDefault();
        playTechSound(600, 'sine', 0.1, 0.05);

        const targetPosition = seccionCatalogo.getBoundingClientRect().top + window.scrollY;
        const startPosition = window.scrollY;
        const distance = targetPosition - startPosition;
        const duration = 800;
        let startTimestamp = null;

        function step(timestamp) {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = timestamp - startTimestamp;
            const percentage = Math.min(progress / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - percentage, 4);

            window.scrollTo(0, startPosition + (distance * easeOutQuart));

            if (progress < duration) window.requestAnimationFrame(step);
        }

        window.requestAnimationFrame(step);
    });

    btnSugerencias.addEventListener('click', (e) => {
        e.preventDefault();
        playTechSound(800, 'square', 0.1, 0.05);
        const asunto = encodeURIComponent("Reporte de Inteligencia - Odradek");
        const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1&to=rodrigo471456@gmail.com&su=${asunto}`;
        window.open(gmailURL, '_blank');
    });

    document.getElementById('btn-cerrar-mapache').addEventListener('click', () => {
        document.getElementById('mapache-protocol').style.display = 'none';
        playTechSound(800, 'sine', 0.1, 0.05);
    });

    // 7. SINCRONIZACIÓN AL VOLVER CON EL BOTÓN ATRÁS (DENTRO DEL SCOPE)
    window.addEventListener('pageshow', () => {
        updateFavoritesCounter();
        const favs = getStoredFavorites();
        document.querySelectorAll('.btn-fav').forEach(btn => {
            const id = btn.getAttribute('data-id');
            const isFav = favs.includes(id);
            btn.classList.toggle('active', isFav);
            btn.setAttribute('title', isFav ? 'Retirar de favoritos' : 'Fijar en favoritos');
        });
    });

});

// Listener global de Hotkeys para index.html
document.addEventListener('keydown', (e) => {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;

    if (e.key === '/' && document.activeElement !== searchInput){
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
    }
if (e.key === 'Escape') {
    if (searchInput.value !=='') {
        searchInput.value = '';
        
// Disparar evento input para actualizar la vista del catálogo

        searchInput.dispatchEvent(new Event('input'));
            searchInput.blur();
        }
    }
});