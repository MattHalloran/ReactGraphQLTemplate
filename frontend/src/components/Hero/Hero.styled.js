import styled from 'styled-components';

export const OverlayContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  pointer-events: none;
  * {
    pointer-events: auto;
  }
`;

export const ContentWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-flow: column;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    pointer-events: none;
    background-color: rgba(0, 0, 0, 0.1);
`;

export const Title = styled.h1`
    margin: 0 auto;
    padding: 0;
    width: 90%;
    text-align: center;
    font-size: 3.5rem;
    text-shadow:
        -1px -1px 0 #000,  
        1px -1px 0 #000,
        -1px 1px 0 #000,
        1px 1px 0 #000;
`;

export const Subtitle = styled.h2`
    margin: 24px auto 0;
    padding: 0;
    width: 80%;
    text-align: center;
    font-size: 1.75rem;
    text-shadow:
        -1px -1px 0 #000,  
        1px -1px 0 #000,
        -1px 1px 0 #000,
        1px 1px 0 #000;
`;