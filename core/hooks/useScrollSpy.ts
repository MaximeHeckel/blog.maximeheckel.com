import React from 'react';

// const isInView = (element: any, offset: number = 0) => {
//   const rect = element.getBoundingClientRect();

//   const scrollTop =
//     document.documentElement.scrollTop || document.body.scrollTop;

//   const scrollBottom = scrollTop + window.innerHeight;

//   const elemTop = rect.top + scrollTop;
//   const elemBottom = elemTop + element.offsetHeight;

//   const isVisible =
//     elemTop < scrollBottom - offset && elemBottom > scrollTop + offset;
//   return isVisible;
// };

// const handleScroll = React.useCallback(() => {
//   const indexOfSectionToHighlight = sections.findIndex(
//     (section) =>

//     isInView(document.querySelector(`[id="${section}"]`), offset)
//   );
//   setCurrentActiveSectionIndex(-1);
// }, [offset, sections]);

const useScrollSpy = (
  elements: Element[],
  options?: {
    offset?: number;
    root?: Element;
  }
): [number, Element[]] => {
  const [
    currentActiveSectionIndex,
    setCurrentActiveSectionIndex,
  ] = React.useState(-1);

  const rootMargin = `-${(options && options.offset) || 0}px 0px 0px 0px`;

  // this is just a shortcut for some other usecase I may have
  const scrolledSections =
    currentActiveSectionIndex >= 0
      ? elements.slice(0, currentActiveSectionIndex + 1)
      : [];

  const observer = React.useRef<IntersectionObserver>();

  React.useEffect(() => {
    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver(
      (entries) => {
        // find the index of the section that is currently intersecting
        const indexOfSectionToHighlight = entries.findIndex((entry) => {
          return entry.intersectionRatio > 0;
        });

        setCurrentActiveSectionIndex(indexOfSectionToHighlight);
      },
      {
        root: (options && options.root) || null,
        // use this option to handle custom offset
        rootMargin,
      }
    );

    const { current: currentObserver } = observer;

    // observe all the elements passed as argument of the hook
    elements.forEach((element) =>
      element ? currentObserver.observe(element) : null
    );

    return () => currentObserver.disconnect();
  }, [elements, options, rootMargin]);

  return [currentActiveSectionIndex, scrolledSections];
};

export default useScrollSpy;
