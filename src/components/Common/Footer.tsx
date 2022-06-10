import React, { FunctionComponents } from 'react'
import styled from '@emotion/styled'

const FooterWrapper = styled.div`
  display: grid;
  place-items: center;
  margin-top: auto;
  padding: 50px 0;
  font-size: 15px;
  text-align: center;
  line-height: 1.5;
`
const Footer: FunctionComponents = function () {
  return (
    <FooterWrapper>
      Thank You for Visiting My Blog, Have a Good Day 😄
      <br />© 2021 Developer Hae-sung, Powered By Gatsby.
    </FooterWrapper>
  )
}

export default Footer
