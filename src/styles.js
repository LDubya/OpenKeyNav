let openKeyNav;

const styleClassname = "openKeyNav-style";
const toolbarStyleClassname ="okn-toolbar-stylesheet";
const minimumWhiteTextContrast = 4.5;
const fallbackFocusLabelRgb = [0, 90, 133];

const parseCssRgb = color => {
  if (typeof color !== 'string') return null;

  const value = color.trim();
  const hexMatch = value.match(/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    const componentSize = hex.length <= 4 ? 1 : 2;
    const components = [];
    for (let index = 0; index < componentSize * 3; index += componentSize) {
      const component = hex.slice(index, index + componentSize);
      components.push(parseInt(componentSize === 1 ? component.repeat(2) : component, 16));
    }
    return components;
  }

  const rgbMatch = value.match(/^rgba?\((.*)\)$/i);
  if (!rgbMatch) return null;

  const colorComponents = rgbMatch[1].split('/')[0].trim();
  const components = colorComponents.includes(',')
    ? colorComponents.split(',')
    : colorComponents.split(/\s+/);
  if (components.length < 3) return null;

  const rgb = components.slice(0, 3).map(component => {
    const normalized = component.trim();
    const numericValue = Number.parseFloat(normalized);
    if (!Number.isFinite(numericValue)) return NaN;
    const value255 = normalized.endsWith('%')
      ? numericValue * 2.55
      : numericValue;
    return Math.min(255, Math.max(0, value255));
  });

  return rgb.every(Number.isFinite) ? rgb : null;
};

const resolveCssRgb = (color, ownerDocument) => {
  const parsedColor = parseCssRgb(color);
  if (parsedColor) return parsedColor;
  if (!ownerDocument?.createElement || !ownerDocument.defaultView) return null;

  const probe = ownerDocument.createElement('span');
  probe.style.color = color;
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  probe.style.pointerEvents = 'none';
  if (!probe.style.color) return null;

  const container = ownerDocument.body || ownerDocument.documentElement;
  if (!container) return null;

  container.appendChild(probe);
  const resolvedColor = ownerDocument.defaultView.getComputedStyle(probe).color;
  probe.remove();
  return parseCssRgb(resolvedColor);
};

const relativeLuminance = rgb => rgb.reduce((luminance, component, index) => {
  const channel = component / 255;
  const linearChannel = channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
  return luminance + linearChannel * [0.2126, 0.7152, 0.0722][index];
}, 0);

const whiteTextContrast = rgb => 1.05 / (relativeLuminance(rgb) + 0.05);

const darkenForWhiteText = rgb => {
  if (whiteTextContrast(rgb) >= minimumWhiteTextContrast) {
    return rgb.map(component => Math.floor(component));
  }

  let accessibleScale = 0;
  let inaccessibleScale = 1;
  for (let index = 0; index < 24; index += 1) {
    const candidateScale = (accessibleScale + inaccessibleScale) / 2;
    const candidate = rgb.map(component => component * candidateScale);
    if (whiteTextContrast(candidate) >= minimumWhiteTextContrast) {
      accessibleScale = candidateScale;
    } else {
      inaccessibleScale = candidateScale;
    }
  }

  return rgb.map(component => Math.floor(component * accessibleScale));
};

export const getAccessibleFocusLabelBackground = (
  focusColor,
  ownerDocument = typeof document === 'undefined' ? null : document
) => {
  const focusRgb = resolveCssRgb(focusColor, ownerDocument) || fallbackFocusLabelRgb;
  return `rgb(${darkenForWhiteText(focusRgb).join(', ')})`;
};

const keyButtonStyles = `
  .keyButtonContainer {
      margin: 0 .1em;
      display: inline-grid;
      grid-template-columns: min-content auto;
      align-items: baseline;
      column-gap: 4px;
  }
  .keyButtonContainer .keyButtonLabel{
    white-space:nowrap;
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
`

const logoStyles = `
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
      border: none;
  }
  .okn-logo-text.tiny .key {
      font-weight: 700;
  }

  .okn-logo-text.light {
      color: #333;
      background-color: #fff;
      border-color: #333;
  }

  .okn-logo-text .key {
      display: inline;
      padding: .1em .2em;
      margin: 0 .1em;
      background-color: #ffffff;
      color: #333;
      line-height: 1;
      position: relative;
      top: -.3em;
  }

  .okn-logo-text.light .key {
      background-color: #333;
      color: #ffffff;
  }

  .okn-logo-text .key::before,
  .okn-logo-text .key::after {
      content: "";
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
  }

  .okn-logo-text .key::before {
      --border-size: 0.5em;
      --min-border-size: 5px;
      border-top: max(var(--border-size), var(--min-border-size)) solid #333;
      bottom: calc(-1 * max(var(--border-size), var(--min-border-size)));
      border-left: max(var(--border-size), var(--min-border-size)) solid transparent;
      border-right: max(var(--border-size), var(--min-border-size)) solid transparent;
  }
  .okn-logo-text.light .key::before {
      border-top-color: #fff;
  }

  .okn-logo-text .key::after {
      --border-size: .4em;
      --min-border-size: 4px;
      border-top: max(calc(var(--border-size) + 2px), var(--min-border-size)) solid #fff;
      bottom: calc(-1 * max(var(--border-size), var(--min-border-size)));
      border-left: max(var(--border-size), var(--min-border-size)) solid transparent;
      border-right: max(var(--border-size), var(--min-border-size)) solid transparent;
  }
  .okn-logo-text.light .key::after {
      border-top-color: #333;
  }
`;

// Shared by the document stylesheet and StatusService-owned ShadowRoot/document
// styles. Keeping this as one source ensures notifications remain styled after
// OpenKeyNav is disabled and inside supported Shadow DOM roots.
export const statusStyles = `
  ${logoStyles}

  .openKeyNav-status {
      box-sizing: border-box;
      position: fixed;
      left: 12px;
      bottom: 12px;
      z-index: 2147483647;
      max-width: min(34rem, calc(100vw - 24px));
      padding: 8px 12px;
      border: 1px solid #666;
      border-radius: 4px;
      color: #fff;
      background: rgba(20, 24, 28, .94);
      box-shadow: 0 4px 6px rgba(0, 0, 0, .16);
      font: 14px/1.35 sans-serif;
      text-align: left;
      pointer-events: none;
  }

  .openKeyNav-status--visually-hidden {
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      border: 0 !important;
      overflow: hidden !important;
      clip: rect(0 0 0 0) !important;
      clip-path: inset(50%) !important;
      white-space: nowrap !important;
  }

  .openKeyNav-notification-container {
      position: fixed;
      left: 50%;
      bottom: 10px;
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      width: min(34rem, calc(100vw - 24px));
      transform: translateX(-50%);
      pointer-events: none;
  }

  .openKeyNav-notification-container .openKeyNav-notification {
      position: relative;
      left: auto;
      bottom: auto;
      display: inline-block;
      max-width: 100%;
      padding: 10px 20px;
      text-align: center;
      pointer-events: auto;
  }

  .openKeyNav-status__dismiss {
      position: absolute;
      top: 5px;
      right: 8px;
      border: 0;
      padding: 0 2px;
      color: inherit;
      background: transparent;
      font: 20px/1 sans-serif;
      cursor: pointer;
  }

  .openKeyNav-status__hint {
      margin-top: 4px;
      font-size: .85em;
      opacity: .8;
  }

  .openKeyNav-status--dismissible {
      padding-right: 30px;
  }
`;

export const injectStylesheet = (parent, replace) => {
    openKeyNav = parent;
    const focusLabelBackground = getAccessibleFocusLabelBackground(
      openKeyNav.config.focus.outlineColor,
      document
    );


    if(document.querySelectorAll('.'+styleClassname).length > 0){
      if(!replace){
        return;
      }
      deleteStylesheets();
    }

    const style = document.createElement('style');
    style.className = styleClassname;
    style.type = 'text/css';
    style.textContent =
      `.openKeyNav-label {
        font: inherit;
        vertical-align: baseline;
        box-sizing: border-box;
        white-space: nowrap;
        border: 1px solid ${openKeyNav.config.spot.fontColor}; 
        // box-shadow: inset 0 -2.5px 0 ${openKeyNav.config.spot.insetColor}, inset 0 -3px 0 #999, 0 0 4px #fff; 
        // background: linear-gradient(to top, #999 5%, ${openKeyNav.config.spot.backgroundColor} 20%); 
        background-color: ${openKeyNav.config.spot.backgroundColor}; 
        // border-radius: calc( 4px );
        color: ${openKeyNav.config.spot.fontColor}; 
        display: inline-block;
        font-size: ${openKeyNav.config.spot.fontSize}; 
        // outline : 2px solid ${openKeyNav.config.focus.outlineColor}; 
        outline-offset: -2px !important;
        // +"font-weight: bold;"
        font-weight: inherit;
        // line-height: 1.5;
        line-height: 1;
        margin: 0 .1em 0 1px;
        overflow-wrap: break-word;
        // padding: .0 .15em .1em;
        padding: 3px;
        text-shadow: 0 1px 0 ${openKeyNav.config.spot.insetColor}; 
        min-width: 1rem;
        text-align: center;
        position: absolute;
        z-index: 99999999;
        font-family: monospace;
      }
      .openKeyNav-keylabel-alternatives {
        display: inline-flex;
        align-items: center;
      }
      .openKeyNav-keylabel-alternative + .openKeyNav-keylabel-alternative {
        border-left: 1px solid currentColor;
        margin-left: .3em;
        padding-left: .3em;
      }
      .openKeyNav-keylabel-modifier {
        border-radius: 2px;
        display: inline-block;
        margin: -1px 0;
        padding: 1px;
      }
      .openKeyNav-keylabel-modifier[data-openkeynav-keylabel-pressed="true"] {
        background-color: #fff;
        box-shadow: inset 0 0 0 1px #111;
        color: #111;
        text-shadow: none;
      }
      .openKeyNav-keylabel-focused {
        background-color: ${focusLabelBackground};
        color: #fff;
        text-shadow: none;
      }
      .openKeyNav-label[data-openkeynav-position="left"]::after,
      .openKeyNav-label[data-openkeynav-position="right"]::before,
      .openKeyNav-label[data-openkeynav-position="top"]::after,
      .openKeyNav-label[data-openkeynav-position="bottom"]::before,
      .openKeyNav-label[data-openkeynav-position="left"]::before,
      .openKeyNav-label[data-openkeynav-position="right"]::after,
      .openKeyNav-label[data-openkeynav-position="top"]::before,
      .openKeyNav-label[data-openkeynav-position="bottom"]::after {
        content: "";
        position: absolute;
      }
      .openKeyNav-label[data-openkeynav-position="left"]::after,
      .openKeyNav-label[data-openkeynav-position="right"]::before,
      .openKeyNav-label[data-openkeynav-position="left"]::before,
      .openKeyNav-label[data-openkeynav-position="right"]::after {
        top: 50%;
        transform: translateY(-50%);
      }
      .openKeyNav-label[data-openkeynav-position="top"]::after,
      .openKeyNav-label[data-openkeynav-position="bottom"]::before,
      .openKeyNav-label[data-openkeynav-position="top"]::before,
      .openKeyNav-label[data-openkeynav-position="bottom"]::after {
        left: 50%;
        transform: translateX(-50%);
      }
      .openKeyNav-label[data-openkeynav-position="left"]::before {
        border-left: ${openKeyNav.config.spot.arrowSize_px + 1}px solid #fff; 
        right: -${openKeyNav.config.spot.arrowSize_px + 1}px; 
        border-top: ${openKeyNav.config.spot.arrowSize_px + 1}px solid transparent; 
        border-bottom: ${openKeyNav.config.spot.arrowSize_px + 1}px solid transparent; 
      }
      .openKeyNav-label[data-openkeynav-position="left"]::after {
        border-left: ${openKeyNav.config.spot.arrowSize_px}px solid ${openKeyNav.config.spot.backgroundColor}; 
        right: -${openKeyNav.config.spot.arrowSize_px}px; 
        border-top: ${openKeyNav.config.spot.arrowSize_px}px solid transparent; 
        border-bottom: ${openKeyNav.config.spot.arrowSize_px}px solid transparent; 
      }
      .openKeyNav-label[data-openkeynav-position="right"]::before {
        border-right: ${openKeyNav.config.spot.arrowSize_px + 1}px solid #fff; 
        left: -${openKeyNav.config.spot.arrowSize_px + 1}px; 
        border-top: ${openKeyNav.config.spot.arrowSize_px + 1}px solid transparent; 
        border-bottom: ${openKeyNav.config.spot.arrowSize_px + 1}px solid transparent; 
      }
      .openKeyNav-label[data-openkeynav-position="right"]::after {
        border-right: ${openKeyNav.config.spot.arrowSize_px}px solid ${openKeyNav.config.spot.backgroundColor}; 
        left: -${openKeyNav.config.spot.arrowSize_px}px; 
        border-top: ${openKeyNav.config.spot.arrowSize_px}px solid transparent; 
        border-bottom: ${openKeyNav.config.spot.arrowSize_px}px solid transparent; 
      }
      .openKeyNav-label[data-openkeynav-position="top"]{
        padding-bottom: 0;
      }
      .openKeyNav-label[data-openkeynav-position="top"]::before {
        border-top: ${openKeyNav.config.spot.arrowSize_px + 1}px solid #fff; 
        bottom: -${openKeyNav.config.spot.arrowSize_px + 1}px; 
        border-left: ${openKeyNav.config.spot.arrowSize_px + 1}px solid transparent; 
        border-right: ${openKeyNav.config.spot.arrowSize_px + 1}px solid transparent; 
      }
      .openKeyNav-label[data-openkeynav-position="top"]::after {
        border-top: ${openKeyNav.config.spot.arrowSize_px}px solid ${openKeyNav.config.spot.backgroundColor}; 
        bottom: -${openKeyNav.config.spot.arrowSize_px}px; 
        border-left: ${openKeyNav.config.spot.arrowSize_px}px solid transparent; 
        border-right: ${openKeyNav.config.spot.arrowSize_px}px solid transparent; 
      }
      .openKeyNav-label[data-openkeynav-position="bottom"]{
        padding-top: 0;
      }
      .openKeyNav-label[data-openkeynav-position="bottom"]::before {
        border-bottom: ${openKeyNav.config.spot.arrowSize_px + 1}px solid #fff; 
        top: -${openKeyNav.config.spot.arrowSize_px + 1}px; 
        border-left: ${openKeyNav.config.spot.arrowSize_px + 1}px solid transparent; 
        border-right: ${openKeyNav.config.spot.arrowSize_px + 1}px solid transparent; 
      }
      .openKeyNav-label[data-openkeynav-position="bottom"]::after {
        border-bottom: ${openKeyNav.config.spot.arrowSize_px}px solid ${openKeyNav.config.spot.backgroundColor}; 
        top: -${openKeyNav.config.spot.arrowSize_px}px; 
        border-left: ${openKeyNav.config.spot.arrowSize_px}px solid transparent; 
        border-right: ${openKeyNav.config.spot.arrowSize_px}px solid transparent; 
      }
      .openKeyNav-keylabel-focused[data-openkeynav-position="left"]::after {
        border-left-color: ${focusLabelBackground};
      }
      .openKeyNav-keylabel-focused[data-openkeynav-position="right"]::after {
        border-right-color: ${focusLabelBackground};
      }
      .openKeyNav-keylabel-focused[data-openkeynav-position="top"]::after {
        border-top-color: ${focusLabelBackground};
      }
      .openKeyNav-keylabel-focused[data-openkeynav-position="bottom"]::after {
        border-bottom-color: ${focusLabelBackground};
      }
      .openKeyNav-label-selected{
        // padding : 0;
        // margin : 0;
        display : grid;
        align-content : center;
        color : ${openKeyNav.config.spot.fontColor}; 
        background : ${openKeyNav.config.spot.backgroundColor}; 
        // outline : 4px solid ${openKeyNav.config.focus.outlineColor}; 
        outline: none; 
        // border-radius: 100%; 
        // width: 1rem; 
        // height: 1rem; 
        // text-shadow : none;
        // padding : 0 !important;
        // margin: 0 !important;
      }
      [data-openkeynav-label]:not(.openKeyNav-label):not(button),
      [data-openkeynav-keylabel-target-active]:not(button){
        // outline: 2px double ${openKeyNav.config.focus.outlineColor} !important; 
        // outline-offset: 2px !important;
        box-shadow:  inset 0 0 0 .5px #000,
                      0 0 0 .75px #000,
                      0 0 0 1.5px rgba(255,255,255,1); 
        outline:none !important;
        // border-radius: 3px;
        border-color: #000;
        border-radius: 3px;
      }
      button[data-openkeynav-label],
      button[data-openkeynav-keylabel-target-active]{
        outline:2px solid #000 !important;
      }
      .openKeyNav-inaccessible:not(.openKeyNav-label):not(button){
        box-shadow:  inset 0 0 0 .5px #f00,
                      0 0 0 1px #f00,
                      0 0 0 1.5px rgba(255,255,255,1); 
        outline:none !important;
        border-color: #f00;
        border-radius: 3px;
      }
      button.openKeyNav-inaccessible{
        outline:2px solid #f00 !important;
      }
      .openKeyNav-inaccessible.openKeyNav-label{
        box-shadow:  inset 0 0 0 .5px #f00,
                      0 0 0 1px #f00,
                      0 0 0 1.5px rgba(255,255,255,1); 
        border-color: #f00;
        border-radius: 3px;
      }
      .openKeyNav-label.debug-inaccessible{
        background-color: #ff4444 !important;
        border-color: #cc0000 !important;
        color: #ffffff !important;
        text-shadow: 0 1px 0 rgba(0,0,0,0.5) !important;
      }
        //   +"span[data-openkeynav-label]{"
        //       +"display: inherit;"
        //   +"}"
      .openKeyNav-noCursor *{
        cursor: none !important;
      }
      .openKeyNav-mouseover-tooltip{
        position: absolute;
        background-color: #333;
        color: #fff;
        padding: 5px;
        border-radius: 5px;
        display: none;
        z-index: 1000;
        font-size: 12px;
      }
      .openKeyNav-mouseover-tooltip::before{
        content: "Debug mode"
      }
      //   [data-openkeynav-draggable="true"] {
      //   outline: 2px solid ${openKeyNav.config.focus.outlineColor}; 
      //   outline-offset: -1px !important;
      // }
      ;
      `

      style.textContent += statusStyles;

      style.textContent+= keyButtonStyles;
      // *:focus { // could be problematic to edit focus states throughout a website
      //   outline: 2px ${openKeyNav.config.focus.outlineStyle} ${openKeyNav.config.focus.outlineColor} !important;
      //   outline-offset: -2px !important;
      // }
      // `;
      // ensuring hidden labeled elements are made visible
      style.textContent += `
        [data-openkeynav-label]:not(.openKeyNav-label),
        [data-openkeynav-keylabel-target-active]{
          opacity:1 !important;
          visibility:visible !important;
        }
      `;

      style.textContent += `
        [data-openkeynav-focused]{
          outline: 2px ${openKeyNav.config.focus.outlineStyle} ${openKeyNav.config.focus.outlineColor} !important; 
          outline-offset: -2px !important;
        }

        .openKeyNav-structural-context-outline {
          box-sizing: border-box;
          position: fixed;
          z-index: 2147483646;
          display: none;
          border-radius: 4px;
          background: transparent;
          pointer-events: none;
        }
      `;

    document.head.appendChild(style);
  }

export const deleteStylesheets = () => {
  document.querySelectorAll('.'+styleClassname).forEach((el)=>{
    el.parentNode && el.parentNode.removeChild(el)
  })
}

export const injectToolbarStyleSheet = (parent) => {

  openKeyNav = parent;

  if(!!document.querySelector(toolbarStyleClassname)){
      return false;
  }

  const style = document.createElement('style');
  style.setAttribute("class", toolbarStyleClassname)
  const toolBarHeight = openKeyNav.config.toolBar.height;
  const toolBarVerticalPadding = 6;
  const toolbarBackground = `
      background-color: ${openKeyNav.config.toolBar.backgroundColor.value};
      color: ${openKeyNav.config.toolBar.contentColor.value};
      border: 1px solid hsl(210, 8%, 68%);
      border-radius: 4px;
      padding: 3px ${toolBarVerticalPadding}px;
  `;
  style.type = 'text/css';
  style.textContent = `
  .openKeyNav-toolBar {
      // width: 200px;    // needs to have a set width (or a min-width) since the content changes inside... 
                          // min-widh is set inside the init depending on number of keys
      // max-width: 200px;
      // background-color: #333;
      color: #333;
      // z-index: 10000;
      ${toolbarBackground}
      font-size:12px;
      display: flex;
      align-items: center;
      // align-items: end;
      flex-direction: column;
      // direction: rtl;
      max-height: ${toolBarHeight}px;
      position:relative;
  }
  .openKeyNav-toolBar > p{
      overflow: hidden;
  }
  .openKeyNav-toolBar p{
      font-size: 16px;
      margin-bottom: 0;
      line-height: ${toolBarHeight - toolBarVerticalPadding}px;
      text-align: left;
  }
  .openKeyNav-toolBar-expanded {
      position: absolute;
      top: 0;
      margin-top: 40px;
      width: 100%;
      ${toolbarBackground}
      display: grid;
      justify-content: left;
  }
  // .openKeyNav-toolBar span.stacked {
  //     display: inline-grid;
  //     grid-template-rows: auto auto;
  // }
  `;
  style.textContent+= keyButtonStyles;
  document.head.appendChild(style);
}
