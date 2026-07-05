(function () {
  var low = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!low && navigator.hardwareConcurrency) low = navigator.hardwareConcurrency <= 2;
  if (!low && navigator.deviceMemory) low = navigator.deviceMemory <= 2;
  if (low) document.documentElement.classList.add('perf-lite');
})();
