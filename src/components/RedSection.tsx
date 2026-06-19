import "../app/red.css";

const VIDEO =
  "https://res.cloudinary.com/daklr2whx/video/upload/v1778602552/track-video_2_s9lp53.mp4";

/** Full-page red section: logo, mission, cursive signature, copy + bottom video. */
export default function RedSection() {
  return (
    <section className="spd">
      <div className="spd__wrap">
        <div className="spd__inner">
          <svg
            className="spd__logo"
            width="80"
            height="80"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M60 120C26.8629 120 0 93.1371 0 60V0C22.5654 0 42.2213 12.4569 52.4662 30.8691C38.4788 34.2089 28.0787 46.7902 28.0787 61.8006V63.1443C28.0787 79.9648 41.7146 93.6006 58.5353 93.6006H59.8789L59.8785 61.8006C59.8785 79.3633 74.1159 93.6006 91.6787 93.6006L91.6787 61.8006C91.6787 44.2783 77.5071 30.0661 60 30.0008L60 0H62.5352C94.2722 0 120 25.7279 120 57.4648V60C120 93.1371 93.1371 120 60 120Z"
              fill="white"
            />
          </svg>

          <p className="spd__mission">
            We built this platform with a single purpose to eliminate operational
            chaos and restore balance to your daily business routine
          </p>

          <div className="spd__sign">S.P.D</div>

          <div className="spd__paras">
            <p>
              I Was Exhausted By Software That Demanded More Effort Than It
              Actually Saved. That Is Why We Engineered An Autonomous Architecture
              That Operates Silently In The Background.
            </p>
            <p>
              Your Business Should Serve Your Life, Not Consume It. Let Our
              Algorithms Handle The Heavy Lifting, So You Can Focus On The Vision.
            </p>
          </div>
        </div>
      </div>

      <div className="spd__videowrap">
        <div className="spd__videofade" />
        <video
          className="spd__video"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={VIDEO} type="video/mp4" />
        </video>
      </div>
    </section>
  );
}
