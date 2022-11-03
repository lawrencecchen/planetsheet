// https://github.com/radix-ui/colors/issues/10
const colors = require('@radix-ui/colors')

const mapKeys = (object, cb) =>
  Object
    .entries(object)
    .reduce((out, [key, value]) => ({
        ...out,
        [cb(key)]: typeof value === "object"
          ? mapKeys(value, cb)
          : value,
    }), {})

// Just makes the names more Tailwindish.
const keyTransformer = key => {
  if (key.endsWith('DarkA')) {
    return key.replace('DarkA', '-dark-alpha')
  } else if (key.endsWith('Dark')) {
    return key.replace('Dark', '-dark')
  } else if (key.endsWith('A')) {
    return key.replace('A', '-alpha')
  }

  return /\d$/.test(key)
    // Removes the color name and A from the color key...
    ? key.replace(/[a-z]/gi, '')
    : key
}

module.exports = mapKeys(
  colors,
  keyTransformer
)