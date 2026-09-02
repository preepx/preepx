import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const BANNERS = [
  {
    webSrc: "https://ik.imagekit.io/cjnon47kr/onjective_banner.png",
    mobileSrc: "https://ik.imagekit.io/cjnon47kr/objective.png",
    alt: "Objective MCQ Exam",
    link: "/objective-exam"
  },
  {
    webSrc: "https://ik.imagekit.io/cjnon47kr/interview_Webbanner.png",
    mobileSrc: "https://ik.imagekit.io/cjnon47kr/interview.png",
    alt: "AI Mock Interview",
    link: "/interview"
  },
  {
    webSrc: "https://ik.imagekit.io/cjnon47kr/webCodingPractice.png",
    mobileSrc: "https://ik.imagekit.io/cjnon47kr/Coding_challenge.png",
    alt: "100 Days Coding Challenge",
    link: "/100-days-challenge"
  }
];

export default function BannerSlider() {
  const navigate = useNavigate();
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isBannerHovered, setIsBannerHovered] = useState(false);
  const touchStartX = useRef(null);

  useEffect(() => {
    if (isBannerHovered) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNERS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isBannerHovered]);

  const handlePrevBanner = (e) => {
    e?.stopPropagation();
    setCurrentBanner((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);
  };

  const handleNextBanner = (e) => {
    e?.stopPropagation();
    setCurrentBanner((prev) => (prev + 1) % BANNERS.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (diff > 40) {
      handleNextBanner();
    } else if (diff < -40) {
      handlePrevBanner();
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="ud-banner-slider-wrap"
      onMouseEnter={() => setIsBannerHovered(true)}
      onMouseLeave={() => setIsBannerHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {BANNERS.map((item, index) => (
        <div
          key={index}
          className={`ud-banner-slide ${currentBanner === index ? "active" : ""}`}
          onClick={() => item.link && navigate(item.link)}
          role="button"
          tabIndex={0}
          aria-label={item.alt}
        >
          <picture className="ud-banner-picture">
            <source media="(max-width: 768px)" srcSet={item.mobileSrc} />
            <img
              src={item.webSrc}
              alt={item.alt}
              className="ud-banner-img"
              loading={index === 0 ? "eager" : "lazy"}
            />
          </picture>
        </div>
      ))}

      {/* Slider Dots */}
      <div className="ud-banner-dots">
        {BANNERS.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`ud-banner-dot ${currentBanner === index ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentBanner(index);
            }}
            aria-label={`Go to banner ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
