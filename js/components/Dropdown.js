export class Dropdown {
    static render({ label, options, id }) {
        return `
            <label class="field ${id === "project-select" ? "project-select" : ""}">
                <span class="sr-only">${label}</span>
                <select id="${id}" class="select">
                    ${options.map((option) => `<option value="${option.id}">${option.name}</option>`).join("")}
                </select>
            </label>
        `;
    }
}
