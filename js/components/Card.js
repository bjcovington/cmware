export class Card {
    static render({ title = "", eyebrow = "", body = "", actions = "" }) {
        return `
            <section class="card">
                ${(title || actions) ? `<div class="card-header"><div>${eyebrow ? `<div class="eyebrow">${eyebrow}</div>` : ""}<h2>${title}</h2></div>${actions}</div>` : ""}
                ${body}
            </section>
        `;
    }
}

export class MetricCard {
    static render([label, value, detail, tone]) {
        return `
            <section class="card metric-card">
                <span class="eyebrow">${label}</span>
                <strong class="metric-value">${value}</strong>
                <span class="metric-trend ${tone}"><i data-lucide="activity"></i>${detail}</span>
            </section>
        `;
    }
}
