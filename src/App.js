import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tokenId, setTokenId] = useState('');
  const [mediaType, setMediaType] = useState('image');

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/m0dest--error-messages.json`)
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          setImages(data);
          const randomIndex = Math.floor(Math.random() * data.length);
          loadImage(data[randomIndex].URL);
          setCurrentIndex(randomIndex);
          setTokenId(data[randomIndex].tokenId);
        }
      })
      .catch(error => console.error('Error loading metadata:', error));
  }, []);

  const loadImage = (url) => {
    setLoading(true);
    setProgress(0);

    const extension = url.split('.').pop().toLowerCase();
    setMediaType((extension === 'mov' || extension === 'mp4') ? 'video' : 'image');


    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to load media");
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
        const mediaUrl = URL.createObjectURL(blob);
        const mediaElement = document.getElementById("main-media");
        if (mediaElement) {
          mediaElement.src = mediaUrl;
          if (mediaType === 'video') {
            mediaElement.load();
          }
        }

        setLoading(false);
        resolve(mediaUrl);
      } catch (error) {
        setLoading(false);
        reject(error);
      }
    });
  };

  const changeImage = (index) => {
    if (images.length > 0 && images[index]) {
      loadImage(images[index].URL);
      setCurrentIndex(index);
      setTokenId(images[index].tokenId);
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

  const goToTokenId = () => {
    const targetIndex = images.findIndex(img => img.tokenId === tokenId);
    if (targetIndex >= 0) {
      changeImage(targetIndex);
    }
  };

  const setRandomImage = () => {
    const randomIndex = Math.floor(Math.random() * images.length);
    changeImage(randomIndex);
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
            {mediaType === 'image' ? (
              <img id="main-media" alt="Retro computer screen" className={`display-image ${loading ? 'hidden' : ''}`} />
            ) : (
              <video id="main-media" className={`display-image ${loading ? 'hidden' : ''}`} controls autoPlay muted loop />
            )}
          </div>
          <div className="metadata">
            {images.length > 0 && currentIndex !== null && (
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
                  onChange={(e) => setTokenId(parseInt(e.target.value) || '')}
                  min="1"
                  max="69"
                  placeholder="1-69"
                  className="token-input"
                />
              </div>
              <button onClick={goToTokenId} disabled={!tokenId} className="nav-button">Go</button>
              <button onClick={setRandomImage} className="random-full-width">Random</button>
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
