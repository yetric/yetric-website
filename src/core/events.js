export const triggerEvent = (el, eventType, detail) =>
    el.dispatchEvent(new CustomEvent(eventType, {detail}));

export const on = (el, evt, fn, opts = {}) => {
    const delegatorFn = (e) => e.target.matches(opts.target) && fn.call(e.target, e);
    el.addEventListener(evt, opts.target ? delegatorFn : fn, opts.options || false);
    if (opts.target) return delegatorFn;
};

export const off = (el, evt, fn, opts = false) => el.removeEventListener(evt, fn, opts);
