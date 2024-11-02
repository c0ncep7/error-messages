import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tokenId, setTokenId] = useState('');

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/m0dest--error-messages.json`)
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          setImages(data);
          const randomIndex = Math.floor(Math.random() * data.length);
          changeImage(randomIndex); // Load a random image on initial load
        }
      })
      .catch(error => console.error('Error loading metadata:', error));
  }, []);

  const loadImage = (url) => {
    setLoading(true);
    setProgress(0);

    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to load image");
        }

        const contentLength = response.headers.get('content-length');
        const total = parseInt(contentLength, 10);
        let loaded = 0;

        const reader = response.body.getReader();
        const chunks = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
            loaded += value.length;
            setProgress(Math.round((loaded / total) * 100));
          }
        }

        const blob = new Blob(chunks);
        const imageUrl = URL.createObjectURL(blob);
        setLoading(false);
        resolve(imageUrl);
      } catch (error) {
        setLoading(false);
        reject(error);
      }
    });
  };

  const changeImage = async (index) => {
    if (images.length === 0 || !images[index]) return; // Check if images is populated and index is valid
    setProgress(0);
    const url = images[index].URL;
    const imageUrl = await loadImage(url);
    document.getElementById("main-image").src = imageUrl;
    setCurrentIndex(index);
    setTokenId(images[index].tokenId);
  };

  const setRandomToken = () => {
    if (images.length > 0) {
      const randomIndex = Math.floor(Math.random() * images.length);
      changeImage(randomIndex);
    }
  };

  const nextImage = () => {
    const nextIndex = (currentIndex + 1) % images.length;
    changeImage(nextIndex);
  };

  const prevImage = () => {
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    changeImage(prevIndex);
  };

  const handleTokenIdInput = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= 60) {
      setTokenId(value);
    } else {
      setTokenId('');
    }
  };

  const goToTokenId = () => {
    const targetIndex = images.findIndex(img => img.tokenId === tokenId);
    if (targetIndex >= 0) {
      changeImage(targetIndex);
    }
  };

  return (
    <div className="app-container">
      <div className="retro-computer">
        <div className="screen">
          <div
            className="image-container"
            style={{
              backgroundImage: loading ? `url(${process.env.PUBLIC_URL}/generic-404.webp)` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {loading && (
              <div className="loading-bar">
                <div className="progress" style={{ width: `${progress}%` }}></div>
              </div>
            )}
            <img
              id="main-image"
              alt="Retro computer screen"
              src={images[currentIndex]?.URL || `${process.env.PUBLIC_URL}/generic-404.webp`}
              className={`display-image ${loading ? 'hidden' : ''}`}
            />
          </div>
          <div className="metadata">
            {images.length > 0 && (
              <>
                <p><strong>Token ID:</strong> {images[currentIndex].tokenId} | <strong>Frame:</strong> {images[currentIndex].attributes.find(attr => attr.trait_type === 'frame')?.value}</p>
              </>
            )}
            <div className="token-input-container">
              <div className="token-input-row">
                <label htmlFor="tokenId">Token ID:</label>
                <input
                  type="number"
                  id="tokenId"
                  value={tokenId}
                  onChange={handleTokenIdInput}
                  min="1"
                  max="60"
                  placeholder="1-60"
                  className="token-input"
                />
              </div>
              <button onClick={goToTokenId} disabled={!tokenId} className="nav-button">Go</button>
              <button onClick={setRandomToken} className="random-full-width">Random</button>
              <div className="next-prev-container">
                <button onClick={prevImage} className="nav-button">&lt; Prev</button>
                <button onClick={nextImage} className="nav-button">Next &gt;</button>
              </div>
            </div>
          </div>
        </div>
        <div className="link-section">
          <a href="https://www.errormessages.xyz/404" target="_blank" rel="noopener noreferrer">
            Error Messages by M0DEST
          </a>
        </div>
        <div className="scrolling-text">
          <p>&lt; error messages &gt; is an experimental art series that combines blockchain infrastructure, game mechanics, public participation and economic incentive with the internet's most obvious missed opportunity to create a connection with a human - the 404 page.</p>
          <p>typically 404 pages tell us - you are lost. you made a mistake. go back and buy more stuff. why? are we not more human than that? i think we are.</p>
          <p>i think of 404 pages as the abandoned walls of the internet - like a street artist sees the walls of buildings as a canvas, i see 404 pages the same way - a canvas with which we could use art to tell a story. each of these tokens will contain an array of metadata assets, including the .gif file, the raw art, the html code, and other data inscribed to deepen the story. then collectors, with my help, will attempt to get sites to change their 404 pages to this artwork to support the mission.</p>
          <p>soon, it is our hope, that we see a wave of sites changing 404 pages to the art we provide. and now, instead of people feeling lost, they will feel found.</p>
          <p>will you play a part?</p>
          <p>~m</p>
        </div>
      </div>
    </div>
  );
};

export default App;
