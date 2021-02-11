import styled from 'styled-components';
import { ACCOUNT_STATUS } from 'utils/consts';

const status_to_color = (status) => {
    switch(status) {
        case ACCOUNT_STATUS.Deleted:
            return 'grey';
        case ACCOUNT_STATUS.Unlocked:
            return 'green';
        case ACCOUNT_STATUS.WaitingApproval:
            return 'yellow';
        case ACCOUNT_STATUS.SoftLock:
            return 'pink';
        case ACCOUNT_STATUS.HardLock:
        default:
            return 'red'
    }
}

export const StyledAdminCustomerPage = styled.div`
    .card-flex {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, .5fr));
        grid-gap: 20px;
    }
`;

export const StyledCustomerCard = styled.div`
    background-color: ${({ theme }) => theme.bodySecondary};
    color: black;
    margin: 20px;
    padding: 10px;
    min-width: 150px;
    min-height: 50px;
    border: 2px solid ${({ account_status }) => status_to_color(account_status)};
    border-radius: 1em;
    cursor: pointer;
`;