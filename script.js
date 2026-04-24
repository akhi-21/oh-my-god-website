const EMAILJS_PUBLIC_KEY = "yYPz71VQ43yloFVTO";
const EMAILJS_SERVICE_ID = "service_im2h0ds";
const EMAILJS_TEMPLATE_ID = "template_yjuqckb"; // use your Contact Us template ID

if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);

  const introSequence = document.querySelector(".intro-sequence");
  const introContent = document.querySelector(".intro-content");

  if (introSequence && introContent) {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: introSequence,
        start: "top top",
        end: "+=1500",
        pin: true,
        scrub: 1,
      }
    });

    tl.to(introContent, {
      scale: 80,
      opacity: 0,
      duration: 1,
      ease: "power2.inOut"
    });
  }
}

const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-menu a");
const revealItems = document.querySelectorAll(".reveal");
const form = document.getElementById("contact-form");
const statusMessage = document.getElementById("form-status");
const currentYear = document.getElementById("year");

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18
    }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

if (window.emailjs) {
  window.emailjs.init({
    publicKey: EMAILJS_PUBLIC_KEY
  });
}

const validators = {
  name: (value) => value.trim().length >= 2 || "Please enter your name.",
  email: (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || "Please enter a valid email address.",
  subject: (value) => value.trim().length >= 3 || "Please enter a subject.",
  message: (value) => value.trim().length >= 10 || "Please enter at least 10 characters."
};

function setFieldState(field, message) {
  const wrapper = field.closest(".form-row");
  const errorNode = wrapper ? wrapper.querySelector(".error-message") : null;

  if (!wrapper || !errorNode) {
    return;
  }

  if (message) {
    wrapper.classList.add("is-invalid");
    errorNode.textContent = message;
  } else {
    wrapper.classList.remove("is-invalid");
    errorNode.textContent = "";
  }
}

function validateField(field) {
  const rule = validators[field.name];

  if (!rule) {
    return true;
  }

  const result = rule(field.value);

  if (result === true) {
    setFieldState(field, "");
    return true;
  }

  setFieldState(field, result);
  return false;
}

function updateStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.classList.remove("is-success", "is-error");

  if (type) {
    statusMessage.classList.add(type);
  }
}

if (form) {
  const fields = Array.from(form.querySelectorAll("input, textarea"));

  fields.forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.closest(".form-row")?.classList.contains("is-invalid")) {
        validateField(field);
      }
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const isValid = fields.every((field) => validateField(field));

    if (!isValid) {
      updateStatus("Please correct the highlighted fields and try again.", "is-error");
      return;
    }

    if (!window.emailjs) {
      updateStatus(
        "EmailJS is not loaded. Please check your internet connection and try again.",
        "is-error"
      );
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const originalLabel = submitButton.textContent;

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";
    updateStatus("Sending your message...", "");

    try {
      await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        from_name: form.name.value.trim(),
        from_email: form.email.value.trim(),
        subject: form.subject.value.trim(),
        message: form.message.value.trim(),
        reply_to: form.email.value.trim()
      });

      form.reset();
      fields.forEach((field) => setFieldState(field, ""));
      updateStatus("Message sent successfully. We’ll get back to you soon.", "is-success");
    } catch (error) {
      updateStatus("Something went wrong while sending your message. Please try again.", "is-error");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalLabel;
    }
  });
}
