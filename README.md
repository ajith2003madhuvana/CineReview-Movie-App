# CineReview - Movie Review & Rating Platform

CineReview is a movie discovery, review, and rating web application powered by the [TMDB API](https://www.themoviedb.org/documentation/api).  
It allows users to search movies, explore details, rate them, write reviews, and manage favorites/history in a responsive user-friendly interface.

---

## Features

### Movie Search and Discovery
- Search movies by title, actors, or genres.
- Real-time suggestions while typing.
- Quick genre filters (Action, Comedy, Drama, Horror, Sci-Fi).
- View trending and popular movies on the homepage.

### Movie Details
- Click on a movie card to open a modal with details.
- Displays poster, title, release year, runtime, rating, and genres.
- Provides an overview/description, cast, and director information.
- Option to add or remove favorites directly from the details modal.

### User Interactions
- Rate movies from 1 to 5 stars with ratings saved locally.
- Write and save reviews with live character counter.
- View and manage your submitted reviews.
- Reviews and ratings are stored in the browser using localStorage.

### Favorites System
- Add movies to your favorites list.
- Manage and view them under the Favorites section.
- Favorites count is displayed in the navigation bar.

### History and Search
- Search history tracking with up to 20 saved searches.
- Option to re-run previous searches.
- Ability to clear search history.

### User Interface and Experience
- Loading spinner displayed while fetching data.
- Toast notifications for success, error, or warning messages.
- Mobile-friendly navigation with hamburger menu.
- Smooth animations and hover effects.

---

## Technology Stack

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla JavaScript)
- **API:** TMDB (The Movie Database)  
- **Storage:** Browser localStorage (for ratings, favorites, and history)
- **Icons:** Font Awesome  
- **Deployment:** GitHub Pages

---

## Project Structure

CineReview/
│── index.html # Main HTML file
│── styles.css # Styling and responsive design
│── script.js # Core functionality (API calls and UI logic)
│── README.md # Documentation


