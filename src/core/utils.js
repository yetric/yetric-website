export const isAbsolute = (url) => !!/^https?:\/\//i.test(url);
export const getTracker = () => {
    return 'ga' in window ? ga.getAll()[0] : null;
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
