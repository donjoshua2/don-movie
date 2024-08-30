const API_URL =
  "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=3fd2be6f0c70a2a598f084ddfb75487c&page=1";
const IMG_PATH = "https://image.tmdb.org/t/p/w1280";
const SEARCH_API =
  'https://api.themoviedb.org/3/search/movie?api_key=3fd2be6f0c70a2a598f084ddfb75487c&query=';
const TRAILER_API = "https://api.themoviedb.org/3/movie/";
const MOVIE_API = "https://vidsrc.xyz/embed/movie?tmdb="; // Replace with actual movie player URL if available

const main = document.getElementById("main");
const form = document.getElementById("form");
const search = document.getElementById("search");

// Get initial movies
getMovies(API_URL);

async function getMovies(url) {
  const res = await fetch(url);
  const data = await res.json();

  // Fetch trailers for each movie
  const moviesWithTrailers = await Promise.all(
    data.results.map(async (movie) => {
      const trailerUrl = await getTrailerUrl(movie.id);
      return { ...movie, trailerUrl };
    })
  );

  showMovies(moviesWithTrailers);
}

async function getTrailerUrl(movieId) {
  const res = await fetch(
    `${TRAILER_API}${movieId}/videos?api_key=3fd2be6f0c70a2a598f084ddfb75487c`
  );
  const data = await res.json();
  const trailer = data.results.find((video) => video.type === "Trailer");
  return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
}

function showMovies(movies) {
  main.innerHTML = "";

  movies.forEach((movie) => {
    const { title, poster_path, vote_average, overview, trailerUrl, id } = movie;

    const movieEl = document.createElement("div");
    movieEl.classList.add("movie");

    movieEl.innerHTML = `
      <img src="${IMG_PATH + poster_path}" alt="${title}">
      <div class="movie-info">
        <h3>${title}</h3>
        <span class="${getClassByRate(vote_average)}">${vote_average}</span>
      </div>
      <div class="overview">
        <h3>Overview</h3>
        ${overview}
        ${trailerUrl ? `<a href="${trailerUrl}" target="_blank">Watch Trailer</a>` : ""}
        <a href="${MOVIE_API}${id}" target="_blank" class="play-btn">Play Movie</a>
      </div>
    `;
    main.appendChild(movieEl);
  });
}

function getClassByRate(vote) {
  if (vote >= 8) {
    return "green";
  } else if (vote >= 5) {
    return "orange";
  } else {
    return "red";
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const searchTerm = search.value;

  if (searchTerm && searchTerm.trim() !== "") {
    getMovies(SEARCH_API + searchTerm);
    search.value = "";
  } else {
    window.location.reload();
  }
});
