import hmUI, { widget, createWidget, text_style, prop, event, align, deleteWidget, getTextLayout } from '@zos/ui'
import { LocalStorage } from '@zos/storage'
import { px } from '@zos/utils'
import { Time } from '@zos/sensor'
import { getDeviceInfo } from '@zos/device'
import { push } from '@zos/router'
import { SessionStorage } from '@zos/storage'
import { setScrollLock } from '@zos/page'
import { Sleep } from '@zos/sensor'
import { getSleepTarget } from '@zos/settings'
import { getProfile } from '@zos/user' // type something
Page({
  build() {
    let Y = 90
    let J = 160
    const { nickName } = getProfile()
    const sleep = new Sleep()
    const { width, height } = getDeviceInfo()
    const sleepTarget = getSleepTarget()
    sleep.updateInfo()
    const sleepStageConstants = sleep.getStageConstantObj();
    const stage = sleep.getStage();
    createWidget(widget.IMG, {
      x: 0, y: 0, w: width, h: height, auto_scale: true, src: "bg.png"
    })
    createWidget(widget.FILL_RECT, {
      x: width / 2 - J,
      y: height / 2 - Y + 10,
      w: J * 2, h: Y * 2, radius: 20,
      color: 0xf0f0f0, alpha: 80
    })
    const stages = sleep.getStage()
    const stageDurations = {}
    let totalTime = sleep.getInfo().totalTime
    let awake = {}
    stages.forEach(({ model, start, stop }) => {
      const duration = stop - start
      stageDurations[model] = (stageDurations[model] || 0) + duration + 1
      if (model == sleepStageConstants.WAKE_STAGE) {
        const duration = stop - start
        awake[model] = (awake[model] || 0) + duration + 1
      }
    })

    totalTime += stageDurations[sleepStageConstants.WAKE_STAGE]

    const baseY = height / 2 - Y + 20
    const barHeight = 20
    const gap = 20


    const totalLength = J * 2 - 20

    const minStart = Math.min(...stages.map(s => s.start))
    const maxStop = Math.max(...stages.map(s => s.stop))
    const range = maxStop - minStart
    const X = width / 2 - totalLength / 2

    const colors = {
      [sleepStageConstants.WAKE_STAGE]: 0xff5652,
      [sleepStageConstants.LIGHT_STAGE]: 0x3a84e2,
      [sleepStageConstants.DEEP_STAGE]: 0x8757e1,
      [sleepStageConstants.REM_STAGE]: 0x31b3dc
    }

    const yOffsets = {
      [sleepStageConstants.WAKE_STAGE]: baseY,
      [sleepStageConstants.LIGHT_STAGE]: baseY + gap * 3,
      [sleepStageConstants.DEEP_STAGE]: baseY + gap * 2,
      [sleepStageConstants.REM_STAGE]: baseY + gap * 1
    }

    stages.forEach(({ model, start, stop }) => {
      const startRatio = (start - minStart) / range
      const durationRatio = (stop - start) / range
      const barX = X + startRatio * totalLength
      const barW = durationRatio * totalLength

      createWidget(widget.FILL_RECT, {
        x: barX,
        y: yOffsets[model],
        w: barW,
        h: barHeight,
        radius: 7,
        color: colors[model],
      })
    })
    createWidget(widget.FILL_RECT, {
      x: X,
      y: baseY + gap * 4,
      w: totalLength, h: 5, radius: 5,
      color: 0xffffff
    })
    function toHourMin(min, rest = false) {
      let hours = Math.floor(min / 60)
      if(rest) hours = hours - 23
      const mins = min % 60
      return `${hours}h ${mins}min`
    }
    let t = 16
    createWidget(widget.TEXT, {
      x: X, y: baseY + gap * 4.35, w: 130, radius: 7, color: 0xffffff, text: toHourMin(sleep.getInfo().startTime), text_size: t,
    })
    function w() {
      const { width } = getTextLayout(toHourMin(sleep.getInfo().endTime), {
        text_size: t,
        text_width: 0,
        wrapped: 0
      })
      return width
    }
    console.log("W: " + w())
    createWidget(widget.TEXT, {
      x: X + totalLength - w(), y: baseY + gap * 4.35, w: 130, radius: 7, color: 0xffffff, text: toHourMin(sleep.getInfo().endTime) > 23 ? toHourMin(sleep.getInfo().endTime, true) : toHourMin(sleep.getInfo().endTime), text_size: t
    })
    let time = createWidget(widget.TEXT, {
      x: 135, y: 65, w: 200, h: 70, text_size: 40, color: 0xfcefd5, text: toHourMin(sleep.getInfo().totalTime)
    })
    createWidget(widget.TEXT, {
      x: 320, y: 65, w: 200, h: 70, text_size: 40, color: 0xfcefd5, text: sleep.getInfo().score
    })
    createWidget(widget.TEXT, {
      x: 312, y: 110, w: 200, h: 70, text_size: 20, color: 0xfcefd5, text: "SCORE"
    })
    stages.forEach(({ model, start, stop }) => {
      const duration = stop - start
      stageDurations[model] = (stageDurations[model] || 0) + duration + 1
    })

    totalTime = totalTime + stageDurations[sleepStageConstants.WAKE_STAGE]
    time.setProperty(prop.TEXT, toHourMin(sleep.getInfo().totalTime - awake[sleepStageConstants.WAKE_STAGE]))
  }
})