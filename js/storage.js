// js/storage.js - Controlador de Memoria Persistente (Red Quiral)

const STORAGE_KEYS = {
    AGENT: 'odradek_agent',
    FAVORITES: 'odradek_favorites'
};

// --- MÓDULO DE FAVORITOS ---

function getStoredFavorites() {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.FAVORITES);
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error("Error al leer favoritos en memoria:", e);
        return [];
    }
}

function isGameFavorite(gameId) {
    return getStoredFavorites().includes(gameId);
}

function toggleFavoriteGame(gameId) {
    let favorites = getStoredFavorites();
    const index = favorites.indexOf(gameId);
    let isNowFavorite = false;

    if (index === -1) {
        favorites.push(gameId);
        isNowFavorite = true;
    } else {
        favorites.splice(index, 1);
        isNowFavorite = false;
    }

    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    return isNowFavorite;
}

// --- MÓDULO DE SESIÓN DE AGENTE ---

function getStoredAgent() {
    return localStorage.getItem(STORAGE_KEYS.AGENT);
}

function saveAgent(agentName) {
    if (agentName && agentName.trim() !== "") {
        localStorage.setItem(STORAGE_KEYS.AGENT, agentName.trim());
        return agentName.trim();
    }
    return null;
}

function clearAgentSession() {
    localStorage.removeItem(STORAGE_KEYS.AGENT);
}