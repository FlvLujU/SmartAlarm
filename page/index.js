import { widget, createWidget, text_style, prop, event, align, deleteWidget } from '@zos/ui'
import { LocalStorage } from '@zos/storage'
import { px } from '@zos/utils'
import { Time } from '@zos/sensor'
import { getDeviceInfo } from '@zos/device'
import { push } from '@zos/router'
import { SessionStorage } from '@zos/storage'
import { setScrollLock } from '@zos/page'
import { getProfile } from '@zos/user'
Page({
  build() {
    const time = new Time()
    //const sessionStorage = new SessionStorage()
    const storage = new LocalStorage()
    let alarms = storage.getItem('alarms') || []
    const { width, height } = getDeviceInfo()
    // ========== FUNCIONES AUXILIARES ==========
    function saveAlarms() {
      storage.setItem('alarms', alarms)
      renderAlarmList()
    }
    const viewContainerButton = createWidget(widget.VIEW_CONTAINER, {
      x: 0,
      y: 0,
      w: width,
      h: height,
      z_index: 1,
      scroll_enable: false
    })
    let v = 80
        const viewContainerButton2 = createWidget(widget.VIEW_CONTAINER, {
      x: 0,
      y: v,
      w: width,
      h: height - v * 2,
      z_index: 2,
      scroll_enable: true
    })
    // ========== INTERFAZ PRINCIPAL ==========
    viewContainerButton.createWidget(widget.IMG, { x: 0, y: 0, w: width, h: height, auto_scale: true, src: "bg2.png" })

    // --- BOTÓN AÑADIR ---
    let alh = 100
    // ========== LISTA DE ALARMAS ==========
    let alarmListWidgets = []
    function renderAlarmList() {
      // limpiar widgets previos
      alarmListWidgets.forEach(w => deleteWidget(w))
      alarmListWidgets = []

      let startY = 90
      if (alarms.length === 0) {
        alarmListWidgets.push(
          viewContainerButton2.createWidget(widget.TEXT, {
            x: 0, y: (height / 2 - 20) - v, w: width, h: 120,
            text: 'No alarms',
            color: 0xffffff,
            text_size: 40,
            align_h: align.CENTER_H
          })
        )
        return
      }
      let spc = 80
      alarms.forEach((a, i) => {
        let text = `${a.hour.toString().padStart(2, '0')}:${a.minute.toString().padStart(2, '0')}`
        let d = viewContainerButton2.createWidget(widget.BUTTON, {
          x: 70, y: (startY + i * spc) - v, w: width - 70 * 2, h: 60,
          normal_color: a.smart == false ? 0x555555 : 0xd496c3,
          press_color: a.smart == false ? 0x777666 : 0xd497d4,
          text: "",
          radius: 25,
          click_func: () => openEditAlarm(i)
        })
        alarmListWidgets.push(d)
        d.setAlpha(130)
        let e = viewContainerButton2.createWidget(widget.TEXT, {
          x: 90, y: (startY + i * spc) - v, w: 130, h: 50,
          text: text,
          text_size: 40,
          color: 0xffffff
        })
        e.setEnable(false)
        let f = viewContainerButton2.createWidget(widget.IMG, {
          x: width - 70 - 50, y: (startY + i * spc + 10) - v,
          src: "edit.png", alpha: 190
        })
        f.setEnable(false)
        /*alarmListWidgets.push(
          createWidget(widget.BUTTON, {
            x: px(260), y: px(startY + i * spc), w: px(50), h: px(50),
            text: '🗑️',
            normal_color: 0xff3333,
            press_color: 0xff3333,
            radius: 25,
            click_func: () => {
              alarms.splice(i, 1)
              saveAlarms()
            }
          })
        )*/
      })
    }

    renderAlarmList()

    // ========== AÑADIR O EDITAR ALARMA ==========
    function openAddAlarm(editIndex = null) {
      storage.setItem('edit', editIndex)
      console.log("edit: " + editIndex)
      push({
        url: 'page/mod',
      })
    }

    function openEditAlarm(index) {
      openAddAlarm(index)
    }

        const viewContainerButton3 = createWidget(widget.VIEW_CONTAINER, {
      x: 0,
      y: 0,
      w: width,
      h: height,
      z_index: 3,
      scroll_enable: false
    })
    // volver a la pantalla principal
    let newAlarm = viewContainerButton3.createWidget(widget.BUTTON, {
      x: width / 2 - 35, y: height - 80, w: 70, h: 70,
      text: '',
      text_size: 40,
      color: 0xffffff,
      normal_color: 0xab30d1,
      press_color: 0x8c1e9d,
      radius: 35, alpha: 50,
      click_func: () => openAddAlarm()
    })
    newAlarm.setAlpha(150)
    viewContainerButton3.createWidget(widget.FILL_RECT, {
      x: 0, y: 0, w: width, h: 80, color: 0xab30d1, alpha: 70
    })
    viewContainerButton3.createWidget(widget.IMG, {
      x: width / 2 - 30, y: height - 75, src: "add.png"
    }).addEventListener(event.CLICK_DOWN, () => {
      openAddAlarm()
    })
    viewContainerButton3.createWidget(widget.TEXT, {
      x: 0, y: 25, w: width, h: 60,
      text: 'My alarms',
      color: 0xffffff,
      text_size: 33,
      align_h: align.CENTER_H
    })
  }
})