import styled from 'styled-components';
export const StyledFooter = styled.footer`
    background-color: ${({ theme }) => theme.bodySecondary};
    color: ${({ theme }) => theme.textSecondary}
    padding-top: 3em;
    position: relative;
    bottom: 0;
    width: 100%;
    overflow: hidden;

    .flexed {
        display: grid;
        padding: 5px;
        grid-template-columns: repeat(auto-fit,minmax(150px,1fr));
        grid-gap: 10px;
        -webkit-align-items: stretch;
        -webkit-box-align: stretch;
        -ms-flex-align: stretch;
        align-items: stretch;
    }

    @media (max-width: 319px) {
        .footer-group {
            border-color: transparent;
            border-bottom-color: darkgreen;
            border-style: solid;
        }
    }

    .footer-group {
        padding: 0 10px;
        min-width: 150px;
    }

    .winner-div {
        display: flex;
    }

    .proven-winner {
        max-height: min(100%,150px);
        max-width: min(100%,150px);
        margin: auto;
    }

    .footer-ul {
        display: grid;
        padding: 0px
    }

    li {
        display: block ;
    }

    .addy { 
        display: flex;
        flex-direction: column;
        white-space: pre-wrap;      /* CSS3 */   
        white-space: -moz-pre-wrap; /* Firefox */    
        white-space: -pre-wrap;     /* Opera <7 */   
        white-space: -o-pre-wrap;   /* Opera 7 */    
        word-wrap: break-word;
    }

    /* Secondary color links */
    a:link {
        color: ${({ theme }) => theme.textSecondary};
    }
    a:visited {
        color: ${({ theme }) => theme.textSecondary};
    }
    a:hover {
        color: ${({ theme }) => theme.textSecondary};
    }
`;