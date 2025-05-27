(function script() {
  'use strict';
  var w, h;

  function init() {
    ap37.setTextSize(11);

    w = ap37.getScreenWidth();
    h = ap37.getScreenHeight();

    background.init();

 // IT MIGHT LOOK WEIRD SINCE THE THEME IM USING IS CATPPUCCIN I JUST GOT LAZY RENAMING OK
    var gruvboxColors = [
  '#f38ba8', '#fab387', '#f9e2af',
  '#a6e3a1', '#94e2d5', '#89b4fa',
  '#cba6f7'
];

var rainbowText = 'TECNO CL7';
var rainbowX = 2;
var rainbowY = 0;
var colorIndex = 0;

function updateRainbowText() {
  for (var i = 0; i < rainbowText.length; i++) {
    var color = gruvboxColors[(colorIndex + i) % gruvboxColors.length];
    print(rainbowX + i, rainbowY, rainbowText[i], color);
  }
  colorIndex = (colorIndex + 1) % gruvboxColors.length;
}

setInterval(updateRainbowText, 1000);
updateRainbowText();

var androidText = 'Android REL 14 aarch64';
var androidX = 1;
var androidY = 1;
var androidColorIndex = 0;

function updateAndroidText() {
  for (var i = 0; i < androidText.length; i++) {
    var color = gruvboxColors[(androidColorIndex + i) % gruvboxColors.length];
    print(androidX + i, androidY, androidText[i], color);
  }
  androidColorIndex = (androidColorIndex + 1) % gruvboxColors.length;
}

setInterval(updateAndroidText, 1000);
updateAndroidText();

function getSimulatedRAM() {
  return 1900 + Math.floor(Math.random() * 50); 
}

function updateRainbowRAM() {
  var ramText = 'AVAILABLE RAM: ' + getSimulatedRAM() + 'MB';
  for (var i = 0; i < ramText.length; i++) {
    var color = gruvboxColors[(colorIndex + i) % gruvboxColors.length];
    print(26 + i, 1, ramText[i], color); 
  }
  colorIndex = (colorIndex + 1) % gruvboxColors.length;
}

setInterval(updateRainbowRAM, 1000);
updateRainbowRAM(); 

    time.init();
    battery.init();
    notifications.init();
    apps.init();
       markets.init();
     transmissions.init();
//    print(w - 3, h - 1, 'EOF'); weird animation thing
    ap37.setOnTouchListener(function (x, y) {
      notifications.onTouch(x, y);
      apps.onTouch(x, y);
     transmissions.onTouch(x, y);
      lineGlitch.onTouch(x, y);
      wordGlitch.onTouch(x, y);
    });
  }



  // modules

  "use strict";

var background = {
  buffer: [],
  bufferColors: [],
  pattern: '',
  printPattern: function (x0, xf, y) {
    ap37.print(x0, y,
      background.pattern.substring(y * w + x0, y * w + xf),
      '#1e1e2e'); 
  },
  init: function () {
    background.pattern = rightPad('', h * w, ' ');

    for (var i = 0; i < h; i++) {
      var line = rightPad('', w, ' ');
      background.buffer.push(line);
      background.bufferColors.push(arrayFill('#1e1e2e', w));
      ap37.print(0, i, line, '#1e1e2e'); 
    }
  }
};

  var time = {
  update: function () {
    var d = new Date();
    var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    var phTime = new Date(utc + (8 * 60 * 60000)); 

    var hours = phTime.getHours();
    var minutes = phTime.getMinutes();

    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 

    var timeStr = (hours + ':' + (minutes < 10 ? '0' + minutes : minutes) + ' ' + ampm).padEnd(8, ' ');
    var dateStr = phTime.getFullYear() + '-' +
      leftPad(phTime.getMonth() + 1, 2, '0') + '-' +
      leftPad(phTime.getDate(), 2, '0');

    print(25, 0, dateStr, '#f9e2af');
    print(40, 0, timeStr, '#89b4fa');
  },
  init: function () {
    time.update();
    setInterval(time.update, 6000);
  }
};

  var battery = {
  update: function () {
    var level = ap37.getBatteryLevel();
    var color;

    if (level >= 51) {
      color = '#a6e3a1'; 
    } else if (level >= 21) {
      color = '#f9e2af'; 
    } else {
      color = '#eba0ac';  
    }
    print(36.5, 0, (level.toString().endsWith('%') ? level : level + '%'), color);
  },
  init: function () {
    battery.update();
    setInterval(battery.update, 60000);
  }
};

  var notifications = {
    list: [],
    active: false,
    group: false,
    update: function () {
      notifications.active = ap37.notificationsActive();
      if (notifications.active) {
        var nots = notifications.group ?
          ap37.getNotificationGroups() : ap37.getNotifications();
        notifications.list = nots;
        for (var i = 0; i < 3; i++) {
          var y = i + 2;
          background.printPattern(0, w, y);
          if (i < nots.length) {
            nots[i].y = y;
            if (i == 2 && nots.length > 3) {
              nots[i].ellipsis = true;
            }
            notifications.printNotification(nots[i], false);
          }
        }
      } else {
        print(2, 3, 'Activate notifications', '#f38ba8'); 
      }
    },
    printNotification: function (notification, highlight) {
      var name = notification.name;
      if (notifications.group && notification.count > 1) {
        name += ' [' + notification.count + ']';
      }
      if (notification.ellipsis) {
        var length = Math.min(name.length, w - 10);
        name = name.substring(0, length) + "... +" +
          (notifications.list.length - 3);
      }
      print(1, notification.y, name,
        highlight ? '#f38ba8' : '#cdd6f4'); 
    },
    init: function () {
      ap37.setOnNotificationsListener(notifications.update);
      notifications.update();
    },
    onTouch: function (x, y) {
      if (notifications.active) {
        for (var i = 0; i < notifications.list.length; i++) {
          if (notifications.list[i].y === y) {
            notifications.printNotification(
              notifications.list[i], true);
            ap37.openNotification(notifications.list[i].id);
            setTimeout(function () {
              notifications.update();
            }, 1000);
            return;
          }
        }
      } else if (y === 3) {
        ap37.requestNotificationsPermission();
      }
    }
  };

var apps = {
  list: [],
  filteredList: [],
  lineHeight: 2,
  topMargin: 6,
  bottomMargin: 8,
  lines: 0,
  appsPerLine: 2,
  appWidth: 0,
  appsPerPage: 0,
  currentPage: 0,
  isNextPageButtonVisible: false,
  touchStartX: null,
  touchStartY: null,
  swipeThreshold: 20,
  positions: [],

  printPage: function(page) {
    var startIndex = page * apps.appsPerPage;
    var endIndex = Math.min(startIndex + apps.appsPerPage, apps.filteredList.length);

    for (var y = apps.topMargin; y < apps.topMargin + apps.lines * apps.lineHeight; y += apps.lineHeight) {
      background.printPattern(0, w, y);
    }

    apps.positions = [];

    for (var i = startIndex; i < endIndex; i++) {
      var app = apps.filteredList[i];
      var indexInPage = i - startIndex;
      var col = indexInPage % apps.appsPerLine;
      var row = Math.floor(indexInPage / apps.appsPerLine);
      var x0 = col * apps.appWidth;
      var xf = x0 + apps.appWidth - 1;
      var y = apps.topMargin + row * apps.lineHeight;

      var name = app.name;
      if (name.length > apps.appWidth - 1) {
        name = name.substring(0, apps.appWidth - 4) + '...';
      }

      apps.positions.push({
        app: app,
        x0: x0,
        xf: xf,
        y: y,
        name: name
      });

      print(x0, y, name, '#a6e3a1');
    }

    var arrowX = w - 5;
    for (var i = 0; i < 3; i++) {
      print(arrowX, h - 9 + i + 1, '>>>>', '#f9e2af');
    }

    var totalPages = Math.ceil(apps.filteredList.length / apps.appsPerPage);
    var pageText = (apps.currentPage + 1) + '/' + totalPages;
    print(w - pageText.length - 1, h - 10, pageText, '#f9e2af');
  },

  init: function() {
    var prevPage = apps.currentPage;
    apps.list = ap37.getApps();
    apps.filteredList = apps.list.slice();
    apps.lines = Math.floor((h - apps.topMargin - apps.bottomMargin) / apps.lineHeight);
    apps.appWidth = Math.floor(w / apps.appsPerLine);
    apps.appsPerPage = apps.lines * apps.appsPerLine;
    var maxPage = Math.floor((apps.filteredList.length - 1) / apps.appsPerPage);
    apps.currentPage = Math.min(prevPage, maxPage);
    apps.isNextPageButtonVisible = apps.filteredList.length > apps.appsPerPage;
    apps.printPage(apps.currentPage);
  },

  onTouchStart: function(x, y) {
    apps.touchStartX = x;
    apps.touchStartY = y;
  },

  onTouchEnd: function(x, y) {
    var dx = x - apps.touchStartX;
    var dy = y - apps.touchStartY;

    if (Math.abs(dx) > apps.swipeThreshold && Math.abs(dy) < apps.swipeThreshold) {
      if (dx > 0 && apps.currentPage < Math.floor((apps.filteredList.length - 1) / apps.appsPerPage)) {
        apps.currentPage++;
        apps.printPage(apps.currentPage);
      } else if (dx < 0 && apps.currentPage > 0) {
        apps.currentPage--;
        apps.printPage(apps.currentPage);
      }
      return;
    }

    apps.onTouch(x, y);
  },

  onTouch: function(x, y) {
    if (apps.isNextPageButtonVisible && y >= h - 9 && y <= h - 7 && x >= w - 4 && x <= w) {
      apps.currentPage++;
      if (apps.currentPage * apps.appsPerPage >= apps.filteredList.length) {
        apps.currentPage = 0;
      }
      apps.printPage(apps.currentPage);
      return;
    }

    for (var i = 0; i < apps.positions.length; i++) {
      var pos = apps.positions[i];
      if (y === pos.y && x >= pos.x0 && x <= pos.xf) {
        print(pos.x0, pos.y, pos.name, '#89b4fa');
        setTimeout(function(x0, y, name) {
          return function() {
            print(x0, y, name, '#a6e3a1');
          };
        }(pos.x0, pos.y, pos.name), 600);
        ap37.openApp(pos.app.id);
        return;
      }
    }
  }
};



  var markets = {
    update: function () {
      get('https://api.kraken.com/0/public/Ticker?pair=' +
        'XBTUSD,ETHUSD,ETCUSD,LTCUSD,ZECUSD', function (response) {
        try {
          var result = JSON.parse(response).result,
            marketString =
              'BTC' + Math.floor(result.XXBTZUSD.c[0]) +
              ' ETH' + Math.floor(result.XETHZUSD.c[0]) +
              ' ETC' + Math.floor(result.XETCZUSD.c[0]) +
              ' LTC' + Math.floor(result.XLTCZUSD.c[0]) +
              ' ZEC' + Math.floor(result.XZECZUSD.c[0]);
          background.printPattern(0, w, h - 7);
          print(0, h - 7, marketString);
        } catch (e) {
        }
      });
    },
    init: function () {
      print(0, h - 8, '// Markets');
      markets.update();
      setInterval(markets.update, 60000);
    }
  };

  var transmissions = {
  list: [
    { name: 'Obsidian' }, 
    { name: 'YouTube' },
    { name: 'ZArchiver' },
    { name: 'Chrome' }, 
    { name: 'TikTok' },  
    { name: 'Messenger' } 
  ],
  init: function () {
    print(0, h - 5, '// Quick Apps');
    let cols = 3;
    let colWidth = Math.floor(w / cols);
    for (let i = 0; i < transmissions.list.length; i++) {
      let app = transmissions.list[i];
      let col = i % cols;
      let row = Math.floor(i / cols);
      app.x = col * colWidth;
      app.y = h - 4 + row;
      app.display = app.name;
      if (app.display.length > colWidth - 1) {
        app.display = app.display.substring(0, colWidth - 4) + '...';
      }
      background.printPattern(app.x, app.x + colWidth, app.y);
      print(app.x, app.y, app.display, '#cba6f7');
    }
  },
  printApp: function (app, highlight) {
    print(app.x, app.y, app.display, highlight ? '#f38ba8' : '#cba6f7');
    if (highlight) {
      setTimeout(() => transmissions.printApp(app, false), 1000);
    }
  },
  onTouch: function (x, y) {
    for (let app of transmissions.list) {
      let colWidth = Math.floor(w / 3);
      if (y === app.y && x >= app.x && x < app.x + colWidth) {
        transmissions.printApp(app, true);
        for (let i = 0; i < apps.list.length; i++) {
          if (apps.list[i].name.toLowerCase() === app.name.toLowerCase()) {
            ap37.openApp(apps.list[i].id);
            return;
          }
        }
      }
    }
  }
};

var wordGlitch = {
    tick: 0,
    length: 0,
    x: 0,
    y: 0,
    text: [],
    active: false,
    intervalId: null,
    update: function () {
      var g = wordGlitch;
      if (g.tick === 0) { 
        g.length = 5 + Math.floor(Math.random() * 6);
        g.x = Math.floor(Math.random() * (w - g.length));
        g.y = Math.floor(Math.random() * h);

        g.text = [];
        for (var i = 0; i < 5; i++) {
          g.text.push(Math.random().toString(36).substr(2, g.length));
        }

        ap37.print(g.x, g.y, g.text[g.tick], '#bac2de'); 
        g.tick++;
      } else if (g.tick === 5) { 
        ap37.printMultipleColors(g.x, g.y,
          background.buffer[g.y].substr(g.x, g.length),
          background.bufferColors[g.y].slice(g.x, g.x + g.length)
        );
        g.tick = 0;
        if (!wordGlitch.active) {
          clearInterval(wordGlitch.intervalId);
        }
      } else {
        ap37.print(g.x, g.y, g.text[g.tick], '#bac2de'); 
        g.tick++;
      }
    },
    onTouch: function (x, y) {
      if (x > w - 6 && y > h - 4) {
        wordGlitch.active = !wordGlitch.active;
        if (wordGlitch.active) {
          wordGlitch.intervalId = setInterval(wordGlitch.update, 100);
        }
      }
    }
  };

  var lineGlitch = {
    tick: 0,
    line: 0,
    active: false,
    intervalId: null,
    update: function () {
      var g = lineGlitch;
      if (g.tick === 0) { 
        g.line = 1 + Math.floor(Math.random() * h - 1);

        var offset = 1 + Math.floor(Math.random() * 4),
          direction = Math.random() >= 0.5;

        if (direction) {
          ap37.printMultipleColors(0, g.line,
            rightPad(
              background.buffer[g.line].substring(offset), w,
              ' '),
            background.bufferColors[g.line].slice(offset));
        } else {
          ap37.printMultipleColors(0, g.line,
            leftPad(background.buffer[g.line]
              .substring(0, w - offset), w, ' '),
            arrayFill('#cdd6f4', offset) // light fg
              .concat(background.bufferColors[g.line]
                .slice(0, w - offset))
          );
        }
        g.tick++;
      } else { 
        ap37.printMultipleColors(
          0, g.line, background.buffer[g.line],
          background.bufferColors[g.line]);
        g.tick = 0;
        if (!lineGlitch.active) {
          clearInterval(lineGlitch.intervalId);
        }
      }
    },
    onTouch: function (x, y) {
      if (x > w - 6 && y > h - 4) {
        lineGlitch.active = !lineGlitch.active;
        if (lineGlitch.active) {
          lineGlitch.intervalId = setInterval(lineGlitch.update, 200);
        }
      }
    }
  };


  //utils

  function print(x, y, text, color) {
    color = color || '#cdd6f4'; 
    background.buffer[y] = background.buffer[y].substr(0, x) + text +
      background.buffer[y].substr(x + text.length);
    for (var i = x; i < x + text.length; i++) {
      background.bufferColors[y][i] = color;
    }
    ap37.print(x, y, text, color);
  }

  function get(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        callback(xhr.response)
      }
    };
    xhr.send();
  }

  function leftPad(str, newLength, char) {
    str = str.toString();
    return newLength > str.length ?
      new Array(newLength - str.length + 1).join(char) + str : str;
  }

  function rightPad(str, newLength, char) {
    str = str.toString();
    return newLength > str.length ?
      str + new Array(newLength - str.length + 1).join(char) : str;
  }

  function arrayFill(value, length) {
    var result = [];
    for (var i = 0; i < length; i++) {
      result.push(value);
    }
    return result;
  }

  init();
})();
