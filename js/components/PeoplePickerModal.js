import { recordStore } from "../recordStore.js";

export class PeoplePickerModal {
    static open({ onSelect, title = "Select Project Contact" }) {
        const contacts = recordStore.getContacts();
        const body = `
            <div class="people-picker-shell">
                <div class="field">
                    <label for="contact-search-input" class="sr-only">Search contacts</label>
                    <div class="search-shell">
                        <i data-lucide="search"></i>
                        <input id="contact-search-input" type="search" class="input" placeholder="Search by name, company, or role..." autofocus>
                    </div>
                </div>
                <div class="contact-list" id="contact-list-container">
                    ${this.renderList(contacts)}
                </div>
                <div class="split" style="margin-top: 1rem; border-top: 1px solid var(--border-color); padding-top: 0.75rem;">
                    <span class="muted">${contacts.length} registered project contacts</span>
                    <button class="button small" id="btn-add-new-contact-inline" type="button"><i data-lucide="user-plus"></i>Add New Contact</button>
                </div>
            </div>
        `;

        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title,
                body,
                onSubmit: null
            }
        }));

        setTimeout(() => {
            const input = document.getElementById("contact-search-input");
            const listContainer = document.getElementById("contact-list-container");
            const addNewBtn = document.getElementById("btn-add-new-contact-inline");

            input?.addEventListener("input", () => {
                const term = input.value.trim().toLowerCase();
                const filtered = contacts.filter((c) =>
                    [c.name, c.company, c.role, c.discipline, c.email].some((f) => String(f || "").toLowerCase().includes(term))
                );
                listContainer.innerHTML = this.renderList(filtered);
                window.lucide?.createIcons();
            });

            listContainer?.addEventListener("click", (e) => {
                const item = e.target.closest("[data-contact-id]");
                if (!item) return;
                const contactId = item.dataset.contactId;
                const selected = contacts.find((c) => c.id === contactId);
                if (selected && onSelect) {
                    onSelect(selected);
                    const modalCloseBtn = document.getElementById("modal-close");
                    modalCloseBtn?.click();
                }
            });

            addNewBtn?.addEventListener("click", () => {
                this.openAddContactForm((newContact) => {
                    const created = recordStore.addContact(newContact);
                    if (onSelect) onSelect(created);
                    const modalCloseBtn = document.getElementById("modal-close");
                    modalCloseBtn?.click();
                });
            });

            window.lucide?.createIcons();
        }, 50);
    }

    static renderList(contacts) {
        if (!contacts.length) {
            return `<div class="empty-inline" style="padding: 1.5rem; text-align: center;">No matching contacts found.</div>`;
        }
        return contacts.map((c) => `
            <div class="contact-card-item" data-contact-id="${c.id}" role="button" tabindex="0">
                <div class="avatar-circle">${c.avatar || "CN"}</div>
                <div class="contact-meta">
                    <strong>${c.name}</strong>
                    <span class="subtext">${c.role} &bull; ${c.company}</span>
                    <span class="contact-email"><i data-lucide="mail"></i> ${c.email} &bull; ${c.phone || ''}</span>
                </div>
                <button class="button small primary" type="button" aria-label="Select ${c.name}">Select</button>
            </div>
        `).join("");
    }

    static openAddContactForm(onCreated) {
        const body = `
            <form id="new-contact-inline-form" class="record-form">
                <div class="field">
                    <label for="cnt-name">Full Name</label>
                    <input class="input" id="cnt-name" name="name" required placeholder="e.g. Jane Doe">
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="cnt-company">Company</label>
                        <input class="input" id="cnt-company" name="company" required placeholder="e.g. Apex Engineering">
                    </div>
                    <div class="field">
                        <label for="cnt-role">Role</label>
                        <input class="input" id="cnt-role" name="role" required placeholder="e.g. Structural Consultant">
                    </div>
                </div>
                <div class="form-grid">
                    <div class="field">
                        <label for="cnt-email">Email Address</label>
                        <input class="input" id="cnt-email" name="email" type="email" required placeholder="jane@apexeng.com">
                    </div>
                    <div class="field">
                        <label for="cnt-phone">Phone Number</label>
                        <input class="input" id="cnt-phone" name="phone" placeholder="(312) 555-0199">
                    </div>
                </div>
                <div class="split" style="margin-top: 1rem;">
                    <button class="button" type="button" onclick="document.getElementById('modal-close').click()">Cancel</button>
                    <button class="button primary" type="submit"><i data-lucide="check"></i> Save Contact</button>
                </div>
            </form>
        `;

        document.dispatchEvent(new CustomEvent("open-modal", {
            detail: {
                title: "Add Project Contact",
                body,
                onSubmit: (values) => {
                    if (onCreated) onCreated(values);
                }
            }
        }));
    }
}
