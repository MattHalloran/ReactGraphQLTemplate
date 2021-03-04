import styled from 'styled-components';

export const StyledFooter = styled.footer`
    background-color: ${({ theme }) => theme.darkPrimaryColor};
    color: ${({ theme }) => theme.headerText};
    border-top: 2px solid ${({ theme }) => theme.primaryText};
    position: relative;
    bottom: 0;
    width: 100%;
    overflow: hidden;

    a:link,
    a:visited {
        color: ${({ theme }) => theme.headerText};
    }

    .flexed {
        display: grid;
        padding: 5px;
        grid-template-columns: repeat(auto-fit,minmax(150px,1fr));
        grid-gap: 10px;
        -webkit-align-items: stretch;
        -webkit-box-align: stretch;
        -ms-flex-align: stretch;
        align-items: stretch;

        > * {
            border-right: 1px solid ${({ theme }) => theme.primaryText};
        }

        > *:last-child {
            border-right: none;
        }
    }

    @media (max-width: ${({ theme }) => theme.mobile}) {
        .footer-group {
            border: 1px solid ${({ theme }) => theme.primaryText};
        }

        .flexed {
            > *:last-child {
                border-right: 1px solid ${({ theme }) => theme.primaryText};
            }
        }
    }

    .footer-group {
        padding: 0 10px;
        min-width: 150px;
        height: auto;

        li {
            padding-bottom: 10px;
        }
    }

    .winner-div {
        display: grid;
    }

    .proven-winner {
        max-height: min(100%,150px);
        max-width: min(100%,150px);
        margin: auto;
    }

    .footer-ul {
        display: grid;
        padding: 0px;
    }

    li {
        display: block ;
    }

    .addy { 
        padding-bottom: 10px;
        display: flex;
        flex-direction: column;
        white-space: pre-wrap;      /* CSS3 */   
        white-space: -moz-pre-wrap; /* Firefox */    
        white-space: -pre-wrap;     /* Opera <7 */   
        white-space: -o-pre-wrap;   /* Opera 7 */    
        word-wrap: break-word;
    }
`;