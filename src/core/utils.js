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

export const getTracker = () => {
    return 'ga' in window ? ga.getAll()[0] : null;
};

export const fetchFeed = async (url) => {
    let response = await fetch(url);
    let xml = await response.text();
    let data = await new window.DOMParser().parseFromString(xml, 'text/xml');
    return Array.from(data.documentElement.getElementsByTagName('item')).map((item) => {
        let title = item.getElementsByTagName('title')[0].textContent;
        let description = item.getElementsByTagName('description')[0].textContent;
        let link = item.getElementsByTagName('link')[0].textContent;
        let published = item.getElementsByTagName('pubDate')[0].textContent;
        return {
            title,
            description,
            link,
            published: new Date(published).toLocaleDateString('sv-SE')
        };
    });
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
