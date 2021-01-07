import React, { Component } from 'react'
import PropTypes from 'prop-types'
import MenuDroppo from './menu-droppo'
import extend from 'xtend'
import classnames from 'classnames'

const noop = () => { }

class Dropdown extends Component {
  static defaultProps = {
    isOpen: false,
    onClick: noop,
    useCssTransition: false,
  }

  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    children: PropTypes.node,
    style: PropTypes.object.isRequired,
    onClickOutside: PropTypes.func,
    innerStyle: PropTypes.object,
    useCssTransition: PropTypes.bool,
    constOverflow: PropTypes.bool,
  }

  render() {
    const {
      isOpen,
      onClickOutside,
      style,
      innerStyle,
      children,
      useCssTransition,
      constOverflow,
    } = this.props

    const innerStyleDefaults = extend({
      boxShadow: '0px 2px 8px rgba(40, 41, 61, 0.04), 0px 16px 24px rgba(96, 97, 112, 0.16)',
      borderRadius: '8px',
      border: '1px solid #E1E4E8',
      padding: '12px 8px',
      background: '#FFFFFF',
    }, innerStyle)

  const styleDefaults = extend({
    borderRadius: '4px',
    background: '#F5F5F5',
    overflowY: 'auto',
    transition: 'max-height 300ms ease-in-out',
  }, style)

  return(
      <MenuDroppo
        useCssTransition = { useCssTransition }
        isOpen = { isOpen }
        zIndex = { 11}
        constOverflow = { constOverflow }
        onClickOutside = { onClickOutside }
        style = { styleDefaults }
        innerStyle = { innerStyleDefaults }
      >
      <style>
        {`
          li.dropdown-menu-item:hover { color: #1C1C28; background: #F2F4FA; border-radius: 8px; }
          li.dropdown-menu-item { color: rgba(28, 28, 40, 0.54); position: relative }
        `}
      </style>
        { children }
      </MenuDroppo>
    )
  }
}

class DropdownMenuItem extends Component {
  static propTypes = {
    closeMenu: PropTypes.func,
    onClick: PropTypes.func.isRequired,
    children: PropTypes.node,
    style: PropTypes.object,
    className: PropTypes.string,
  }

  render() {
    const { onClick, closeMenu, children } = this.props
    const style = Object.assign({
      listStyle: 'none',
      padding: (this.props.style && this.props.style.padding) ? this.props.style.padding : '12px',
      fontSize: '15px',
      fontStyle: 'normal',
      fontFamily: 'Work Sans, sans-serif',
      cursor: 'pointer',
    }, this.props.style)

    return (
      <li
        className={classnames('dropdown-menu-item', this.props.className)}
        onClick={() => {
          onClick()
          closeMenu()
        }}
        style={style}
      >
        {children}
      </li>
    )
  }

}

module.exports = {
  Dropdown,
  DropdownMenuItem,
}
