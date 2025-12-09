document.addEventListener('DOMContentLoaded', () => {
  const slider = document.querySelector('[data-about-slider]');
  if (!slider) {
    return;
  }

  const slides = Array.from(slider.querySelectorAll('[data-about-slide]'));
  const prevButton = slider.querySelector('[data-about-prev]');
  const nextButton = slider.querySelector('[data-about-next]');
  const counter = slider.querySelector('[data-about-counter]');

  if (!slides.length) {
    return;
  }

  if (!slider.hasAttribute('tabindex')) {
    slider.tabIndex = 0;
  }

  let activeIndex = Math.max(0, slides.length - 1); // show most recent (last) first

  const updateSlide = (nextIndex) => {
    activeIndex = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });

    if (counter) {
      counter.textContent = `${activeIndex + 1}/${slides.length}`;
      counter.hidden = slides.length <= 1;
    }
  };

  const toggleNavVisibility = () => {
    const hideNav = slides.length <= 1;
    if (prevButton) prevButton.style.display = hideNav ? 'none' : '';
    if (nextButton) nextButton.style.display = hideNav ? 'none' : '';
  };

  if (prevButton) {
    prevButton.addEventListener('click', () => updateSlide(activeIndex - 1));
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => updateSlide(activeIndex + 1));
  }

  slider.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      updateSlide(activeIndex - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      updateSlide(activeIndex + 1);
    }
  });

  toggleNavVisibility();
  updateSlide(0);
});
