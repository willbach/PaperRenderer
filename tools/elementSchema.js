const types = {
  figma: [
    'qr',
    'template_text',
    'rect',
    'patq',
    'text',
    'sigil',
    'img',
    'wrap_addr_split_four',
    'addr_split_four',
    'template_text',
    'hr',
  ],
  // types whose data is retrieved asynchronously (we do not import the figma data)
  async: ['sigil', 'qr'],
  // these Figma types house children elements, so we need to transverse all children nodes when we find a parentType
  singleParent: ['group', 'instance', 'frame'],
}

// const toBase64 = url => {
//   image2base64(url)
//     .then(response => {
//       console.log(response)
//       return response
//     })
//     .catch(error => {
//       console.error(error)
//       return null
//     })
// }

const getSvgPath = (child) => {
  const path = child.fillGeometry[0].path

  if (path === undefined || path === null || path === '')
    console.error(
      `Unable to get the path for the svg child: ${JSON.stringify(child)}`
    )

  const ast = `<svg height="${child.absoluteBoundingBox.height}" width="${child.absoluteBoundingBox.width}"><path d="${path}"/></svg>`
  return ast
}

const rgba = (fills) => {
  if (fills.length === 0) return `rgba(0,0,0,0)`
  const color = fills[0].color
  return `rgba(${color.r},${color.g},${color.b},${color.a})`
}

const isType = (type) => {
  if (
    types.figma.includes(type) ||
    types.async.includes(type) ||
    types.singleParent.includes(type)
  )
    return true
  return false
}

const getPath = (child) => {
  const str = child.name
  if (str.includes('@')) {
    return str.split('@')[1]
  }
  return null
}

const qr = (child, page) => {
  return {
    type: 'qr',
    draw: 'qr',
    data: null,
    path: getPath(child),
    size: child.absoluteBoundingBox.height,
    x: child.absoluteBoundingBox.x - page.originX,
    y: child.absoluteBoundingBox.y - page.originY,
  }
}

const sigil = (child, page) => {
  return {
    type: 'sigil',
    draw: 'sigil',
    data: null,
    path: getPath(child),
    size: child.absoluteBoundingBox.height,
    x: child.absoluteBoundingBox.x - page.originX,
    y: child.absoluteBoundingBox.y - page.originY,
  }
}

const img = (child, page) => {
  return {
    type: 'img',
    draw: 'img',
    data: getSvgPath(child),
    path: getPath(child),
    // svg: getSvgPath(child),
    width: child.absoluteBoundingBox.height,
    height: child.absoluteBoundingBox.width,
    x: child.absoluteBoundingBox.x - page.originX,
    y: child.absoluteBoundingBox.y - page.originY,
  }
}

const text = (child, page) => {
  return {
    type: 'text',
    draw: 'wrappedText',
    path: null,
    fontFamily: child.style.fontFamily,
    fontSize: child.style.fontSize,
    data: child.characters,
    fontWeight: child.style.fontWeight,
    maxWidth: child.absoluteBoundingBox.width,
    lineHeightPx: child.style.lineHeightPx,
    x: child.absoluteBoundingBox.x - page.originX,
    y: child.absoluteBoundingBox.y - page.originY,
    fontColor: rgba(child.fills),
  }
}

const template_text = (child, page) => {
  return {
    type: 'template_text',
    draw: 'wrappedText',
    path: getPath(child),
    data: null,
    fontFamily: child.style.fontFamily,
    fontSize: child.style.fontSize,
    fontWeight: child.style.fontWeight,
    maxWidth: child.absoluteBoundingBox.width,
    lineHeightPx: child.style.lineHeightPx,
    x: child.absoluteBoundingBox.x - page.originX,
    y: child.absoluteBoundingBox.y - page.originY,
    fontColor: rgba(child.fills),
  }
}

const patq = (child, page) => {
  return {
    type: 'patq',
    draw: 'patQ',
    path: getPath(child),
    data: null,
    fontFamily: child.style.fontFamily,
    fontSize: child.style.fontSize,
    fontWeight: child.style.fontWeight,
    fontColor: rgba(child.fills),
    maxWidth: child.absoluteBoundingBox.width,
    lineHeightPx: child.style.lineHeightPx,
    x: child.absoluteBoundingBox.x - page.originX,
    y: child.absoluteBoundingBox.y - page.originY,
  }
}

const addr_split_four = (child, page) => {
  return {
    type: 'addr_split_four',
    draw: 'ethereumAddressLong',
    path: getPath(child),
    data: null,
    fontWeight: child.style.fontWeight,
    fontFamily: child.style.fontFamily,
    fontSize: child.style.fontSize,
    // text: getPath(child),
    maxWidth: child.absoluteBoundingBox.width,
    lineHeightPx: child.style.lineHeightPx,
    x: child.absoluteBoundingBox.x - page.originX,
    y: child.absoluteBoundingBox.y - page.originY,
    fontColor: rgba(child.fills),
  }
}

const wrap_addr_split_four = (child, page) => {
  return {
    type: 'wrap_addr_split_four',
    draw: 'ethereumAddressCompact',
    path: getPath(child),
    data: null,
    fontWeight: child.style.fontWeight,
    fontFamily: child.style.fontFamily,
    fontSize: child.style.fontSize,
    maxWidth: child.absoluteBoundingBox.width,
    lineHeightPx: child.style.lineHeightPx,
    x: child.absoluteBoundingBox.x - page.originX,
    y: child.absoluteBoundingBox.y - page.originY,
    fontColor: rgba(child.fills),
  }
}

const rect = (child, page) => {
  return {
    type: 'rect',
    draw: 'rect',
    path: getPath(child),
    data: null,
    cornerRadius: child.cornerRadius,
    dashes: child.strokeDashes,
    x: child.absoluteBoundingBox.x - page.originX,
    y: child.absoluteBoundingBox.y - page.originY,
    width: child.absoluteBoundingBox.width,
    height: child.absoluteBoundingBox.height,
    fillColor: rgba(child.fills),
    strokeColor: rgba(child.strokes),
    strokeWeight: child.strokeWeight,
  }
}

const hr = (child, page) => {
  return {
    type: 'hr',
    draw: 'line',
    path: getPath(child),
    data: null,
    dashes: child.strokeDashes,
    x: child.absoluteBoundingBox.x - page.originX,
    y: child.absoluteBoundingBox.y - page.originY,
    width: child.absoluteBoundingBox.width,
    height: child.absoluteBoundingBox.height,
    strokeColor: rgba(child.strokes),
    strokeWeight: child.strokeWeight,
  }
}

const getComponent = (child, name, page) => {
  if (name === 'qr') return qr(child, page)
  if (name === 'template_text') return template_text(child, page)
  if (name === 'rect') return rect(child, page)
  if (name === 'patq') return patq(child, page)
  if (name === 'text') return text(child, page)
  if (name === 'sigil') return sigil(child, page)
  if (name === 'img') return img(child, page)
  if (name === 'wrap_addr_split_four') return wrap_addr_split_four(child, page)
  if (name === 'addr_split_four') return addr_split_four(child, page)
  if (name === 'template_text') return template_text(child, page)
  if (name === 'hr') return hr(child, page)

  return null
}

module.exports = {
  getComponent,
  types,
  isType,
}
