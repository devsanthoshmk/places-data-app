import { parsePhoneNumberFromString } from 'libphonenumber-js';

function extractPhone(text) {
  const rawMatch = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/);
  if (!rawMatch) return '';
  const phoneNumber = parsePhoneNumberFromString(rawMatch[0]);
  if (phoneNumber && phoneNumber.isValid()) {
    return phoneNumber.number;
  }
  return '';
}

async function fetchit(url) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
  };

  try {
    const response = await fetch(url, {
      headers,
      redirect: 'follow',
      signal: AbortSignal.timeout(20_000),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const htmlText = await response.text();
    const doc = new DOMParser().parseFromString(htmlText, 'text/html');

    const items = doc.querySelector('#search')?.querySelectorAll('.VkpGBb');
    if (!items) throw new Error('No items variable found');
    const scrapedData = [];

    items.forEach((item) => {
      const row = {};

      const titleEl = item.querySelector('[role="heading"]');
      row.title = titleEl ? titleEl.textContent.trim().replace(/\r?\n/g, ' ').split(' ').filter(str => /\S/.test(str)).join(' ') : 'N/A';

      const detailsDiv = item.querySelector('.rllt__details');
      row.stars = 0;
      row.reviews = 0;
      row.category = '';
      row.address = '';
      row.completePhoneNumber = '';

      if (detailsDiv) {
        const lines = Array.from(detailsDiv.querySelectorAll('div'));
        lines.forEach(line => {
          const text = line.textContent.trim();

          if (line.querySelector('[role="img"]') || text.match(/^\d\.\d/)) {
            const starSpan = line.querySelector('.yi40Hd') || line.querySelector('[aria-hidden="true"]');
            if (starSpan) {
              const val = parseFloat(starSpan.textContent);
              if (!isNaN(val)) row.stars = val;
            }
            const reviewSpan = line.querySelector('[aria-label*="reviews"]');
            if (reviewSpan) {
              const count = parseInt(reviewSpan.textContent.replace(/\D/g, ''));
              row.reviews = isNaN(count) ? 0 : count;
            }
            if (text.includes('·')) {
              const parts = text.split('·');
              row.category = parts[parts.length - 1].trim();
            }
          } else if (text.length > 0) {
            const segments = text.split('·').map(s => s.trim());
            const lastSegment = segments[segments.length - 1];
            const phone = extractPhone(lastSegment.trim().replace(/\r?\n/g, ' ').split(' ').filter(str => /\S/.test(str)).join(' '));
            if (phone) {
              row.completePhoneNumber = phone;
              if (segments.length > 1) {
                const addressCandidate = segments[segments.length - 2];
                if (!addressCandidate.includes('years in business') && !addressCandidate.includes('Open')) {
                  row.address = addressCandidate.replace(/\s+/g, ' ').trim();
                }
              }
            } else {
              if (!text.includes('Opens') && !text.includes('Closed') && text.includes(',') && !row.address) {
                row.address = text.replace(/\s+/g, ' ').trim();
              }
            }
          }
        });
      }

      const allLinks = Array.from(item.querySelectorAll('a'));
      const websiteLink = allLinks.find(link => link.textContent.includes('Website'));
      row.url = websiteLink ? websiteLink.href : '';

      scrapedData.push(row);
    });
    return scrapedData;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}

export async function search(query) {
  const fullList = [];
  let pagination = 0;

  while (true) {
    const url = new URL('https://www.google.com/search');
    url.search = new URLSearchParams({
      q: query,
      start: pagination,
      udm: '1',
    }).toString();
    console.log(`Fetching: ${url}`);

    const result = await fetchit(url.toString());
    if (result?.length > 0) {
      pagination += 10;
      fullList.push(...result);
    } else {
      break;
    }
  }

  return [...new Set(fullList)];
}
