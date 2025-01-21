import Fuse from 'fuse.js';

    // Mock data for 4000+ articles
    const generateArticles = () => {
      const articles = [];
      const tags = ['Law', 'History', 'Roman', 'Civil', 'Property', 'Obligations'];
      
      for (let i = 1; i <= 4000; i++) {
        articles.push({
          id: i,
          title: `Article ${i}`,
          content: `Content for article ${i}...`,
          details: `Detailed content for article ${i}...`,
          tags: tags.slice(0, Math.floor(Math.random() * tags.length) + 1)
        });
      }
      return articles;
    };

    const articles = generateArticles();
    let visibleArticles = articles.slice(0, 50); // Initial visible articles

    const fuse = new Fuse(articles, {
      keys: ['title', 'content', 'details', 'tags'],
      includeScore: true,
      threshold: 0.3,
      includeMatches: true
    });

    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('results');

    function highlightText(text, matches) {
      if (!matches || !matches.length) return text;
      
      const indices = matches.flatMap(match => match.indices || []);
      if (!indices.length) return text;
      
      let highlightedText = '';
      let lastIndex = 0;
      
      indices.sort((a, b) => a[0] - b[0]);
      
      indices.forEach(([start, end]) => {
        highlightedText += text.slice(lastIndex, start);
        highlightedText += `<mark>${text.slice(start, end + 1)}</mark>`;
        lastIndex = end + 1;
      });
      
      highlightedText += text.slice(lastIndex);
      return highlightedText;
    }

    function createCard(article, matches) {
      const card = document.createElement('div');
      card.className = 'card';
      
      const titleMatches = matches?.find(m => m.key === 'title');
      const contentMatches = matches?.find(m => m.key === 'content');
      
      card.innerHTML = `
        <div class="card-header">
          <h2>${highlightText(article.title, titleMatches?.indices)}</h2>
          <div class="tags">
            ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </div>
        <div class="card-content">
          <p>${highlightText(article.content, contentMatches?.indices)}</p>
        </div>
        <div class="card-details">
          <p>${article.details}</p>
        </div>
      `;
      
      card.addEventListener('click', () => {
        card.classList.toggle('expanded');
        const details = card.querySelector('.card-details');
        details.style.display = details.style.display === 'none' ? 'block' : 'none';
      });
      
      return card;
    }

    function renderArticles(articlesToRender) {
      const fragment = document.createDocumentFragment();
      articlesToRender.forEach(article => {
        const card = createCard(article);
        fragment.appendChild(card);
      });
      resultsContainer.innerHTML = '';
      resultsContainer.appendChild(fragment);
    }

    function handleSearch(query) {
      if (query.length > 2) {
        const results = fuse.search(query);
        visibleArticles = results.slice(0, 50).map(result => result.item);
      } else {
        visibleArticles = articles.slice(0, 50);
      }
      renderArticles(visibleArticles);
    }

    function initializeInfiniteScroll() {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const start = visibleArticles.length;
            const end = start + 50;
            const newArticles = articles.slice(start, end);
            visibleArticles = visibleArticles.concat(newArticles);
            renderArticles(visibleArticles);
          }
        });
      }, {
        threshold: 1.0
      });

      const sentinel = document.createElement('div');
      resultsContainer.appendChild(sentinel);
      observer.observe(sentinel);
    }

    searchInput.addEventListener('input', (e) => {
      handleSearch(e.target.value);
    });

    // Initial render
    renderArticles(visibleArticles);
    initializeInfiniteScroll();
