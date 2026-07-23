export class Toast {
    render() {
        return `<div class="toast-region" id="toast-region" aria-live="assertive"></div>`;
    }

    bind() {
        this.region = document.getElementById("toast-region");
        document.addEventListener("toast", (event) => this.show(event.detail));
    }

    show(message) {
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.textContent = message;
        this.region.appendChild(toast);
        setTimeout(() => toast.remove(), 3200);
    }
}
