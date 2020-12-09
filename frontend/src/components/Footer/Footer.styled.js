import styled from 'styled-components';
export const StyledFooter = styled.footer`
    background-color: ${({ theme }) => theme.bodySecondary};
    color: ${({ theme }) => theme.textSecondary}
    padding-top: 3em;
    position: relative;
    bottom: 0;
    width: 100%;
    overflow: hidden;

    /* Remove extra left and right margins, due to padding */
    .footer-row {
        margin: 0 -5px;
    }

    /* Clear floats after the columns */
    .footer-row:after {
        content: "";
        display: table;
        clear: both;
    }

    /* Float four columns side by side */
    .footer-col {
        float: left;
        width: 25%;
        padding: 0 10px;
        text-align: center;
    }

    /* Responsive columns */
    @media screen and (max-width: 700px) {
        .footer-col {
        width: 50%;
        display: block;
        margin-bottom: 20px;
        }
    }

    /* Responsive columns */
    @media screen and (max-width: 500px) {
        .footer-col {
        width: 100%;
        display: block;
        margin-bottom: 20px;
        }
    }

    .proven-winner {
        position: relative;
        max-height: 200px;
        max-width: 200px;
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