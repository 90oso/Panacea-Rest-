<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#faf5ee">
  <meta name="description" content="Panacea Restaurant: una experiencia gastronómica contemporánea, diseñada alrededor de cada visita.">
  <title>Panacea Restaurant · Una experiencia para quedarse</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&family=Cormorant+Garamond:wght@500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{{ asset('panacea/guest.css') }}?v=1">
  <script>
    window.PANACEA_GUEST = {
      bookingUrl: @json($bookingUrl),
      csrf: @json(csrf_token()),
      items: @json($menuItems)
    };
  </script>
  <script defer src="{{ asset('panacea/guest.js') }}?v=1"></script>
</head>
<body>
  <div class="reading-progress" id="readingProgress" aria-hidden="true"></div>
  <a class="skip-link" href="#contenido">Saltar al contenido</a>
  <nav class="guest-nav" aria-label="Navegación principal">
    <a href="#inicio" class="guest-logo" aria-label="Panacea Restaurant, inicio"><span class="mark" aria-hidden="true">✳</span><span><strong>panacea</strong><small>R E S T A U R A N T</small></span></a>
    <div class="guest-nav-links"><a href="#concepto">Nuestra esencia</a><a href="#carta">La carta</a><a href="#experiencia">La experiencia</a></div>
    <a href="#reservar" class="nav-book">Solicitar mesa <span aria-hidden="true">↗</span></a>
  </nav>

  <main id="contenido">
    <section class="hero" id="inicio">
      <div class="hero-copy">
        <div class="eyebrow reveal"><span class="line"></span> LA EXPERIENCIA PANACEA <span class="small-star">✳</span></div>
        <h1 class="hero-title reveal">Momentos que<br>merecen <em>quedarse.</em></h1>
        <p class="hero-desc reveal">Una nueva manera de disfrutar la mesa: sabores, encuentros y pequeños detalles que hacen que todo se sienta especial.</p>
        <div class="hero-actions reveal"><a class="btn-dark" href="#reservar">Solicitar una mesa <span>↗</span></a><a class="text-link" href="#carta">Explorar la carta <span>↘</span></a></div>
        <div class="hero-aside reveal"><div class="three-stars" aria-hidden="true">✳ ✳ ✳</div><span>Hospitalidad contemporánea.<br>Experiencias memorables.</span></div>
      </div>
      <div class="hero-art" aria-label="Fotografía ilustrativa de un espacio gastronómico contemporáneo">
        <div class="hero-photo"></div>
        <div class="photo-fade"></div>
        <div class="photo-stamp"><span>EST. 2026</span><strong>El placer<br>de compartir.</strong><span>✳</span></div>
        <div class="hero-orbit" aria-hidden="true"><div class="orb-center">✳</div><div class="orbit-line"></div></div>
        <div class="photo-caption">UNA EXPERIENCIA PARA SENTIR · PANACEA</div>
      </div>
      <div class="hero-scroll"><span>DESLIZA PARA DESCUBRIR</span><span class="scroll-arrow" aria-hidden="true">↓</span></div>
    </section>

    <div class="marquee" aria-hidden="true"><div class="marquee-track">
      <span>BUENA MESA</span><i>✳</i><span>BUENAS HISTORIAS</span><i>✳</i><span>EXPERIENCIAS PARA RECORDAR</span><i>✳</i>
      <span>BUENA MESA</span><i>✳</i><span>BUENAS HISTORIAS</span><i>✳</i><span>EXPERIENCIAS PARA RECORDAR</span><i>✳</i>
    </div></div>

    <section class="story section-wrap" id="concepto">
      <div class="story-image reveal"><img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=82" alt="Mesa preparada en un restaurante, fotografía ilustrativa" loading="lazy"><div class="story-corner">01 / ESENCIA</div></div>
      <div class="story-copy reveal">
        <span class="section-tag">✳ UN LUGAR PARA COMPARTIR</span>
        <h2>La diferencia está<br>en <em>cómo te hacemos</em><br>sentir.</h2>
        <p>La comida reúne. La hospitalidad transforma. Creemos en los espacios que invitan a quedarse un poco más, conversar sin prisa y disfrutar de cada detalle.</p>
        <div class="story-line"><span>01</span> Atención pensada para ti</div>
        <div class="story-line"><span>02</span> Un ambiente para cada ocasión</div>
        <div class="story-line"><span>03</span> Encuentros que dejan huella</div>
        <a href="#reservar" class="story-link">Reserva tu próximo momento <span>↗</span></a>
      </div>
    </section>

    <section class="menu-section" id="carta">
      <div class="menu-intro section-wrap reveal">
        <div><span class="section-tag">02 / LA CARTA</span><h2>El sabor de<br><em>descubrir.</em></h2></div>
        <div><p>Una selección de productos, momentos y propuestas para disfrutar de la mesa a tu manera.</p><span class="menu-note">Los precios se obtienen del catálogo configurado en TastyIgniter.</span></div>
      </div>
      <div class="menu-toolbar section-wrap"><span>SELECCIÓN DE LA CASA</span><label class="menu-search"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input type="search" id="guestMenuSearch" placeholder="Buscar un sabor..." aria-label="Buscar producto"></label></div>
      <div class="menu-cards section-wrap" id="guestMenuCards"></div>
      <p class="visual-disclaimer section-wrap">Las fotografías de esta página son ilustrativas y no representan necesariamente los productos del establecimiento.</p>
    </section>

    <section class="experience" id="experiencia">
      <div class="experience-bg"></div>
      <div class="experience-copy reveal"><span class="section-tag">03 / EXPERIENCIA</span><h2>Un momento<br><em>fuera de lo común.</em></h2><p>La mejor mesa es aquella en la que nacen nuevas historias.</p><a class="btn-light" href="#reservar">Planear mi visita <span>↗</span></a></div>
      <div class="experience-deco" aria-hidden="true">P<span>✳</span></div>
    </section>

    <section class="booking section-wrap" id="reservar">
      <div class="booking-copy reveal"><span class="section-tag">04 / TU PRÓXIMA VISITA</span><h2>Tu mesa<br><em>te espera.</em></h2><p>Cuéntanos cuándo deseas visitarnos. Enviaremos tu solicitud al equipo del restaurante para su revisión.</p><div class="booking-note"><span>✳</span><p>La solicitud no garantiza la mesa. La confirmación queda pendiente de revisión por el equipo.</p></div></div>
      <div class="booking-card reveal">
        <div class="booking-card-head"><span>RESERVACIÓN</span><span>✳ PANACEA</span></div>
        <h3>Hagamos espacio para ti.</h3>
        <form id="guestBookingForm">
          <label>Nombre completo<input type="text" name="guest_name" placeholder="Tu nombre" minlength="2" maxlength="100" autocomplete="name" required></label>
          <label>Correo electrónico<input type="email" name="email" placeholder="tunombre@correo.com" autocomplete="email" required></label>
          <div class="form-pair"><label>Personas<select name="party_size" required><option value="1">1 persona</option><option value="2" selected>2 personas</option><option value="3">3 personas</option><option value="4">4 personas</option><option value="5">5 personas</option><option value="6">6 personas</option><option value="7">7 personas</option><option value="8">8 personas</option><option value="10">10 personas</option><option value="12">12 personas</option><option value="16">16 personas</option></select></label>
          <label>Fecha y hora<input type="datetime-local" name="reserved_at" required></label></div>
          <label class="consent"><input type="checkbox" name="privacy_consent" value="1" required><span>Acepto que mis datos se utilicen para gestionar esta solicitud de reserva en el entorno de desarrollo.</span></label>
          <div id="bookingMessage" class="booking-message" role="status" aria-live="polite" hidden></div>
          <button class="booking-submit" type="submit">Enviar solicitud <span>↗</span></button>
        </form>
        <div class="booking-card-foot">EXPERIENCIA DEMOSTRATIVA · RESERVAS EN ENTORNO LOCAL</div>
      </div>
    </section>

    <footer class="guest-footer"><div><a class="guest-logo" href="#inicio"><span class="mark">✳</span><span><strong>panacea</strong><small>R E S T A U R A N T</small></span></a><p>Los buenos momentos comienzan alrededor de una mesa.</p></div><div class="footer-links"><a href="#concepto">Esencia</a><a href="#carta">Carta</a><a href="#reservar">Reservar</a></div><div class="footer-end">Panacea Restaurant · Prototipo local<br>Las imágenes y textos son parte de una experiencia de demostración.</div></footer>
  </main>
</body>
</html>
