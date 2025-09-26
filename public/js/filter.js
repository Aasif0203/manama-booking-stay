document.addEventListener('DOMContentLoaded', function() {
    const sharingToggle = document.getElementById('sharing-toggle');
    const genderOptions = document.getElementById('gender-options');
    const priceRange = document.getElementById('price-range');
    const priceMax = document.getElementById('price-max');
    const hiddenSearchTerm = document.getElementById('searchTerm');
    
    // Show/hide gender options when toggled
    if (sharingToggle && genderOptions) {
        sharingToggle.addEventListener('change', function() {
            genderOptions.style.display = this.checked ? 'block' : 'none';
        });
    }
    
    // Update price display
    if (priceRange && priceMax) {
        priceRange.addEventListener('input', function() {
            priceMax.textContent = this.value;
        });
    }
    
    // Get search term from URL and populate hidden field
    if (hiddenSearchTerm) {
        const params = new URLSearchParams(window.location.search);
        const searchTerm = params.get('searchTerm');
        if (searchTerm) {
            hiddenSearchTerm.value = searchTerm;
        }
    }
});