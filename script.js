document.addEventListener("DOMContentLoaded", () => {

// Aparición del nombre y controles de la portada.
document.getElementById('name').classList.add('show');

const projectPreview = document.getElementById('project-preview');
const projectPreviewImage = document.getElementById('project-preview-image');
const projectPreviewPrev = document.getElementById('project-preview-prev');
const projectPreviewNext = document.getElementById('project-preview-next');
const projectPreviewConnector = document.getElementById('project-preview-connector');
const projectPreviewConnectorPath = document.getElementById('project-preview-connector-path');
const galleryLink = document.querySelector('.btn-p');
let projectPreviewConnectorAnimation;
const projectPreviewImages = [
  'imagenes/p-06.jpg',
  'imagenes/p-08.jpg',
  'imagenes/p-35.jpg',
  'imagenes/p-30.jpg',
  'imagenes/p-36.jpg'
];
let projectPreviewIndex = 0;

function showProjectPreviewImage(index){
  projectPreviewIndex = (index + projectPreviewImages.length) % projectPreviewImages.length;
  if (projectPreviewImage) {
    projectPreviewImage.src = projectPreviewImages[projectPreviewIndex];
    projectPreviewImage.alt = `Obra seleccionada de Proyecto P, ${projectPreviewIndex + 1} de ${projectPreviewImages.length}`;
  }
}

projectPreviewPrev?.addEventListener('click', () => showProjectPreviewImage(projectPreviewIndex - 1));
projectPreviewNext?.addEventListener('click', () => showProjectPreviewImage(projectPreviewIndex + 1));

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobileLayout = window.matchMedia('(max-width: 1000px), (max-width: 1024px) and (max-height: 500px)');
const previewDelay = reducedMotion ? 0 : 5200;
const navigationDelay = reducedMotion ? 0 : 6800;

function drawProjectPreviewConnector(animate = false){
  if (!projectPreview || !projectPreviewConnector || !projectPreviewConnectorPath || !galleryLink || mobileLayout.matches) return;

  const previewBounds = projectPreview.getBoundingClientRect();
  const galleryBounds = galleryLink.getBoundingClientRect();
  const frameOffset = 3;
  const frameLeft = previewBounds.left - frameOffset;
  const frameRight = previewBounds.right + frameOffset;
  const frameTop = previewBounds.top - frameOffset;
  const frameBottom = previewBounds.bottom + frameOffset;
  const endY = galleryBounds.bottom;

  projectPreviewConnector.setAttribute('viewBox', `0 0 ${window.innerWidth} ${window.innerHeight}`);
  projectPreviewConnectorPath.setAttribute(
    'd',
    `M ${frameRight} ${frameTop} H ${frameLeft} V ${frameBottom} H ${frameRight} V ${frameTop} V ${endY}`
  );

  const pathLength = projectPreviewConnectorPath.getTotalLength();
  projectPreviewConnectorPath.style.strokeDasharray = pathLength;

  if (animate && !reducedMotion) {
    projectPreviewConnectorPath.style.strokeDashoffset = pathLength;
  } else {
    projectPreviewConnectorPath.style.strokeDashoffset = 0;
  }

  return pathLength;
}

const connectorDelay = reducedMotion ? 0 : 8800;
setTimeout(() => projectPreview?.classList.add('show'), previewDelay);
setTimeout(() => {
  document.getElementById('index-screen').classList.add('show');
  document.querySelector('.site-header')?.classList.add('navigation-visible');
}, navigationDelay);
setTimeout(() => document.getElementById('social-connector-v').classList.add('show'), navigationDelay);
setTimeout(() => document.getElementById('social-buttons').classList.add('show'), navigationDelay);
setTimeout(() => {
  const pathLength = drawProjectPreviewConnector(true);
  projectPreviewConnector?.classList.add('show');
  if (!reducedMotion && pathLength) setTimeout(() => {
    projectPreviewConnectorAnimation?.cancel();
    projectPreviewConnectorAnimation = projectPreviewConnectorPath?.animate(
      [{ strokeDashoffset: pathLength }, { strokeDashoffset: 0 }],
      { duration: Math.max(2200, pathLength * 8) * 0.8, easing:'ease', fill:'forwards' }
    );
  }, 450);
}, connectorDelay);
window.addEventListener('resize', drawProjectPreviewConnector);

// Reserva el espacio real de la barra de redes, aunque ocupe varias filas en móvil.
const mobileSocialButtons = document.getElementById('social-buttons');
function updateMobileSocialSpace(){
  if (!mobileSocialButtons) return;
  if (mobileLayout.matches) {
    const height = Math.ceil(mobileSocialButtons.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--mobile-social-height', `${height}px`);
  } else {
    document.documentElement.style.removeProperty('--mobile-social-height');
  }
}
updateMobileSocialSpace();
window.addEventListener('resize', updateMobileSocialSpace);
if ('ResizeObserver' in window && mobileSocialButtons) {
  new ResizeObserver(updateMobileSocialSpace).observe(mobileSocialButtons);
}
});
