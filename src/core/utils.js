export const isAbsolute = (url) => !!/^https?:\/\//i.test(url);
export const isExistingPath = (href) => {
    const avoidPushURLs = ['/rss.xml', '/sitemap.xml'];
    return avoidPushURLs.indexOf(href) > -1;
};
export const isCustomProtocol = (url) => {
    const protocols = ['mailto', 'ftp', 'file', 'nntp', 'telnet', 'gopher'];
    for (let i = 0; i < protocols.length; i++) {
        const protocol = protocols[i];
        if (url.startsWith(`${protocol}:`)) {
            return true;
        }
    }
    return false;
};

export const isPushStateURL = (href) =>
    !isAbsolute(href) && !isExistingPath(href) && !isCustomProtocol(href);

export const getTracker = () => {
    return 'ga' in window ? ga.getAll()[0] : null;
};

export const getChildContent = (item, child) => {
    return item.getElementsByTagName(child)[0].textContent;
};

export const getChilds = (item, children) => {
    let props = {};
    children.forEach((key) => {
        props[key] = getChildContent(item, key);
    });
    return props;
};

export const stripHTML = (text) => {
    var tmp = document.createElement('DIV');
    tmp.innerHTML = text;
    return tmp.textContent || tmp.innerText || '';
};

export const doExcerpt = (text, length = 160) => {
    text = stripHTML(text);
    return text.substr(0, text.lastIndexOf(' ', length)) + '...';
};

export const parseFeedItem = (item) => {
    let props = getChilds(item, ['title', 'description', 'link', 'pubDate', 'content:encoded']);
    props.published = new Date(props.pubDate).toLocaleDateString('sv-SE');
    props.content = props['content:encoded'];
    props.excerpt = doExcerpt(props.content);

    delete props['pubDate'];
    delete props['content:encoded'];

    return props;
};

export const fetchFeed = async (url) => {
    let response = await fetch(url);
    let xml = await response.text();
    let data = await new window.DOMParser().parseFromString(xml, 'text/xml');
    const items = Array.from(data.documentElement.getElementsByTagName('item'));
    return items.map((item) => parseFeedItem(item));
};

export const send = (...args) => {
    const tracker = getTracker();
    tracker && tracker.send.apply(tracker, args);
};
export const trackPageView = (path) => {
    send('pageview', path);
};

export const trackEvent = (category, action, label = null, value = null) => {
    send('event', category, action, label, value);
};

export const setAttributes = (element, attrs) => {
    for (let key in attrs) {
        if (attrs.hasOwnProperty(key)) {
            element.setAttribute(key, attrs[key]);
        }
    }
};
