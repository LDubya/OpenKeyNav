let openKeyNav;

export const injectStylesheet = (parent) => {
    openKeyNav = parent;

    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML =
      '' +
      '.openKeyNav-label {' +
        'font: inherit;' +
        'vertical-align: baseline;' +
        'box-sizing: border-box;' +
        'white-space: nowrap;' +
        `border: 1px solid ${openKeyNav.config.spot.fontColor};` +
      //   `box-shadow: inset 0 -2.5px 0 ${openKeyNav.config.spot.insetColor}, inset 0 -3px 0 #999, 0 0 4px #fff;` +
      //   `background: linear-gradient(to top, #999 5%, ${openKeyNav.config.spot.backgroundColor} 20%);` +
        `background-color: ${openKeyNav.config.spot.backgroundColor};` +
      //   'border-radius: calc( 4px );' +
        `color: ${openKeyNav.config.spot.fontColor};` +
        'display: inline-block;' +
        `font-size: ${openKeyNav.config.spot.fontSize};` +
        // `outline : 2px solid ${openKeyNav.config.focus.outlineColor};` +
        'outline-offset: -2px !important;' +
        // +"font-weight: bold;"
        'font-weight: inherit;' +
      //   'line-height: 1.5;' +
        'line-height: 1;' +
        'margin: 0 .1em 0 1px;' +
        'overflow-wrap: break-word;' +
      //   'padding: .0 .15em .1em;' +
        'padding: 3px;' +
        `text-shadow: 0 1px 0 ${openKeyNav.config.spot.insetColor};` +
        'min-width: 1rem;' +
        'text-align: center;' +
        'position: absolute;' +
        'z-index: 99999999;' +
        'font-family: monospace;' +
      '}' +
      '.openKeyNav-label[data-openkeynav-position="left"]::after, ' +
      '.openKeyNav-label[data-openkeynav-position="right"]::before, ' +
      '.openKeyNav-label[data-openkeynav-position="top"]::after, ' +
      '.openKeyNav-label[data-openkeynav-position="bottom"]::before, ' +
      '.openKeyNav-label[data-openkeynav-position="left"]::before, ' +
      '.openKeyNav-label[data-openkeynav-position="right"]::after, ' +
      '.openKeyNav-label[data-openkeynav-position="top"]::before, ' +
      '.openKeyNav-label[data-openkeynav-position="bottom"]::after {' +
          'content: "";' +
          'position: absolute;' +
      '}' +
      '.openKeyNav-label[data-openkeynav-position="left"]::after, ' +
      '.openKeyNav-label[data-openkeynav-position="right"]::before, ' +
      '.openKeyNav-label[data-openkeynav-position="left"]::before, ' +
      '.openKeyNav-label[data-openkeynav-position="right"]::after {' +
          'top: 50%;' +
          'transform: translateY(-50%);' +
      '}' +
      '.openKeyNav-label[data-openkeynav-position="top"]::after, ' +
      '.openKeyNav-label[data-openkeynav-position="bottom"]::before, ' +
      '.openKeyNav-label[data-openkeynav-position="top"]::before, ' +
      '.openKeyNav-label[data-openkeynav-position="bottom"]::after {' +
          'left: 50%;' +
          'transform: translateX(-50%);' +
      '}' +
      '.openKeyNav-label[data-openkeynav-position="left"]::before {' +
          `border-left: ${openKeyNav.config.spot.arrowSize_px + 1}px solid #fff;` +
          `right: -${openKeyNav.config.spot.arrowSize_px + 1}px;` +
          `border-top: ${openKeyNav.config.spot.arrowSize_px + 1}px solid transparent;` +
          `border-bottom: ${openKeyNav.config.spot.arrowSize_px + 1}px solid transparent;` +
      '}' +
      '.openKeyNav-label[data-openkeynav-position="left"]::after {' +
          `border-left: ${openKeyNav.config.spot.arrowSize_px}px solid ${openKeyNav.config.spot.backgroundColor};` +
          `right: -${openKeyNav.config.spot.arrowSize_px}px;` +
          `border-top: ${openKeyNav.config.spot.arrowSize_px}px solid transparent;` +
          `border-bottom: ${openKeyNav.config.spot.arrowSize_px}px solid transparent;` +
      '}' +
      '.openKeyNav-label[data-openkeynav-position="right"]::before {' +
          `border-right: ${openKeyNav.config.spot.arrowSize_px + 1}px solid #fff;` +
          `left: -${openKeyNav.config.spot.arrowSize_px + 1}px;` +
          `border-top: ${openKeyNav.config.spot.arrowSize_px + 1}px solid transparent;` +
          `border-bottom: ${openKeyNav.config.spot.arrowSize_px + 1}px solid transparent;` +
      '}' +
      '.openKeyNav-label[data-openkeynav-position="right"]::after {' +
          `border-right: ${openKeyNav.config.spot.arrowSize_px}px solid ${openKeyNav.config.spot.backgroundColor};` +
          `left: -${openKeyNav.config.spot.arrowSize_px}px;` +
          `border-top: ${openKeyNav.config.spot.arrowSize_px}px solid transparent;` +
          `border-bottom: ${openKeyNav.config.spot.arrowSize_px}px solid transparent;` +
      '}' +
      '.openKeyNav-label[data-openkeynav-position="top"]{' +
          'padding-bottom: 0;' +
      '}' +
      '.openKeyNav-label[data-openkeynav-position="top"]::before {' +
          `border-top: ${openKeyNav.config.spot.arrowSize_px + 1}px solid #fff;` +
          `bottom: -${openKeyNav.config.spot.arrowSize_px + 1}px;` +
          `border-left: ${openKeyNav.config.spot.arrowSize_px + 1}px solid transparent;` +
          `border-right: ${openKeyNav.config.spot.arrowSize_px + 1}px solid transparent;` +
      '}' +
      '.openKeyNav-label[data-openkeynav-position="top"]::after {' +
          `border-top: ${openKeyNav.config.spot.arrowSize_px}px solid ${openKeyNav.config.spot.backgroundColor};` +
          `bottom: -${openKeyNav.config.spot.arrowSize_px}px;` +
          `border-left: ${openKeyNav.config.spot.arrowSize_px}px solid transparent;` +
          `border-right: ${openKeyNav.config.spot.arrowSize_px}px solid transparent;` +
      '}' +
      '.openKeyNav-label[data-openkeynav-position="bottom"]{' +
          'padding-top: 0;' +
      '}' +
      '.openKeyNav-label[data-openkeynav-position="bottom"]::before {' +
          `border-bottom: ${openKeyNav.config.spot.arrowSize_px + 1}px solid #fff;` +
          `top: -${openKeyNav.config.spot.arrowSize_px + 1}px;` +
          `border-left: ${openKeyNav.config.spot.arrowSize_px + 1}px solid transparent;` +
          `border-right: ${openKeyNav.config.spot.arrowSize_px + 1}px solid transparent;` +
      '}' +
      '.openKeyNav-label[data-openkeynav-position="bottom"]::after {' +
          `border-bottom: ${openKeyNav.config.spot.arrowSize_px}px solid ${openKeyNav.config.spot.backgroundColor};` +
          `top: -${openKeyNav.config.spot.arrowSize_px}px;` +
          `border-left: ${openKeyNav.config.spot.arrowSize_px}px solid transparent;` +
          `border-right: ${openKeyNav.config.spot.arrowSize_px}px solid transparent;` +
      '}' +
      '.openKeyNav-label-selected{' +
        // 'padding : 0;' +
        // 'margin : 0;' +
        'display : grid;' +
        'align-content : center;' +
        `color : ${openKeyNav.config.spot.fontColor};` +
        `background : ${openKeyNav.config.spot.backgroundColor};` +
        // `outline : 4px solid ${openKeyNav.config.focus.outlineColor};` +
        `outline: none;` +
        // `border-radius: 100%;` +
        // `width: 1rem;` +
        // `height: 1rem;` +
        // 'text-shadow : none;' +
        // 'padding : 0 !important;' +
        // 'margin: 0 !important;' +
      '}' +
      '[data-openkeynav-label]:not(.openKeyNav-label):not(button){' +
        // `outline: 2px double ${openKeyNav.config.focus.outlineColor} !important;` +
        // 'outline-offset: 2px !important;' +
        `box-shadow:  inset 0 0 0 .5px #000,
                      0 0 0 .75px #000,
                      0 0 0 1.5px rgba(255,255,255,1);` +
        'outline:none !important;'+
        // 'border-radius: 3px;' +
        'border-color: #000;' +
        'border-radius: 3px;' +
      '}' +
      'button[data-openkeynav-label]{' +
        'outline:2px solid #000 !important;' +
      '}' +
      '.openKeyNav-inaccessible:not(.openKeyNav-label):not(button){' +
        `box-shadow:  inset 0 0 0 .5px #f00,
                      0 0 0 1px #f00,
                      0 0 0 1.5px rgba(255,255,255,1);` +
        'outline:none !important;'+
        'border-color: #f00;' +
        'border-radius: 3px;' +
      '}' +
      'button.openKeyNav-inaccessible{' +
        'outline:2px solid #f00 !important;' +
      '}' +
      '.openKeyNav-inaccessible.openKeyNav-label{' +
        `box-shadow:  inset 0 0 0 .5px #f00,
                      0 0 0 1px #f00,
                      0 0 0 1.5px rgba(255,255,255,1);` +
        'border-color: #f00;' +
        'border-radius: 3px;' +
      '}' +
        //   +"span[data-openkeynav-label]{"
        //       +"display: inherit;"
        //   +"}"
      '.openKeyNav-noCursor *{' +
        'cursor: none !important;' +
      '}' +
      '*:focus {' +
        `outline: 2px ${openKeyNav.config.focus.outlineStyle} ${openKeyNav.config.focus.outlineColor} !important;` +
        'outline-offset: -2px !important;' +
      '}' +
      '.openKeyNav-mouseover-tooltip{' +
        'position: absolute;' +
        'background-color: #333;' +
        'color: #fff;' +
        'padding: 5px;' +
        'border-radius: 5px;' +
        'display: none;' +
        'z-index: 1000;' +
        'font-size: 12px;' +
      '}' +
      '.openKeyNav-mouseover-tooltip::before{' +
        'content: "Debug mode"' +
      '}'
      //   '[data-openkeynav-draggable="true"] {' +
      //   `outline: 2px solid ${openKeyNav.config.focus.outlineColor};` +
      //   'outline-offset: -1px !important;' +
      // '}'
      ;

      style.innerHTML += `
      .okn-logo-text {
          font-size: 36px;
          font-weight: 600;
          color: #ffffff;
          background-color: #333;
          padding: .1em .2em;
          border-radius: 1em;
          box-sizing: border-box;
          line-height: 1;
          text-align: center;
          position: relative;
          display: inline-block;
          min-width: 1rem;
          border: max(.1em, 2px) solid #ffffff;
          white-space: nowrap;
      }

      .okn-logo-text.small {
          font-size: 18px;
      }
      .okn-logo-text.tiny {
          font-size: 10px;
          /* border-width: 1px; */
          border: none;
      }
      .okn-logo-text.tiny .key {
          font-weight: 700;
      }

      .okn-logo-text.light {
          color: #333; /* Dark text color */
          background-color: #fff; /* Light background */
          border-color: #333; /* Dark border */
      }

      .okn-logo-text .key {
          display: inline;
          padding: .1em .2em;
          margin: 0 .1em;
          background-color: #ffffff; /* Light background */
          color: #333; /* Dark text */
          line-height: 1;
          /* font-size: 0.6em; */
          position: relative;
          top: -.3em;
      }

      .okn-logo-text.light .key {
          background-color: #333; /* Dark background */
          color: #ffffff; /* Light text */
      }

      .okn-logo-text .key::before,
      .okn-logo-text .key::after {
          content: "";
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
      }

      .okn-logo-text .key::before {
          --border-size: 0.5em; /* Base border size */
          --min-border-size: 5px; /* Minimum pixel size */

          border-top: max(var(--border-size), var(--min-border-size)) solid #333;
          bottom: calc(-1 * max(var(--border-size), var(--min-border-size)));
          border-left: max(var(--border-size), var(--min-border-size)) solid transparent;
          border-right: max(var(--border-size), var(--min-border-size)) solid transparent;
      }
      .okn-logo-text.light .key::before {
          border-top-color: #fff; /* Dark top triangle */
      }

      .okn-logo-text .key::after {
          --border-size: .4em; /* Base border size */
          --min-border-size: 4px; /* Minimum pixel size */

          border-top: max( calc( var(--border-size) + 2px) , var(--min-border-size)) solid #fff;
          bottom: calc(-1 * max(var(--border-size), var(--min-border-size)));
          border-left: max(var(--border-size), var(--min-border-size)) solid transparent;
          border-right: max(var(--border-size), var(--min-border-size)) solid transparent;
      }

      .okn-logo-text.light .key::after {
          border-top-color: #333; /* Light bottom triangle */
      }
      `;

      style.innerHTML+=`
        .keyButtonContainer {
            margin: 0 .1em;
            display: inline-grid;
            grid-template-columns: min-content auto;
            align-items: baseline;
            column-gap: 4px;
        }
        .keyButton {
          display: inline-block;
          padding: 1px 4px;
          min-width: 1.3em;
          text-align: center;
          line-height: 1;
          color: hsl(210, 8%, 5%);
          text-shadow: 0 1px 0 hsl(0, 0%, 100%);
          background-color: hsl(210, 8%, 90%);
          border: 1px solid hsl(210, 8%, 68%);
          border-radius: 3px;
          box-shadow: 0 1px 1px hsla(210, 8%, 5%, 0.15), inset 0 1px 0 0 hsl(0, 0%, 100%);
          white-space: nowrap;
          margin: 0 1px;
      }
      `;
    document.head.appendChild(style);
  }