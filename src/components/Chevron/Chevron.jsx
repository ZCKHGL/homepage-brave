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
        bottomMenuControls = useAnimationControls()
        
  const controls = useMemo(() => {
    return ({
      miku: mikuControls,
      ball: ballControls, 
      line: lineControls,
      topMenu: topMenuControls, 
      bottomMenu: bottomMenuControls
    })
  }, [mikuControls, ballControls, lineControls, topMenuControls, bottomMenuControls])

  const animations = useMemo(() => {
    return ({
      transitions: {
        default: {
          // Returning from QuickLook to Default
          async searching() {
            // Ensure ball starts pink
            controls.ball.set({ backgroundColor: theme.accent })

            // Start color shift slowly (1 second)
            controls.ball.start({
              backgroundColor: theme.time,
              transition: { duration: duration * 1 }
            })

            // Ball comes back from left side
            await controls.ball.start({
              left: '50%',
              scale: 1,
              opacity: 1,
              transition: {
                ease: easeOutQuad,
                duration: duration * timings.smashToSide[0]
              }
            })
            
            if (mode !== modeRef.current) return
            
            // Ball shrinks and Miku appears
            controls.ball.start({
              scale: 0,
              opacity: 0,
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
            
            // Ball bounce down to line (50%)
            await controls.ball.start({
              top: '50%',
              transition: { ease: easeInQuad, duration: duration * timings.ball[2] }
            })
            
            if (mode !== modeRef.current) return

            // Pop up slightly to morph back into Miku
            await controls.ball.start({
              top: '40%',
              transition: { ease: easeOutCubic, duration: duration * timings.ball[2] }
            })
            
            if (mode !== modeRef.current) return

            // Shrink ball to dot and show Miku
            controls.ball.start({
              scale: 0,
              opacity: 0,
              top: '50%',
              transition: { ease: easeInBack, duration: duration * timings.ball[0] }
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
            // Ensure ball starts with time color
            controls.ball.set({ backgroundColor: theme.time })

            // Miku to ball
            controls.miku.start({
              scale: 0,
              opacity: 0,
              transition: { duration: duration * timings.ball[0] }
            })
            await controls.ball.start({
              scale: 1,
              opacity: 1,
              left: '50%',
              transition: { duration: duration * timings.ball[0] }
            })
            
            if (mode !== modeRef.current) return

            // Ball moves to left side and shifts to pink
            await controls.ball.start({
              left: 0,
              backgroundColor: theme.accent,
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
            // Reset color
            controls.ball.set({ backgroundColor: theme.time })
            
            // 1. Dot spawn & Miku hide (Spawns slightly higher than center so it can fall)
            controls.miku.start({
              scale: 0,
              opacity: 0,
              transition: { ease: easeInBack, duration: duration * timings.ball[0] }
            })
            await controls.ball.start({
              scale: 1,
              opacity: 1,
              top: '40%',
              transition: { ease: easeOutCubic, duration: duration * timings.ball[0] }
            })

            if (mode !== modeRef.current) return

            // 2. Line appears & Ball bounce down to line (50%)
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

            // 3. Ball bounce up to clock position
            await controls.ball.start({
              top: '35%',
              transition: { ease: easeOutCubic, duration: duration * timings.ball[2] }
            })

            if (mode !== modeRef.current) return

            // 4. Ball morph to clock (shrink out, Time component fades in)
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
              backgroundColor: theme.chevron,
              height: thickness + 'px',
            }}
          />
          <motion.img 
            src="/miku.png" 
            className={classes['miku-img']}
            initial={{ x: "-50%", y: "-50%", scale: 1, opacity: 1 }}
            animate={controls.miku}
            alt="Miku"
          />
          <MikuBall 
            controls={controls.ball}
            initial={{ x: "-50%", y: "-50%", scale: 0, opacity: 0, left: '50%', top: '50%' }}
            color={theme.time}
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