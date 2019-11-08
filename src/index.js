import './style.scss';
import {loadBlogIndex, loadPage, nav} from './core/cms';
import {trackPageView} from './core/utils';
const pageView = async (name) => loadPage(name);
const postView = async (name) => loadPage(name, 'blog');
const homeView = async () => loadPage('home');
let lead = `<p class="lead">Read posts on our blog on Software Development, Game Development, Analytics, Metrics, User Experience, User Engagement, Onboarding and other pain points in the product development lifecycle</p>`;
let subheader = '<h3>Blog Posts</h3>';
let footer = '<p>You can find our blog here: <a href="https://yetric.net">yetric.net</a></p>';
const blogIndex = async () =>
    loadBlogIndex('https://yetric.net/rss.xml', lead, subheader, footer, 'Blog Posts from Yetric');

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
