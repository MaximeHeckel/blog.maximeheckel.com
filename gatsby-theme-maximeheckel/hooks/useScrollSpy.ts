import React from 'react';

const useScrollSpy = (sections: string[], offset: number) => {
  const [
    currentActiveSectionIndex,
    setCurrentActiveSectionIndex,
  ] = React.useState(-1);

  const scrolledSections =
    currentActiveSectionIndex >= 0
      ? sections.slice(0, currentActiveSectionIndex + 1)
      : [];

  const handleScroll = React.useCallback(() => {
    let sectionToHighlight = currentActiveSectionIndex;

    for (let index = 0; index < sections.length; index++) {
      const section = document.querySelector(`[id="${sections[index]}"]`)!;
      if (section.getBoundingClientRect().top - offset < 0) {
        sectionToHighlight = index;
        continue;
      }
      break;
    }

    setCurrentActiveSectionIndex(sectionToHighlight);
  }, [offset, sections, currentActiveSectionIndex]);

  React.useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections, offset, handleScroll]);

  return [currentActiveSectionIndex, scrolledSections];
};

export default useScrollSpy;
