import React, { useRef, useState, useEffect, useCallback, use } from "react";
import HTMLFlipBook from "react-pageflip";
import "../CSS/Flipbook.css";

const TOTAL_PAGES = 16;

const PageCover = ({ children }) => (
  <div className="page page-cover">
    <div className="page-content">
      <h2>{children}</h2>
    </div>
  </div>
);

const Page = React.forwardRef(({ number, children }, ref) => {
  const isRight = number % 2 !== 0; // right pages only

  return (
    <div className={`page ${isRight ? "right-page" : ""}`} ref={ref}>
      <div className="page-content" style={{ position: "relative" }}>
        <div className="page-image" style={{ position: "relative" }}>
          {children}
          {isRight && <div className="page-crease" />} {/* crease overlay */}
        </div>
      </div>
    </div>
  );
});

export default function Flipbook() {
  const flipBook = useRef(null);
  const bgAudioRef = useRef(null);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // --- Autoplay on load (muted first) ---
  useEffect(() => {
    if (bgAudioRef.current) {
      bgAudioRef.current.muted = true;
      bgAudioRef.current.loop = true;
      bgAudioRef.current.play().catch(() => {
        console.log("Muted autoplay blocked (expected on some browsers)");
      });
    }
  }, []);

  // --- Toggle Background Music ---
  const toggleMusic = () => {
    if (!bgAudioRef.current) return;
    if (isPlaying) {
      bgAudioRef.current.pause();
      setIsPlaying(false);
    } else {
      bgAudioRef.current
        .play()
        .then(() => {
          bgAudioRef.current.muted = false;
          setIsPlaying(true);
        })
        .catch(() => alert("Your browser blocked autoplay."));
    }
  };

  // --- Copy Share Link ---
  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Share link copied to clipboard!");
    } catch {
      alert("Could not copy link. Copy from the address bar.");
    }
  };

  // --- Fullscreen Toggle ---
  const handleFullscreen = () => {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // --- Unmute + Play on first page turn ---
  const onPageOpen = (e) => {
    setIsBookOpen(e.data > 0);
    if (bgAudioRef.current && !isPlaying) {
      bgAudioRef.current.muted = false;
      bgAudioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => console.log("Autoplay still blocked, waiting for click."));
    }
  };

  const onPage = useCallback(() => {
    const turnSound = new Audio("/music/turn.mp3");
    turnSound.play().catch(() => {});
  }, []);

  // --- Keyboard Navigation ---
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") flipBook.current?.pageFlip().flipPrev();
      if (event.key === "ArrowRight") flipBook.current?.pageFlip().flipNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flipbook-wrapper">
      {/* Background Music */}
      <audio ref={bgAudioRef} src="/music/music.mp3" loop />

      {/* Flipbook Centered */}
      <div className="flipbook-center">
        <HTMLFlipBook
          width={550}
          height={450}
          size="stretch"
          minWidth={315}
          maxWidth={1000}
          minHeight={400}
          maxHeight={1533}
          showCover={true}
          mobileScrollSupport={true}
          onFlip={onPage}
          onChangeOrientation={onPageOpen} // track book opening
          onChangeState={onPageOpen}
          className={`album-book ${isBookOpen ? "flipbook-open" : ""}`}
          ref={flipBook}>
          {Array.from({ length: TOTAL_PAGES }, (_, index) => (
            <Page key={index} number={index + 1}>
              <img src={`/photos/${index + 1}.jpg`} alt={`Page ${index + 1}`} />
            </Page>
          ))}
        </HTMLFlipBook>
      </div>

      {/* Buttons BELOW book */}
      <div className="flipbook-toolbar">
        <button onClick={toggleMusic}>{isPlaying ? "🔊" : "🔈"}</button>
        <button onClick={copyShareLink}>📤</button>
        <button onClick={handleFullscreen}>{isFullscreen ? "↙️" : "⛶"}</button>
      </div>
    </div>
  );
}
