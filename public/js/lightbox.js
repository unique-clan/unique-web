document.addEventListener('DOMContentLoaded', () => {
    
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    
    const content = document.createElement('div');
    content.className = 'lightbox-content';
    
    const img = document.createElement('img');
    img.className = 'lightbox-image';
    
    content.appendChild(img);
    overlay.appendChild(content);
    document.body.appendChild(overlay);

    document.querySelectorAll('.map-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            img.src = link.href;
            overlay.classList.add('active');
        });
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('active');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            overlay.classList.remove('active');
        }
    });
});