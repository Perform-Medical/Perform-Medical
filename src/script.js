const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');
const year = document.getElementById('year');

const toast = document.getElementById('toast');
const chatWidget = document.getElementById('chatWidget');
const chatFab = document.getElementById('chatFab');
const chatLaunch = document.getElementById('chatLaunch');
const chatClose = document.getElementById('chatClose');
const chatPanel = document.getElementById('chatPanel');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatMessages = document.getElementById('chatMessages');

const contactForm = document.getElementById('contactForm');

const testimonialQuote = document.getElementById('testimonialQuote');
const testimonialName = document.getElementById('testimonialName');
const testimonialRole = document.getElementById('testimonialRole');
const prevTestimonial = document.getElementById('prevTestimonial');
const nextTestimonial = document.getElementById('nextTestimonial');

year.textContent = new Date().getFullYear();

const testimonials = [
  {
    quote: "The page should make people feel calm before they ever speak to anyone. That is what good medical design does.",
    name: "Patient Experience",
    role: "Comfort-first website style"
  },
  {
    quote: "Visitors coming from social media need a fast answer, a clear next step, and a page that looks trustworthy right away.",
    name: "Conversion Focus",
    role: "Built for attention and action"
  },
  {
    quote: "A premium medical site should feel private, clean, and easy to understand on a phone. That is what keeps people engaged.",
    name: "Mobile Design",
    role: "Designed for modern users"
  }
];

let testimonialIndex = 0;
let testimonialTimer = null;

function renderTestimonial(index) {
  const item = testimonials[index];
  testimonialQuote.textContent = item.quote;
  testimonialName.textContent = item.name;
  testimonialRole.textContent = item.role;
}

function nextTestimonialItem() {
  testimonialIndex = (testimonialIndex + 1) % testimonials.length;
  renderTestimonial(testimonialIndex);
}

function prevTestimonialItem() {
  testimonialIndex = (testimonialIndex - 1 + testimonials.length) % testimonials.length;
  renderTestimonial(testimonialIndex);
}

renderTestimonial(testimonialIndex);

function startTestimonialAutoRotate() {
  stopTestimonialAutoRotate();
  testimonialTimer = setInterval(nextTestimonialItem, 6000);
}

function stopTestimonialAutoRotate() {
  if (testimonialTimer) clearInterval(testimonialTimer);
}

startTestimonialAutoRotate();

prevTestimonial.addEventListener('click', () => {
  prevTestimonialItem();
  startTestimonialAutoRotate();
});

nextTestimonial.addEventListener('click', () => {
  nextTestimonialItem();
  startTestimonialAutoRotate();
});

menuToggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

nav.addEventListener('click', (e) => {
  if (e.target.matches('a')) {
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
});

const revealItems = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.14
});

revealItems.forEach((el) => io.observe(el));

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

function openChat() {
  chatWidget.classList.add('open');
  chatWidget.setAttribute('aria-hidden', 'false');
  setTimeout(() => chatInput.focus(), 50);
}

function closeChat() {
  chatWidget.classList.remove('open');
  chatWidget.setAttribute('aria-hidden', 'true');
}

chatFab.addEventListener('click', openChat);
chatLaunch.addEventListener('click', openChat);
chatClose.addEventListener('click', closeChat);

function appendBubble(text, type = 'bot') {
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${type}`;
  bubble.textContent = text;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return bubble;
}

async function sendToClaude(message) {
  const response = await fetch('/api/claude-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      history: [
        {
          role: 'system',
          content:
            'You are the Perform Medical website assistant. Be warm, concise, reassuring, and professional. ' +
            'Help users with services, booking, and general website questions. Do not provide medical diagnosis. ' +
            'Encourage professional care for medical concerns.'
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error('Bad response');
  }

  const data = await response.json();
  return data.reply || 'Thanks for reaching out.';
}

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = chatInput.value.trim();
  if (!message) return;

  appendBubble(message, 'user');
  chatInput.value = '';
  const typing = appendBubble('Typing...', 'bot');

  try {
    const reply = await sendToClaude(message);
    typing.textContent = reply;
  } catch (err) {
    typing.textContent =
      "Thanks for your message. The AI backend is not connected yet, but this chat can still be wired to Claude when your server is live.";
  }
});

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(contactForm);
  const name = formData.get('name');

  contactForm.reset();
  showToast(`Thanks, ${name}. Your message is ready to be sent.`);
});
