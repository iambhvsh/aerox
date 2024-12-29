const RSS_FEEDS = [
  'https://simpleflying.com/feed/',
  'https://www.australianaviation.com.au/feed/',
  'https://www.avweb.com/feed/',
  'https://www.aero-news.net/feed/',
  'https://aerotimemagazine.com/feed/',
  'https://theaviationist.com/feed/',
  'https://airlinereporter.com/feed/',
  'https://www.ex-yuaviation.com/feeds/posts/default?alt=rss',
  'https://www.flightaware.com/news/rss',
  'https://www.ainonline.com/rss.xml',
  'https://www.airsoc.com/rss/news',
  'https://www.flightglobal.com/rss/all-channels.xml',
  'https://www.aviation24.be/feed/',
  'https://www.airdatanews.com/feed/',
  'https://airwaysmag.com/feed/',
  'https://www.aviationpros.com/rss/',
  'https://www.businessairnews.com/rss.html',
  'https://www.aerotime.aero/rss',
  'https://www.aviator.aero/rss/news.xml',
  'https://www.airlineratings.com/feed/',
  'https://www.samchui.com/feed/',
  'https://www.futureflight.aero/rss.xml',
  'https://www.ch-aviation.com/portal/rss/news',
  'https://www.runwaygirlnetwork.com/feed/',
  'https://www.aeroinside.com/rss/news',
  'https://www.askthepilot.com/feed/',
  'https://www.aopa.org/rss/news.xml',
  'https://www.flyer.co.uk/feed/',
  'https://robbreport.com/tag/aviation/feed/',
  'https://www.airforce-technology.com/feed/',
  'https://www.seattletimes.com/tag/boeing/feed/',
  'https://www.airlinerwatch.com/feeds/posts/default?alt=rss',
  'https://www.aircraftinteriorsinternational.com/feed',
  'https://www.flightglobal.com/rss/military',
  'https://www.aviationtoday.com/feed/',
  'https://www.aircargoweek.com/feed/',
  'https://www.aviationweek.com/rss',
  'https://www.airport-technology.com/feed/',
  'https://www.flightradar24.com/blog/feed/',
  'https://generalaviationnews.com/feed/',
  'https://www.unmannedsystemstechnology.com/feed/',
  'https://www.businessairportinternational.com/feed',
  'https://www.rotor.org/rss/news',
  'https://www.helis.com/feed/',
  'https://verticalmag.com/feed/',
  'https://www.aviationmaintenance.edu/blog/feed/',
  'https://www.planeandpilotmag.com/feed/',
  'https://www.airnav.com/airports/latest.rss',
  'https://www.aircraftcompare.com/feed/',
  'https://www.paddleyourownkanoo.com/feed/'
];

const newsContainer = document.getElementById('news-container');
const searchInput = document.querySelector('.search-input');
const searchIcon = document.querySelector('.search-icon');
const clearSearchBtn = document.querySelector('.clear-search');
let allNews = [];
let isLoading = false;
let currentPage = 1;
const newsPerPage = 10;
let loadedFeeds = 0;

document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-container')) {
    searchInput.classList.remove('active');
    clearSearchBtn.classList.remove('visible');
  }
});

searchIcon.addEventListener('click', (e) => {
  e.stopPropagation();
  searchInput.classList.toggle('active');
  if (searchInput.classList.contains('active')) {
    searchInput.focus();
    if (searchInput.value) {
      clearSearchBtn.classList.add('visible');
    }
  } else {
    clearSearchBtn.classList.remove('visible');
    displayNews(allNews.slice(0, currentPage * newsPerPage));
  }
});

clearSearchBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  searchInput.value = '';
  searchInput.focus();
  clearSearchBtn.classList.remove('visible');
  displayNews(allNews.slice(0, currentPage * newsPerPage));
});

async function fetchRSSFeed(url) {
  try {
    const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&api_key=zswsnxxvbpqopnmbz5exb4vy7fjmtmwwdns71v43`);
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return [];
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function createNewsElement(item) {
  const newsItem = document.createElement('article');
  newsItem.className = 'news-item';

  const title = item.title.replace(/<\/?[^>]+(>|$)/g, "");
  const desc = item.description.replace(/<\/?[^>]+(>|$)/g, "");

  newsItem.innerHTML = `
    <h2 class="news-title">${title}</h2>
    <p class="news-desc">${desc}</p>
    <div class="news-meta">
      <span>${formatDate(item.pubDate)} · ${timeago.format(item.pubDate)}</span>
      <a href="${item.link}" target="_blank" aria-label="Read full article">
        Read more <i class="fas fa-external-link-alt"></i>
      </a>
    </div>
  `;

  return newsItem;
}

function displayNews(newsItems, append = false) {
  const loader = newsContainer.querySelector('.loader');
  if (loader) {
    loader.remove();
  }

  if (!append) {
    newsContainer.innerHTML = '';
  }

  if (newsItems.length === 0 && !append) {
    newsContainer.innerHTML = '<div style="text-align: center; padding: 1rem;"><p style="margin-bottom: 1rem; color: red;">No articles found, please try again later. </p><p style="color: #fff;"> Or if the issue persist please let me know by creating a issue here at <a href="https://github.com/iambhvsh/aerox/issues">Github</a></p></div>';
    return;
  }

  newsItems.forEach(item => {
    newsContainer.appendChild(createNewsElement(item));
  });
}

function filterNews(searchTerm) {
  return allNews.filter(item => {
    const searchContent = `${item.title} ${item.description}`.toLowerCase();
    return searchContent.includes(searchTerm.toLowerCase());
  });
}

function loadMoreNews() {
  const start = (currentPage - 1) * newsPerPage;
  const end = start + newsPerPage;
  const newsToShow = allNews.slice(start, end);
  displayNews(newsToShow, true);
  currentPage++;
}

function handleScroll() {
  if (isLoading) return;

  const scrollPos = window.innerHeight + window.pageYOffset;
  const pageBottom = document.documentElement.scrollHeight - 1000;

  if (scrollPos >= pageBottom) {
    isLoading = true;
    loadMoreNews();
    isLoading = false;
  }
}

searchInput.addEventListener('input', (e) => {
  currentPage = 1;
  if (e.target.value) {
    clearSearchBtn.classList.add('visible');
    const filtered = filterNews(e.target.value);
    displayNews(filtered);
  } else {
    clearSearchBtn.classList.remove('visible');
    displayNews(allNews.slice(0, currentPage * newsPerPage));
  }
});

window.addEventListener('scroll', handleScroll);

async function init() {
  try {
    RSS_FEEDS.forEach(async (feed) => {
      const news = await fetchRSSFeed(feed);
      loadedFeeds++;

      allNews = [...allNews, ...news].sort((a, b) =>
        new Date(b.pubDate) - new Date(a.pubDate)
      );

      if (loadedFeeds === 1) {
        loadMoreNews();
      } else {
        currentPage = 1;
        displayNews(allNews.slice(0, currentPage * newsPerPage));
        currentPage++;
      }
    });
  } catch (error) {
    console.error('Error initializing app:', error);
    newsContainer.innerHTML = '<p style="text-align: center; color: #f87171;">Error loading news. Please try again later.</p>';
  }
}

init();