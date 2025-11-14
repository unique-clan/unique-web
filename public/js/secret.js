let currentSlide = 0;
const totalSlides = 5;

function updateCarousel() {
    const track = document.getElementById('carouselTrack');
    const indicators = document.querySelectorAll('.carousel-indicators .indicator');
    
    if (track) {
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        indicators.forEach((indicator, index) => {
            if (index === currentSlide) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
    }
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateCarousel();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateCarousel();
}

function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
}

let currentRecord = 0;
const totalRecords = 5;

function updateRecordsSlider() {
    const track = document.getElementById('sliderTrack');
    const dots = document.querySelectorAll('.slider-indicators .slider-dot');
    
    if (track) {
        track.style.transform = `translateX(-${currentRecord * 100}%)`;
        
        dots.forEach((dot, index) => {
            if (index === currentRecord) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
}

function nextRecord() {
    currentRecord = (currentRecord + 1) % totalRecords;
    updateRecordsSlider();
}

function prevRecord() {
    currentRecord = (currentRecord - 1 + totalRecords) % totalRecords;
    updateRecordsSlider();
}

function goToRecord(index) {
    currentRecord = index;
    updateRecordsSlider();
}

function toggleHistory(id) {
    const content = document.getElementById(id);
    const icon = document.getElementById(id + 'Icon');
    
    if (content.classList.contains('show')) {
        content.classList.remove('show');
        if (icon) {
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
        }
    } else {
        content.classList.add('show');
        if (icon) {
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {

    const carouselPrev = document.getElementById('carouselPrev');
    const carouselNext = document.getElementById('carouselNext');
    
    if (carouselPrev) {
        carouselPrev.addEventListener('click', prevSlide);
    }
    
    if (carouselNext) {
        carouselNext.addEventListener('click', nextSlide);
    }
    
    const indicators = document.querySelectorAll('.carousel-indicators .indicator');
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', function() {
            goToSlide(index);
        });
    });
    
    const sliderPrev = document.getElementById('sliderPrev');
    const sliderNext = document.getElementById('sliderNext');
    
    if (sliderPrev) {
        sliderPrev.addEventListener('click', prevRecord);
    }
    
    if (sliderNext) {
        sliderNext.addEventListener('click', nextRecord);
    }
    
    const sliderDots = document.querySelectorAll('.slider-indicators .slider-dot');
    sliderDots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            goToRecord(index);
        });
    });
});
