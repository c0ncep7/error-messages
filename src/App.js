import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tokenId, setTokenId] = useState('');

  useEffect(() => {
    // Load metadata from the public folder and extract data
    fetch(`${process.env.PUBLIC_URL}/m0dest--error-messages.json`)
      .then(response => response.json())
      .then(data => {
        setImages(data);
        if (data.length > 0) setTokenId(data[0].tokenId); // Set initial tokenId
      })
      .catch(error => console.error('Error loading metadata:', error));
  }, []);

  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      setLoading(true);
      setProgress(0);
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.responseType = "blob";

      xhr.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setProgress(percentComplete);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          setLoading(false);
          resolve(URL.createObjectURL(xhr.response));
        } else {
          reject(new Error("Failed to load image"));
        }
      };

      xhr.onerror = () => reject(new Error("Network error"));
      xhr.send();
    });
  };

  const changeImage = async (index) => {
    setProgress(0);
    const url = images[index].URL;
    const imageUrl = await loadImage(url);
    document.getElementById("main-image").src = imageUrl;
    setCurrentIndex(index);
    setTokenId(images[index].tokenId); // Reflect current tokenId in the input
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

  useEffect(() => {
    if (images.length > 0) {
      changeImage(currentIndex);
    }
  }, [images]);

  return (
    <div className="app-container">
      <div className="retro-computer">
        {loading && <div className="error-message">404 NOT FOUND -  REQUETED URL NOT FOUND ON THIS SERVER</div>}
        <div className="screen">
          <div className="image-container">
            {loading && (
              <div className="loading-bar">
                <div className="progress" style={{ width: `${progress}%` }}></div>
              </div>
            )}
            <img id="main-image" alt="Retro computer screen" className={`display-image ${loading ? 'hidden' : ''}`} />
          </div>
          <div className="metadata">
            {images.length > 0 && (
              <>
                <p><strong>Token ID:</strong> {images[currentIndex].tokenId}</p>
                {images[currentIndex].attributes.map((attr, index) => (
                  <p key={index}><strong>{attr.trait_type}:</strong> {attr.value}</p>
                ))}
              </>
            )}
            <div className="token-input-container">
              <label htmlFor="tokenId">Enter Token ID (1-60):</label>
              <input
                type="number"
                id="tokenId"
                value={tokenId}
                onChange={handleTokenIdInput}
                min="1"
                max="60"
                placeholder="1-60"
              />
              <button onClick={goToTokenId} disabled={!tokenId}>Go</button>
            </div>
          </div>
        </div>
        <div className="controls">
          <button onClick={prevImage} className="nav-button">&lt; Prev</button>
          <button onClick={nextImage} className="nav-button">Next &gt;</button>
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
