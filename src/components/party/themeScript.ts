/**
 * Inline <head> script: sets <html data-party="day|night"> before first paint (no theme flash).
 * Plain module (not "use client") so the server root layout can import it.
 * Keep in sync with resolveParty() in partyTheme.ts: 06:00–18:59 local time = day.
 */
export const THEME_MODE_KEY = "bw-theme-mode";

export const THEME_INIT_SCRIPT = `(function(){try{var m=localStorage.getItem("${THEME_MODE_KEY}")||"auto";var h=new Date().getHours();var t=(m==="day"||m==="night")?m:(h>=6&&h<19?"day":"night");if(/^(localhost|127\\.0\\.0\\.1|192\\.168\\.)/.test(location.hostname)){var q=new URLSearchParams(location.search).get("party");if(q==="day"||q==="night"){t=q;}}document.documentElement.setAttribute("data-party",t);}catch(e){document.documentElement.setAttribute("data-party","day");}})();`;
// ↑ `?party=day|night` override works on local/LAN hosts only (for design review screenshots), never on the live domain.
