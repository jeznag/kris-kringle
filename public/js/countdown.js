const CHRISTMAS_MONTH_INDEX = 11;
const CHRISTMAS_DAY = 25;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function sleepsUntilChristmas(today) {
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let christmas = new Date(today.getFullYear(), CHRISTMAS_MONTH_INDEX, CHRISTMAS_DAY);
  if (startOfToday > christmas) {
    christmas = new Date(today.getFullYear() + 1, CHRISTMAS_MONTH_INDEX, CHRISTMAS_DAY);
  }
  return Math.round((christmas - startOfToday) / MS_PER_DAY);
}

function renderCountdown() {
  const countdownEl = document.querySelector('[data-countdown]');
  if (!countdownEl) {
    return;
  }
  const sleeps = sleepsUntilChristmas(new Date());
  countdownEl.innerHTML = sleeps === 0
    ? '🎅 <span>Merry Christmas!</span>'
    : `🛷 <span class="countdown__number">${sleeps}</span> <span>${sleeps === 1 ? 'sleep' : 'sleeps'} until Christmas</span>`;
}

renderCountdown();
