export class SearchBar {
    static render({ placeholder = "Search project records", id = "global-search" }) {
        return `
            <form class="search-shell" id="${id}-form" role="search">
                <i data-lucide="search"></i>
                <input id="${id}" type="search" placeholder="${placeholder}" autocomplete="off">
            </form>
        `;
    }
}
