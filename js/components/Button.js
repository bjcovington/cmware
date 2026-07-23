export class Button {
    static render({ label, icon = "plus", variant = "", id = "", type = "button" }) {
        return `<button class="button ${variant}" type="${type}" ${id ? `id="${id}"` : ""}><i data-lucide="${icon}"></i>${label}</button>`;
    }
}

export class FloatingActionButton {
    static render({ label, icon, id }) {
        return `<button class="button primary fab" type="button" id="${id}" aria-label="${label}" title="${label}"><i data-lucide="${icon}"></i>${label}</button>`;
    }
}
