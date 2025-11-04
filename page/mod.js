import { widget, createWidget, text_style, event, align, prop, getTextLayout, deleteWidget } from '@zos/ui'
import { LocalStorage } from '@zos/storage'
import { px } from '@zos/utils'
import { Time } from '@zos/sensor'
import { getDeviceInfo } from '@zos/device'
import { replace, back } from '@zos/router'
import { setScrollLock } from '@zos/page'
Page({
  build() {
    let nums = ["nums/0.png", "nums/1.png", "nums/2.png", "nums/3.png", "nums/4.png", "nums/5.png", "nums/6.png", "nums/7.png", "nums/8.png", "nums/9.png"]
    setScrollLock({
      lock: true,
    })
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
    const storage = new LocalStorage()
    let alarms = storage.getItem('alarms') || []
    const { width, height } = getDeviceInfo()
    // ========== FUNCIONES AUXILIARES ==========
    const editIndex = storage.getItem('edit')
    console.log("edit: " + editIndex)
    function saveAlarms() {
      console.log(JSON.stringify(alarms))
      storage.setItem('alarms', alarms)
    }
    let selectList = []
    if (editIndex != null && Array.isArray(alarms[editIndex].repeat)) {
      selectList = alarms[editIndex].repeat
      selected = 3
    } else if (editIndex != null) {
      selected = alarms[editIndex].repeat
      for (let i = 1; i < 8; i++) {
        selectList.push(i == time.getDay() ? 1 : 0)
      }
    } else {
      for (let i = 1; i < 8; i++) {
        selectList.push(i == time.getDay() ? 1 : 0)
      }
    }
    console.log("ALARM: " + alarms[editIndex])
    // ========== INTERFAZ PRINCIPAL ==========

    // limpiar todo lo anterior
    let w0 = createWidget(widget.IMG, { x: 0, y: 0, w: width, h: height, auto_scale: true, src: "bg3.png" })

    let title = editIndex !== null ? 'Edit alarm' : 'New alarm'
    let w5 = createWidget(widget.TEXT, {
      x: 0, y: px(30), w: width, h: px(40),
      text: title,
      color: 0xffffff,
      text_size: 26,
      align_h: align.CENTER_H
    })
    let initH = editIndex !== null ? alarms[editIndex].hour : time.getHours()
    let initM = editIndex !== null ? alarms[editIndex].minute : time.getMinutes()

    const R = 10
    const primaryColor = 0x8757e1
    const secondaryColor = 0xd7c6f0
    const textColor = 0xffffff

    let alarmData = {
      hour: 7,
      minute: 30,
      days: [false, false, false, false, false, false, false], // L-D
      repeat: false,
      smart: false,
      sound: true,
      vibration: true
    }

    let minus = 20
    let hStr = initH.toString().padStart(2, '0')
    let mStr = initM.toString().padStart(2, '0')

    let initT = [Number(hStr[0]), Number(hStr[1]), Number(mStr[0]), Number(mStr[1])]
    let widgetArray = []
    let m = 10
    let points = createWidget(widget.TEXT, {
      x: 0,
      y: 135 - minus + m,
      w: width, align_h: align.CENTER_H,
      text_size: 80,
      color: 0xffffff,
      text: ":"
    })
    wholeList.push(points)
    for (let j = 0; j < 4; j++) {
      let k = 70
      let p = 0
      if (j == 2) k = 90
      if (j == 3) p = 40

      // crea número  const sep = 90 // distancia base desde el centro
      let sep = 65
      let more = 0
      if (j > 1) more = 23
      // factor de desplazamiento según posición
      let f = 0
      if (j === 0) f = -2
      else if (j === 1) f = -1
      else if (j === 2) f = 0
      else f = 1

      const num = createWidget(widget.TEXT, {
        x: width / 2 + sep * f + more,
        y: 135 - minus + m,
        w: 80,
        h: 120,
        color: 0xffffff,
        text_size: 80,
        text: String(initT[j])
      })
      wholeList.push(num)
      /* let startY = 0
       let startNumY = 135 - minus // posición inicial del texto
 
       num.addEventListener(event.CLICK_DOWN, (e) => {
         startY = e.y
         startNumY = num.getProperty(prop.Y) 
       })
       let created = false 
       let newWidget
       let val = 70
       let newValue
 
       num.addEventListener(event.CLICK_DOWN, (e) => {
         startY = e.y
         startNumY = num.getProperty(prop.Y)
       })
       let globalDiff
       num.addEventListener(event.MOVE, (e) => {
         const diff = e.y - startY
         num.setProperty(prop.Y, startNumY + diff)
 
         if (Math.abs(diff) > 10 && !created) {
           created = true
           newValue = diff > 0 ? initT[j] + 1 : initT[j] - 1
 
           newWidget = createWidget(widget.TEXT, {
             x: width / 2 + sep * f + more,
             y: startNumY + (diff > 0 ? -val : val),
             w: 80,
             h: 120,
             color: 0xffffff,
             text_size: 80,
             text: String(newValue)
           })
         }
         if (newWidget) {
           newWidget.setProperty(prop.Y, startNumY + (diff > 0 ? -val : val) + diff)
         }
       })
 
       num.addEventListener(event.CLICK_UP, (e) => {
         const diff = e.y - startY
         const threshold = 20 
 
         if (Math.abs(diff) > threshold) {
           const finalY = startNumY + (diff > 0 ? -val : val)
           const step = (finalY - num.getProperty(prop.Y)) / 10
           let frame = 0
 
           const anim = setInterval(() => {
             frame++
             num.setProperty(prop.Y, num.getProperty(prop.Y) + step)
             newWidget.setProperty(prop.Y, newWidget.getProperty(prop.Y) + step)
 
             if (frame >= 10) {
               clearInterval(anim)
 
               initT[j] = newValue
               num.setProperty(prop.TEXT, String(initT[j]))
               num.setProperty(prop.Y, startNumY)
               deleteWidget(newWidget)
               newWidget = null
               created = false
             }
           }, 16)
         } else {
           const stepBack = (startNumY - num.getProperty(prop.Y)) / 10
           let frame = 0
 
           const anim = setInterval(() => {
             frame++
             num.setProperty(prop.Y, num.getProperty(prop.Y) + stepBack)
             if (newWidget) {
               newWidget.setProperty(
                 prop.Y,
                 newWidget.getProperty(prop.Y) + stepBack
               )
             }
 
             if (frame >= 10) {
               clearInterval(anim)
               num.setProperty(prop.Y, startNumY)
               if (newWidget) {
                 deleteWidget(newWidget)
                 newWidget = null
               }
               created = false
             }
           }, 16)
         }
       })
 
       num.addEventListener(event.MOVE_OUT, (e) => {
         const diff = e.y - startY
         const threshold = 20 
 
         if (Math.abs(diff) > threshold) {
           const finalY = startNumY + (diff > 0 ? -val : val)
           const step = (finalY - num.getProperty(prop.Y)) / 10
           let frame = 0
 
           const anim = setInterval(() => {
             frame++
             num.setProperty(prop.Y, num.getProperty(prop.Y) + step)
             newWidget.setProperty(prop.Y, newWidget.getProperty(prop.Y) + step)
 
             if (frame >= 10) {
               clearInterval(anim)
 
               initT[j] = newValue
               num.setProperty(prop.TEXT, String(initT[j]))
               num.setProperty(prop.Y, startNumY)
               deleteWidget(newWidget)
               newWidget = null
               created = false
             }
           }, 16)
         } else {
           const stepBack = (startNumY - num.getProperty(prop.Y)) / 10
           let frame = 0
 
           const anim = setInterval(() => {
             frame++
             num.setProperty(prop.Y, num.getProperty(prop.Y) + stepBack)
             if (newWidget) {
               newWidget.setProperty(
                 prop.Y,
                 newWidget.getProperty(prop.Y) + stepBack
               )
             }
 
             if (frame >= 10) {
               clearInterval(anim)
               num.setProperty(prop.Y, startNumY)
               if (newWidget) {
                 deleteWidget(newWidget)
                 newWidget = null
               }
               created = false
             }
           }, 16)
         }
       })*/
      widgetArray.push(num)


      // botón +
      const plusBtn = createWidget(widget.IMG, {
        x: width / 2 + sep * f + more,
        y: 100 - minus + m,
        src: 'plus.png'
      })
      wholeList.push(plusBtn)

      plusBtn.addEventListener(event.CLICK_DOWN, () => {
        initT[j]++
        if (j == 0 && initT[j] > 2) initT[j] = 0
        else if (j == 1) {
          if (initT[0] == 2 && initT[j] > 3) initT[j] = 0
          else if (initT[j] > 9) initT[j] = 0
        } else if (j == 2 && initT[j] > 5) initT[j] = 0
        else if (j == 3 && initT[j] > 9) initT[j] = 0

        if (initT[0] == 2 && initT[1] > 3) {
          initT[1] = 3
          widgetArray[1].setProperty(prop.TEXT, String(initT[1]))
        }

        widgetArray[j].setProperty(prop.TEXT, String(initT[j]))
      })

      // botón -
      const minusBtn = createWidget(widget.IMG, {
        x: width / 2 + sep * f + more,
        y: 240 - minus + m,
        src: 'less.png'
      })
      wholeList.push(minusBtn)
      minusBtn.addEventListener(event.CLICK_DOWN, () => {
        initT[j]--
        if (j == 0 && initT[j] < 0) initT[j] = 2
        else if (j == 1) {
          if (initT[0] == 2 && initT[j] < 0) initT[j] = 3
          else if (initT[j] < 0) initT[j] = 9
        } else if (j == 2 && initT[j] < 0) initT[j] = 5
        else if (j == 3 && initT[j] < 0) initT[j] = 9

        if (initT[0] == 2 && initT[1] > 3) {
          initT[1] = 3
          widgetArray[1].setProperty(prop.TEXT, String(initT[1]))
        }

        widgetArray[j].setProperty(prop.TEXT, String(initT[j]))
      })
    }



    function calculateWidth(text, textW, size, h = 1) {
      const { width, height } = getTextLayout(text, {
        text_size: textW,
        text_width: size,
        wrapped: 0
      })
      if (h == 1) {
        return width
      } else {
        return height
      }
    }
    let isSmart = editIndex !== null ? alarms[editIndex].smart : false
    let isSound = editIndex !== null ? alarms[editIndex].sound : false
    let lp = 110
    let created = false
    let created2 = false
    function updt() {
      let d = createWidget(widget.BUTTON, {
        x: !created ? width - 110 + width : width - 110,
        y: height - 180 - lp,
        text: "",
        w: 104, h: 60,
        normal_src: isSound ? 'onM.png' : 'offM.png',
        press_src: isSound ? 'onM.png' : 'offM.png',
        click_func: () => {
          deleteWidget(d)
          isSound = !isSound
          updt()
        }
      })
      created = true
      wholeList.push(d)
    }
    let t1 = createWidget(widget.TEXT, {
      x: 40 + width, y: height - 170 - lp, w: 100, h: 60, color: 0xffffff, text: "Sound", text_size: 33
    })
    wholeList.push(t1)
    updt()
    function updt2() {
      let d = createWidget(widget.BUTTON, {
        x: !created2 ? width - 110 + width : width - 110,
        y: height - 120 - lp,
        text: "",
        w: 104, h: 60,
        normal_src: isSmart ? 'onM.png' : 'offM.png',
        press_src: isSmart ? 'onM.png' : 'offM.png',
        click_func: () => {
          deleteWidget(d)
          isSmart = !isSmart
          updt2()
        }
      })
      created2 = true
      wholeList.push(d)
    }
    let t2 = createWidget(widget.TEXT, {
      x: 40 + width, y: height - 110 - lp, w: 200, h: 60, color: 0xffffff, text: "Smart alarm", text_size: 33
    })
    let t3 = createWidget(widget.TEXT, {
      x: 40 + width, y: height - 230 - lp, w: 200, h: 60, color: 0xffffff, text: "Repeat", text_size: 33
    })
    let t4 = createWidget(widget.TEXT, {
      x: width + width - 70, y: height - 230 - lp, w: 200, h: 60, color: 0xffffff, text: ">", text_size: 33
    })
    wholeList.push(t2)
    wholeList.push(t3)
    wholeList.push(t4)
    updt2()
    let next = createWidget(widget.BUTTON, {
      x: width / 2 - 110, y: height - 150, w: 219, h: 56, text: "Next", normal_src: "btnN.png", press_src: "btnN.png", click_func: () => { save_cte() }
    })
    createWidget(widget.BUTTON, {
      x: width / 2 - 70, y: height - 70, w: 140, h: 36, text: editIndex === null ? 'Cancel' : "Delete", normal_src: editIndex == null ? "btnT.png" : "btnTD.png", press_src: editIndex == null ? "btnT.png" : "btnTD.png", click_func: () => {
        if (editIndex !== null) {
          alarms.splice(i, 1)
          saveAlarms()
        }
        back()
      }
    })
    let repeat_period = 1
    function save_cte() {
      if (page != 2) {
        shiftWidgetsLeft(wholeList, width)
      } else {
        const newAlarm = { hour: String(initT[0]) + String(initT[1]), minute: String(initT[2]) + String(initT[3]), smart: isSmart, sound: isSound, repeat: repeat_period, enabled: true }
        if (editIndex !== null) alarms[editIndex] = newAlarm
        else alarms.push(newAlarm)
        saveAlarms()
        back()
      }
      console.log(JSON.stringify(newAlarm))
    }
    function shiftWidgetsLeft(wholeList, width, obligated = false) {
      console.log("PAGE: " + page)
      console.log("LIST: " + selectList)
      if (page == 4) {
        if (selectList.join(",") == "0,0,0,0,0,0,0") {
          selected = 1;
          repeat_period = 1
          selectList.length = 0
          for (let i = 1; i < 8; i++) {
            selectList.push(i == time.getDay() ? 1 : 0)
          }
        }
      }
      let back = 1
      console.log("TXT: " + next.getProperty(prop.TEXT))
      let startPositions = wholeList.map(w => w.getProperty(prop.X));
      if (next.getProperty(prop.TEXT) == "Done" && obligated == false) {
        back = -1
        page--
      } else {
        page++
      }
      let step = 4 * back
      let steps = 0
      let aceleration = 1.3
      console.log("TIME: " + initT)
      if (TimeW == null) {
        TimeW = createWidget(widget.TEXT, {
          x: width, y: 60, w: width, h: 80, color: 0xffffff, text: String(initT[0]) + String(initT[1]) + " : " + String(initT[2]) + String(initT[3]), text_size: 45, align_h: align.CENTER_H
        })
        wholeList.push(TimeW)
      }
      updateButtons();
      let cur = setInterval(() => {
        for (let i = 0; i < wholeList.length; i++) {
          let widget = wholeList[i]
          let currentX = widget.getProperty(prop.X)
          widget.setEnable(false)
          widget.setProperty(prop.X, currentX - step)
        }
        next.setEnable(false)

        steps += step
        step *= aceleration

        if (Math.abs(steps) >= width) {

          clearInterval(cur)
          updateUI()
          for (let i = 0; i < wholeList.length; i++) {
            let widget = wholeList[i];
            widget.setProperty(prop.X, startPositions[i] - width * back);
            widget.setEnable(true)
          }
          next.setEnable(true)
          TimeW.setProperty(prop.X, 0)
          if (page == 2) {
            updt()
            updt2()
          }
          if (page == 2) {
            next.setProperty(prop.MORE, {
              x: width / 2 - 110,
              y: height - 150,
              w: 219,
              h: 56,
              text: "Save"
            })
          }
          if (page == 3 || page == 4) {
            next.setProperty(prop.MORE, {
              x: width / 2 - 110,
              y: height - 150,
              w: 219,
              h: 56,
              text: "Done"
            })
          }
        }
      }, 5)
    }
    let rect = createWidget(widget.IMG, {
      x: width, y: height - 220 - lp, w: width, h: 80, src: ".png"
    })
    rect.addEventListener(event.CLICK_DOWN, () => {
      shiftWidgetsLeft(wholeList, width, true)
    })
    wholeList.push(rect)
    let t5 = createWidget(widget.TEXT, {
      x: 40 + width * 2, y: height - 230 - lp, w: 200, h: 60, color: 0xffffff, text: "Only once", text_size: 33
    })
    let t6 = createWidget(widget.TEXT, {
      x: 40 + width * 2, y: height - 170 - lp, w: 200, h: 60, color: 0xffffff, text: "All days", text_size: 33
    })
    let t7 = createWidget(widget.TEXT, {
      x: 40 + width * 2, y: height - 110 - lp, w: 200, h: 60, color: 0xffffff, text: "Custom", text_size: 33
    })
    let t8 = createWidget(widget.TEXT, {
      x: width * 2 + width - 65, y: height - 110 - lp, w: 200, h: 60, color: 0xffffff, text: ">", text_size: 33
    })
    // Posiciones de los botones
    const xPos = width * 3 - 70;
    const yPos1 = height - 215 - lp;
    const yPos2 = height - 155 - lp;
    const yPos3 = height - 95 - lp;

    // Estado de selección
    const button1 = createWidget(widget.IMG, {
      x: xPos,
      y: yPos1,
      w: 64,
      h: 64,
      src: 'S.png'
    });

    const button2 = createWidget(widget.IMG, {
      x: xPos,
      y: yPos2,
      w: 64,
      h: 64,
      src: 'F.png'
    });

    // Creamos las imágenes
    let rect1 = createWidget(widget.IMG, {
      x: width * 2,
      y: yPos1 - 15,
      w: width,
      h: 80,
      src: '.png'
    });
    let rect2 = createWidget(widget.IMG, {
      x: width * 2,
      y: yPos2 - 15,
      w: width,
      h: 80,
      src: '.png'
    });
    let rect3 = createWidget(widget.IMG, {
      x: width * 2,
      y: yPos3 - 15,
      w: width,
      h: 80,
      src: '.png'
    });
    // Función para actualizar imágenes según selección
    function updateButtons() {
      console.log("SELECTED: " + selected)
      button1.setProperty(prop.SRC, selected === 1 ? 'S.png' : 'F.png');
      button2.setProperty(prop.SRC, selected === 2 ? 'S.png' : 'F.png');
      repeat_period = selected
      if (selected == 3) {
        repeat_period = selectList
        button1.setProperty(prop.SRC, 'F.png');
        button2.setProperty(prop.SRC, 'F.png');
      }
    }

    // Eventos de clic
    rect1.addEventListener(event.CLICK_DOWN, () => {
      selected = 1;
      updateButtons();
      console.log('button 1 selected');
    });

    rect2.addEventListener(event.CLICK_DOWN, () => {
      selected = 2;
      updateButtons();
      console.log('button 2 selected');
    });
    rect3.addEventListener(event.CLICK_DOWN, () => {
      selected = 3;
      updateButtons();
      shiftWidgetsLeft(wholeList, width, true)
      console.log('button 2 selected');
    });
    wholeList.push(t5, t6, t7, t8, button1, button2, rect1, rect2, rect3)
    let numAssets = 7
    let assetWidth = 34
    let spacing = 15
    let totalWidth = (numAssets * assetWidth + (numAssets - 1) * spacing) - assetWidth


    let startX = (width - totalWidth) / 2
    let days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    let assets = []
    for (let i = 0; i < numAssets; i++) {
      let w = createWidget(widget.IMG, {
        x: width * 3 + (startX + i * (assetWidth + spacing)),
        y: 175,
        src: i + 1 == time.getDay() ? 'T.png' : 'F.png'
      })
      let t = createWidget(widget.TEXT, {
        x: width * 3 + (startX + i * (assetWidth + spacing)) - 2,
        y: 205, color: 0xffffff, h: 60,
        text: days[i]
      })
      assets.push(w)
      wholeList.push(w)
      wholeList.push(t)
      w.addEventListener(event.CLICK_DOWN, () => {
        if (selectList[i] == 0) {
          selectList[i] = 1
        } else {
          selectList[i] = 0
        }
        w.setProperty(prop.MORE, {
          src: selectList[i] == 0 ? 'F.png' : 'T.png'
        })
      })
    }
    function updateUI() {
      for (let j = 0; j < assets.length; j++) {
        assets[j].setProperty(prop.MORE, {
          src: selectList[j] == 0 ? 'F.png' : 'T.png'
        })
      }
    }


    updateButtons()

    /*let picker_widget = createWidget(widget.WIDGET_PICKER, {
      title: 'A que hora?',
      subtitle: '',
      nb_of_columns: 2,
      single_wide: true,
      init_col_index: 0,
      data_config: [
        {
          data_array: new Array(24).fill(0).map((_, i) => i),
          init_val_index: initH,
          unit: 'h',
          support_loop: true,
          font_size: 24,
          select_font_size: 42,
          col_width: 70
        },
        {
          data_array: new Array(60).fill(0).map((_, i) => i),
          init_val_index: initM,
          unit: 'm',
          support_loop: true,
          font_size: 24,
          select_font_size: 42,
          col_width: 70
        }
      ],
      picker_cb
    })

    // interruptor inteligente

    // botón guardar
    function picker_cb(picker, event_type, column_index, select_index) {
      console.log('Picker event:', event_type, column_index, select_index)

      //picker_widget.setProperty(prop.TITLE, { title: column_index == 0 ? "Hora" : "Minuto" })
      if (column_index == 0) {
        initH = select_index
      } else {
        initM = select_index
      }
      if (event_type == 2) {
        const newAlarm = { hour: initH, minute: initM, smart: false, enabled: true }
        if (editIndex !== null) alarms[editIndex] = newAlarm
        else alarms.push(newAlarm)
      }
    }*/
    /*let w2 = createWidget(widget.FILL_RECT, {
      x: 0, y: height * (4 / 5), w: width, h: height * (1 / 5), color: 0x000000
    })
    let w3 = createWidget(widget.BUTTON, {
      x: width / 2, y: height - 60, w: width / 2, h: 60,
      text: 'Guardar',
      color: 0xffffff,
      normal_color: 0x00ff22,
      press_color: 0x00ff22,
      radius: 0,
      click_func: () => {
        const newAlarm = { hour: initH, minute: initM, smart: isSmart, enabled: true }
        if (editIndex !== null) alarms[editIndex] = newAlarm
        else alarms.push(newAlarm)
        saveAlarms()
        mainScreen()
      }
    })

    // botón volver
    let w4 = createWidget(widget.BUTTON, {
      x: 0, y: height - 60, w: width / 2, h: 60,
      text: editIndex === null ? 'Cancelar' : "Eliminar",
      color: 0xffffff,
      normal_color: 0xff3333,
      press_color: 0xff3333,
      radius: 0,
      click_func: () => {
        if (editIndex !== null) {
          alarms.splice(i, 1)
          saveAlarms()
        }
        mainScreen()
      }
    })
    let isSmart = editIndex !== null ? alarms[editIndex].smart : false

    // Crear imagen del interruptor
    function updt() {
      let d = createWidget(widget.BUTTON, {
        x: width / 2 - 104 / 2,
        y: height - 130,
        text: "",
        w: 104, h: 60,
        normal_src: isSmart ? 'on.png' : 'off.png',
        press_src: isSmart ? 'on.png' : 'off.png',
        click_func: () => {
          deleteWidget(d)
          isSmart = !isSmart
          updt()
        }
      })
    }
    updt()

    // Área táctil para detectar el toque

    //alarmListWidgets.push(picker_widget, w1, w2, w3, w4)
    function mainScreen() {
      replace({
        url: 'page/index',
      })
    }*/
  }
})