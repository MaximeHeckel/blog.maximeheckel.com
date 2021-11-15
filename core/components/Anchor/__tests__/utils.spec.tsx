import { getIconString } from '../utils';

describe('Anchor - utils', () => {
  it('returns the arrow icon when an arrow argument is passed', () => {
    expect(getIconString('https://maximeheckel.com', 'left')).toEqual(
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSJ2YXIoLS1zaXplLCAxLjA1ZW0pIiBoZWlnaHQ9InZhcigtLXNpemUsIDEuMDVlbSkiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48bGluZSB4MT0iNSIgeTE9IjEyIiB4Mj0iMTkiIHkyPSIxMiI+PC9saW5lPjxwb2x5bGluZSBwb2ludHM9IjEyIDUgMTkgMTIgMTIgMTkiPjwvcG9seWxpbmU+PC9zdmc+'
    );
  });

  it('returns the Twitter icon if the URL passed contains "twitter.com"', () => {
    expect(getIconString('https://twitter.com/MaximeHeckel')).toEqual(
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSJ2YXIoLS1zaXplLCAxLjA1ZW0pIiBoZWlnaHQ9InZhcigtLXNpemUsIDEuMDVlbSkiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLXR3aXR0ZXIiPjxwYXRoIGQ9Ik0yMyAzYTEwLjkgMTAuOSAwIDAgMS0zLjE0IDEuNTMgNC40OCA0LjQ4IDAgMCAwLTcuODYgM3YxQTEwLjY2IDEwLjY2IDAgMCAxIDMgNHMtNCA5IDUgMTNhMTEuNjQgMTEuNjQgMCAwIDEtNyAyYzkgNSAyMCAwIDIwLTExLjVhNC41IDQuNSAwIDAgMC0uMDgtLjgzQTcuNzIgNy43MiAwIDAgMCAyMyAzeiI+PC9wYXRoPjwvc3ZnPg=='
    );
  });

  it('returns the Github icon if the URL passed contains "github.com"', () => {
    expect(getIconString('https://github.com/MaximeHeckel')).toEqual(
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSJ2YXIoLS1zaXplLCAxLjA1ZW0pIiBoZWlnaHQ9InZhcigtLXNpemUsIDEuMDVlbSkiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJjdXJyZW50Q29sb3IiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWdpdGh1YiI+PHBhdGggZD0iTTkgMTljLTUgMS41LTUtMi41LTctM20xNCA2di0zLjg3YTMuMzcgMy4zNyAwIDAgMC0uOTQtMi42MWMzLjE0LS4zNSA2LjQ0LTEuNTQgNi40NC03QTUuNDQgNS40NCAwIDAgMCAyMCA0Ljc3IDUuMDcgNS4wNyAwIDAgMCAxOS45MSAxUzE4LjczLjY1IDE2IDIuNDhhMTMuMzggMTMuMzggMCAwIDAtNyAwQzYuMjcuNjUgNS4wOSAxIDUuMDkgMUE1LjA3IDUuMDcgMCAwIDAgNSA0Ljc3YTUuNDQgNS40NCAwIDAgMC0xLjUgMy43OGMwIDUuNDIgMy4zIDYuNjEgNi40NCA3QTMuMzcgMy4zNyAwIDAgMCA5IDE4LjEzVjIyIj48L3BhdGg+PC9zdmc+'
    );
  });
});
