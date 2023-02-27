import 'simplelightbox/dist/simple-lightbox.min.css';
import SimpleLightbox from 'simplelightbox';
import axios from 'axios';
import { Notify } from 'notiflix';

const inputForm = document.querySelector('#search-form');
const inputEl = document.querySelector('#search-form input');
const submitBtn = document.querySelector('#search-form button');
const imageList = document.querySelector('.gallery');
const footerEl = document.querySelector('#footer');

const simpleLightBox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
  scrollZoom: false,
});

const state = {
  init: false, 
  finish: false, 
};

const queryParams = {
  key: '33954907-db44b670018dee1fd494dbc54',
  orientation: 'horizontal',
  image_type: 'photo',
  safesearch: true,
  per_page: 40,
};

const observer = new IntersectionObserver(onReachedBottom);
observer.observe(footerEl);

function onReachedBottom(entries) {
  entries.forEach(async entry => {
    console.log(entries);
    if (entry.isIntersecting && state.init && !state.finish) {
      const hits = (await loadImages()).totalHits;
      state.finish = hits < queryParams.per_page;
      if (state.finish && hits != 0) {
        Notify.warning("We're sorry, but you've reached the end of search results.");
      }
    }
  });
}

function getImageHtml(hit) {
  return `<div class="photo-card">
            <a href="${hit.largeImageURL}"> 
                <img src="${hit.webformatURL}" alt="${hit.tags}" loading="lazy">
            </a>
            <div class="info">
                <p class="info-item"> <b>Likes: </b>${hit.likes} </p>
                <p class="info-item"> <b>Views: </b>${hit.views} </p>
                <p class="info-item"> <b>Comments: </b>${hit.comments} </p>
                <p class="info-item"> <b>Downloads: </b>${hit.downloads} </p>
            </div>
        </div>`;
}

function getUrl(params) {
  return (
    'https://pixabay.com/api/?' +
    Object.entries(params)
      .map(([k, v]) => `${k}=${v}`)
      .join('&')
  );
}

async function loadImages() {
  queryParams.page += 1;
  const url = getUrl(queryParams);
  const res = await axios.get(url);
  if (res.data.hits.length > 0) {
    imageList.innerHTML += res.data.hits.map(getImageHtml).join('\n');
    simpleLightBox.refresh();
  }
  return res.data;
}

inputForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  state.finish = false;
  if (inputEl.value.trim() === "") {
    state.init = false;
    return Notify.failure("Please enter your request");
  }
  imageList.innerHTML = '';
  queryParams.page = 0;
  queryParams.q = inputEl.value.trim();
  const hits = (await loadImages()).totalHits;
  
  if (hits > 0) {
    Notify.success(`Hooray! We found ${hits} images.`);
    state.init = true;
  } else {
    Notify.failure("Sorry, there are no images matching your search query. Please try again.");
    
  }
  console.log(state);
});

// inputEl.addEventListener('input', function (event) {
//   submitBtn.disabled = inputEl.value == '';
// });