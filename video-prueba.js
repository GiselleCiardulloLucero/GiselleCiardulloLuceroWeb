(() => {
  'use strict';

  const stage = document.getElementById('video-background');
  const poster = document.querySelector('.video-poster');
  const status = document.getElementById('video-trial-status');
  const startButton = document.getElementById('video-trial-start');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let loadTimeout;

  if (!stage || !poster) return;

  function setStatus(message) {
    if (status) status.textContent = message;
  }

  function showPoster(message) {
    window.clearTimeout(loadTimeout);
    stage.classList.remove('is-visible');
    poster.hidden = false;
    setStatus(message);
  }

  if (reducedMotion) {
    showPoster('Fondo fijo para respetar tu preferencia de reducir el movimiento.');
    return;
  }

  const video = document.createElement('video');
  video.id = 'background-video';
  video.muted = true;
  video.defaultMuted = true;
  video.autoplay = true;
  video.playsInline = true;
  video.loop = false;
  video.controls = false;
  video.preload = 'auto';
  video.tabIndex = -1;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('aria-hidden', 'true');
  video.setAttribute('disablepictureinpicture', '');
  video.setAttribute('disableremoteplayback', '');

  function playVideo() {
    const result = video.play();
    result?.catch(error => {
      if (error.name === 'AbortError') return;
      showPoster(error.name === 'NotAllowedError'
        ? 'El navegador ha bloqueado la reproducción automática del fondo.'
        : 'No se ha podido reproducir el vídeo de fondo.');
    });
  }

  video.addEventListener('playing', () => {
    window.clearTimeout(loadTimeout);
    poster.hidden = true;
    stage.classList.add('is-visible');
    if (startButton) startButton.hidden = true;
    setStatus('Reproduciendo los diez segundos del vídeo de fondo.');
  });

  video.addEventListener('ended', () => {
    // El archivo termina en 0:10; se conserva su último fotograma, sin repetirlo.
    window.clearTimeout(loadTimeout);
    setStatus('Fondo pausado en 0:10.');
  });

  video.addEventListener('error', () => {
    showPoster('No se ha podido cargar el vídeo de fondo.');
  });

  startButton?.addEventListener('click', () => {
    video.currentTime = 0;
    playVideo();
  });

  window.addEventListener('pagehide', () => {
    window.clearTimeout(loadTimeout);
    video.pause();
  });

  window.addEventListener('pageshow', event => {
    if (event.persisted && !video.ended) playVideo();
  });

  loadTimeout = window.setTimeout(() => {
    if (video.readyState < 3 && !video.ended) {
      showPoster('El vídeo de fondo tarda en cargar.');
    }
  }, 15000);

  video.src = 'videos/fondo-proyecto-p-10s.mp4';
  stage.appendChild(video);
  playVideo();
})();
