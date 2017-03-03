class ColorUtils {
  static bestForegroundFor({r,g,b}) {
    const luminance = 1 - ( 0.299 * r + 0.587 * g + 0.114 * b) / 255;
    if (luminance < 0.5) return { r: 0, g: 0, b: 0 }
    else return { r: 255, g: 255, b: 255 }
  }
}


class Codec {

  /**
   * Converts a character (a string of length 1) to ascii code.
   * @param {*string} c 
   */
  static ascii(c) {
    return c.charCodeAt(0);
  }

  static valueOfHexDigit(d) {
    if ('0' <= d && d <= '9') return this.ascii(d) - this.ascii('0');
    else if (this.ascii('A') <= this.ascii(d) && this.ascii(d) <= this.ascii('F')) return this.ascii(d) - this.ascii('A') + 10;
    else if (this.ascii('a') <= this.ascii(d) && this.ascii(d) <= this.ascii('f')) return this.ascii(d) - this.ascii('a') + 10;
    else return -1;
  }

  static valueOfTwoHexDigits(d1, d2) {
    const v1 = this.valueOfHexDigit(d1)
    const v2 = this.valueOfHexDigit(d2)
    return v1* 16 + v2;
  }


  static isValieHex(hex) {
    if (hex.length !== 3 && hex.length !== 6) return false;
    const re = /^[0-9A-Fa-f]+$/g;
    return re.test(hex);
  }


  /**
   * Converts a hex color string to rgb values. 
   * Returns `undefined` for invalid hex color strings.
   * @param {string} hex The hex value of a color, such as `"FFFFFF"` or `"FFF"`
   */
  static hexToRgb(hex) {
    
    if (!this.isValieHex(hex)) return undefined;

    /**
     * A normalized hex value is one of length 6. 
     * @example {{{
     *     AAA will be converted to AAAAAA
     * }}}
     */
    let normalizedHex = hex;

    if (hex.length == 3) {
      normalizedHex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
    }

    // From this point on, the hex is guaranteed to be of length 6
    return { 
      r: this.valueOfTwoHexDigits(normalizedHex[0], normalizedHex[1]), 
      g: this.valueOfTwoHexDigits(normalizedHex[2], normalizedHex[3]), 
      b: this.valueOfTwoHexDigits(normalizedHex[4], normalizedHex[5]) }
  }


  static hexDigitOfValue(v) {
    if (0 <= v && v <= 9) return '' + v;
    else if (v === 10) return 'A';
    else if (v === 11) return 'B';
    else if (v === 12) return 'C';
    else if (v === 13) return 'D';
    else if (v === 14) return 'E';
    else if (v === 15) return 'F';
    else return undefined;
  }

  /**
   * 
   * @param {*number} c An R or G or B value
   */
  static singleColorValueToHex(c) {
    const lo = c % 16
    const hi = Math.floor(c / 16)
    return this.hexDigitOfValue(hi) + '' + this.hexDigitOfValue(lo)
  }

  static isValieSingleColorValue(c) {
    if (c === '') return false;
    return 0 <= c && c <= 255;
  }

  /**
   * 
   * @param {*number} r 
   * @param {*number} g 
   * @param {*number} b 
   */
  static rgbToHex(r, g, b) {

    if (!this.isValieSingleColorValue(r) || !this.isValieSingleColorValue(g) || !this.isValieSingleColorValue(b)) return undefined;

    return this.singleColorValueToHex(r) + 
      this.singleColorValueToHex(g) +
      this.singleColorValueToHex(b);

  }

}


function resetState() {
  $('#r').val('63')
  $('#g').val('81')
  $('#b').val('181')
  $('#hex').val('3F51B5')
  setAppBackgroundColor({r: 63, g: 81, b: 181})
}

let needsNoise = false;

resetState();

function setAppBackgroundColor({r, g, b}) {
  setColorBackground({r,g,b})
  const foreColor = ColorUtils.bestForegroundFor({r,g,b})
  $('body').css({"color": `rgb(${foreColor.r},${foreColor.g},${foreColor.b})`})
}

function setErrorBackground() {
  setNoiseBackground()
  $('body').css({"color": `white`})
}

$('.user-input').on('input', function (e) {
  if (this.id == 'r' || this.id == 'g' || this.id == 'b') {
    const r = $('#r').val();
    const g = $('#g').val();
    const b = $('#b').val();

    // Detect errors
    if (!Codec.isValieSingleColorValue(r) || !Codec.isValieSingleColorValue(g) || !Codec.isValieSingleColorValue(b)) {
      setErrorBackground()
    }
    else {
      setAppBackgroundColor({r,g,b})
    }
    
    const hex = Codec.rgbToHex(r, g, b);
    if (hex) $('#hex').val(hex); else $('#hex').val("");
  }
  else {
    const hex = $('#hex').val();
    const rgb = Codec.hexToRgb(hex);

    if (rgb) {
      $('#r').val(rgb.r);
      $('#g').val(rgb.g);
      $('#b').val(rgb.b);
      setAppBackgroundColor(rgb)
    }
    else setErrorBackground()
  }
})






function setNoiseBackground() {
  needsNoise = true;
  var canvas = document.getElementById('background'),
      ctx = canvas.getContext('2d');

  function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
  }
  resize();
  window.onresize = resize;

  function noise(ctx) {
      
      var w = ctx.canvas.width,
          h = ctx.canvas.height,
          idata = ctx.createImageData(w, h),
          buffer32 = new Uint32Array(idata.data.buffer),
          len = buffer32.length,
          i = 0;

      for(; i < len;)
          buffer32[i++] = ((255 * Math.random())|0) << 24;
      
      ctx.putImageData(idata, 0, 0);
  }

  var toggle = true;


  // added toggle to get 30 FPS instead of 60 FPS
  (function loop() {
    if (needsNoise) {
      toggle = !toggle;
      if (toggle) {
          requestAnimationFrame(loop);
          return;
      }
      noise(ctx);
      requestAnimationFrame(loop);
    }
  })();
}

function setColorBackground({r,g,b}) {
  const canvas = document.getElementById('background')
  const ctx = canvas.getContext('2d')

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  needsNoise = false;

  function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = `rgb(${r},${g},${b})`;
  ctx.fill();
  }
  resize();
  window.onresize = resize;
}

