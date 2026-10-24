const HUDToast = (() => {
    let container = null;

    const initContainer = () => {
        if (!container) {
            container = document.getElementById("hud-toast-container");
            if (!container) {
                container = document.createElement("div");
                container = document.createElement("div");
                container.id = "hud-toast-container";
                container.className = "hud-toast-container";
                document.body.appendChild(container);
            }
        }
    };

    /** 
     * @param {Object} options
     * @param {string} options.title 
     * @param {string} options.message 
     * @param {('sync'|'remove'|'alert')} [options.type='sync'] 
     * @param {number} [options.duration=3500]
*/

    const show = ({ title, message, type = "sync", duration = 3500 }) => {
        initContainer();
        
        if (container && container.children.length >= 3) {
    dismiss(container.firstElementChild);
}

        const toast = document.createElement("div");
        toast.className = `hud-toast hud-toast-${type}`;

        const typeLabels = {
            sync: "// CODEX SYNC // REGISTRO VINCULADO",
            remove: "// CODEX PURGE // MEMORIA LIBERADA",
            alert: "// ALERTA DE SISTEMA // PROTOCOLO ACTIVO"
        };

        const headerLabel = typeLabels[type] || "// NOTIFICACIÓN TÁCTICA";

        toast.innerHTML = `
            <div class="hud-toast-corner"></div>
            <div class="hud-toast-header">
                <span class="hud-toast-dot"></span>
                <span class="hud-toast-tag">${headerLabel}</span>
            </div>
            <div class="hud-toast-body">
                <h4 class="hud-toast-title">${title}</h4>
               <p class="hud-toast-msg">${message}</p>
            </div>
            <div class="hud-toast-progress" style="animation-duration: ${duration}ms;"></div>
        `;

        toast.addEventListener("click", () => dismiss(toast));

        container.appendChild(toast);

    
        setTimeout(() => {
            dismiss(toast);
        }, duration);
    };

    const dismiss = (toast) => {
        if (toast.classList.contains("hud-toast-out")) return;
        toast.classList.add("hud-toast-out");
        toast.addEventListener("animationend", () => {
            toast.remove();
        });
    };

    return { show };
})();