import './style.scss';
import {loadPage, nav, setAppContent, setAppTitle} from './core/cms';
import {fetchFeed, trackPageView} from './core/utils';
const pageView = async (name) => loadPage(name);
const postView = async (name) => loadPage(name, 'blog');
const homeView = async () => loadPage('home');

const blogIndex = async () => {
    let feed = await fetchFeed('https://yetric.net/rss.xml');
    let links = feed.map((item) => {
        return `<li><a href="${item.link}">${item.title}</a> <small>(${item.published})</small></li>`;
    });
    let lead = `<p class="lead">Read posts on our blog on Software Development, Game Development, Analytics, Metrics, User Experience, User Engagement, Onboarding and other pain points in the product development lifecycle</p>`;
    let subheader = '<h3>Blog Posts</h3>';
    let footer = '<p>You can find our blog here: <a href="https://yetric.net">yetric.net</a></p>';
    let content = `<h1>Blog Posts from <em>Yetric</em></h1>${lead}${subheader}<ul>${links.join(
        ''
    )}</ul>${footer}`;
    setAppContent(content);
    setAppTitle('Blog Posts from Yetric Blog');
};

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
