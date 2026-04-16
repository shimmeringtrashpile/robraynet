// Footer include script
document.addEventListener('DOMContentLoaded', function() {
  // Find the footer placeholder
  const footerPlaceholder = document.getElementById('footer-placeholder');
  
  if (footerPlaceholder) {
    // Load the footer content
    fetch('footer.html')
      .then(response => {
        if (!response.ok) {
          throw new Error('Footer not found');
        }
        return response.text();
      })
      .then(data => {
        footerPlaceholder.innerHTML = data;
      })
      .catch(error => {
        console.error('Error loading footer:', error);
        // Fallback footer content
        footerPlaceholder.innerHTML = `
          <div class="nav-block">
            <h3>Navigation</h3>
            <ul>
              <li class="nav-item"><a href="index.html">Home</a></li>
              <li class="nav-item"><a href="blog/index.html">Blog</a></li>
              <li class="nav-item"><a href="bio.html">Bio & CV</a></li>
              <li class="nav-item"><a href="privacy-policy.html">Privacy Policy</a></li>
            </ul>
          </div>
        `;
      });
  }
}); 