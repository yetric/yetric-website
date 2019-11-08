import './style.scss';
import {loadBlogIndex, loadPage, nav} from './core/cms';
import {trackPageView} from './core/utils';
const pageView = async (name) => loadPage(name);
const postView = async (name) => loadPage(name, 'blog');
const homeView = async () => loadPage('home');
const blogIndex = async () => loadBlogIndex('https://yetric.net/rss.xml');

(async () => {
    const cms = await nav({
        '/': homeView,
        '/posts': blogIndex,
        '/:page': pageView,
        '/blog/:post': postView
    });
    cms.onNav((event) => {
        trackPageView(event.path);
    });
})();
