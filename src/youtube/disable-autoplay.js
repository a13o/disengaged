/**
 * Automatically disable autoplay
 * @see A.1
 */
(function disableAutoplay () {
  // Autoplay is toggled off by a cookie
  // First grab any existing prefs
  const cookies = document.cookie.split('; ');
  const prefCookie = cookies.find((cookie) => {
    return cookie.includes('PREF');
  }) || 'PREF=';

  const prefs = prefCookie.replace('PREF=', '').split('&');
  let f5Idx = prefs.findIndex((pref) => {
    return pref.includes('f5');
  });

  // Early exit if it's already set
  if (f5Idx >= 0 && prefs[f5Idx].split('=')[1] === '30000') { return; }

  if (f5Idx === -1) { f5Idx = prefs.length; }
  prefs[f5Idx] = 'f5=30000';

  const twoYrs = 2 * 365 * 24 * 60 * 60; // in seconds
  document.cookie = `PREF=${prefs.join('&')}; max-age=${twoYrs}; path=/; domain=.youtube.com`;

  // localStorage API is also used to track expiration
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  window.localStorage.setItem('yt.autonav::autonav_disabled', JSON.stringify({
    data: true,
    expiration: nextYear.valueOf(),
    creation: Date.now()
  }));

  // sessionStorage API also sets this for some reason
  window.sessionStorage.setItem('yt-player-autonavstate', JSON.stringify({
    data: '1',
    creation: Date.now()
  }));
})();
