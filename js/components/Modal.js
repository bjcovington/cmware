export class Modal {
    render() {
        return `
            <div class="modal-backdrop" id="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                <section class="modal">
                    <div class="modal-header">
                        <h2 id="modal-title"></h2>
                        <button class="icon-button" type="button" id="modal-close" aria-label="Close"><i data-lucide="x"></i></button>
                    </div>
                    <div id="modal-body"></div>
                </section>
            </div>
        `;
    }

    bind() {
        this.backdrop = document.getElementById("modal-backdrop");
        this.title = document.getElementById("modal-title");
        this.body = document.getElementById("modal-body");
        this.onSubmit = null;
        document.getElementById("modal-close").addEventListener("click", () => this.close());
        this.backdrop.addEventListener("click", (event) => {
            if (event.target === this.backdrop) this.close();
        });
        this.backdrop.addEventListener("submit", (event) => {
            if (!this.onSubmit) return;
            event.preventDefault();
            const values = Object.fromEntries(new FormData(event.target).entries());
            this.onSubmit(values);
            this.close();
        });
        this.body.addEventListener("click", (event) => {
            const action = event.target.closest("[data-toast]");
            if (action) {
                document.dispatchEvent(new CustomEvent("toast", { detail: action.dataset.toast }));
                this.close();
            }
        });
    }

    open({ title, body, onSubmit = null }) {
        this.title.textContent = title;
        this.body.innerHTML = body;
        this.onSubmit = onSubmit;
        this.backdrop.classList.add("open");
        window.lucide?.createIcons();
    }

    close() {
        this.backdrop.classList.remove("open");
        this.onSubmit = null;
    }
}
