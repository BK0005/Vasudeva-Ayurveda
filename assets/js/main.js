/**
 * Vasudeva Ayurveda - Main Interactive Script
 * Handles custom animations, scrolling dynamics, mobile drawer menu,
 * and the booking form. (Dosha Quiz removed per user request)
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initScrollAnimations();
  initBookingForm();
});

/* ==========================================================================
   1. Navigation & Scroll Handling
   ========================================================================== */
function initNavigation() {
  const header = document.querySelector('.site-header');
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const mainNav = document.querySelector('.main-nav');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  // Sticky Header Effect on Scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    highlightNavLink();
  });

  // Mobile Menu Toggle
  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      mainNav.classList.toggle('active');
    });

    // Close menu when clicking navigation links
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        mainNav.classList.remove('active');
      });
    });
  }

  // Active Navigation Link Highlighting on Scroll
  function highlightNavLink() {
    let scrollPos = window.scrollY + 120; // Offset for header

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }
}

/* ==========================================================================
   2. Intersection Observer Scroll Reveal Animations
   ========================================================================== */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal');
  
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Once animated, no need to track it further
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    // Fallback if browser doesn't support IntersectionObserver
    revealElements.forEach(el => el.classList.add('active'));
  }
}

/* ==========================================================================
   3. Booking Form Validation & Success Portal
   ========================================================================== */
function initBookingForm() {
  const bookingForm = document.getElementById('bookingForm');
  const modalOverlay = document.getElementById('successModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const submitBtn = document.getElementById('bookSubmitBtn');

  if (!bookingForm || !modalOverlay) return;

  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Simple visual validation check
    const inputs = bookingForm.querySelectorAll('.form-control');
    let isValid = true;

    inputs.forEach(input => {
      if (input.hasAttribute('required') && !input.value.trim()) {
        isValid = false;
        input.style.borderColor = '#C25945'; // Highlight red
      } else {
        input.style.borderColor = 'rgba(28, 63, 36, 0.08)'; // Restore border
      }
    });

    if (!isValid) return;

    // Gather form values
    const name = document.getElementById('bookName').value.trim();
    const email = document.getElementById('bookEmail').value.trim();
    const phone = document.getElementById('bookPhone').value.trim();
    const preferredPackage = document.getElementById('bookPackage').value;
    const details = document.getElementById('bookDetails').value.trim();

    // Show loading state on button
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting Request...';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';

    try {
      // Send data to Express backend endpoint
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          package: preferredPackage,
          details
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Show success modal overlay
        modalOverlay.classList.add('active');
        bookingForm.reset();
      } else {
        alert(result.error || 'Failed to submit enquiry. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      alert('A network error occurred. Please verify your server is running and try again.');
    } finally {
      // Restore button state
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
    }
  });

  // Modal Closing Triggers
  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', () => {
      modalOverlay.classList.remove('active');
    });
  }

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.classList.remove('active');
    }
  });
}
