import React from 'react'
import { motion } from 'framer-motion'
import classes from './MikuBall.module.css'

function MikuBall({ controls, initial, style, color }) {
  return (
    <motion.div
      className={classes['miku-ball']}
      initial={{ ...initial, backgroundColor: color || '#39c5bb' }}
      animate={controls}
      style={style}
    />
  )
}

export default MikuBall
