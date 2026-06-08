const tabButtons = document.querySelectorAll(".tab-button");
const tabPanels = document.querySelectorAll(".tab-panel");
const feedback = document.getElementById("form-feedback");
const form = document.getElementById("contact-form");
const reviewCard = document.getElementById("review-card");
const reviewText = document.getElementById("review-text");
const reviewAuthor = document.getElementById("review-author");

const switchTab = (targetId) => {
  tabButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tab === targetId);
  });

  tabPanels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.id === targetId);
  });
};

tabButtons.forEach((button) => {
  button.addEventListener("click", () => switchTab(button.dataset.tab));
});

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (feedback) {
      feedback.textContent = "Merci ! Votre demande a bien ete envoyee.";
    }
    form.reset();
  });
}

const defaultReviews = [
  {
    text: "Barbara est d'une douceur incroyable, on lui confie notre chat les yeux fermes.",
    author: "Emma"
  },
  {
    text: "Promenades au bord du lac et nouvelles quotidiennes, parfait.",
    author: "Thomas"
  },
  {
    text: "Notre chien l'adore, service pro et rassurant.",
    author: "Camille"
  },
  {
    text: "Toujours ponctuelle, attentionnee et disponible.",
    author: "Lucas"
  },
  {
    text: "On recoit des photos a chaque visite, c'est top.",
    author: "Aline"
  }
];

const rotateReviews = (reviews) => {
  if (!reviewCard || !reviewText || !reviewAuthor || !reviews.length) {
    return;
  }

  let currentIndex = 0;

  const showReview = () => {
    const item = reviews[currentIndex];
    reviewText.textContent = `"${item.text}"`;
    reviewAuthor.textContent = `— ${item.author}`;
    currentIndex = (currentIndex + 1) % reviews.length;
  };

  showReview();

  setInterval(() => {
    reviewCard.classList.add("is-fading");
    setTimeout(() => {
      showReview();
      reviewCard.classList.remove("is-fading");
    }, 350);
  }, 4500);
};

const loadReviews = async () => {
  try {
    const response = await fetch("reviews.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to load reviews");
    }
    const reviews = await response.json();
    rotateReviews(Array.isArray(reviews) ? reviews : defaultReviews);
  } catch (error) {
    rotateReviews(defaultReviews);
  }
};

loadReviews();

// --- Lightbox ---
let lightboxImages = [];
let lightboxIndex = 0;

const lightbox = document.createElement("div");
lightbox.className = "lightbox";
const lightboxImg = document.createElement("img");
lightboxImg.className = "lightbox-img";
lightbox.appendChild(lightboxImg);
document.body.appendChild(lightbox);

const openLightbox = (srcs, index) => {
  lightboxImages = srcs;
  lightboxIndex = index;
  lightboxImg.src = srcs[index];
  lightbox.classList.add("is-open");
};

const closeLightbox = () => lightbox.classList.remove("is-open");

const showImage = (index) => {
  lightboxIndex = (index + lightboxImages.length) % lightboxImages.length;
  lightboxImg.src = lightboxImages[lightboxIndex];
};

lightbox.addEventListener("click", (e) => {
  if (e.target === lightboxImg) {
    const rect = lightboxImg.getBoundingClientRect();
    e.clientX - rect.left > rect.width / 2 ? showImage(lightboxIndex + 1) : showImage(lightboxIndex - 1);
  } else {
    closeLightbox();
  }
});

document.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("is-open")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowRight") showImage(lightboxIndex + 1);
  if (e.key === "ArrowLeft") showImage(lightboxIndex - 1);
});

const loadGalerie = async () => {
  const galerieDiv = document.querySelector(".galerie");
  if (!galerieDiv) return;

  try {
    const response = await fetch("/api/galerie");
    if (!response.ok) throw new Error("Failed to load galerie");
    const images = await response.json();
    const srcs = images.map(img => `galerie/${img}`);
    galerieDiv.innerHTML = srcs
      .map((src, i) => `<div class="galerie-item"><img src="${src}" alt="" data-index="${i}"></div>`)
      .join("");
    galerieDiv.querySelectorAll("img").forEach((img, i) => {
      img.addEventListener("click", () => openLightbox(srcs, i));
    });
  } catch (error) {
    console.error("Galerie:", error);
  }
};

loadGalerie();

const contactForm = document.getElementById("contact-form");
const formFeedback = document.getElementById("form-feedback");

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(contactForm));
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.ok) {
        formFeedback.textContent = "Message envoyé avec succès !";
        contactForm.reset();
      } else {
        formFeedback.textContent = "Erreur lors de l'envoi. Veuillez réessayer.";
      }
    } catch {
      formFeedback.textContent = "Erreur réseau. Veuillez réessayer.";
    }
  });
}
