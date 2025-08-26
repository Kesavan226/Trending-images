import React, { useEffect, useState } from "react";

const API_URL = "https://picsum.photos/v2/list?page=1&limit=12";
const TREND_WINDOW = 5 * 60 * 1000; 

export default function App() {
  const [images, setImages] = useState([]);
  const [likes, setLikes] = useState({});
  const [trending, setTrending] = useState([]);

  
  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        setImages(data.map(img => ({
          id: img.id,
          author: img.author,
          url: img.download_url
        })));
      });
  }, []);

 
  const likeImage = (id) => {
    const now = Date.now();
    setLikes(prev => ({
      ...prev,
      [id]: prev[id] ? [...prev[id], now] : [now]
    }));
  
    
  };

 
  useEffect(() => {
    const updateTrending = () => {
      const now = Date.now();
      const scores = Object.entries(likes).map(([id, times]) => {
        const recentCount = times.filter(t => now - t <= TREND_WINDOW).length;
        return { id, recentCount };
      });
      scores.sort((a, b) => b.recentCount - a.recentCount);
      setTrending(scores.filter(s => s.recentCount > 0));
    };

    updateTrending(); 
    const interval = setInterval(updateTrending, 5000);
    return () => clearInterval(interval);
  }, [likes]);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Image Marketplace</h1>
      <p>Trending updates based on likes in last 5 minutes</p>

      <div style={{ display: "flex", gap: "30px" }}>
       
        <div style={{ flex: 3, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "15px" }}>
          {images.map(img => (
            <div key={img.id} style={{ border: "1px solid #ddd", padding: "10px" }}>
              <img src={img.url} alt={img.author} style={{ width: "100%", height: "150px", objectFit: "cover" }} />
              <p>{img.author}</p>
              <button onClick={() => likeImage(img.id)}>
                ❤ {likes[img.id]?.length || 0}
              </button>
            </div>
          ))}
        </div>

       
        <div style={{ flex: 1 }}>
          <h2>Trending</h2>
          <ul>
            {trending.length === 0 && <li>No trending images yet</li>}
            {trending.map(({ id, recentCount }) => {
              const img = images.find(i => i.id === id);
              return (
                <li key={id}>
                  <img src={img.url} alt={img.author} style={{ width: "50px", height: "50px", objectFit: "cover" }} />{" "}
                  {img.author} — {recentCount} likes
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}