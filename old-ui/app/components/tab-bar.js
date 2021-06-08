const Component = require('react').Component
const h = require('react-hyperscript')
const inherits = require('util').inherits

module.exports = TabBar

inherits(TabBar, Component)
function TabBar () {
  Component.call(this)
}

TabBar.prototype.render = function () {
  const props = this.props
  const state = this.state || {}
  const { tabs = [], defaultTab, tabSelected, style } = props
  const { subview = defaultTab } = state

  return (
    h('.flex-row.space-around', {
      style: {
        background: '#F7F8F9',
        border: '1px solid #F1F2F4',
        boxSizing: 'border-box',
        boxShadow: 'inset 0px 1px 2px rgba(0, 0, 0, 0.12)',
        borderRadius: '12px',
        padding: '6px',
        minHeight: '45px',
        lineHeight: '45px',
        marginLeft: '16px',
        marginRight: '16px'
      },
    }, tabs.map((tab, ind) => {
      const { key, content, id } = tab
      return h(`${key ? '#' + key : ''}${subview === key ? ind === 0 ? '.activeForm.left' : '.activeForm.right' : '.inactiveForm.pointer'}`, {
        onClick: () => {
          this.setState({ subview: key })
          tabSelected(key)
        },
        id: id,
      }, content)
    }))
  )
}

