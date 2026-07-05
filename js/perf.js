window.TabyarPerf = (() => {
  function detectLowEnd() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) return true;
    if (navigator.deviceMemory && navigator.deviceMemory <= 2) return true;
    return false;
  }

  function apply(mode) {
    const resolved = mode || 'auto';
    document.documentElement.classList.remove('perf-lite');
    if (resolved === 'lite' || (resolved === 'auto' && detectLowEnd())) {
      document.documentElement.classList.add('perf-lite');
    }
  }

  return { apply, detectLowEnd };
})();
