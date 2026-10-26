'use strict';

/*
 * Menu photography presentation.
 * Native images always win. The curated Unsplash images are only illustrative
 * and never represent the actual dish sold by the restaurant.
 */
(function (root) {
  const BASE = 'https://images.unsplash.com/';
  const PHOTO = Object.freeze({
    pizza: 'photo-1565299624946-b28f40a0ae38',
    burger: 'photo-1568901346375-23c9450c58cd',
    bowl: 'photo-1546069901-ba9599a7e63c',
    salad: 'photo-1512621776951-a57141f2eefd',
    pasta: 'photo-1473093295043-cdd812d0e601',
    dessert: 'photo-1488477181946-6428a0291777',
    coffee: 'photo-1509042239860-f550ce710b93',
    drink: 'photo-1544145945-f90425340c7e',
    steak: 'photo-1544025162-d76694265947',
    general: 'photo-1547592180-85f173990554',
    general2: 'photo-1559847844-5315695dadae',
    general3: 'photo-1512621776951-a57141f2eefd'
  });

  function safeNative(src) {
    if (typeof src !== 'string' || src.length > 2048) return null;
    const value = src.trim();
    if (!value) return null;
    if (/^https?:\/\/[^<>"'\s]+$/i.test(value)) return value;
    if (/^\/(?!\/)[^<>"']+$/.test(value)) return value;
    return null;
  }
  function illustrativePhoto(name, id) {
    const n = String(name || '').toLocaleLowerCase('es');
    let key = null;
    if (/pizza|focaccia|calzone/.test(n)) key = 'pizza';
    else if (/hamburguesa|burger|sandwich|sándwich|hot dog/.test(n)) key = 'burger';
    else if (/ensalada|vegetal|verdura|veggie|avocado|aguacate/.test(n)) key = 'salad';
    else if (/pasta|espagueti|spaghetti|fettuccine|ravioli|lasaña|lasagna/.test(n)) key = 'pasta';
    else if (/bowl|poke|arroz|quinoa|grain/.test(n)) key = 'bowl';
    else if (/postre|tarta|pastel|helado|brownie|cheesecake|chocolate|dulce/.test(n)) key = 'dessert';
    else if (/café|cafe|coffee|capuccino|latte|espresso/.test(n)) key = 'coffee';
    else if (/limonada|refresco|jugo|juice|soda|té helado|bebida|coctel|mocktail/.test(n)) key = 'drink';
    else if (/carne|filete|steak|res|pollo|chicken|parrilla|costilla/.test(n)) key = 'steak';
    else {
      const choices = ['general','general2','general3'];
      const number = Number(id);
      const seed = Number.isFinite(number) ? Math.abs(Math.floor(number)) : Array.from(n).reduce((a,c)=>a+c.charCodeAt(0),0);
      key = choices[seed % choices.length];
    }
    return BASE + PHOTO[key] + '?auto=format&fit=crop&w=920&h=660&q=82';
  }

  function resolve(item) {
    const native = safeNative(item?.image);
    const illustrative = illustrativePhoto(item?.name, item?.id);
    return {
      src: native || illustrative,
      fallback: illustrative,
      native: !!native,
      alt: native
        ? 'Fotografía del producto ' + String(item.name || '')
        : 'Fotografía gastronómica ilustrativa; no necesariamente corresponde a ' + String(item?.name || 'este plato'),
      badge: native ? 'FOTO DEL PRODUCTO' : 'IMAGEN ILUSTRATIVA'
    };
  }

  function activateFallback(img) {
    if (!img || img.tagName?.toLowerCase() !== 'img' || !img.hasAttribute('data-menu-photo')) return;
    const parent = img.closest('.menu-card-media,.catalog-card-media');
    const badge = parent?.querySelector('[data-photo-badge]');
    const alternate = img.getAttribute('data-menu-fallback');
    if (img.dataset.fallbackTried !== '1' && safeNative(alternate) && img.getAttribute('src') !== alternate) {
      img.dataset.fallbackTried = '1';
      img.src = alternate;
      img.alt = 'Fotografía gastronómica ilustrativa';
      if (badge) badge.textContent = 'IMAGEN ILUSTRATIVA';
      return;
    }
    img.hidden = true;
    parent?.classList.add('media-unavailable');
    if (badge) badge.textContent = 'FOTOGRAFÍA NO DISPONIBLE';
  }

  // Image errors do not bubble; use one capture listener for cards rendered
  // after filtering or after switching Demo / Datos reales.
  if (typeof document !== 'undefined' && document.addEventListener) {
    document.addEventListener('error', function (event) {
      activateFallback(event.target);
    }, true);
  }

  root.PanaceaMenuVisuals = Object.freeze({
    resolve, illustrativePhoto, safeNative
  });
})(window);
