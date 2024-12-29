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
  'https://www.flightglobal.com/rss/military',
  'https://www.aviationtoday.com/feed/',
  'https://www.aircargoweek.com/feed/',
  'https://www.aviationweek.com/rss',
  'https://www.airport-technology.com/feed/',
  'https://www.flightradar24.com/blog/feed/',
  'https://generalaviationnews.com/feed/',
  'https://www.businessairportinternational.com/feed',
  'https://www.rotor.org/rss/news',
  'https://www.helis.com/feed/',
  'https://verticalmag.com/feed/',
  'https://www.planeandpilotmag.com/feed/',
  'https://www.aircraftcompare.com/feed/',
  'https://www.flyingmag.com/feed/',
  'https://www.airspacemag.com/rss/',
  'https://www.airportsinternational.com/feed/',
  'https://www.ukaviation.news/feed/',
  'https://www.aviationbusinessnews.com/feed/',
  'https://www.airwaysmag.com/feed/',
  'https://leehamnews.com/feed/',
  'https://www.airlive.net/feed/',
  'https://airinsight.com/feed/',
  'https://www.airlines.net/feed/',
  'https://www.flightdeckfriend.com/feed/',
  'https://airlinegeeks.com/feed/',
  'https://www.aviationcv.com/aviation-blog/feed/',
  'https://blog.aviator.aero/feed/',
  'https://centreforaviation.com/news/rss'
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
const maxRetries = 3;

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

async function fetchRSSFeed(url, retryCount = 0) {
  try {
    const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&api_key=zswsnxxvbpqopnmbz5exb4vy7fjmtmwwdns71v43`, {
      timeout: 10000
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    if (retryCount < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return fetchRSSFeed(url, retryCount + 1);
    }
    console.error(`Failed to fetch ${url}:`, error);
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

  const title = item.title.replace(/<\/?[^>]+(>|$)/g, "").trim();
  const desc = item.description.replace(/<\/?[^>]+(>|$)/g, "").trim();
  const source = new URL(item.link).hostname.replace('www.', '');

  newsItem.innerHTML = `
    <h2 class="news-title">${title}</h2>
    <p class="news-desc">${desc}</p>
    <div class="news-meta">
      <span>${formatDate(item.pubDate)} · ${timeago.format(item.pubDate)}</span>
      <span class="news-source">${source}</span>
      <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="news-link">
        Read more <i class="fas fa-external-link-alt"></i>
      </a>
    </div>
  `;

  return newsItem;
}

function displayNews(newsItems, append = false) {
  if (!append) {
    newsContainer.innerHTML = '';
  }

  if (newsItems.length === 0 && !append) {
    newsContainer.innerHTML = '<div class="no-results">No articles found</div>';
    return;
  }

  const fragment = document.createDocumentFragment();
  newsItems.forEach(item => {
    if (item && item.title && item.description && item.link) {
      fragment.appendChild(createNewsElement(item));
    }
  });

  newsContainer.appendChild(fragment);
}

function filterNews(searchTerm) {
  return allNews.filter(item => {
    if (!item || !item.title || !item.description) return false;
    const searchContent = `${item.title} ${item.description}`.toLowerCase();
    return searchContent.includes(searchTerm.toLowerCase());
  });
}

function loadMoreNews() {
  const start = (currentPage - 1) * newsPerPage;
  const end = start + newsPerPage;
  const newsToShow = allNews.slice(start, end);
  if (newsToShow.length > 0) {
    displayNews(newsToShow, true);
    currentPage++;
  }
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

async function processFeedChunk(feeds) {
  const results = await Promise.all(
    feeds.map(async (feed) => {
      const news = await fetchRSSFeed(feed);
      loadedFeeds++;
      return news;
    })
  );
  return results.flat();
}

async function init() {
  try {
    newsContainer.innerHTML = '<div class="loader">Loading news...</div>';

    const chunkSize = 5;
    for (let i = 0; i < RSS_FEEDS.length; i += chunkSize) {
      const chunk = RSS_FEEDS.slice(i, i + chunkSize);
      const newsChunk = await processFeedChunk(chunk);

      allNews = [...allNews, ...newsChunk].sort((a, b) =>
        new Date(b.pubDate) - new Date(a.pubDate)
      );

      if (i === 0) {
        loadMoreNews();
      } else {
        currentPage = 1;
        displayNews(allNews.slice(0, currentPage * newsPerPage));
        currentPage++;
      }
    }
  } catch (error) {
    console.error('Error initializing app:', error);
    newsContainer.innerHTML = '<div class="error">Error loading news. Please try again later.</div>';
  }
}

init();