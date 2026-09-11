(() => {
  const header = document.querySelector('header');
  if (!header) return;
  const guide = header.querySelector('.sub');
  if (!guide) return;
  guide.innerHTML = `
    <b>Quick Guide</b><br>
    After each shot, enter <b>where the ball finished</b>.<br>
    <b>Off the green:</b> Enter <b>Distance Remaining + Resulting Position</b>.<br>
    <b>On the green:</b> Enter <b>First-Putt Distance + Total Putts</b>.<br>
    <b>Penalties:</b> Add them to the shot that caused the penalty.<br>
    <b>SG vs Par does the rest automatically.</b>
  `;
})();
