(() => {
    'use strict';

    const form = document.querySelector('form');
    const status = document.querySelector('.form-status');
    const button = form?.querySelector('button[type="submit"]');
    if (!form || !status || !button) return;

    const uncertainDelivery = ' El mensaje podría haber llegado. Espera unos minutos antes de repetirlo para evitar duplicados.';
    let sending = false;

    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (sending) return;

        if (navigator.onLine === false) {
            status.textContent = 'No hay conexión a Internet. Revisa tu conexión antes de enviar el mensaje.';
            console.warn('[Contacto]', JSON.stringify({ reason: 'offline', attempted: false }));
            return;
        }

        const payload = Object.fromEntries(new FormData(form));
        const controller = new AbortController();
        const startedAt = performance.now();
        sending = true;
        button.disabled = true;
        status.textContent = 'Enviando mensaje…';

        function diagnose(reason, response) {
            // Nunca se registran datos del formulario, su destino ni el cuerpo de la respuesta.
            console.warn('[Contacto]', JSON.stringify({
                reason,
                httpStatus: response?.status ?? null,
                responseType: response?.type ?? null,
                contentType: response?.headers?.get('content-type')?.split(';')[0] ?? null,
                elapsedMs: Math.round(performance.now() - startedAt)
            }));
        }

        const waitingNotice = window.setTimeout(() => {
            status.textContent = 'El envío está tardando. Seguimos esperando confirmación; no vuelvas a enviarlo todavía.';
        }, 15000);
        const requestTimeout = window.setTimeout(() => controller.abort(), 90000);

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(payload),
                signal: controller.signal
            });

            if (!response.ok) {
                diagnose('http-error', response);
                status.textContent = 'El servicio ha respondido con un problema y no hemos podido confirmar el envío.' + uncertainDelivery;
                return;
            }

            let result;
            try {
                result = await response.json();
            } catch {
                diagnose(controller.signal.aborted ? 'timeout' : 'invalid-response', response);
                status.textContent = controller.signal.aborted
                    ? 'El servicio no ha respondido a tiempo.' + uncertainDelivery
                    : 'El servicio no ha dado una confirmación que podamos verificar.' + uncertainDelivery;
                return;
            }

            if (result?.success === true || result?.success === 'true') {
                status.textContent = '¡Gracias! El servicio ha confirmado el envío de tu mensaje.';
                form.reset();
            } else {
                diagnose(result?.success === false || result?.success === 'false'
                    ? 'service-not-confirmed' : 'missing-confirmation', response);
                status.textContent = 'El servicio no ha confirmado el envío.' + uncertainDelivery;
            }
        } catch {
            diagnose(controller.signal.aborted ? 'timeout' : 'network-error');
            status.textContent = controller.signal.aborted
                ? 'El servicio no ha respondido a tiempo.' + uncertainDelivery
                : 'No hemos podido obtener respuesta del servicio.' + uncertainDelivery;
        } finally {
            window.clearTimeout(waitingNotice);
            window.clearTimeout(requestTimeout);
            sending = false;
            button.disabled = false;
        }
    });
})();
