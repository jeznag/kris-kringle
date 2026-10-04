// The app first launched on this workers.dev address; keep old links working by sending
// them (path and query intact) to its permanent home.
const CANONICAL_HOST = 'kriskringle.jeremynagel.info';
const MOVED_PERMANENTLY = 301;

export default {
  fetch(request) {
    const url = new URL(request.url);
    url.protocol = 'https:';
    url.host = CANONICAL_HOST;
    return Response.redirect(url.toString(), MOVED_PERMANENTLY);
  },
};
