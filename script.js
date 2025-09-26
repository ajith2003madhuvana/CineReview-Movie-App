// ===== API CONFIGURATION =====
const API_KEY = "18e6d40cb61c9f3d6ce413b8b4f7558b";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_PATH = "https://image.tmdb.org/t/p/w500";
const BACKDROP_PATH = "https://image.tmdb.org/t/p/w1280";

// ===== GENRE MAPPING =====
const genreMap = {
    28: "Action",
    12: "Adventure", 
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Sci-Fi",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western"
};



// ===== DOM ELEMENTS =====
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");
const searchSuggestions = document.getElementById("searchSuggestions");
const resultsTitle = document.getElementById("resultsTitle");

// Modal elements
const movieModal = document.getElementById("movieModal");
const modalBackdrop = document.getElementById("modalBackdrop");
const closeModal = document.getElementById("closeModal");

// Movie details elements
const movieTitle = document.getElementById("movieTitle");
const moviePoster = document.getElementById("moviePoster");
const movieOverview = document.getElementById("movieOverview");
const movieCast = document.getElementById("movieCast");
const movieDirector = document.getElementById("movieDirector");
const movieYear = document.getElementById("movieYear");
const movieRating = document.getElementById("movieRating");
const movieRuntime = document.getElementById("movieRuntime");
const movieGenre = document.getElementById("movieGenre");

// User interaction elements
const starRating = document.querySelector(".star-rating");
const ratingDisplay = document.getElementById("ratingDisplay");
const reviewText = document.getElementById("reviewText");
const charCount = document.getElementById("charCount");
const submitReview = document.getElementById("submitReview");
const favoriteBtn = document.getElementById("favoriteBtn");
const userReviews = document.getElementById("userReviews");

// Navigation elements
const homeBtn = document.getElementById("homeBtn");
const favoritesBtn = document.getElementById("favoritesBtn");
const historyBtn = document.getElementById("historyBtn");
const favoriteCount = document.getElementById("favoriteCount");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileNav = document.getElementById("mobileNav");

// Sections
const homeSection = document.getElementById("homeSection");

const favoritesSection = document.getElementById("favoritesSection");
const historySection = document.getElementById("historySection");
const favoritesGrid = document.getElementById("favoritesGrid");
const historyList = document.getElementById("historyList");


// Filter and sort
const sortFilter = document.getElementById("sortFilter");
const genreButtons = document.querySelectorAll(".genre-btn");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const loadingSpinner = document.getElementById("loadingSpinner");

// Toast container
const toastContainer = document.getElementById("toastContainer");

// ===== GLOBAL STATE =====
let currentMovie = null;
let currentPage = 1;
let currentQuery = "";
let currentGenre = "";
let allMovies = [];
let searchTimeout = null;

// ===== INITIALIZATION =====
document.addEventListener("DOMContentLoaded", () => {
    loadPopularMovies();
    updateFavoriteCount();
    setupEventListeners();
    loadSearchHistory();
    updateFavoritesCount();
    updateHistoryCount();
});

// ===== EVENT LISTENERS SETUP =====
function setupEventListeners() {
    // Search functionality
    searchBtn.addEventListener("click", handleSearch);
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleSearch();
    });
    
    // Real-time search suggestions
    searchInput.addEventListener("input", handleSearchInput);
    
    // Modal controls
    if (closeModal) closeModal.addEventListener("click", closeMovieModal);
    if (modalBackdrop) modalBackdrop.addEventListener("click", closeMovieModal);
    
    // Navigation
    if (homeBtn) homeBtn.addEventListener("click", () => showSection("home"));
    
    if (favoritesBtn) favoritesBtn.addEventListener("click", () => showSection("favorites"));
    if (historyBtn) historyBtn.addEventListener("click", () => showSection("history"));
    
    // Mobile menu
    if (mobileMenuBtn) mobileMenuBtn.addEventListener("click", toggleMobileMenu);
    
    // Mobile nav data-section handling
    document.querySelectorAll('[data-section]').forEach(btn => {
        btn.addEventListener("click", (e) => {
            const section = e.target.getAttribute('data-section') || e.target.closest('[data-section]').getAttribute('data-section');
            showSection(section);
        });
    });
    
    // Genre buttons
    genreButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            currentGenre = e.target.dataset.genre;
            searchMoviesByGenre(currentGenre);
        });
    });
    
   
    
    // Sort filter
    if (sortFilter) sortFilter.addEventListener("change", handleSortChange);
    
    // Load more
    if (loadMoreBtn) loadMoreBtn.addEventListener("click", loadMoreMovies);
    
    // Review character count
    if (reviewText) reviewText.addEventListener("input", updateCharCount);
    
    // Review submission
    if (submitReview) submitReview.addEventListener("click", handleReviewSubmit);
    
    // History clear button
    const clearHistoryBtn = document.getElementById("clearHistoryBtn");
    if (clearHistoryBtn) clearHistoryBtn.addEventListener("click", clearHistory);
    
    // Keyboard shortcuts
    document.addEventListener("keydown", handleKeyboardShortcuts);
}

// ===== UTILITY FUNCTIONS =====
function getGenreNames(genreIds) {
    if (!genreIds || genreIds.length === 0) return "N/A";
    
    const genres = genreIds.slice(0, 2).map(id => genreMap[id] || "Unknown").filter(g => g !== "Unknown");
    return genres.length > 0 ? genres.join(", ") : "N/A";
}

function updateFavoritesCount() {
    const favoritesCountElement = document.getElementById("favoritesCount");
    if (favoritesCountElement) {
        const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        favoritesCountElement.textContent = `${favorites.length} movies`;
    }
}

function updateHistoryCount() {
    const historyCountElement = document.getElementById("historyCount");
    if (historyCountElement) {
        const history = JSON.parse(localStorage.getItem("searchHistory")) || [];
        historyCountElement.textContent = `${history.length} reviews`;
    }
}

// ===== POSTER UTILITY FUNCTIONS =====
function createCustomPoster(movie) {
    // Create a custom poster with movie information
    const cleanTitle = movie.title.replace(/[^\w\s]/gi, '').replace(/\s+/g, '+');
    const cleanDirector = movie.director.replace(/[^\w\s]/gi, '').replace(/\s+/g, '+');
    
    // Color based on verdict
    const getColor = (verdict) => {
        switch(verdict.toLowerCase()) {
            case 'blockbuster':
            case 'industry hit':
                return '2c3e50';
            case 'super hit':
                return '27ae60';
            case 'hit':
                return '3498db';
            case 'atb':
                return 'e74c3c';
            case 'debut':
                return '9b59b6';
            default:
                return '34495e';
        }
    };
    
    const bgColor = getColor(movie.verdict);
    const text = `${cleanTitle}%0A${movie.year}%0A${cleanDirector}`;
    
    return `https://via.placeholder.com/250x350/${bgColor}/ffffff?text=${text}`;
}

// ===== LOADING AND UI STATE =====
function showLoading(show = true) {
    if (loadingSpinner) {
        if (show) {
            loadingSpinner.classList.remove("hidden");
        } else {
            loadingSpinner.classList.add("hidden");
        }
    }
}

function showToast(message, type = "success") {
    if (!toastContainer) return;
    
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}"></i>
        ${message}
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = "toastSlideOut 0.3s ease forwards";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== SEARCH FUNCTIONALITY =====
async function handleSearch() {
    const query = searchInput.value.trim();
    if (!query) return;
    
    currentQuery = query;
    currentPage = 1;
    allMovies = [];
    
    showLoading(true);
    hideSuggestions();
    
    try {
        const response = await fetch(
            `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=1`
        );
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            allMovies = data.results;
            displayMovies(data.results);
            if (resultsTitle) resultsTitle.textContent = `Search Results for "${query}"`;
            
            // Save search to history
            saveSearchHistory(query);
            
            // Show load more if there are more pages
            if (data.total_pages > 1) {
                const loadMoreContainer = document.getElementById("loadMoreContainer");
                if (loadMoreContainer) loadMoreContainer.classList.remove("hidden");
            }
        } else {
            showNoResults();
        }
        
    } catch (error) {
        console.error("Search error:", error);
        showToast("Failed to search movies. Please try again.", "error");
    } finally {
        showLoading(false);
    }
}

async function handleSearchInput() {
    const query = searchInput.value.trim();
    
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    if (query.length < 2) {
        hideSuggestions();
        return;
    }
    
    searchTimeout = setTimeout(async () => {
        try {
            const response = await fetch(
                `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=1`
            );
            const data = await response.json();
            showSuggestions(data.results.slice(0, 5));
        } catch (error) {
            console.error("Suggestions error:", error);
        }
    }, 300);
}

function showSuggestions(movies) {
    if (!searchSuggestions || !movies || movies.length === 0) {
        hideSuggestions();
        return;
    }
    
    searchSuggestions.innerHTML = movies.map(movie => `
        <div class="suggestion-item" onclick="selectSuggestion('${movie.title.replace(/'/g, "\\'")}')">
            <img src="${movie.poster_path ? IMG_PATH + movie.poster_path : 'https://via.placeholder.com/50x75?text=No+Image'}" alt="${movie.title}">
            <div class="suggestion-info">
                <h4>${movie.title}</h4>
                <p>${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</p>
            </div>
        </div>
    `).join("");
    
    searchSuggestions.classList.remove("hidden");
}

function hideSuggestions() {
    if (searchSuggestions) {
        searchSuggestions.classList.add("hidden");
    }
}

function selectSuggestion(title) {
    searchInput.value = title;
    hideSuggestions();
    handleSearch();
}

// ===== MOVIE DISPLAY =====
async function loadPopularMovies() {
    showLoading(true);
    try {
        const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=1`);
        const data = await response.json();
        allMovies = data.results;
        displayMovies(data.results);
        if (resultsTitle) resultsTitle.textContent = "Popular Movies";
    } catch (error) {
        console.error("Error loading popular movies:", error);
        showToast("Failed to load movies. Please refresh the page.", "error");
    } finally {
        showLoading(false);
    }
}

function displayMovies(movies) {
    if (!movies || movies.length === 0) {
        showNoResults();
        return;
    }
    
    if (searchResults) {
        searchResults.innerHTML = "";
        const noResults = document.getElementById("noResults");
        if (noResults) noResults.classList.add("hidden");
        
        movies.forEach(movie => {
            const card = createMovieCard(movie);
            searchResults.appendChild(card);
        });
    }
}

function createMovieCard(movie) {
    const card = document.createElement("div");
    card.className = "movie-card";
    card.onclick = () => showMovieDetails(movie);
    
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";
    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : "N/A";
    const genres = getGenreNames(movie.genre_ids);
    
    card.innerHTML = `
        <div class="movie-poster-container">
            <img src="${movie.poster_path ? IMG_PATH + movie.poster_path : 'https://via.placeholder.com/250x350?text=No+Image'}" 
                 alt="${movie.title}" class="movie-poster" loading="lazy">
            <div class="rating-badge">${rating}</div>
        </div>
        <div class="movie-info">
            <h3 class="movie-title">${movie.title}</h3>
            <div class="movie-meta">
                <span class="movie-year"><i class="fas fa-calendar"></i> ${year}</span>
                <span class="movie-genre"><i class="fas fa-tags"></i> ${genres}</span>
            </div>
        </div>
    `;
    
    return card;
}





function getVerdictClass(verdict) {
    switch(verdict.toLowerCase()) {
        case 'blockbuster':
        case 'industry hit':
        case 'atb':
            return 'verdict-blockbuster';
        case 'super hit':
            return 'verdict-superhit';
        case 'hit':
            return 'verdict-hit';
        case 'average':
            return 'verdict-average';
        case 'flop':
        case 'disaster':
            return 'verdict-flop';
        default:
            return 'verdict-debut';
    }
}




function showNoResults() {
    if (searchResults) {
        searchResults.innerHTML = "";
        const noResults = document.getElementById("noResults");
        if (noResults) noResults.classList.remove("hidden");
    }
}

// ===== MOVIE DETAILS MODAL =====
async function showMovieDetails(movie) {
    currentMovie = movie;
    showLoading(true);
    
    try {
        // Get detailed movie information
        const [movieDetails, credits] = await Promise.all([
            fetch(`${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}`).then(r => r.json()),
            fetch(`${BASE_URL}/movie/${movie.id}/credits?api_key=${API_KEY}`).then(r => r.json())
        ]);
        
        // Update modal content
        if (movieTitle) movieTitle.textContent = movieDetails.title;
        if (moviePoster) moviePoster.src = movieDetails.poster_path ? IMG_PATH + movieDetails.poster_path : 'https://via.placeholder.com/300x450?text=No+Image';
        if (movieOverview) movieOverview.textContent = movieDetails.overview || "No overview available.";
        
        // Movie metadata with icons
        if (movieYear) {
            const metaValue = movieYear.querySelector('.meta-value') || movieYear;
            metaValue.textContent = movieDetails.release_date ? new Date(movieDetails.release_date).getFullYear() : "N/A";
        }
        if (movieRating) {
            const metaValue = movieRating.querySelector('.meta-value') || movieRating;
            metaValue.textContent = movieDetails.vote_average ? `${movieDetails.vote_average}/10` : "N/A";
        }
        if (movieRuntime) {
            const metaValue = movieRuntime.querySelector('.meta-value') || movieRuntime;
            metaValue.textContent = movieDetails.runtime ? `${movieDetails.runtime} min` : "N/A";
        }
        if (movieGenre) {
            const metaValue = movieGenre.querySelector('.meta-value') || movieGenre;
            metaValue.textContent = movieDetails.genres ? movieDetails.genres.map(g => g.name).join(", ") : "N/A";
        }
        
        // Cast and director
        const cast = credits.cast.slice(0, 5).map(actor => actor.name).join(", ");
        const director = credits.crew.find(person => person.job === "Director");
        
        if (movieCast) movieCast.textContent = cast || "N/A";
        if (movieDirector) movieDirector.textContent = director ? director.name : "N/A";
        
        // Setup user interactions
        setupStarRating(movie.id);
        loadUserReviews(movie.id);
        updateFavoriteButton(movie.id);
        
        // Show modal
        if (movieModal) {
            movieModal.classList.remove("hidden");
            document.body.style.overflow = "hidden";
        }
        
    } catch (error) {
        console.error("Error loading movie details:", error);
        showToast("Failed to load movie details.", "error");
    } finally {
        showLoading(false);
    }
}

function closeMovieModal() {
    if (movieModal) {
        movieModal.classList.add("hidden");
        document.body.style.overflow = "auto";
        currentMovie = null;
    }
}

// ===== RATING SYSTEM =====
function setupStarRating(movieId) {
    if (!starRating) return;
    
    const savedRating = localStorage.getItem(`rating-${movieId}`);
    
    starRating.innerHTML = "";
    for (let i = 1; i <= 5; i++) {
        const star = document.createElement("span");
        star.className = "star";
        star.dataset.rating = i;
        star.textContent = "⭐";
        star.onclick = () => saveRating(movieId, i);
        
        if (savedRating && i <= parseInt(savedRating)) {
            star.classList.add("active");
        }
        
        starRating.appendChild(star);
    }
    
    if (ratingDisplay) {
        if (savedRating) {
            ratingDisplay.textContent = `You rated this ${savedRating}/5 stars`;
        } else {
            ratingDisplay.textContent = "Click to rate";
        }
    }
}

function saveRating(movieId, rating) {
    localStorage.setItem(`rating-${movieId}`, rating);
    
    // Update star display
    if (starRating) {
        const stars = starRating.querySelectorAll(".star");
        stars.forEach((star, index) => {
            star.classList.toggle("active", index < rating);
        });
    }
    
    if (ratingDisplay) {
        ratingDisplay.textContent = `You rated this ${rating}/5 stars`;
    }
    showToast(`Rated ${rating}/5 stars!`, "success");
}

// ===== REVIEW SYSTEM =====
function updateCharCount() {
    if (!reviewText || !charCount) return;
    
    const count = reviewText.value.length;
    charCount.textContent = `${count}/500`;
    
    if (count > 450) {
        charCount.style.color = "var(--accent-color)";
    } else {
        charCount.style.color = "var(--medium-gray)";
    }
}

function handleReviewSubmit() {
    if (!reviewText) return;
    
    const text = reviewText.value.trim();
    if (!text) {
        showToast("Please write a review before submitting.", "warning");
        return;
    }
    
    if (!currentMovie) return;
    
    const review = {
        text: text,
        date: new Date().toLocaleDateString(),
        movieTitle: currentMovie.title,
        movieId: currentMovie.id
    };
    
    // Save review
    let reviews = JSON.parse(localStorage.getItem(`reviews-${currentMovie.id}`)) || [];
    reviews.unshift(review); // Add to beginning
    localStorage.setItem(`reviews-${currentMovie.id}`, JSON.stringify(reviews));
    
    // Clear form
    reviewText.value = "";
    updateCharCount();
    
    // Reload reviews
    loadUserReviews(currentMovie.id);
    showToast("Review submitted successfully!", "success");
    updateHistoryCount();
}

function loadUserReviews(movieId) {
    if (!userReviews) return;
    
    const reviews = JSON.parse(localStorage.getItem(`reviews-${movieId}`)) || [];
    
    if (reviews.length === 0) {
        userReviews.innerHTML = "<p>No reviews yet. Be the first to review!</p>";
        return;
    }
    
    userReviews.innerHTML = reviews.map((review, index) => `
        <div class="review-item">
            <div class="review-header">
                <span class="review-date">${review.date}</span>
                <button class="delete-review" onclick="deleteReview('${movieId}', ${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <p class="review-text">${review.text}</p>
        </div>
    `).join("");
}

function deleteReview(movieId, index) {
    let reviews = JSON.parse(localStorage.getItem(`reviews-${movieId}`)) || [];
    reviews.splice(index, 1);
    localStorage.setItem(`reviews-${movieId}`, JSON.stringify(reviews));
    
    loadUserReviews(movieId);
    showToast("Review deleted.", "success");
    updateHistoryCount();
}

// ===== FAVORITES SYSTEM =====
function updateFavoriteButton(movieId) {
    if (!favoriteBtn) return;
    
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const isFavorite = favorites.some(fav => fav.id === movieId);
    
    const icon = favoriteBtn.querySelector("i");
    if (icon) {
        if (isFavorite) {
            icon.className = "fas fa-heart";
            favoriteBtn.classList.add("active");
            favoriteBtn.onclick = () => removeFromFavorites(movieId);
        } else {
            icon.className = "far fa-heart";
            favoriteBtn.classList.remove("active");
            favoriteBtn.onclick = () => addToFavorites(currentMovie);
        }
    }
}

function addToFavorites(movie) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    
    if (!favorites.some(fav => fav.id === movie.id)) {
        favorites.push(movie);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        showToast("Added to favorites!", "success");
        updateFavoriteButton(movie.id);
        updateFavoriteCount();
        updateFavoritesCount();
    }
}

function removeFromFavorites(movieId) {
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    favorites = favorites.filter(fav => fav.id !== movieId);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    
    showToast("Removed from favorites.", "success");
    updateFavoriteButton(movieId);
    updateFavoriteCount();
    updateFavoritesCount();
    
    // Refresh favorites section if currently viewing
    if (favoritesSection && !favoritesSection.classList.contains("hidden")) {
        showFavoritesSection();
    }
}

function updateFavoriteCount() {
    if (favoriteCount) {
        const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        favoriteCount.textContent = favorites.length;
    }
}

// ===== NAVIGATION SYSTEM =====
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll(".section").forEach(section => {
        section.classList.add("hidden");
        section.classList.remove("active");
    });
    
    // Update nav buttons
    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.classList.remove("active");
    });
    
    // Show selected section
    switch(sectionName) {
        case "home":
            if (homeSection) {
                homeSection.classList.remove("hidden");
                homeSection.classList.add("active");
            }
            if (homeBtn) homeBtn.classList.add("active");
            break;
        
        case "favorites":
            if (favoritesSection) {
                favoritesSection.classList.remove("hidden");
                favoritesSection.classList.add("active");
            }
            if (favoritesBtn) favoritesBtn.classList.add("active");
            showFavoritesSection();
            break;
        case "history":
            if (historySection) {
                historySection.classList.remove("hidden");
                historySection.classList.add("active");
            }
            if (historyBtn) historyBtn.classList.add("active");
            showHistorySection();
            break;
    }
    
    // Close mobile menu
    if (mobileNav) mobileNav.classList.add("hidden");
}

function showFavoritesSection() {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    
    if (favorites.length === 0) {
        if (favoritesGrid) favoritesGrid.innerHTML = "";
        const noFavorites = document.getElementById("noFavorites");
        if (noFavorites) noFavorites.classList.remove("hidden");
        return;
    }
    
    const noFavorites = document.getElementById("noFavorites");
    if (noFavorites) noFavorites.classList.add("hidden");
    
    if (favoritesGrid) {
        favoritesGrid.innerHTML = "";
        favorites.forEach(movie => {
            const card = createMovieCard(movie);
            favoritesGrid.appendChild(card);
        });
    }
}

function showHistorySection() {
    const searches = JSON.parse(localStorage.getItem("searchHistory")) || [];
    
    if (searches.length === 0) {
        if (historyList) historyList.innerHTML = "";
        const noHistory = document.getElementById("noHistory");
        if (noHistory) noHistory.classList.remove("hidden");
        return;
    }
    
    const noHistory = document.getElementById("noHistory");
    if (noHistory) noHistory.classList.add("hidden");
    
    if (historyList) {
        historyList.innerHTML = searches.map(search => `
            <div class="history-item">
                <div class="history-info">
                    <h4>${search.query}</h4>
                    <p>${search.date}</p>
                </div>
                <button class="repeat-search" onclick="repeatSearch('${search.query.replace(/'/g, "\\'")}')">
                    <i class="fas fa-search"></i>
                </button>
            </div>
        `).join("");
    }
}

// ===== SEARCH HISTORY =====
function saveSearchHistory(query) {
    let history = JSON.parse(localStorage.getItem("searchHistory")) || [];
    
    // Remove duplicate if exists
    history = history.filter(item => item.query !== query);
    
    // Add new search to beginning
    history.unshift({
        query: query,
        date: new Date().toLocaleDateString(),
        timestamp: Date.now()
    });
    
    // Keep only last 20 searches
    history = history.slice(0, 20);
    
    localStorage.setItem("searchHistory", JSON.stringify(history));
    updateHistoryCount();
}

function loadSearchHistory() {
    // This is called on page load, no UI update needed here
}

function repeatSearch(query) {
    searchInput.value = query;
    showSection("home");
    handleSearch();
}

function clearHistory() {
    localStorage.removeItem("searchHistory");
    showHistorySection();
    showToast("Search history cleared.", "success");
    updateHistoryCount();
}

// ===== MOBILE MENU =====
function toggleMobileMenu() {
    if (mobileNav) {
        mobileNav.classList.toggle("hidden");
    }
}

// ===== GENRE SEARCH =====
async function searchMoviesByGenre(genreName) {
    showLoading(true);
    currentQuery = "";
    currentPage = 1;
    
    // Genre mapping
    const genreSearchMap = {
        "action": 28,
        "comedy": 35,
        "drama": 18,
        "horror": 27,
        "sci-fi": 878
    };
    
    const genreId = genreSearchMap[genreName.toLowerCase()];
    
    try {
        const response = await fetch(
            `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=1`
        );
        const data = await response.json();
        
        allMovies = data.results;
        displayMovies(data.results);
        if (resultsTitle) resultsTitle.textContent = `${genreName.charAt(0).toUpperCase() + genreName.slice(1)} Movies`;
        
    } catch (error) {
        console.error("Genre search error:", error);
        showToast("Failed to load genre movies.", "error");
    } finally {
        showLoading(false);
    }
}

// ===== SORTING AND FILTERING =====
function handleSortChange() {
    if (!sortFilter) return;
    
    const sortBy = sortFilter.value;
    let sortedMovies = [...allMovies];
    
    switch(sortBy) {
        case "popularity":
            sortedMovies.sort((a, b) => b.popularity - a.popularity);
            break;
        case "rating":
            sortedMovies.sort((a, b) => b.vote_average - a.vote_average);
            break;
        case "year":
            sortedMovies.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
            break;
        case "title":
            sortedMovies.sort((a, b) => a.title.localeCompare(b.title));
            break;
    }
    
    displayMovies(sortedMovies);
}

// ===== LOAD MORE FUNCTIONALITY =====
async function loadMoreMovies() {
    if (!currentQuery) return;
    
    currentPage++;
    showLoading(true);
    
    try {
        const response = await fetch(
            `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(currentQuery)}&page=${currentPage}`
        );
        const data = await response.json();
        
        if (data.results && data.results.length > 0 && searchResults) {
            allMovies = [...allMovies, ...data.results];
            
            // Append new movies to existing ones
            data.results.forEach(movie => {
                const card = createMovieCard(movie);
                searchResults.appendChild(card);
            });
            
            // Hide load more if no more pages
            if (currentPage >= data.total_pages) {
                const loadMoreContainer = document.getElementById("loadMoreContainer");
                if (loadMoreContainer) loadMoreContainer.classList.add("hidden");
            }
        }
        
    } catch (error) {
        console.error("Load more error:", error);
        showToast("Failed to load more movies.", "error");
    } finally {
        showLoading(false);
    }
}

// ===== KEYBOARD SHORTCUTS =====
function handleKeyboardShortcuts(e) {
    // Escape to close modal
    if (e.key === "Escape") {
        if (movieModal && !movieModal.classList.contains("hidden")) {
            closeMovieModal();
        }
        if (mobileNav && !mobileNav.classList.contains("hidden")) {
            mobileNav.classList.add("hidden");
        }
    }
    
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (searchInput) searchInput.focus();
    }
}

// ===== GLOBAL FUNCTIONS =====
window.selectSuggestion = selectSuggestion;
window.deleteReview = deleteReview;
window.repeatSearch = repeatSearch;
window.clearHistory = clearHistory;
