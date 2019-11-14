import {
    fetchFeed,
    isAbsolute,
    isCustomProtocol,
    isExistingPath,
    setAttributes,
    trackPageView
} from './utils';
import {triggerEvent, on} from './events';

let APP_ROUTES = [];
const appRoot = document.getElementById('app');
const pageCache = {};

export const prefetch = async (tpl, type) => {
    pageCache[tpl] = await import(`../${type}/${tpl}.md`);
    return true;
};
export const onError = (error) => {
    console.error(error);
};
/* WiP - Handle 404 with noindex meta tag */
export const injectToHead = (elm) => {
    document.getElementsByTagName('head')[0].appendChild(elm);
};

export const setMetaTag = (metaType, value) => {
    const metaTag = document.createElement('meta');
    setAttributes(metaTag, {
        name: metaType,
        content: value
    });
    injectToHead(metaTag);
};

export const removeMetaTag = (metaType, value) => {
    const tag = document.querySelector(`[name="${metaType}"][content="${value}"]`);
    tag && tag.remove();
};

export const handle404 = async (error) => {
    const fourOhFour = await import(`../pages/404.md`);
    setMetaTag('robots', 'noindex');
    setAppTitle(fourOhFour.attributes.title || document.title);
    setAppContent(fourOhFour.html);
    onError(error);
};

export const setAppContent = (html) => {
    appRoot.innerHTML = html;
};

export const setAppTitle = (title) => {
    document.title = title;
};

const parseForImages = (page) => {
    return page;
};

const injectImage = (html, img) => {
    return html.replace('<!--img-->', `<div class="page-img"><img src="${img}" /></div>`);
};

export const loadBlogIndex = async (
    feedURL,
    lead = '',
    subheader = '',
    footer = '',
    title = ''
) => {
    let feed = await fetchFeed(feedURL);
    let links = feed.map((item) => {
        return `<li><a href="${item.link}">${item.title}</a> <small>(${item.published})</small></li>`;
    });

    let content = `<h1>Blog Posts</h1>${lead}${subheader}<ul>${links.join('')}</ul>${footer}`;
    setAppContent(content);
    setAppTitle(title);
};

export const loadPage = async (tpl, type = 'pages') => {
    setAppContent('Loading ...');
    try {
        let page = null;
        if (pageCache.hasOwnProperty(tpl)) {
            page = pageCache[tpl];
        } else {
            page = await import(`../${type}/${tpl}.md`);
            page = parseForImages(page);
            pageCache[tpl] = page;
        }

        const img = page.attributes.img;
        let html = page.html;
        if (img) {
            const myImg = require('../' + img);
            html = injectImage(html, myImg);
        }

        removeMetaTag('robots', 'noindex');
        setAppContent(html);
        setAppTitle(page.attributes.title || document.title);
    } catch (error) {
        await handle404(error);
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
            return {
                module,
                args: found.slice(1)
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
        const href = target.getAttribute('href');
        if (!isAbsolute(href) && !isExistingPath(href) && !isCustomProtocol(url)) {
            event.preventDefault();
            return await navigate(href);
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
    window.addEventListener('beforeunload', () => {
        removeNavHandlers();
        callbacks.length = 0;
    });
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
