export class Router {
    constructor(routes, documentRef) {
        this.routes = routes;
        this.document = documentRef;
        this.outlet = null;
        this.afterRoute = () => {};
    }

    mount(outlet, afterRoute) {
        this.outlet = outlet;
        this.afterRoute = afterRoute;
        window.addEventListener("hashchange", () => this.resolve());
        this.resolve();
    }

    resolve() {
        const hash = location.hash.replace(/^#\/?/, "");
        const [path = "dashboard", queryString = ""] = hash.split("?");
        const route = this.routes.find((item) => item.path === path) || this.routes[0];
        const params = new URLSearchParams(queryString);
        this.outlet.innerHTML = route.page.render({ route, params });
        route.page.bind?.({ route, params });
        this.afterRoute(route);
    }
}
