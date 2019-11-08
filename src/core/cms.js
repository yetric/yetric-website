import {isAbsolute, setAttributes, trackPageView} from './utils';
import {triggerEvent, on} from './events';

let APP_ROUTES = [];
const appRoot = document.getElementById('app');
const pageCache = {};

export const prefetch = async (tpl, type) => {
    pageCache[tpl] = await import(`../${type}/${tpl}.md`);
    return true;
};

export const setAppContent = (html) => {
    appRoot.innerHTML = html;
};

export const setAppTitle = (title) => {
    document.title = title;
};

export const loadPage = async (tpl, type = 'pages') => {
    setAppContent('Laddar sida');
    try {
        let page = null;
        if (pageCache.hasOwnProperty(tpl)) {
            page = pageCache[tpl];
        } else {
            page = await import(`../${type}/${tpl}.md`);
            pageCache[tpl] = page;
        }
        setAppContent(page.html);
        setAppTitle(page.attributes.title || document.title);
    } catch (error) {
        loadPage('404').catch((error) => console.error('Error loading Error.', error));
    }
};

const routesToTraversable = (routes) =>
    Object.keys(routes)
        .sort((a, b) => b.length - a.length)
        .map((path) => ({
            path: new RegExp('^' + path.replace(/:[^\s/]+/g, '([\\w-]+)') + '$'),
            module: routes[path]
        }));

const matchRoute = (path, traversableRoutes) => {
    for (let i = 0, l = traversableRoutes.length; i < l; i++) {
        let found = path.match(traversableRoutes[i].path);
        if (found) {
            let module = traversableRoutes[i].module;
            let args = found.slice(1);
            return {
                module,
                args
            };
        }
    }
    return null;
};

const popStateHandler = async () => {
    await navigate(document.location.pathname);
};

const removeNavHandlers = () => {
    window.removeEventListener('popstate', popStateHandler);
    document.removeEventListener('click', navigateHandler);
};

export const navigate = async (path, doPushState = true) => {
    const route = matchRoute(path, APP_ROUTES);
    const {history} = window;
    if (route && typeof route.module === 'function') {
        triggerEvent(document, 'nav', {
            path
        });
        await route.module.apply(route.module, route.args);
    }
    if (doPushState) {
        history.pushState({}, null, path);
        window.scrollTo(0, 0);
        trackPageView(path);
    }
};

const navigateHandler = async (event) => {
    let {target} = event;
    if (target && target.tagName.toLowerCase() === 'a') {
        if (!isAbsolute(target.getAttribute('href'))) {
            event.preventDefault();
            await navigate(target.getAttribute('href'));
        } else {
            setAttributes(target, {
                target: '_blank',
                rel: 'noopener'
            });
        }
    }
};

export const nav = async (routes) => {
    APP_ROUTES = routesToTraversable(routes);
    const callbacks = [];

    window.addEventListener('popstate', popStateHandler);
    window.addEventListener('beforeunload', removeNavHandlers);
    document.addEventListener('click', navigateHandler);

    await navigate(document.location.pathname, false);

    on(document, 'nav', (event) => {
        callbacks.forEach((callback) => callback(event.detail));
    });

    return {
        onNav: (callback) => {
            callbacks.push(callback);
        }
    };
};
