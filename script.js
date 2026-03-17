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
