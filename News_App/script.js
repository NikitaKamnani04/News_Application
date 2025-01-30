document.addEventListener("DOMContentLoaded", () => {
    let currentQuery = "";
    let currentPage = 1;
    const pageSize = 20;
    const isViewingBookmarks = window.location.pathname.includes('bookmarks'); // Check if we are on the bookmarks page

    const fetchNews = async (page = 1, query = "") => {
        console.log("Fetching news...");
        let category = "";
        if (["sports", "business", "entertainment", "health", "science", "technology"].includes(query.toLowerCase())) {
            category = `category=${query.toLowerCase()}&`;
            query = "";
        }

        const url = `https://newsapi.org/v2/top-headlines?country=us&page=${page}&pageSize=${pageSize}&${query ? `q=${query}&` : ""}${category}language=en&apiKey=64ea96bd824146e1a9c6b086a938d6b0`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.status !== "ok" || !data.articles.length) {
                document.querySelector(".content").innerHTML = "<p>No articles found. Try a different search term.</p>";
                document.getElementById("resultCount").innerText = "0"; // Update result count to 0
                return;
            }

            // Update the result count with the correct number of articles
            document.getElementById("resultCount").innerText = data.articles.length;
            
            let str = "";
            const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
            
            for (const item of data.articles) {
                const isBookmarked = bookmarks.some(bookmark => bookmark.id === item.url);  
                str += `<div class="card my-4 mx-2" style="width: 18rem;">
                        <img height="184" src="${item.urlToImage || 'https://via.placeholder.com/184'}" class="card-img-top mt-2" alt="Image not available">
                        <div class="card-body">
                            <h5 class="card-title">${item.title.slice(0, 23)}...</h5>
                            <p class="card-text">${item.description ? item.description.slice(0, 123) : "No description available"}...</p>
                          <div class="d-flex justify-content-between gap-1">
                    <a href="${item.url}" target="_blank" class="btn btn-primary btn-sm">Read Article</a>
                    <button class="btn btn-secondary save-btn btn-sm" data-id="${item.url}" data-title="${item.title}" data-description="${item.description}" data-image="${item.urlToImage}" ${isBookmarked ? 'disabled' : ''}>${isBookmarked ? 'Already Bookmarked' : 'Save Bookmark'}</button>
                </div>
                        </div>
                    </div>`;
            }
            document.querySelector(".content").innerHTML = str;
            document.querySelectorAll('.save-btn').forEach(button => button.addEventListener('click', saveBookmark));
        } catch (error) {
            document.querySelector(".content").innerHTML = "<p>Something went wrong. Please try again later.</p>";
            document.getElementById("resultCount").innerText = "0"; // Update result count to 0 on error
        }
    };

    const saveBookmark = (e) => {
        const article = e.target;
        let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
        const articleData = {
            id: article.getAttribute('data-id'),
            title: article.getAttribute('data-title'),
            description: article.getAttribute('data-description'),
            image: article.getAttribute('data-image')
        };

        if (!bookmarks.some(bookmark => bookmark.id === articleData.id)) {
            bookmarks.push(articleData);
            localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
            document.getElementById("resultCount").innerText = bookmarks.length;
        }

        alert('Article saved to bookmarks!');
        article.disabled = true;
        article.innerText = "Already Bookmarked";
    };

    const displayBookmarks = (query = "") => {
        const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
        
        let filteredBookmarks = bookmarks;
        if (query) {
            filteredBookmarks = bookmarks.filter(bookmark => bookmark.title.toLowerCase().includes(query.toLowerCase()) || (bookmark.description && bookmark.description.toLowerCase().includes(query.toLowerCase())));
        }

        let str = filteredBookmarks.length > 0 ? '<h5>Saved Bookmarks</h5>' : '<p>No bookmarks saved yet.</p>';
        
        filteredBookmarks.forEach(item => {
            str += `<div class="card my-4 mx-2" style="width: 18rem;">
                        <img height="184" src="${item.image || 'https://via.placeholder.com/184'}" class="card-img-top" alt="Image not available">
                        <div class="card-body">
                            <h5 class="card-title">${item.title.slice(0, 23)}...</h5>
                            <p class="card-text">${item.description ? item.description.slice(0, 123) : "No description available"}...</p>
                            <a href="${item.id}" target="_blank" class="btn btn-primary btn-sm">Read More</a>
                        </div>
                    </div>`;
        });
        document.querySelector(".content").innerHTML = str;

        // Update the bookmark count dynamically
        document.getElementById("resultCount").innerText = filteredBookmarks.length;
    };

    const handleSearch = (query) => {
        currentQuery = query.trim();
        
        if (currentQuery) {
            currentPage = 1;
            if (isViewingBookmarks) {
                // If we are on the bookmarks page, show only filtered bookmarks
                displayBookmarks(currentQuery);
            } else {
                // Otherwise, fetch news from the API
                fetchNews(currentPage, currentQuery);
            }
        }
    };

    // Initial news load if we're on the homepage
    if (!isViewingBookmarks) {
        fetchNews(currentPage); 
    } else {
        displayBookmarks(); // Display saved bookmarks if we are on the bookmarks page
    }
    
    document.getElementById("search").addEventListener("click", (e) => {
        e.preventDefault();
        handleSearch(document.getElementById("searchInput").value);
    });
    
    document.getElementById("previous").addEventListener("click", () => {
        if (currentPage > 1) fetchNews(--currentPage, currentQuery);
    });
    
    document.getElementById("next").addEventListener("click", () => {
        fetchNews(++currentPage, currentQuery);
    });
    
    document.getElementById("viewSavedBookmarksBtn").addEventListener("click", () => {
        // Switch to the bookmarks view
        displayBookmarks();
    });
});
