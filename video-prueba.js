(() => {
  'use strict';

  const VIDEO_ID = '1seDTiGlVqs';
  const PAUSE_AT_SECONDS = 10;
  const stage = document.getElementById('video-background');
  const poster = document.querySelector('.video-poster');
  const status = document.getElementById('video-trial-status');
  const startButton = document.getElementById('video-trial-start');
  const localLink = document.getElementById('video-trial-local');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let player;
  let ready = false;
  let reachedLimit = false;
  let timer;
  let loadTimeout;

  function clearTimer() {
    window.clearInterval(timer);
    timer = undefined;
  }

  function showPoster(message) {
    clearTimer();
    window.clearTimeout(loadTimeout);
    stage.classList.remove('is-visible');
    poster.hidden = false;
    status.textContent = message;
    startButton.hidden = true;
  }

  function startClip() {
    if (!ready) return;
    clearTimer();
    reachedLimit = false;
    poster.hidden = true;
    player.mute();
    player.seekTo(0, true);
    player.playVideo();
    startButton.hidden = true;
    status.textContent = 'Iniciando el fondo de vídeo…';
  }

  function checkTime() {
    if (!ready || reachedLimit || player.getCurrentTime() < PAUSE_AT_SECONDS) return;
    reachedLimit = true;
    clearTimer();
    player.pauseVideo();
  }

  function onStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
      if (reachedLimit) {
        player.pauseVideo();
        return;
      }
      stage.classList.add('is-visible');
      poster.hidden = true;
      startButton.hidden = true;
      status.textContent = 'Prueba: el vídeo se pausará en 0:10.';
      clearTimer();
      timer = window.setInterval(checkTime, 50);
      checkTime();
    } else if (event.data === YT.PlayerState.PAUSED) {
      clearTimer();
      if (reachedLimit) {
        // El ajuste se hace ya en pausa para conservar la imagen, sin terminar el vídeo.
        if (Math.abs(player.getCurrentTime() - PAUSE_AT_SECONDS) > .15) {
          player.seekTo(PAUSE_AT_SECONDS, true);
        }
        status.textContent = 'Fondo pausado en 0:10.';
        startButton.textContent = 'Repetir los diez segundos';
        startButton.hidden = false;
      } else if (stage.classList.contains('is-visible')) {
        showPoster('Fondo fijo del vídeo.');
      }
    }
  }

  function onError(event) {
    const messages = {
      100: 'YouTube no encuentra este vídeo o no permite acceder a él.',
      101: 'Este vídeo no permite su reproducción fuera de YouTube.',
      150: 'Este vídeo no permite su reproducción fuera de YouTube.',
      153: 'YouTube necesita que esta prueba se abra mediante la previsualización local.'
    };
    showPoster(messages[event.data] || 'No se pudo cargar el vídeo. Se muestra una imagen fija como fondo.');
  }

  function initializePlayer() {
    if (player) return;
    player = new YT.Player('background-youtube-player', {
      events: {
        onReady(event) {
          window.clearTimeout(loadTimeout);
          ready = true;
          event.target.mute();
          event.target.playVideo();
        },
        onStateChange,
        onError,
        onAutoplayBlocked() {
          showPoster('Fondo fijo: el navegador ha bloqueado la reproducción automática.');
        }
      }
    });
  }

  startButton.addEventListener('click', startClip);
  window.addEventListener('pagehide', () => {
    clearTimer();
    window.clearTimeout(loadTimeout);
    if (ready) player.pauseVideo();
  });

  if (window.location.protocol === 'file:') {
    showPoster('Para ver el fondo de YouTube, abre «Abrir web.cmd» y utiliza la previsualización local.');
    localLink.hidden = false;
    return;
  }

  if (reducedMotion) {
    showPoster('Fondo fijo para respetar tu preferencia de reducir el movimiento.');
    return;
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'background-youtube-player';
  iframe.title = 'Vídeo de fondo de Proyecto P';
  iframe.tabIndex = -1;
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  const params = new URLSearchParams({
    enablejsapi: '1', autoplay: '0', mute: '1', controls: '0', playsinline: '1',
    rel: '0', disablekb: '1', fs: '0', iv_load_policy: '3',
    origin: window.location.origin
  });
  iframe.src = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?${params}`;
  stage.appendChild(iframe);

  if (window.YT && window.YT.Player) {
    initializePlayer();
  } else {
    window.onYouTubeIframeAPIReady = initializePlayer;
    const apiScript = document.createElement('script');
    apiScript.src = 'https://www.youtube.com/iframe_api';
    apiScript.async = true;
    apiScript.onerror = () => {
      showPoster('No se pudo conectar con YouTube. Se muestra una imagen fija como fondo.');
    };
    document.head.appendChild(apiScript);
  }
  loadTimeout = window.setTimeout(() => {
    if (!ready) showPoster('YouTube tarda en cargar. Se muestra una imagen fija como fondo.');
  }, 15000);
})();
