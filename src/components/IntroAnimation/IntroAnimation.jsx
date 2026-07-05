import { useState, useEffect, useContext } from 'react'
import { motion, useAnimationControls, AnimatePresence } from 'framer-motion'
import { SettingsContext } from '../../contexts/Settings'
import { easeOutCubic, easeInOutQuad, easeOutElastic } from '../../functions/animUtils/easings'
import classes from './IntroAnimation.module.css'

function IntroAnimation({ onComplete }) {
  const settings = useContext(SettingsContext)
  const duration = settings.general.animationSpeed / 1000

  const [visible, setVisible] = useState(true)

  const bgControls = useAnimationControls()
  const dotControls = useAnimationControls()
  const rectControls = useAnimationControls()
  const mikuControls = useAnimationControls()
  const iconControls = useAnimationControls()

  useEffect(() => {
    async function runIntro() {
      // Stage 1: Dot appears (scale from 0 to 1)
      await dotControls.start({
        scale: 1,
        opacity: 1,
        transition: { duration: duration * 0.3, ease: easeOutCubic }
      })

      // Stage 2: Dot morphs into vertical line (height grows, dot fades)
      dotControls.start({
        opacity: 0,
        transition: { duration: duration * 0.1 }
      })
      rectControls.set({ opacity: 1, width: 8, height: 8, borderRadius: 4 })
      await rectControls.start({
        height: '100vh',
        borderRadius: 0,
        transition: { duration: duration * 0.4, ease: easeInOutQuad }
      })

      // Stage 3: Line widens to rectangle (like image 2)
      await rectControls.start({
        width: '33vw',
        transition: { duration: duration * 0.4, ease: easeInOutQuad }
      })

      // Stage 4: Miku bounces up from below center
      mikuControls.set({ y: '60vh', opacity: 0, scale: 0.5 })
      await mikuControls.start({
        y: '-10%',
        opacity: 1,
        scale: 1,
        transition: { duration: duration * 0.8, ease: easeOutElastic }
      })

      // Stage 5: 01 icon appears below Miku with slight bounce
      await iconControls.start({
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { duration: duration * 0.5, ease: easeOutElastic }
      })

      // Hold for a moment
      await new Promise(resolve => setTimeout(resolve, 300 * duration))

      // Fade out the intro overlay
      await bgControls.start({
        opacity: 0,
        transition: { duration: duration * 0.4, ease: easeInOutQuad }
      })

      setVisible(false)
      onComplete()
    }

    runIntro()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={classes['intro-overlay']}
          animate={bgControls}
          exit={{ opacity: 0 }}
        >
          {/* Teal dot */}
          <motion.div
            className={classes['dot']}
            initial={{ scale: 0, opacity: 0 }}
            animate={dotControls}
          />

          {/* Teal rectangle that grows from the dot */}
          <motion.div
            className={classes['teal-rect']}
            initial={{ opacity: 0, width: 8, height: 8 }}
            animate={rectControls}
          />

          {/* Miku image */}
          <motion.img
            src="./miku.png"
            className={classes['miku-intro']}
            initial={{ y: '60vh', opacity: 0, scale: 0.5 }}
            animate={mikuControls}
            alt="Miku"
          />

          {/* 01 icon */}
          <motion.img
            src="./01r.png"
            className={classes['icon-01']}
            initial={{ opacity: 0, scale: 0.3, y: 30 }}
            animate={iconControls}
            alt="01"
            style={{ top: '62%' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default IntroAnimation
