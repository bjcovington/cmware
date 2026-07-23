export class Badge {
    static render(label, tone = "neutral") {
        return `<span class="badge ${tone}">${label}</span>`;
    }
}
