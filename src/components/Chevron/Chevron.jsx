import { useMemo, useContext, useRef, useEffect, useState } from 'react'
import { SettingsContext, ThemeContext } from '../../contexts/Settings'
import { useStateSelector } from '../../contexts/Store'
import useTransitions from '../../hooks/useTransitions'
import Time from '../Time/Time'
import MacrosMenu from '../MacrosMenu/MacrosMenu'
import { motion, useAnimationControls } from 'framer-motion'
import { easeInOutQuad, easeInQuad, easeOutCubic, easeOutQuad, easeOutElastic, easeInBack } from '../../functions/animUtils/easings'
import MikuBall from '../MikuBall/MikuBall'
import classes from './Chevron.module.css'

const timings = {
  smashToSide: [.6, .4],
  menu: [.4, .5, .5],
  ball: [.3, .4, .3] // spawn, grow, bounce
}

function Chevron({ visibility, onAnimationEnd }) {
  // settings
  const settings = useContext(SettingsContext)
  // theme
  const theme = useContext(ThemeContext)
  
  const duration = settings.general.animationSpeed / 1000
  const thickness = settings.chevron.thickness

  // mode
  const mode = useStateSelector(store => store.mode)
  // for some animations
  const modeRef = useRef(mode)
  useEffect(() => {
    modeRef.current = mode
  }, [mode])

  const [isMacrosMenuRendered, setIsMacrosMenuRendered] = useState(false)

  // element animation controls
  const mikuControls = useAnimationControls(),
        ballControls = useAnimationControls(),
        lineControls = useAnimationControls(),
        topMenuControls = useAnimationControls(),
        bottomMenuControls = useAnimationControls(),
        // New controls for 01 icon, and teal background
        icon01Controls = useAnimationControls(),
        tealBgControls = useAnimationControls()
        
  const controls = useMemo(() => {
    return ({
      miku: mikuControls,
      ball: ballControls, 
      line: lineControls,
      topMenu: topMenuControls, 
      bottomMenu: bottomMenuControls,
      icon01: icon01Controls,
      tealBg: tealBgControls
    })
  }, [mikuControls, ballControls, lineControls, topMenuControls, bottomMenuControls, icon01Controls, tealBgControls])

  const animations = useMemo(() => {
    return ({
      transitions: {
        default: {
          // Returning from QuickLook to Default
          async searching() {
            // Ensure ball starts pink
            controls.ball.set({ backgroundColor: '#fe008a' })

            // Start color shift to green
            controls.ball.start({
              backgroundColor: '#39ff39',
              transition: { duration: duration * 1 }
            })

            // Ball and teal bg come back from left side together
            controls.ball.start({
              left: '50%',
              scale: 1,
              opacity: 1,
              transition: {
                ease: easeOutQuad,
                duration: duration * timings.smashToSide[0]
              }
            })
            
            // Teal bg expands back to rectangle synced with ball
            await controls.tealBg.start({
              width: '33vw',
              left: '33.5vw',
              opacity: 1,
              transition: { ease: easeOutQuad, duration: duration * timings.smashToSide[0] }
            })
            
            // Ball shrinks and Miku + 01 appear
            controls.ball.start({
              scale: 0,
              opacity: 0,
              transition: { duration: duration * timings.ball[0] }
            })
            controls.icon01.start({
              opacity: 1,
              scale: 1,
              top: '62%',
              transition: { duration: duration * timings.ball[0] }
            })
            await controls.miku.start({
              opacity: 1,
              scale: 1,
              transition: { duration: duration * timings.ball[0] }
            })
            return onAnimationEnd()
          },
          // Returning from Menu to Default
          async opened() {
            setIsMacrosMenuRendered(false)
            // closing menus
            controls.topMenu.start({
              translateY: '100%',
              transition: {
                ease: easeInOutQuad,
                duration: duration * timings.menu[2]
              }
            })
            controls.line.start({
              scaleX: 0,
              opacity: 0,
              transition: {
                ease: easeInOutQuad,
                duration: duration * timings.menu[2]
              }
            })
            await controls.bottomMenu.start({
              translateY: '-100%',
              transition: {
                ease: easeInOutQuad,
                duration: duration * timings.menu[2]
              }
            })
            if (mode !== modeRef.current) return 

            // Teal bg shrinks back from fullscreen to rectangle
            await controls.tealBg.start({
              width: '33vw',
              height: '100vh',
              left: '33.5vw',
              top: '0',
              borderRadius: 0,
              transition: { ease: easeInOutQuad, duration: duration * timings.menu[2] }
            })

            if (mode !== modeRef.current) return
            
            // Ball bounce down to line (50%)
            await controls.ball.start({
              top: '50%',
              transition: { ease: easeInQuad, duration: duration * timings.ball[2] }
            })
            
            if (mode !== modeRef.current) return

            // Pop up slightly to morph back into Miku + 01
            await controls.ball.start({
              top: '40%',
              transition: { ease: easeOutCubic, duration: duration * timings.ball[2] }
            })
            
            if (mode !== modeRef.current) return

            // Shrink ball and show Miku + 01
            controls.ball.start({
              scale: 0,
              opacity: 0,
              top: '50%',
              transition: { ease: easeInBack, duration: duration * timings.ball[0] }
            })
            controls.icon01.start({
              scale: 1,
              opacity: 1,
              top: '62%',
              transition: { ease: easeOutElastic, duration: duration * timings.ball[0] }
            })
            return await controls.miku.start({
              scale: 1,
              opacity: 1,
              transition: { ease: easeOutElastic, duration: duration * timings.ball[0] }
            })
          }
        },
        searching: {
          // Going to Search from Default
          async default() {
            // Ensure ball starts with green color
            controls.ball.set({ backgroundColor: '#39ff39' })

            // Miku + 01 to balls
            controls.miku.start({
              scale: 0,
              opacity: 0,
              transition: { duration: duration * timings.ball[0] }
            })
            controls.icon01.start({
              scale: 0,
              opacity: 0,
              top: '50%',
              transition: { duration: duration * timings.ball[0] }
            })
            await controls.ball.start({
              scale: 1,
              opacity: 1,
              left: '50%',
              transition: { duration: duration * timings.ball[0] }
            })
            
            if (mode !== modeRef.current) return

            // Teal bg slides left and shrinks
            controls.tealBg.start({
              width: '0vw',
              left: '0',
              opacity: 0,
              transition: {
                ease: easeInQuad,
                duration: duration * timings.smashToSide[0]
              }
            })

            // Ball move to left side and shift to pink
            await controls.ball.start({
              left: 0,
              backgroundColor: '#fe008a',
              transition: {
                ease: easeInQuad,
                duration: duration * timings.smashToSide[0]
              }
            })
            // Hide ball, QuickLook takes over
            await controls.ball.start({
              opacity: 0,
              transition: { duration: 0.1 }
            })
            return onAnimationEnd()
          }
        },
        opened: {
          // Going to Menu from Default
          async default() {
            // Reset colors - green ball
            controls.ball.set({ backgroundColor: '#39ff39' })
            
            // 1. Dot spawn & Miku + 01 hide
            controls.miku.start({
              scale: 0,
              opacity: 0,
              transition: { ease: easeInBack, duration: duration * timings.ball[0] }
            })
            controls.icon01.start({
              scale: 0,
              opacity: 0,
              top: '50%',
              transition: { ease: easeInBack, duration: duration * timings.ball[0] }
            })
            await controls.ball.start({
              scale: 1,
              opacity: 1,
              top: '40%',
              transition: { ease: easeOutCubic, duration: duration * timings.ball[0] }
            })

            if (mode !== modeRef.current) return

            // 2. Teal bg expands to fullscreen + ball color shifts green → pink
            controls.tealBg.start({
              width: '100vw',
              height: '100vh',
              left: '0',
              top: '0',
              opacity: 1,
              borderRadius: 0,
              transition: { ease: easeInOutQuad, duration: duration * timings.menu[1] }
            })
            controls.ball.start({
              backgroundColor: '#fe008a',
              transition: { duration: duration * timings.menu[1] }
            })

            // Line appears & Ball bounces
            controls.line.start({
              scaleX: 1,
              opacity: 1,
              transition: { ease: easeInOutQuad, duration: duration * timings.menu[2] }
            })
            await controls.ball.start({
              top: '50%',
              transition: { ease: easeInQuad, duration: duration * timings.ball[2] }
            })

            if (mode !== modeRef.current) return

            // 3. Ball bounces up to clock position
            await controls.ball.start({
              top: '42%',
              transition: { ease: easeOutCubic, duration: duration * timings.ball[2] }
            })

            if (mode !== modeRef.current) return

            // 4. Ball morph to clock (shrink out)
            await controls.ball.start({
              scale: 0,
              opacity: 0,
              transition: { ease: easeInOutQuad, duration: duration * timings.menu[1] }
            })

            if (mode !== modeRef.current) return

            // 5. Menus appear
            controls.topMenu.start({
              translateY: 0,
              transition: { ease: easeInOutQuad, duration: duration * timings.menu[2] }
            })
            await controls.bottomMenu.start({
              translateY: 0,
              transition: { ease: easeInOutQuad, duration: duration * timings.menu[2] }
            })
            return setIsMacrosMenuRendered(true)
          }
        }
      }
    })
  }, [controls, duration, mode, onAnimationEnd])

  useTransitions(mode, animations, visibility)

  return (
      <div 
        className={classes['container']} 
        style={{
          '--menu-offset': thickness/2 + 'px',
          visibility: visibility ? 'visible' : 'hidden'
        }}>

        {/* Teal background overlay */}
        <motion.div
          className={classes['teal-bg']}
          initial={{ width: '33vw', height: '100vh', left: '33.5vw', top: '0', opacity: 1, borderRadius: 0 }}
          animate={controls.tealBg}
        />

        <div className={classes['wrapper']}>
            <motion.div 
              initial={{ translateY: '100%'}}
              animate={controls.topMenu}>
              <Time/>
            </motion.div>
        </div>
        
        <div className={classes['miku-container']}>
          <motion.div 
            className={classes['miku-line']}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={controls.line}
            style={{ 
              backgroundColor: '#fe008a',
              height: thickness + 'px',
            }}
          />
          <motion.img 
            src="./miku.png" 
            className={classes['miku-img']}
            initial={{ x: "-50%", y: "-50%", scale: 1, opacity: 1 }}
            animate={controls.miku}
            alt="Miku"
          />
          {/* 01 Icon */}
          <motion.img
            src="./01r.png"
            className={classes['icon-01']}
            initial={{ x: "-50%", scale: 1, opacity: 1 }}
            animate={controls.icon01}
            alt="01"
          />
          <MikuBall 
            controls={controls.ball}
            initial={{ x: "-50%", y: "-50%", scale: 0, opacity: 0, left: '50%', top: '50%' }}
            color={'#39ff39'}
          />
        </div>

        <div className={classes['wrapper']}>
          <motion.div 
            initial={{ translateY: '-100%'}}
            animate={controls.bottomMenu}>
              <MacrosMenu 
                visibility={visibility}
                fullVisibility={isMacrosMenuRendered}/>
          </motion.div>
        </div>
      </div>
  )
}

export default Chevron