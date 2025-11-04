import { widget, createWidget, text_style, event, align, prop, getTextLayout, deleteWidget } from '@zos/ui'
import { LocalStorage } from '@zos/storage'
import { px } from '@zos/utils'
import { Time } from '@zos/sensor'
import { getDeviceInfo } from '@zos/device'
import { replace, back } from '@zos/router'
import { setScrollLock } from '@zos/page'
import { SoundPlayer } from "@silver-zepp/easy-media";
Page({
  build() {
    const storage = new LocalStorage()
    const player = new SoundPlayer();
    let nums = ["nums/0.png", "nums/1.png", "nums/2.png", "nums/3.png", "nums/4.png", "nums/5.png", "nums/6.png", "nums/7.png", "nums/8.png", "nums/9.png"]
    setScrollLock({
      lock: true,
    })
    /*let Volume = storage.getItem('VolumeAlarm')
    if (storage.getItem("VolumeAlarm") != null && storage.getItem("VolumeAlarm") != undefined) {
      Volume = storage.getItem("VolumeAlarm")
    } else {
      Volume = player.get.volume()
      storage.setItem("VolumeAlarm", Volume)
    }*/
    let selected = 1
    let wholeList = []
    const plane = createWidget(widget.IMG, {
      x: 100,
      y: 100,
      src: ".png",
      w: 100,
      h: 150
    })
    let page = 1

    let TimeW = null
    const time = new Time()
    //const sessionStorage = new SessionStorage()
    let confs = storage.getItem('sleep_conf') || { stopPlayBack: false, vib: 1, tone: 0, volume: player.get.volume()}
    let Volume = confs.volume
    const { width, height } = getDeviceInfo()
    // ========== FUNCIONES AUXILIARES ==========

    // limpiar todo lo anterior
    let w0 = createWidget(widget.IMG, { x: 0, y: 0, w: width, h: height, auto_scale: true, src: "bg4.png" })

    let w5 = createWidget(widget.TEXT, {
      x: 0, y: px(30), w: width, h: px(40),
      text: "Settings",
      color: 0xffffff,
      text_size: 26,
      align_h: align.CENTER_H
    })
    let items = [
      { text: "Sleep analysis" },
      { text: "Sleeping schedule" },
      { text: "Headphones" },
      { text: "Vibration & ringtone" },
      { text: "Volume" }
    ]
    const lp = 110
    const baseY = height - 230 - lp - 30
    const gap = 65 // separaclet whol
    for (let i = 0; i < items.length; i++) {
      const y = baseY + i * gap

      // fondo rectangular
      let bg = createWidget(widget.FILL_RECT, {
        x: 70,
        y: y - 10,
        w: width - 70 * 2,
        h: 55,
        color: 0x555555,
        alpha: 130,
        radius: 15
      })

      // texto de la izquierda

      // flecha ">"
      let ar = createWidget(widget.TEXT, {
        x: width - 70 - 40,
        y: y - 5,
        w: 200,
        h: 60,
        color: 0xffffff,
        text: ">",
        text_size: 33
      })
      let tx = createWidget(widget.TEXT, {
        x: 70,
        y: y - 10,
        w: width - 70 * 2,
        h: 55,
        align_v: align.CENTER_V,
        color: 0xffffff,
        text: "    " + items[i].text,
        text_size: 25
      })
      tx.addEventListener(event.CLICK_DOWN, () => {
        shiftWidgetsLeft(wholeList, width, false, i)
      })
      wholeList.push(bg, tx, ar)
    }
    function shiftWidgetsLeft(wholeList, width, obligated = false, type = 0) {
      if (type == 4) {
        let L = width / 2 + 20
        let minV = 0
        let maxV = 100
        let sW = 35
        const sliderStart = width / 2 - sW / 2 // X fijo, centrado
        const sliderHeight = L
        const sliderTop = height / 2 - L / 2 - 10
        const sliderBottom = sliderTop + sliderHeight

        var VolumeBarGray = createWidget(widget.FILL_RECT, {
          x: sliderStart + width,
          y: sliderTop,
          w: sW,
          h: sliderHeight,
          color: 0x555555,
          radius: sW / 2
        })

        var VolumeBar = createWidget(widget.FILL_RECT, {
          x: sliderStart + width,
          y: sliderTop + sliderHeight * (1 - Volume / 100), // parte superior según volumen
          w: sW,
          h: sliderHeight * Volume / 100, // altura proporcional
          color: 0xffffff,
          radius: sW / 2
        })

        var circleVol = createWidget(widget.IMG, {
          x: sliderStart - 25 + (sW / 2) + width, // centrado en X
          y: sliderTop + sliderHeight * (1 - Volume / 100) - 25,
          src: "circle.png",
        })

        var touchVol = createWidget(widget.IMG, {
          x: width,
          y: 0,
          w: width,
          h: height,
          src: ".png",
        })
        let next = createWidget(widget.BUTTON, {
          x: width + width / 2 - 110, y: height - 80, w: 219, h: 56, text: "Back", normal_src: "btnN.png", press_src: "btnN.png", click_func: () => { back() }
        })
        function back() {
          shiftWidgetsLeft(wholeList, width, true)
          setTimeout(() => {
            deleteWidget(VolumeBarGray)
            deleteWidget(VolumeBar)
            deleteWidget(circleVol)
            deleteWidget(touchVol)
            deleteWidget(next)
          }, 500)
        }
        wholeList.push(VolumeBarGray, VolumeBar, circleVol, touchVol, next)
        function updateVolumeByXY(x, y) {
          console.log("XY: " + x + " " + y)
          if (x < sliderStart || x > sliderStart + 35) return false
          if (y < sliderTop || y > sliderBottom) return false

          // volumen invertido: arriba = max, abajo = min
          Volume = Math.floor((sliderBottom - y) * 100 / sliderHeight)
          Volume = Math.min(Math.max(Volume, minV), maxV)
          if (Volume <= 1) Volume = 0

                                            confs.volume = Volume
        storage.setItem('sleep_conf', confs)
          setVolumeUI(Volume)
          //applyVolume(Volume)
          return true
        }

        touchVol.addEventListener(event.MOVE, (info) => {
          updateVolumeByXY(info.x, info.y)
        })

        touchVol.addEventListener(event.CLICK_DOWN, (info) => {
          updateVolumeByXY(info.x, info.y)
        })

        touchVol.addEventListener(event.CLICK_UP, (info) => {
          updateVolumeByXY(info.x, info.y)
        })
        function setVolumeUI(v) {
          // barra blanca proporcional al volumen
          VolumeBar.setProperty(prop.MORE, {
            x: sliderStart,
            y: Math.floor(sliderTop + sliderHeight * (1 - v / 100)), // parte superior según volumen
            w: Math.floor(sW),
            h: Math.floor(sliderHeight * v / 100),
            color: 0xffffff,
            radius: sW / 2
          })

          // círculo indicador
          circleVol.setProperty(prop.MORE, {
            x: sliderStart - 25 + sW / 2, // centrado en X
            y: sliderTop + sliderHeight * (1 - v / 100) - 25, // posición Y según volumen
          })
        }
      }
      if (type == "Vibration") {
        let numAssets = 4
        let assetWidth = 34
        let spacing = 35
        let assets = []
        let selectList = [0, 0, 0, 0]
        selectList[confs.vib] = 1
        const intensities = ["High", "Large", "Medium", "Short"]
        for (let i = 0; i < numAssets; i++) {
          let bg = createWidget(widget.FILL_RECT, {
            x: width + 70,
            y: 110 + (i * (assetWidth + spacing)),
            w: width - 70 * 2,
            h: 55,
            color: 0x555555,
            alpha: 130,
            radius: 15
          })
          let w = createWidget(widget.IMG, {
            x: width + width - 120,
            y: 120 + (i * (assetWidth + spacing)),
            src: selectList[i] == 1 ? 'S.png' : 'F.png'
          })
          let t = createWidget(widget.TEXT, {
            x: width + 90,
            y: 110 + (i * (assetWidth + spacing)),
            w: 125, h: 55,
            align_v: align.CENTER_V, color: 0xffffff, text_size: 25, text: intensities[i]
          })
          wholeList.push(w, bg, t)
          assets.push(w, bg, t)
          w.addEventListener(event.CLICK_DOWN, () => {
            selectList = [0, 0, 0, 0]
            selectList[i] = 1
            assets.forEach((w) => {
              w.setProperty(prop.MORE, {
                src: 'F.png'
              })
            })
            w.setProperty(prop.MORE, {
              src: 'S.png'
            })
                                            confs.vib = i
        storage.setItem('sleep_conf', confs)
          })
          t.addEventListener(event.CLICK_DOWN, () => {
            selectList = [0, 0, 0, 0]
            selectList[i] = 1
            assets.forEach((w) => {
              w.setProperty(prop.MORE, {
                src: 'F.png'
              })
            })
            w.setProperty(prop.MORE, {
              src: 'S.png'
            })
                                            confs.vib = i
        storage.setItem('sleep_conf', confs)
          })
          bg.addEventListener(event.CLICK_DOWN, () => {
            selectList = [0, 0, 0, 0]
            selectList[i] = 1
            assets.forEach((w) => {
              w.setProperty(prop.MORE, {
                src: 'F.png'
              })
            })
            w.setProperty(prop.MORE, {
              src: 'S.png'
            })
                                confs.vib = i
        storage.setItem('sleep_conf', confs)
          })
        }
        let next = createWidget(widget.BUTTON, {
          x: width + width / 2 - 110, y: height - 80, w: 219, h: 56, text: "Back", normal_src: "btnN.png", press_src: "btnN.png", click_func: () => { back() }
        })
        function back() {
          shiftWidgetsLeft(wholeList, width, true)
          setTimeout(() => {
            assets.forEach((w) => {
              deleteWidget(w)
            })
            deleteWidget(next)
          }, 500)
        }
        wholeList.push(next)
      }
      if (type == "Ringtone") {
        let numAssets = 4
        let assetWidth = 34
        let spacing = 35
        let assets = []
        let selectList = [0, 0, 0, 0]
        selectList[confs.tone] = 1
        const intensities = ["Beep Beep Beep", "Digital universe", "Xperia", "Vibroton"]
        for (let i = 0; i < numAssets; i++) {
          let bg = createWidget(widget.FILL_RECT, {
            x: width + 70,
            y: 110 + (i * (assetWidth + spacing)),
            w: width - 70 * 2,
            h: 55,
            color: 0x555555,
            alpha: 130,
            radius: 15
          })
          let w = createWidget(widget.IMG, {
            x: width + width - 120,
            y: 120 + (i * (assetWidth + spacing)),
            src: selectList[i] == 1 ? 'S.png' : 'F.png'
          })
          let t = createWidget(widget.TEXT, {
            x: width + 90,
            y: 110 + (i * (assetWidth + spacing)),
            w: 195, h: 55,
            align_v: align.CENTER_V, color: 0xffffff, text_size: 25, text: intensities[i]
          })
          wholeList.push(w, bg, t)
          assets.push(w, bg, t)
          w.addEventListener(event.CLICK_DOWN, () => {
            selectList = [0, 0, 0, 0]
            selectList[i] = 1
            assets.forEach((w) => {
              w.setProperty(prop.MORE, {
                src: 'F.png'
              })
            })
            w.setProperty(prop.MORE, {
              src: 'S.png'
            })
                                confs.tone = i
        storage.setItem('sleep_conf', confs)
          })
          t.addEventListener(event.CLICK_DOWN, () => {
            selectList = [0, 0, 0, 0]
            selectList[i] = 1
            assets.forEach((w) => {
              w.setProperty(prop.MORE, {
                src: 'F.png'
              })
            })
            w.setProperty(prop.MORE, {
              src: 'S.png'
            })
                                confs.tone = i
        storage.setItem('sleep_conf', confs)
          })
          bg.addEventListener(event.CLICK_DOWN, () => {
            selectList = [0, 0, 0, 0]
            selectList[i] = 1
            assets.forEach((w) => {
              w.setProperty(prop.MORE, {
                src: 'F.png'
              })
            })
            w.setProperty(prop.MORE, {
              src: 'S.png'
            })
                    confs.tone = i
        storage.setItem('sleep_conf', confs)
          })
        }
        let next = createWidget(widget.BUTTON, {
          x: width + width / 2 - 110, y: height - 80, w: 219, h: 56, text: "Back", normal_src: "btnN.png", press_src: "btnN.png", click_func: () => { back() }
        })
        function back() {
          shiftWidgetsLeft(wholeList, width, true)
          setTimeout(() => {
            assets.forEach((w) => {
              deleteWidget(w)
            })
            deleteWidget(next)
          }, 500)
        }
        wholeList.push(next)
      }
      if (type == 3) {
        let items2 = [
          { text: "Vibration" },
          { text: "Ringtone" }
        ]
        let widgets = []
        for (let i = 0; i < items2.length; i++) {
          const y = baseY + i * gap

          // fondo rectangular
          let bg = createWidget(widget.FILL_RECT, {
            x: width + 70,
            y: y - 10,
            w: width - 70 * 2,
            h: 55,
            color: 0x555555,
            alpha: 130,
            radius: 15
          })

          // texto de la izquierda

          // flecha ">"
          let ar = createWidget(widget.TEXT, {
            x: width + width - 70 - 40,
            y: y - 5,
            w: 200,
            h: 60,
            color: 0xffffff,
            text: ">",
            text_size: 33
          })
          let tx = createWidget(widget.TEXT, {
            x: width + 70,
            y: y - 10,
            w: width - 70 * 2,
            h: 55,
            align_v: align.CENTER_V,
            color: 0xffffff,
            text: "    " + items2[i].text,
            text_size: 25
          })

          tx.addEventListener(event.CLICK_DOWN, () => {
            shiftWidgetsLeft(wholeList, width, false, items2[i].text)
          })
          wholeList.push(bg, tx, ar)
          widgets.push(bg, tx, ar)
        }
        let next = createWidget(widget.BUTTON, {
          x: width + width / 2 - 110, y: height - 80, w: 219, h: 56, text: "Back", normal_src: "btnN.png", press_src: "btnN.png", click_func: () => { back() }
        })
        function back() {
          shiftWidgetsLeft(wholeList, width, true)
          setTimeout(() => {
            widgets.forEach((e) => { deleteWidget(e) })
            deleteWidget(next)
          }, 500)
        }
        wholeList.push(next)
      }
      if (type == 2) {
        let widgets = []
        let quitSleep = confs.stopPlayBack
        let created = false
        let bg = createWidget(widget.FILL_RECT, {
          x: width + 70,
          y: 100,
          w: width - 70 * 2,
          h: 265,
          color: 0x555555,
          alpha: 130,
          radius: 15
        })

        let t1 = createWidget(widget.TEXT, {
          x: width, y: 110, w: width, h: 200, color: 0xffffff, text: "As soon as the\nwatch detects that\nyou are falling asleep, it\nwill automatically stop\nmusic playback.", text_size: 25, align_h: align.CENTER_H
        })
        let d = createWidget(widget.BUTTON, {
          x: !created ? width / 2 - 104 / 2 + width : width / 2 - 104 / 2,
          y: height - 170,
          text: "",
          w: 104, h: 60,
          normal_src: quitSleep ? 'onM.png' : 'offM.png',
          press_src: quitSleep ? 'onM.png' : 'offM.png',
          click_func: () => {
            quitSleep = !quitSleep
            d.setProperty(prop.MORE, {
              x: !created ? width / 2 - 104 / 2 + width : width / 2 - 104 / 2,
              y: height - 170,
              text: "",
              w: 104, h: 60,
              normal_src: quitSleep ? 'onM.png' : 'offM.png',
              press_src: quitSleep ? 'onM.png' : 'offM.png',
            })
            confs.stopPlayBack = quitSleep
            storage.setItem('sleep_conf', confs)
          }
        })
        wholeList.push(d)
        created = true

        wholeList.push(t1)
        wholeList.push(bg)
        widgets.push(t1, bg, d)
        let next = createWidget(widget.BUTTON, {
          x: width + width / 2 - 110, y: height - 80, w: 219, h: 56, text: "Back", normal_src: "btnN.png", press_src: "btnN.png", click_func: () => { back() }
        })
        function back() {
          shiftWidgetsLeft(wholeList, width, true)
          setTimeout(() => {
            widgets.forEach((e) => { deleteWidget(e) })
            deleteWidget(next)
          }, 500)
        }
        wholeList.push(next)
      }

      let back = 1

      if (obligated == true) {
        back = -1
      }
      let startPositions = wholeList.map(w => w.getProperty(prop.X));
      let step = 4 * back
      let steps = 0
      let aceleration = 1.3
      let cur = setInterval(() => {
        for (let i = 0; i < wholeList.length; i++) {
          let widget = wholeList[i]
          let currentX = widget.getProperty(prop.X)
          widget.setEnable(false)
          widget.setProperty(prop.X, currentX - step)
        }

        steps += step
        step *= aceleration

        if (Math.abs(steps) >= width) {

          clearInterval(cur)
          for (let i = 0; i < wholeList.length; i++) {
            let widget = wholeList[i];
            widget.setProperty(prop.X, startPositions[i] - width * back);
            widget.setEnable(true)
          }
        }
      }, 5)
    }
  }
})