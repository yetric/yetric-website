export const isAbsolute = (url) => !!/^https?:\/\//i.test(url);
export const analytics = () => {
    let ga = window[window['GoogleAnalyticsObject'] || 'ga'];
    return typeof ga === 'function' ? ga : () => {};
};
export const trackPageView = (path) => {
    analytics('set', 'page', path);
};

export const trackEvent = (category, action, label = null, value = null) => {
    analytics('send', 'event', category, action, label, value);
};

export const setAttributes = (elm, attr) => {
    for (let [key, value] of Object.entries(attr)) {
        elm.setAttribute(key, value);
    }
};
