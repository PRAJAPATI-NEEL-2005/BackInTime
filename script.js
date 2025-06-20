const dateInput = document.getElementById('datePicker');
const filterSelect = document.getElementById('filterSelect');
const eventsDiv = document.getElementById('events');
const spinner = document.getElementById('spinner');
const prevBtn = document.getElementById('prevPage');
const nextBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');

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
    div.innerHTML = `<strong>${event.year}:</strong> ${event.text}`;
    eventsDiv.appendChild(div);
  });

  pageInfo.textContent = `Page ${page}`;
  prevBtn.disabled = page === 1;
  nextBtn.disabled = end >= allItems.length;
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
  if (currentPage > 1) {
    currentPage--;
    renderPage(currentPage);
  }
});
nextBtn.addEventListener('click', () => {
  if ((currentPage * itemsPerPage) < allItems.length) {
    currentPage++;
    renderPage(currentPage);
  }
});
