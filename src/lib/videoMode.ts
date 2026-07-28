/**
 * Which video treatment a device gets.
 *
 * The site's signature effect is scroll-scrubbing: a video is never played,
 * its `currentTime` is driven frame-by-frame from scroll. That works well
 * with a mouse wheel on a desktop, but it does not survive a phone:
 *
 *  - iOS Safari will not decode a <video> that has never been played from a
 *    user gesture. Assigning `currentTime` to it renders nothing at all, so
 *    a scrubbed video is simply a blank rectangle — the videos "don't play".
 *  - Scrubbing needs the whole clip resident to seek smoothly. These clips
 *    are 12–32MB, and mobile browsers deliberately refuse to preload that
 *    (iOS ignores `preload="auto"`), so seeks land on unbuffered ranges.
 *  - Pinning the page and stepping frames off `touchmove` fights the
 *    device's own scrolling and feels broken under a thumb.
 *
 * So on touch/small-screen devices we stop scrubbing and just let the video
 * PLAY — muted, inline, looping, which every mobile browser allows without a
 * gesture. Any scroll-timed overlay content is driven off playback progress
 * instead of scroll position, so it still appears over the right moments.
 *
 * Desktop behaviour is entirely unchanged.
 */
export const PLAYBACK_MODE_QUERY = "(max-width: 820px), (pointer: coarse)";

/**
 * Start muted inline playback, retrying once on the first user gesture.
 *
 * Mobile browsers allow muted+playsInline autoplay, but a few situations
 * still reject the promise (iOS Low Power Mode, Android data saver, some
 * in-app webviews). In those cases the first tap anywhere on the page is a
 * valid gesture to start from, so we retry there rather than leaving a dead
 * black frame on screen.
 *
 * Returns a cleanup function that removes the pending gesture listeners.
 */
export function playInlineWithGestureFallback(video: HTMLVideoElement) {
  // Must be set as properties, not just attributes — iOS checks the live
  // property when deciding whether inline autoplay is permitted.
  video.muted = true;
  video.playsInline = true;

  let settled = false;
  const attempt = () => {
    const p = video.play();
    if (p && typeof p.then === "function") {
      p.then(() => {
        settled = true;
        removeListeners();
      }).catch(() => {
        /* blocked — wait for the gesture listeners below */
      });
    } else {
      settled = true;
      removeListeners();
    }
  };

  const onGesture = () => {
    if (settled) return;
    attempt();
  };

  function removeListeners() {
    window.removeEventListener("touchend", onGesture);
    window.removeEventListener("click", onGesture);
  }

  attempt();
  window.addEventListener("touchend", onGesture, { passive: true });
  window.addEventListener("click", onGesture);

  return removeListeners;
}
