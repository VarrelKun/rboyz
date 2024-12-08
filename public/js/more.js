async function loadGallery() {
      try {
        const response = await fetch('/gallery');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const gallery = await response.json();
        const galleryContainer = document.getElementById('gallery-container');
        const showMoreBtn = document.getElementById('show-more-btn');

        let itemsToShow = 4; // Initial number of items to show
        let currentIndex = 0;

        function renderGallery() {
          const items = gallery.slice(0, currentIndex + itemsToShow);
          galleryContainer.innerHTML = items
            .map(
              (item) => `
                <li>
                  <div class="discover-card card">
                    <div class="card-banner img-holder" style="--width: 500; --height: 500;">
                      <img src="${item.imgUrl}" width="500" height="500" loading="lazy" alt="${item.username}" class="img-cover">
                    </div>
                    <div class="card-profile">
                      <img src="https://files.catbox.moe/z8uqjv.jpg" width="32" height="32" loading="lazy" alt="rb profile" class="img">
                      <a class="link:hover">@ ${item.username}</a>
                    </div>
                    
                    <h3 class="title-sm card-title">
                  
                </h3>
                
                    <div class="card-meta">
                      <div class="card-price"><span class="span">${item.caption}</span></div>
                      <p>redzöne</p>
                    </div>
                  </div>
                </li>
              `
            )
            .join('');

          // Handle "No More" state
          if (currentIndex + itemsToShow >= gallery.length) {
            showMoreBtn.textContent = 'No More';
            showMoreBtn.disabled = true;
            showMoreBtn.style.cursor = 'not-allowed';
          }
        }

        renderGallery();

        showMoreBtn.addEventListener('click', () => {
          currentIndex += itemsToShow;
          renderGallery();
        });
      } catch (error) {
        console.error('Error loading gallery:', error);
        alert('Failed to load gallery. Please try again later.');
      }
    }

    document.addEventListener('DOMContentLoaded', loadGallery);
    
    // Function to open the modal with image and caption
function openModal(imageUrl, caption) {
  // Set the modal image source and caption text
  document.getElementById('modalImage').src = imageUrl;
  document.getElementById('modalCaption').innerText = caption;

  // Show the modal
  document.getElementById('imageModal').style.display = 'flex';
}

// Function to close the modal
document.getElementById('closeModal').addEventListener('click', function () {
  document.getElementById('imageModal').style.display = 'none';
});

// Close the modal if the user clicks outside of the modal content
window.onclick = function(event) {
  if (event.target == document.getElementById('imageModal')) {
    document.getElementById('imageModal').style.display = 'none';
  }
};
