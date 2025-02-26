import { useEffect, useState } from 'react';

const useIntersectionObserver = (
  elements: Element[],
  options: IntersectionObserverInit
) => {
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  useEffect(() => {
    // Create a sentinel element at the top of the page
    const sentinel = document.createElement('div');
    sentinel.style.position = 'absolute';
    sentinel.style.top = '0';
    sentinel.style.height = '300px'; // Adjust this value as needed
    sentinel.style.width = '100%';
    sentinel.style.pointerEvents = 'none';
    document.body.prepend(sentinel);

    const observer = new IntersectionObserver((entries) => {
      let maxVisibleIndex = -1;
      let isNearTop = false;

      entries.forEach((entry) => {
        // Check if the entry is our sentinel element
        if (entry.target === sentinel) {
          isNearTop = entry.isIntersecting;
          return;
        }

        const index = elements.indexOf(entry.target);
        if (entry.isIntersecting) {
          maxVisibleIndex = Math.max(maxVisibleIndex, index);
        }
      });

      // Update active index if we're either near the top or have a visible section
      setActiveIndex(isNearTop ? -1 : maxVisibleIndex);
    }, options);

    // Observe the sentinel element along with the section elements
    observer.observe(sentinel);
    elements.forEach((element) => {
      if (element) observer.observe(element);
    });

    return () => {
      observer.unobserve(sentinel);
      elements.forEach((element) => {
        if (element) observer.unobserve(element);
      });
      sentinel.remove();
    };
  }, [elements, options]);

  return activeIndex;
};

export { useIntersectionObserver };
