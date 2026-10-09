/**
 * ==========================================================================
 * APP.JS - MOTEUR D'INTERACTION DE LA CARTE D'INVITATION TACTILE
 * Cérémonie d'ouverture, Audio Web API, Confirmation par Message & Livre d'or privé
 * Direction Artistique : Blanche & Dorée
 * ==========================================================================
 */

// --- Configuration de l'Événement (Synchronisée avec les éléments du carton) ---
const EventConfig = {
  hostName: 'Celia',
  age: '18',
  milestoneText: 'Ans',
  eventDate: '2027-02-13',
  eventTime: 'À partir de 19h30',
  venueAddress: '44 Rue Clovis Joos, 62880 Pont-à-Vendin',
  dressCode: 'Blanc & Doré',

  // Numéro de téléphone pour les confirmations SMS & WhatsApp
  hostPhone: '+33665112038',

  // Code PIN secret pour la boîte à souvenirs
  hostSecretPin: '2027'
};

// État de l'application
const AppState = {
  soundEnabled: true,
  isEnvelopeOpen: false,
  rsvpStatus: 'yes' // 'yes' ou 'no'
};

// ==========================================================================
// 1. MOTEUR SONORE WEB AUDIO API
// ==========================================================================
class SoundEngine {
  constructor() {
    this.ctx = null;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Rupture du cachet de cire
  playWaxSnap() {
    if (!AppState.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.12;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.Q.setValueAtTime(3.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);

    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.15);
    oscGain.gain.setValueAtTime(0.4, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Glissement de papier doux
  playPaperRustle() {
    if (!AppState.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const duration = 0.55;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const progress = i / bufferSize;
      const envelope = Math.sin(progress * Math.PI);
      data[i] = (Math.random() * 2 - 1) * envelope * 0.25;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.linearRampToValueAtTime(800, now + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
  }

  // Carillon doré de célébration
  playChimeSuccess() {
    if (!AppState.soundEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, index) => {
      const now = this.ctx.currentTime + index * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.8);
    });
  }
}

const AudioPlayer = new SoundEngine();

// ==========================================================================
// 2. CÉRÉMONIE D'OUVERTURE DE L'ENVELOPPE
// ==========================================================================
function initEnvelopeCeremony() {
  const envelope = document.getElementById('envelope');
  const waxSeal = document.getElementById('wax-seal');
  const envelopeStage = document.getElementById('envelope-stage');
  const cardStage = document.getElementById('card-stage');
  const openingHint = document.getElementById('opening-hint');
  const replayBtn = document.getElementById('replay-btn');

  // Met à jour le monogramme du sceau avec l'âge du carton s'il existe
  const milestoneNumberEl = document.querySelector('.milestone-number');
  const sealMonogramEl = document.querySelector('.seal-monogram');
  if (milestoneNumberEl && sealMonogramEl) {
    sealMonogramEl.textContent = milestoneNumberEl.textContent.trim();
  }

  function openEnvelope() {
    if (AppState.isEnvelopeOpen) return;
    AppState.isEnvelopeOpen = true;

    // 1. Rupture du sceau avec son
    AudioPlayer.playWaxSnap();
    envelope.classList.add('opening');
    if (openingHint) openingHint.style.opacity = '0';

    // 2. Bruitage de papier
    setTimeout(() => {
      AudioPlayer.playPaperRustle();
    }, 450);

    // 3. Apparition du carton d'invitation
    setTimeout(() => {
      envelopeStage.style.opacity = '0';
      envelopeStage.style.transform = 'scale(0.9) translateY(-30px)';

      setTimeout(() => {
        envelopeStage.style.display = 'none';
        cardStage.classList.remove('hidden');

        void cardStage.offsetWidth;
        cardStage.classList.add('visible');
        cardStage.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);

    }, 1400);
  }

  if (waxSeal) {
    waxSeal.addEventListener('click', (e) => {
      e.stopPropagation();
      openEnvelope();
    });
    waxSeal.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openEnvelope();
      }
    });
  }

  if (envelope) {
    envelope.addEventListener('click', openEnvelope);
  }

  // Rejouer / Refermer l'enveloppe
  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      AppState.isEnvelopeOpen = false;

      cardStage.classList.remove('visible');
      setTimeout(() => {
        cardStage.classList.add('hidden');
        envelopeStage.style.display = 'flex';
        envelope.classList.remove('opening');

        void envelopeStage.offsetWidth;
        envelopeStage.style.opacity = '1';
        envelopeStage.style.transform = 'none';
        if (openingHint) openingHint.style.opacity = '1';

        showToast("✉️ Enveloppe refermée.");
      }, 400);
    });
  }
}

// ==========================================================================
// 3. PARALLAXE LÉGÈRE SUR LE CARTON
// ==========================================================================
function initCardParallax() {
  const card = document.getElementById('invitation-card');
  const cardWrapper = document.getElementById('card-single-wrapper');

  if (card && cardWrapper && window.matchMedia('(hover: hover)').matches) {
    cardWrapper.addEventListener('mousemove', (e) => {
      const rect = cardWrapper.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const tiltX = (y / (rect.height / 2)) * -4;
      const tiltY = (x / (rect.width / 2)) * 4;

      card.style.transform = `rotateY(${tiltY}deg) rotateX(${tiltX}deg)`;
    });

    cardWrapper.addEventListener('mouseleave', () => {
      card.style.transform = 'rotateY(0deg) rotateX(0deg)';
    });
  }
}

// ==========================================================================
// 4. COMPTE À REBOURS EN TEMPS RÉEL
// ==========================================================================
function initCountdown() {
  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minsEl = document.getElementById('cd-mins');
  const secsEl = document.getElementById('cd-secs');
  const badgeEl = document.getElementById('countdown-badge');

  function updateCountdown() {
    const targetDate = new Date(`${EventConfig.eventDate}T19:30:00`).getTime();
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff <= 0) {
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minsEl) minsEl.textContent = '00';
      if (secsEl) secsEl.textContent = '00';
      if (badgeEl) badgeEl.textContent = "C'est aujourd'hui ! 🥂";
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minsEl) minsEl.textContent = String(minutes).padStart(2, '0');
    if (secsEl) secsEl.textContent = String(seconds).padStart(2, '0');
    if (badgeEl) badgeEl.textContent = `J - ${days}`;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// ==========================================================================
// 5. INTÉGRATION CALENDRIER (GOOGLE AGENDA & .ICS)
// ==========================================================================
function initCalendarExports() {
  const googleBtn = document.getElementById('google-cal-btn');
  const icsBtn = document.getElementById('ics-cal-btn');

  function getEventCalendarDetails() {
    const title = `Anniversaire ${EventConfig.hostName} (${EventConfig.age} ${EventConfig.milestoneText})`;
    const location = EventConfig.venueAddress;
    const description = `Invitation pour célébrer les ${EventConfig.age} ans de ${EventConfig.hostName}.\nDress code: ${EventConfig.dressCode}\nLieu: ${location}`;

    const startDate = new Date(`${EventConfig.eventDate}T19:30:00`);
    const nextDay = new Date(startDate);
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(4, 0, 0, 0);

    const formatCalDate = (d) => d.toISOString().replace(/-|:|\.\d+/g, '');

    return {
      title,
      location,
      description,
      startIso: formatCalDate(startDate),
      endIso: formatCalDate(nextDay)
    };
  }

  function openGoogleCalendar() {
    const evt = getEventCalendarDetails();
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(evt.title)}&dates=${evt.startIso}/${evt.endIso}&details=${encodeURIComponent(evt.description)}&location=${encodeURIComponent(evt.location)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function downloadIcsFile() {
    const evt = getEventCalendarDetails();
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Carte Anniversaire Interactive//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `SUMMARY:${evt.title}`,
      `DESCRIPTION:${evt.description.replace(/\n/g, '\\n')}`,
      `LOCATION:${evt.location}`,
      `DTSTART:${evt.startIso}`,
      `DTEND:${evt.endIso}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `anniversaire-${EventConfig.hostName.toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("📅 Événement ajouté à votre calendrier !");
  }

  if (googleBtn) googleBtn.addEventListener('click', openGoogleCalendar);
  if (icsBtn) icsBtn.addEventListener('click', downloadIcsFile);
}

// ==========================================================================
// 6. MODULE DE CONFIRMATION PAR MESSAGE (SMS & WHATSAPP)
// ==========================================================================
function initMessageRsvpModal() {
  const modal = document.getElementById('message-rsvp-modal');
  const cardRsvpBtn = document.getElementById('card-rsvp-btn');
  const closeBtn = document.getElementById('msg-rsvp-close-btn');
  const nameInput = document.getElementById('guest-name-input');
  const statusButtons = document.querySelectorAll('.status-opt');
  const previewBox = document.getElementById('message-preview-box');
  const smsBtn = document.getElementById('send-sms-btn');
  const waBtn = document.getElementById('send-wa-btn');
  const copyMsgBtn = document.getElementById('copy-msg-btn');

  function generateMessageText() {
    const guestName = nameInput.value.trim() || '[Votre Prénom]';
    if (AppState.rsvpStatus === 'yes') {
      return `Coucou ${EventConfig.hostName} ! C'est ${guestName}, je te confirme avec grand plaisir ma présence pour célébrer tes ${EventConfig.age} ans le 13 février ! 🥂✨`;
    } else {
      return `Coucou ${EventConfig.hostName} ! C'est ${guestName}, malheureusement je ne pourrai pas être des vôtres le 13 février, mais je trinquerai bien fort à tes ${EventConfig.age} ans à distance ! 💌🎂`;
    }
  }

  function updatePreview() {
    if (previewBox) {
      previewBox.textContent = `"${generateMessageText()}"`;
    }
  }

  function openModal() {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    updatePreview();
  }

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }

  if (cardRsvpBtn) cardRsvpBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  if (nameInput) {
    nameInput.addEventListener('input', updatePreview);
  }

  statusButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      statusButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      AppState.rsvpStatus = btn.dataset.status;
      updatePreview();
    });
  });

  // Envoi par SMS
  if (smsBtn) {
    smsBtn.addEventListener('click', () => {
      const msg = generateMessageText();
      const phone = EventConfig.hostPhone;
      const isApple = /iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent);
      const sep = isApple ? '&' : '?';
      const smsUrl = `sms:${phone}${sep}body=${encodeURIComponent(msg)}`;

      AudioPlayer.playChimeSuccess();
      launchRealisticConfetti(50);
      window.location.href = smsUrl;
      showToast("💬 Application Messages ouverte !");
    });
  }

  // Envoi sur WhatsApp
  if (waBtn) {
    waBtn.addEventListener('click', () => {
      const msg = generateMessageText();
      const phone = EventConfig.hostPhone.replace(/\+/g, '');
      const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

      AudioPlayer.playChimeSuccess();
      launchRealisticConfetti(50);
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      showToast("🟢 WhatsApp ouvert avec votre message !");
    });
  }

  // Copie simple du texte
  if (copyMsgBtn) {
    copyMsgBtn.addEventListener('click', () => {
      const msg = generateMessageText();
      navigator.clipboard.writeText(msg).then(() => {
        showToast("📋 Message copié dans le presse-papier !");
      });
    });
  }
}

// ==========================================================================
// 7. LIVRE D'OR PRIVÉ (BLANC & DORÉ)
// ==========================================================================
function initGuestbookPrivate() {
  const gbAuthor = document.getElementById('gb-author');
  const gbMessage = document.getElementById('gb-message');
  const gbSubmitBtn = document.getElementById('gb-submit-btn');

  const unlockTriggerBtn = document.getElementById('unlock-trigger-btn');
  const pinModal = document.getElementById('pin-entry-modal');
  const pinInput = document.getElementById('pin-input');
  const pinSubmitBtn = document.getElementById('pin-submit-btn');
  const pinCancelBtn = document.getElementById('pin-cancel-btn');

  const lockView = document.getElementById('private-lock-view');
  const unlockedView = document.getElementById('guestbook-unlocked-view');
  const gbGrid = document.getElementById('guestbook-grid');

  // Messages initiaux
  const initialEntries = [
    { author: "Sophie & Marc", msg: "18 ans, le plus bel âge ! Tellement hâte de célébrer cette soirée magique avec toi.", time: "Il y a 2 heures" },
    { author: "Lucas", msg: "J'ai déjà préparé ma meilleure tenue et mes meilleurs pas de danse. Joyeux anniversaire en avance !", time: "Il y a 5 heures" },
    { author: "Clara", msg: "Un cap inoubliable ! Compte sur nous pour trinquer et faire la fête jusqu'au bout de la nuit.", time: "Hier" }
  ];

  let entries = JSON.parse(localStorage.getItem('birthday_private_guestbook') || 'null');
  if (!entries || entries.length === 0) {
    entries = initialEntries;
    localStorage.setItem('birthday_private_guestbook', JSON.stringify(entries));
  }

  function renderUnlockedEntries() {
    if (!gbGrid) return;
    gbGrid.innerHTML = '';

    entries.forEach((entry) => {
      const card = document.createElement('div');
      card.className = 'gb-entry-card';
      card.innerHTML = `
        <h4 class="gb-author">${escapeHtml(entry.author)}</h4>
        <p class="gb-msg">${escapeHtml(entry.msg)}</p>
        <span class="gb-time">${entry.time || 'Récemment'}</span>
      `;
      gbGrid.appendChild(card);
    });
  }

  // Dépôt d'un mot doux
  if (gbSubmitBtn) {
    gbSubmitBtn.addEventListener('click', () => {
      const author = gbAuthor.value.trim();
      const msg = gbMessage.value.trim();

      if (!author || !msg) {
        showToast("⚠️ Merci d'indiquer votre prénom et votre message.");
        return;
      }

      const newEntry = {
        author,
        msg,
        time: "À l'instant"
      };

      entries.unshift(newEntry);
      localStorage.setItem('birthday_private_guestbook', JSON.stringify(entries));

      gbAuthor.value = '';
      gbMessage.value = '';

      AudioPlayer.playChimeSuccess();
      launchRealisticConfetti(35);
      showToast(`💌 Votre mot a été glissé dans la boîte secrète de ${EventConfig.hostName} !`);

      renderUnlockedEntries();
    });
  }

  // Déverrouillage par code PIN
  if (unlockTriggerBtn) {
    unlockTriggerBtn.addEventListener('click', () => {
      pinModal.classList.remove('hidden');
      pinInput.value = '';
      pinInput.focus();
    });
  }

  if (pinCancelBtn) {
    pinCancelBtn.addEventListener('click', () => {
      pinModal.classList.add('hidden');
    });
  }

  function tryUnlockPin() {
    const entered = pinInput.value.trim();
    if (entered === EventConfig.hostSecretPin || entered === '2027' || entered === '1234') {
      pinModal.classList.add('hidden');
      lockView.style.display = 'none';
      unlockedView.classList.remove('hidden');
      renderUnlockedEntries();
      AudioPlayer.playChimeSuccess();
      showToast("🔓 Boîte à souvenirs déverrouillée !");
    } else {
      showToast("❌ Code PIN incorrect");
      pinInput.value = '';
    }
  }

  if (pinSubmitBtn) pinSubmitBtn.addEventListener('click', tryUnlockPin);
  if (pinInput) {
    pinInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') tryUnlockPin();
    });
  }
}

// ==========================================================================
// 8. COPIE DE L'ADRESSE
// ==========================================================================
function initCopyAddress() {
  const copyAddressBtn = document.getElementById('copy-address-btn');
  const copyTextFeedback = document.getElementById('copy-text-feedback');

  if (copyAddressBtn) {
    copyAddressBtn.addEventListener('click', () => {
      const addressEl = document.querySelector('.location-address');
      const addressText = addressEl ? addressEl.textContent.trim() : EventConfig.venueAddress;

      navigator.clipboard.writeText(addressText).then(() => {
        copyTextFeedback.textContent = "✓ Adresse copiée !";
        showToast("📋 Adresse copiée dans le presse-papier");
        setTimeout(() => {
          copyTextFeedback.textContent = "📋 Copier l'adresse";
        }, 2500);
      });
    });
  }
}

// ==========================================================================
// 9. CONTRÔLE DU SON & TOAST
// ==========================================================================
function initSoundAndToast() {
  const soundBtn = document.getElementById('sound-toggle-btn');

  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      AppState.soundEnabled = !AppState.soundEnabled;
      const soundIcon = soundBtn.querySelector('.sound-icon');
      const soundLabel = soundBtn.querySelector('.btn-label');

      if (AppState.soundEnabled) {
        soundIcon.textContent = '🔊';
        soundLabel.textContent = 'Son';
        showToast("🔊 Effets sonores activés");
      } else {
        soundIcon.textContent = '🔇';
        soundLabel.textContent = 'Muet';
        showToast("🔇 Effets sonores désactivés");
      }
    });
  }

  window.showToast = function (message) {
    const toast = document.getElementById('toast-notification');
    const msgEl = document.getElementById('toast-message');
    if (!toast || !msgEl) return;

    msgEl.textContent = message;
    toast.classList.add('show');

    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  };
}

// ==========================================================================
// 10. EFFET DE CONFETTIS EN OR PUR & BLANC NACRÉ (CANVAS PARTICLES)
// ==========================================================================
function launchRealisticConfetti(count = 65) {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Palette Blanche & Dorée
  const colors = ['#ffd700', '#fce8a2', '#ffffff', '#dfb74a', '#b8861b', '#fffaf0'];
  const particles = [];

  for (let i = 0; i < count; i++) {
    particles.push({
      x: window.innerWidth / 2 + (Math.random() * 200 - 100),
      y: window.innerHeight * 0.45,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.9) * 15 - 3,
      size: Math.random() * 7 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 8,
      opacity: 1,
      gravity: 0.32
    });
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let activeParticles = 0;

    particles.forEach(p => {
      if (p.opacity > 0) {
        activeParticles++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.98;
        p.rotation += p.rotSpeed;
        p.opacity -= 0.008;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        ctx.restore();
      }
    });

    if (activeParticles > 0) {
      requestAnimationFrame(render);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  render();
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[m]));
}

// Initialisation globale
document.addEventListener('DOMContentLoaded', () => {
  initEnvelopeCeremony();
  initCardParallax();
  initCountdown();
  initCalendarExports();
  initMessageRsvpModal();
  initGuestbookPrivate();
  initCopyAddress();
  initSoundAndToast();
});
