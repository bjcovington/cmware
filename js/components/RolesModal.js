import { Roles } from "../roles.js";

export const RolesModal = {
  async open() {
    const roles = await Roles.list();
    const perms = await Roles.listPermissions();

    const body = `
      <div class="roles-modal-shell">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
          <div>
            <h3>Roles & Permissions</h3>
            <p class="muted">Create and manage configurable roles and assign permissions.</p>
          </div>
          <button class="button primary" id="btn-create-role"><i data-lucide="plus"></i> New Role</button>
        </div>

        <div class="split" style="gap:1rem;align-items:flex-start;">
          <div style="flex:1 1 45%;">
            <div class="card small" style="padding:0.5rem;">
              <div id="roles-list" class="roles-list">
                ${roles.map(r => `
                  <div class="role-item" data-role-id="${r.id}" style="padding:0.5rem;border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;">
                    <div>
                      <strong>${r.name}</strong>
                      <div class="muted" style="font-size:0.85rem;margin-top:2px;">${r.description || ''}</div>
                    </div>
                    <div>
                      <button class="button small secondary" data-edit-role-id="${r.id}">Edit</button>
                      <button class="button small danger" data-delete-role-id="${r.id}">Delete</button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <div style="flex:1 1 55%;">
            <div class="card small" style="padding:0.75rem;">
              <form id="form-role-editor">
                <div class="field">
                  <label for="role-name">Role Name</label>
                  <input class="input" id="role-name" name="name" required>
                </div>
                <div class="field">
                  <label for="role-desc">Description</label>
                  <input class="input" id="role-desc" name="description">
                </div>

                <div style="margin-top:0.5rem;">
                  <label class="muted">Permissions</label>
                  <div id="permissions-list" style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.5rem;margin-top:0.5rem;max-height:240px;overflow:auto;">
                    ${perms.map(p => `
                      <label class="checkbox-row"><input type="checkbox" data-perm-code="${p.code}"> ${p.description}</label>
                    `).join('')}
                  </div>
                </div>

                <div style="margin-top:0.75rem;text-align:right;">
                  <button class="button" type="button" id="btn-clear-role">Clear</button>
                  <button class="button primary" type="submit" id="btn-save-role"><i data-lucide="save"></i> Save Role</button>
                </div>
                <input type="hidden" id="editing-role-id">
              </form>
            </div>
          </div>
        </div>
      </div>
    `;

    document.dispatchEvent(new CustomEvent("open-modal", { detail: { title: "Roles & Permissions", body, onSubmit: null } }));

    // bind handlers after modal open
    setTimeout(() => {
      window.lucide?.createIcons();

      const refreshRolesList = async () => {
        const listEl = document.getElementById("roles-list");
        const items = await Roles.list();
        if (!listEl) return;
        listEl.innerHTML = items.map(r => `
          <div class="role-item" data-role-id="${r.id}" style="padding:0.5rem;border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;">
            <div>
              <strong>${r.name}</strong>
              <div class="muted" style="font-size:0.85rem;margin-top:2px;">${r.description || ''}</div>
            </div>
            <div>
              <button class="button small secondary" data-edit-role-id="${r.id}">Edit</button>
              <button class="button small danger" data-delete-role-id="${r.id}">Delete</button>
            </div>
          </div>
        `).join('');

        // rebind edit/delete
        listEl.querySelectorAll('[data-edit-role-id]').forEach((btn) => btn.addEventListener('click', async (e) => {
          const id = btn.dataset.editRoleId;
          const role = await Roles.get(id);
          if (!role) return;
          document.getElementById('role-name').value = role.name || '';
          document.getElementById('role-desc').value = role.description || '';
          document.getElementById('editing-role-id').value = role.id;
          // set permission checkboxes
          document.querySelectorAll('#permissions-list input[type=checkbox]').forEach(cb => {
            cb.checked = !!(role.permissions || []).includes(cb.dataset.permCode);
          });
        }));

        listEl.querySelectorAll('[data-delete-role-id]').forEach((btn) => btn.addEventListener('click', async () => {
          const id = btn.dataset.deleteRoleId;
          if (confirm('Delete this role? This action cannot be undone.')) {
            await Roles.remove(id);
            await refreshRolesList();
            document.dispatchEvent(new CustomEvent('toast', { detail: 'Role deleted.' }));
          }
        }));
      };

      document.getElementById('btn-create-role')?.addEventListener('click', () => {
        document.getElementById('form-role-editor')?.reset();
        document.getElementById('editing-role-id').value = '';
        document.querySelectorAll('#permissions-list input[type=checkbox]').forEach(cb => cb.checked = false);
      });

      document.getElementById('btn-clear-role')?.addEventListener('click', () => {
        document.getElementById('form-role-editor')?.reset();
        document.getElementById('editing-role-id').value = '';
        document.querySelectorAll('#permissions-list input[type=checkbox]').forEach(cb => cb.checked = false);
      });

      document.getElementById('form-role-editor')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('role-name').value.trim();
        const description = document.getElementById('role-desc').value.trim();
        const permissions = Array.from(document.querySelectorAll('#permissions-list input[type=checkbox]:checked')).map(cb => cb.dataset.permCode);
        const editingId = document.getElementById('editing-role-id').value;
        if (!name) return alert('Role name is required.');
        if (editingId) {
          await Roles.update(editingId, { name, description, permissions });
          document.dispatchEvent(new CustomEvent('toast', { detail: 'Role updated.' }));
        } else {
          await Roles.create({ name, description, permissions });
          document.dispatchEvent(new CustomEvent('toast', { detail: 'Role created.' }));
        }
        await refreshRolesList();
        // clear form
        document.getElementById('form-role-editor')?.reset();
        document.getElementById('editing-role-id').value = '';
      });

      // initial bindings for edit/delete
      refreshRolesList();
    }, 50);
  }
};
