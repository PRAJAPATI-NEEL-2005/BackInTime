const dateInput = document.getElementById('datePicker');
const filterSelect = document.getElementById('filterSelect');
const eventsDiv = document.getElementById('events');
const spinner = document.getElementById('spinner');
const prevBtn = document.getElementById('prevPage');
const nextBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');
  const cursor = document.querySelector('.custom-cursor');

document.addEventListener('mousemove', (e) => {
  cursor.style.left = `${e.clientX}px`;
  cursor.style.top = `${e.clientY}px`;
});

document.addEventListener('mouseover', (e) => {
  const tag = e.target.tagName.toLowerCase();
  const isInteractive =
    ['a', 'button', 'input', 'textarea', 'select', 'label'].includes(tag) ||
    e.target.onclick;

  if (isInteractive) {
    cursor.classList.add('hovering');
  }
});
let allItems = [];
let currentPage = 1;
const itemsPerPage = 10;

// Set default date to today
const today = new Date();
dateInput.valueAsDate = today;

// Format date for API
function formatDateForAPI(dateStr) {
  const d = new Date(dateStr);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${month}/${day}`;
}

// Get a random border color
function getRandomColor() {
  const colors = ['#3B82F6', '#9333EA', '#10B981', '#F59E0B', '#EF4444'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Render current page
function renderPage(page) {
  eventsDiv.innerHTML = '';
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pagedItems = allItems.slice(start, end);

  pagedItems.forEach(event => {
    const div = document.createElement('div');
    div.className = 'event';
    div.style.borderLeft = `5px solid ${getRandomColor()}`;
    div.style.position = 'relative';

    const content = `<strong>${event.year}:</strong> ${event.text}`;
    const link = event.links && event.links.length > 0 ? event.links[0].link : null;

    // Share button
    const shareBtn = document.createElement('button');
    shareBtn.textContent = '📤';
    shareBtn.title = 'Share this event';
    shareBtn.className = 'share-btn';
    shareBtn.style.position = 'absolute';
    shareBtn.style.top = '10px';
    shareBtn.style.right = '10px';
    shareBtn.style.background = 'transparent';
    shareBtn.style.border = 'none';
    shareBtn.style.cursor = 'pointer';
    shareBtn.style.fontSize = '18px';

    shareBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (navigator.share) {
        navigator.share({
          title: `On this day: ${event.year}`,
          text: event.text,
          url: link || document.location.href,
        }).catch(err => {
          console.error('Share failed:', err);
        });
      } else {
        alert("Sharing is not supported in this browser.");
      }
    });

    if (link) {
      div.innerHTML = `
        <a href="${link}" target="_blank" style="text-decoration: none; color: inherit; display: block;">
          ${content}
        </a>`;
      div.style.cursor = 'pointer';
    } else {
      div.innerHTML = content;
    }

    div.appendChild(shareBtn);
    eventsDiv.appendChild(div);
  });

  pageInfo.textContent = `Page ${page}`;
if (page === 1) {
  prevBtn.classList.add('disabled');
} else {
  prevBtn.classList.remove('disabled');
}

if (end >= allItems.length) {
  nextBtn.classList.add('disabled');
} else {
  nextBtn.classList.remove('disabled');
}
}



// Fetch data and filter category
async function fetchHistory(dateStr, category) {
  const formattedDate = formatDateForAPI(dateStr);
  spinner.style.display = 'block';
  eventsDiv.innerHTML = '';
  pageInfo.textContent = '';

  try {
    const res = await fetch(`https://history.muffinlabs.com/date/${formattedDate}`);
    const data = await res.json();

    const properCategory = category.toLowerCase() === 'all'
      ? ['Events', 'Births', 'Deaths']
      : [category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()];

    allItems = [];
    properCategory.forEach(cat => {
      allItems.push(...(data.data[cat] || []));
    });

    allItems.sort((a, b) => parseInt(b.year) - parseInt(a.year));

    spinner.style.display = 'none';

    if (allItems.length === 0) {
      eventsDiv.innerHTML = `<p>No ${category.toLowerCase()} found for this date.</p>`;
      return;
    }

    currentPage = 1;
    renderPage(currentPage);
  } catch (error) {
    spinner.style.display = 'none';
    eventsDiv.innerHTML = `<p>Error fetching data. Try again later.</p>`;
    console.error(error);
  }
}

// Initial Load
fetchHistory(dateInput.value, filterSelect.value);

// Event Listeners
dateInput.addEventListener('change', () => {
  fetchHistory(dateInput.value, filterSelect.value);
});
filterSelect.addEventListener('change', () => {
  fetchHistory(dateInput.value, filterSelect.value);
});
prevBtn.addEventListener('click', () => {
  if (prevBtn.classList.contains('disabled')) {
    alert('This is the first page. No previous items.');
    return;
  }
  currentPage--;
  renderPage(currentPage);
});

nextBtn.addEventListener('click', () => {
  if (nextBtn.classList.contains('disabled')) {
    alert('This is the last page. No more items.');
    return;
  }
  currentPage++;
  renderPage(currentPage);
});
