import React, { useRef, useState, useEffect, useCallback } from "react";
import HTMLFlipBook from "react-pageflip";
import "./App.css";

// --- Configuration ---
const TOTAL_PAGES = 16;

const PageCover = ({ children }) => {
  return (
    <div className="page page-cover">
      <div className="page-content">
        <h2>{children}</h2>
      </div>
    </div>
  );
};

const Page = React.forwardRef(({ number, children }, ref) => {
  return (
    <div className="page" ref={ref}>
      <div className="page-content">
        <div className="page-image">{children}</div>
        <div className="page-footer">{number}</div>
      </div>
    </div>
  );
});

export default function App() {
  const flipBook = useRef(null);
  const bgAudioRef = useRef(null);
  const turnAudioRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // --- Music & Sound ---
  const toggleMusic = () => {
    if (!bgAudioRef.current) return;

    if (isPlaying) {
      bgAudioRef.current.pause();
      setIsPlaying(false);
    } else {
      const playPromise = bgAudioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Playback started!
            setIsPlaying(true);
          })
          .catch((error) => {
            console.error("Audio play was prevented:", error);
            // We still show the alert here if it fails.
            alert("Audio could not be played. Your browser might be blocking it.");
            setIsPlaying(false);
          });
      }
    }
  };

  // --- Page Flip Handling ---
  const onPage = useCallback((e) => {
    setCurrentPage(e.data);
    // Create a new audio object for each flip to ensure it plays immediately
    const turnSound = new Audio("/music/turn.mp3");
    turnSound.play().catch((error) => console.error("Turn sound failed to play:", error));
  }, []);

  // --- Toolbar Actions ---
  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Share link copied to clipboard!");
    } catch {
      alert("Could not copy the link. Please copy it from the address bar.");
    }
  };

  const handleFullscreen = () => {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch((err) => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Add keyboard controls for flipping pages
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") {
        flipBook.current?.pageFlip().flipPrev();
      } else if (event.key === "ArrowRight") {
        flipBook.current?.pageFlip().flipNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="app-container">
      {/* --- Audio Elements --- */}
      <audio ref={bgAudioRef} src="/music/music.mp3" loop />

      <div className="flipbook-container">
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
          className="album-book"
          ref={flipBook}
        >
          {/* --- Dynamically Generated Inner Pages --- */}
          {Array.from({ length: TOTAL_PAGES }, (_, index) => (
            <Page key={index} number={index + 1}>
              <img src={`/photos/${index + 1}.jpg`} alt={`Page ${index + 1}`} />
            </Page>
          ))}
        </HTMLFlipBook>
      </div>

      {/* --- Floating Toolbar --- */}
      <div className="toolbar">
        <button onClick={toggleMusic} title="Music">
          {isPlaying ? "🔊" : "🔈"}
        </button>
        <button onClick={copyShareLink} title="Share">
          📤
        </button>
        <button onClick={handleFullscreen} title="Fullscreen">
          {isFullscreen ? "↙️" : "⛶"}
        </button>
      </div>
    </div>
  );
}
