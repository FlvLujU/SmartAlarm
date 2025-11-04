import hmUI, { widget, createWidget, text_style, prop, event, align, deleteWidget } from '@zos/ui'
import { LocalStorage } from '@zos/storage'
import { px } from '@zos/utils'
import { Time } from '@zos/sensor'
import { getDeviceInfo } from '@zos/device'
import { push } from '@zos/router'
import { SessionStorage } from '@zos/storage'
import { setScrollLock } from '@zos/page'
import { Sleep } from '@zos/sensor'
import { getSleepTarget } from '@zos/settings'
import { getProfile } from '@zos/user'
Page({
  build() {
    const { nickName } = getProfile()
    const sleep = new Sleep()
    const { width, height } = getDeviceInfo()
    const sleepTarget = getSleepTarget()
    sleep.updateInfo()
    createWidget(widget.IMG, {
      x: 0, y: 0, w: width, h: height, auto_scale: true, src: "bg.png"
    })
    let alh = 185
    let W = 80
    let time = createWidget(widget.TEXT, {
      x: 135, y: 65, w: 200, h: 70, text_size: 40, color: 0xfcefd5, text: toHourMin(sleep.getInfo().totalTime)
    })
    createWidget(widget.TEXT, {
      x: 320, y: 65, w: 200, h: 70, text_size: 40, color: 0xfcefd5, text: sleep.getInfo().score
    })
    createWidget(widget.TEXT, {
      x: 312, y: 110, w: 200, h: 70, text_size: 20, color: 0xfcefd5, text: "SCORE"
    })
    let L = 160
    let Y = 90
    createWidget(widget.FILL_RECT, {
      x: width / 2 - L,
      y: height / 2 - Y + 10,
      w: L * 2, h: Y * 2, radius: 20,
      color: 0xf0f0f0, alpha: 80
    })
    let timesAwake = 0;
    let lastState = null;
    const sleepStageConstants = sleep.getStageConstantObj();
    const stage = sleep.getStage();

    stage.forEach((i) => {
      const { model } = i;

      if (model === sleepStageConstants.WAKE_STAGE) {
        if (lastState !== sleepStageConstants.WAKE_STAGE) {
          timesAwake++;
        }
      }

      lastState = model;
    });
    let R = 15
    let D = 25
    createWidget(widget.FILL_RECT, {
      x: width / 2 - L + R,
      y: height / 2 - Y + 10 + R + D,
      w: L * 2 - R * 2, h: 10, radius: 5,
      color: 0xd7d7d7
    })
    /*createWidget(widget.FILL_RECT, {
      x: width / 2 - L + R,
      y: height / 2 - Y + 10 + R,
      w: (sleep.getInfo().totalTime / sleepTarget) * (L * 2 - R * 2), h: 10, radius: 5,
      color: 0x5d477f
    })*/
    let percent = Math.round((sleep.getInfo().totalTime / sleepTarget) * 100)
    if (percent > 100) percent = 100
    let perW = createWidget(widget.TEXT, {
      x: 0,
      y: height / 2 - Y + 10 + R + 10 - 30,
      w: width, h: 80, text: Math.round(percent) + "%",
      align_h: align.CENTER_H, text_size: 33,
      color: 0x5d477f
    })
    createWidget(widget.TEXT, {
      x: 0,
      y: height / 2 - Y + 10 + R + 125,
      w: width, h: 80, text: "",//"Good morning, " + nickName + "!",
      align_h: align.CENTER_H, text_size: 25,
      color: 0xffffff
    })
    console.log("Veces despertado:", JSON.stringify(sleep.getStageConstantObj()));
    let rad = 100
    function toHourMin(min) {
      const hours = Math.floor(min / 60)
      const mins = min % 60
      return `${hours}h ${mins}min`
    }

    const stages = sleep.getStage()


    const stageDurations = {}
    const awake = {}
    let totalTime = sleep.getInfo().totalTime
    stages.forEach(({ model, start, stop }) => {
      if (model != sleepStageConstants.WAKE_STAGE) {
        const duration = stop - start
        stageDurations[model] = (stageDurations[model] || 0) + duration + 1
      } else {
        const duration = stop - start
        awake[model] = (awake[model] || 0) + duration + 1
      }
    })

    totalTime = totalTime - awake[sleepStageConstants.WAKE_STAGE]
    time.setProperty(prop.TEXT, toHourMin(sleep.getInfo().totalTime - awake[sleepStageConstants.WAKE_STAGE]))
    perW.setProperty(prop.TEXT, Math.round(totalTime / sleepTarget * 100))
    const colors = {
      [sleepStageConstants.LIGHT_STAGE]: 0x3a84e2,
      [sleepStageConstants.DEEP_STAGE]: 0x8757e1,
      [sleepStageConstants.REM_STAGE]: 0x31b3dc     // 💗
    }

    let offset = 0
    const maxWidth = L * 2 - R * 2
    const barWidth = Math.min(Math.floor((totalTime / sleepTarget) * maxWidth), maxWidth)

    const orderedStages = Object.entries(stageDurations)
      .sort((a, b) => b[1] - a[1])
    const radiusPx = 5

    orderedStages.forEach(([model, duration], index) => {
      const color = colors[model] || 0x999999
      let w = Math.floor((duration / totalTime) * barWidth)


      let x = width / 2 - L + R + offset
      let drawRadiusStart = false
      let drawRadiusEnd = false

      if (index === 0) {
        x += radiusPx
        w -= radiusPx
        drawRadiusStart = true
      }
      if (index === orderedStages.length - 1) {
        drawRadiusEnd = true
      }

      createWidget(widget.FILL_RECT, {
        x, y: height / 2 - Y + 10 + R + D,
        w, h: 10, radius: 0,
        color
      })
      let test = 0
      if (drawRadiusStart) {
        createWidget(widget.CIRCLE, {
          center_x: x - radiusPx / 2 + 1, center_y: height / 2 - Y + 10 + R + 5 + D, radius: radiusPx,
          color
        })
      }
      if (drawRadiusEnd) {
        createWidget(widget.CIRCLE, {
          center_x: x + w + 1, center_y: height / 2 - Y + 10 + R + 5 + D, radius: radiusPx,
          color
        })
      }

      offset += w
    })

    let C = 130
    let J = 10
    let H = 15
    createWidget(widget.CIRCLE, {
      center_x: width / 2 - C, center_y: height / 2 + -5 - J + H, radius: 7, color: 0x3a84e2
    })
    createWidget(widget.CIRCLE, {
      center_x: width / 2 - C, center_y: height / 2 + 50 + H, radius: 7, color: 0x8757e1
    })
    createWidget(widget.CIRCLE, {
      center_x: width / 2 + C, center_y: height / 2 + -5 - J + H, radius: 7, color: 0x31b3dc
    })
    createWidget(widget.CIRCLE, {
      center_x: width / 2 + C, center_y: height / 2 + 50 + H, radius: 7, color: 0xff5652
    })
    let k = 14
    createWidget(widget.TEXT, {
      x: width / 2 - C + k, y: height / 2 + -5 - k - J + H, w: 130, radius: 7, color: 0xffffff, text: "Light dream"
    })
    createWidget(widget.TEXT, {
      x: width / 2 - C + k, y: height / 2 + 50 - k + H, w: 130, radius: 7, color: 0xffffff, text: "Deep dream"
    })
    createWidget(widget.TEXT, {
      x: width / 2 - C + k + 190, y: height / 2 + -5 - k - J + H, w: 130, radius: 7, color: 0xffffff, text: "REM"
    })
    createWidget(widget.TEXT, {
      x: width / 2 - C + k + 185, y: height / 2 + 50 - k + H, w: 130, radius: 7, color: 0xffffff, text: "Wake"
    })
    createWidget(widget.IMG, {
      x: width / 2 - W / 2, y: height - 120, src: "conf.png", alpha: alh
    }).addEventListener(event.CLICK_DOWN, () => {
      push({ url: "page/conf" })
    })
    let min = 50
    createWidget(widget.IMG, {
      x: width / 2 - min - W, y: height - 120, src: "alarm.png", alpha: alh
    }).addEventListener(event.CLICK_DOWN, () => {
      push({ url: "page/index" })
    })
    createWidget(widget.IMG, {
      x: width / 2 + min, y: height - 120, src: "analysis.png", alpha: alh
    }).addEventListener(event.CLICK_DOWN, () => {
      push({ url: "page/anal" })
    })
  }
})